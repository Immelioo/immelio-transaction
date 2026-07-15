import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { getAuthCookieOptions } from "@/lib/cookieOptions";

const DUMMY_PASSWORD_HASH = "$2b$10$I4ZdYh8q0yy681FxWXtXnOYZP/r2K7xvVnUyxOe0onWUkubVrsH0q";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Rate limiting : 5 tentatives / minute par IP
  const rl = await checkRateLimit(ip, "login", RATE_LIMITS.login);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();

    // Validation Zod
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const { password } = parsed.data;

    // Délai constant pour éviter les timing attacks
    const user = await prisma.user.findUnique({ where: { email } });

    const passwordValid = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, DUMMY_PASSWORD_HASH).then(() => false);

    if (!user || !passwordValid) {
      logger.warn("Tentative de connexion échouée", { email, ip });
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }

    if (user.role !== "PARTENAIRE" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Générer le JWT
    const token = generateToken({ userId: user.id, role: user.role, email: user.email });

    logger.info("Connexion réussie", { userId: user.id, role: user.role, ip });

    // Réponse avec cookie HttpOnly
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        entreprise: user.entreprise,
      },
    });

    response.cookies.set("auth-token", token, getAuthCookieOptions(req));
    return response;
  } catch (error) {
    logger.error("Erreur login", { error: String(error), ip });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
