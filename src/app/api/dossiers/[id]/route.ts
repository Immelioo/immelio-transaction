import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";

const VALID_STATUTS = ["NOUVELLE", "EN_COURS", "TRAITEE", "ARCHIVEE"];

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const user = await verifyAuth(req, "ADMIN");
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const statut = String(body?.statut || "");

    if (!VALID_STATUTS.includes(statut)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const dossier = await prisma.dossier.update({
      where: { id },
      data: { statut },
    });

    return NextResponse.json(dossier);
  } catch (error) {
    logger.error("Erreur mise à jour dossier", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
