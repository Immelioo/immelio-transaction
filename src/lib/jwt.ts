import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  // Pas de repli silencieux : un secret par défaut connu permettrait de forger un JWT admin valide.
  throw new Error("JWT_SECRET manquant dans les variables d'environnement !");
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
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
