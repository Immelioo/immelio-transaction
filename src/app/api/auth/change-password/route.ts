import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/schemas";
import { logger } from "@/lib/logger";

export async function PUT(req: NextRequest) {
  // Utilisateur identifié uniquement via la session — jamais via le body
  const sessionUser = await verifyAuth(req);
  if (!sessionUser) return unauthorizedResponse("Connexion requise");

  try {
    const body = await req.json();

    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Charger le hash actuel depuis la DB (sessionUser ne l'inclut jamais)
    const userWithHash = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, password: true },
    });

    if (!userWithHash) return unauthorizedResponse();

    const isValid = await bcrypt.compare(currentPassword, userWithHash.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 401 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit être différent de l'ancien" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { password: hashedPassword },
    });

    logger.info("Mot de passe modifié", { userId: sessionUser.id });

    return NextResponse.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    logger.error("Erreur changement mot de passe", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
