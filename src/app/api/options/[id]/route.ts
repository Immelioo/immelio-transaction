import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";

const OPTION_TO_LOT_STATUS: Record<string, string> = {
  EN_COURS: "OPTION",
  ACCEPTEE: "RESERVE",
  REFUSEE: "DISPONIBLE",
  EXPIREE: "DISPONIBLE",
  LEVEE: "DISPONIBLE",
};

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const body = await req.json();
    const statut = String(body?.statut || "");

    if (!OPTION_TO_LOT_STATUS[statut]) {
      return NextResponse.json({ error: "Statut d'option invalide" }, { status: 400 });
    }

    const existing = await prisma.optionLot.findUnique({
      where: { id },
      include: { lot: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Option introuvable" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const option = await tx.optionLot.update({
        where: { id },
        data: { statut },
        include: {
          lot: {
            include: { programme: true },
          },
          user: {
            select: { id: true, nom: true, prenom: true, email: true, entreprise: true },
          },
        },
      });

      await tx.lot.update({
        where: { id: existing.lotId },
        data: { statut: OPTION_TO_LOT_STATUS[statut] },
      });

      return option;
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Erreur mise a jour option", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
