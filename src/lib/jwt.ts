import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Pas de repli silencieux : un secret par défaut connu permettrait de forger un JWT admin valide.
    throw new Error("JWT_SECRET manquant dans les variables d'environnement !");
  }
  return secret;
}

export interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)auth-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
