import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { getAuthCookieOptions } from "@/lib/cookieOptions";
import { z } from "zod";

const setupSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "8 caractères minimum").max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = setupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({ where: { inviteToken: token } });

    if (!user) {
      return NextResponse.json(
        { error: "Lien d'invitation invalide ou expiré" },
        { status: 400 }
      );
    }

    if (user.inviteTokenExpiry && user.inviteTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Lien d'invitation expiré. Contactez votre administrateur." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        inviteToken: null,
        inviteTokenExpiry: null,
      },
    });

    logger.info("Compte activé via invitation", { userId: user.id });

    // Connecter automatiquement l'utilisateur après activation
    const jwtToken = generateToken({ userId: user.id, role: user.role, email: user.email });

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

    response.cookies.set("auth-token", jwtToken, getAuthCookieOptions(req));
    return response;
  } catch (error) {
    logger.error("Erreur setup compte", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Vérification du token (utilisé côté page pour valider avant d'afficher le formulaire)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "Token manquant" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
    select: { prenom: true, nom: true, email: true, entreprise: true, inviteTokenExpiry: true },
  });

  if (!user) {
    return NextResponse.json({ valid: false, error: "Lien invalide" });
  }

  if (user.inviteTokenExpiry && user.inviteTokenExpiry < new Date()) {
    return NextResponse.json({ valid: false, error: "Lien expiré" });
  }

  return NextResponse.json({
    valid: true,
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    entreprise: user.entreprise,
  });
}
