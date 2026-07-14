import { NextRequest } from "next/server";

const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function getForwardedProto(req: NextRequest): string | null {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (!forwardedProto) return null;
  return forwardedProto.split(",")[0]?.trim() || null;
}

export function shouldUseSecureCookies(req: NextRequest): boolean {
  const forwardedProto = getForwardedProto(req);
  if (forwardedProto) return forwardedProto === "https";
  return req.nextUrl.protocol === "https:";
}

export function getAuthCookieOptions(req: NextRequest) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "strict" as const,
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  };
}

export function getExpiredAuthCookieOptions(req: NextRequest) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "strict" as const,
    maxAge: 0,
    path: "/",
  };
}
