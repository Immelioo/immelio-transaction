import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getExpiredAuthCookieOptions } from "@/lib/cookieOptions";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Pas de repli silencieux : un secret par défaut connu permettrait de forger
    // un JWT admin valide. On refuse de démarrer plutôt que de servir un secret faible.
    throw new Error("JWT_SECRET manquant — impossible de vérifier les sessions en sécurité.");
  }
  return new TextEncoder().encode(secret);
}

async function verifyTokenEdge(
  token: string
): Promise<{ userId: string; role: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload as { userId: string; role: string; email: string };
  } catch {
    return null;
  }
}

function clearAuthCookie(req: NextRequest, response: NextResponse) {
  response.cookies.set("auth-token", "", getExpiredAuthCookieOptions(req));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ============================================
  // PROTECTION ROUTES ADMIN
  // ============================================
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    const payload = await verifyTokenEdge(token);
    if (!payload || payload.role !== "ADMIN") {
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      clearAuthCookie(req, res);
      return res;
    }
  }

  // ============================================
  // PROTECTION ROUTES PARTENAIRE
  // ============================================
  if (
    pathname.startsWith("/pro") &&
    pathname !== "/pro/login" &&
    pathname !== "/pro/setup" &&
    !pathname.startsWith("/pro/setup")
  ) {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/pro/login", req.url));
    }
    const payload = await verifyTokenEdge(token);
    if (!payload || (payload.role !== "PARTENAIRE" && payload.role !== "ADMIN")) {
      const res = NextResponse.redirect(new URL("/pro/login", req.url));
      clearAuthCookie(req, res);
      return res;
    }
  }

  // ============================================
  // HEADERS DE SÉCURITÉ — toutes les routes
  // ============================================
  const response = NextResponse.next();

  // Clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Referrer
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // XSS legacy
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // Permissions
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  // HSTS (activé seulement en production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  // Content-Security-Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",  // unsafe-inline requis par Next.js (hydration)
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",   // blob: pour les previews d'image locales
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/pro/:path*",
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
