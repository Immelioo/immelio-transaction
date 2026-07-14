import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";

const VALID_STATUTS = ["EN_ATTENTE", "CONFIRMEE", "ANNULEE", "EFFECTUEE"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth(req, "ADMIN");
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const statut = String(body?.statut || "");

    if (!VALID_STATUTS.includes(statut)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const visite = await prisma.demandeVisite.update({
      where: { id },
      data: { statut },
    });

    return NextResponse.json(visite);
  } catch (error) {
    logger.error("Erreur mise à jour visite", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
