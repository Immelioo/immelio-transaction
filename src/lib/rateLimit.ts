/**
 * Rate limiter avec deux modes :
 * - Upstash Redis (recommandé en production serverless — fonctionne correctement
 *   avec plusieurs instances/régions Vercel, car l'état est partagé).
 * - Repli en mémoire par instance si UPSTASH_REDIS_REST_URL/TOKEN ne sont pas définis
 *   (suffisant en dev local ou sur un serveur à instance unique, mais chaque instance
 *   serverless aurait son propre compteur — donc peu fiable en prod multi-instance).
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

export interface RateLimitOptions {
  limit: number;       // Nombre de requêtes max
  windowMs: number;    // Fenêtre de temps en ms
}

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

if (!redis) {
  logger.warn(
    "UPSTASH_REDIS_REST_URL/TOKEN non configurés — rate limiting en mémoire (non fiable en serverless multi-instance)."
  );
}

// Un Ratelimit Upstash par couple (limit, windowMs) rencontré, mis en cache.
const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(options: RateLimitOptions): Ratelimit {
  const cacheKey = `${options.limit}:${options.windowMs}`;
  let limiter = upstashLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(options.limit, `${options.windowMs} ms`),
    });
    upstashLimiters.set(cacheKey, limiter);
  }
  return limiter;
}

// --- Repli en mémoire ---
interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.resetAt < now) memoryStore.delete(key);
  }
}, 5 * 60 * 1000);

function checkMemoryRateLimit(
  ip: string,
  key: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetAt: number } {
  const storeKey = `${key}:${ip}`;
  const now = Date.now();
  const entry = memoryStore.get(storeKey);

  if (!entry || entry.resetAt < now) {
    memoryStore.set(storeKey, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, resetAt: now + options.windowMs };
  }

  if (entry.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: options.limit - entry.count, resetAt: entry.resetAt };
}

export async function checkRateLimit(
  ip: string,
  key: string,
  options: RateLimitOptions
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  if (!redis) {
    return checkMemoryRateLimit(ip, key, options);
  }

  const limiter = getUpstashLimiter(options);
  const result = await limiter.limit(`${key}:${ip}`);
  return { allowed: result.success, remaining: result.remaining, resetAt: result.reset };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

// Configurations prédéfinies
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 60 * 1000 },       // 5/min
  contact: { limit: 5, windowMs: 60 * 1000 },      // 5/min
  visite: { limit: 3, windowMs: 60 * 1000 },       // 3/min
  demande: { limit: 3, windowMs: 60 * 1000 },      // 3/min
  upload: { limit: 10, windowMs: 60 * 1000 },      // 10/min
  message: { limit: 30, windowMs: 60 * 1000 },     // 30/min
} as const;
