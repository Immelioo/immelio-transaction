import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";

const VALID_STATUTS = ["NOUVEAU", "CONTACTE", "QUALIFIE", "PROPOSITION", "NEGOCE", "GAGNE", "PERDU"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await verifyAuth(req, "ADMIN");
  if (!sessionUser) return unauthorizedResponse();

  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { activites: { orderBy: { createdAt: "desc" } } },
  });

  if (!lead) return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  return NextResponse.json(lead);
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

    if (body.statut && !VALID_STATUTS.includes(body.statut)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.statut && { statut: body.statut }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.assigneA !== undefined && { assigneA: body.assigneA }),
      },
    });

    logger.info("Lead mis à jour", { leadId: id, adminId: sessionUser.id, changes: body });

    return NextResponse.json(lead);
  } catch (error) {
    logger.error("Erreur mise à jour lead", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await verifyAuth(req, "ADMIN");
  if (!sessionUser) return unauthorizedResponse();

  try {
    const { id } = await params;
    await prisma.lead.delete({ where: { id } });
    logger.info("Lead supprimé", { leadId: id, adminId: sessionUser.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erreur suppression lead", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
