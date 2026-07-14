import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { activiteSchema } from "@/lib/schemas";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await verifyAuth(req, "ADMIN");
  if (!sessionUser) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = activiteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { type, description, dateEcheance } = parsed.data;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });

    const activite = await prisma.activite.create({
      data: {
        leadId: id,
        type,
        description,
        dateEcheance: dateEcheance ? new Date(dateEcheance) : null,
      },
    });

    logger.info("Activité créée", { leadId: id, activiteId: activite.id, adminId: sessionUser.id });
    return NextResponse.json(activite, { status: 201 });
  } catch (error) {
    logger.error("Erreur création activité", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await verifyAuth(req, "ADMIN");
  if (!sessionUser) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const { activiteId, effectuee } = body;

    if (!activiteId || typeof activiteId !== "string") {
      return NextResponse.json({ error: "activiteId requis" }, { status: 400 });
    }

    // Vérifie que l'activité appartient bien au lead de l'URL
    const existing = await prisma.activite.findUnique({ where: { id: activiteId } });
    if (!existing || existing.leadId !== id) {
      return NextResponse.json({ error: "Activité introuvable" }, { status: 404 });
    }

    const activite = await prisma.activite.update({
      where: { id: activiteId },
      data: { effectuee: Boolean(effectuee) },
    });

    return NextResponse.json(activite);
  } catch (error) {
    logger.error("Erreur mise à jour activité", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
