import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";

/**
 * Vérifie l'authentification depuis :
 * 1. Cookie HttpOnly `auth-token` (priorité)
 * 2. Header `Authorization: Bearer <token>` (fallback)
 */
export async function verifyAuth(
  req: NextRequest,
  requiredRole?: "ADMIN" | "PARTENAIRE" | "ADMIN_OR_PARTENAIRE"
) {
  try {
    let token: string | null = null;

    // 1. Cookie HttpOnly (sécurisé)
    const cookieToken = req.cookies.get("auth-token")?.value;
    if (cookieToken) {
      token = cookieToken;
    }

    // 2. Fallback Authorization header
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "");
      }
    }

    if (!token) return null;

    // Vérifier le JWT
    const payload = verifyToken(token);
    if (!payload) {
      logger.warn("Token JWT invalide ou expiré", { path: req.nextUrl.pathname });
      return null;
    }

    // Charger l'utilisateur depuis la DB (vérifie qu'il existe toujours)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true, email: true, nom: true, prenom: true,
        role: true, telephone: true, entreprise: true, codeAcces: true,
        // NE PAS inclure password
      },
    });

    if (!user) return null;

    // Vérification du rôle
    if (requiredRole === "ADMIN" && user.role !== "ADMIN") return null;
    if (requiredRole === "PARTENAIRE" && user.role !== "PARTENAIRE") return null;
    if (requiredRole === "ADMIN_OR_PARTENAIRE" && user.role !== "ADMIN" && user.role !== "PARTENAIRE") return null;

    return user;
  } catch (err) {
    logger.error("Erreur verifyAuth", { error: String(err) });
    return null;
  }
}

/**
 * Helper 401
 */
export function unauthorizedResponse(message = "Non autorisé") {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Helper 403
 */
export function forbiddenResponse(message = "Accès refusé") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Helper 429 rate limit
 */
export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Trop de requêtes. Veuillez patienter.", retryAfter },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
