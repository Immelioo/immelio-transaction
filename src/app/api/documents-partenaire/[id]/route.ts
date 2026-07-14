import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
  if (!sessionUser) return unauthorizedResponse();

  const { id } = await params;

  const doc = await prisma.documentPartenaire.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  if (sessionUser.role === "PARTENAIRE" && doc.userId !== sessionUser.id) {
    return forbiddenResponse();
  }

  logger.info("Téléchargement document partenaire", {
    documentId: id,
    documentNom: doc.nom,
    documentType: doc.type,
    userId: sessionUser.id,
    userRole: sessionUser.role,
    ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown",
  });

  return NextResponse.redirect(doc.url);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
  if (!sessionUser) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const { statut, commentaire } = body;

    if (!statut) {
      return NextResponse.json({ error: "Le statut est requis" }, { status: 400 });
    }

    const validStatuts = ["ENVOYE", "VU", "VALIDE", "REFUSE"];
    if (!validStatuts.includes(statut)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const existing = await prisma.documentPartenaire.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
    }

    if (sessionUser.role === "PARTENAIRE") {
      if (existing.userId !== sessionUser.id) return forbiddenResponse();
      if (statut === "VALIDE" || statut === "REFUSE") {
        return forbiddenResponse("Seul un administrateur peut valider ou refuser un document");
      }
    }

    const document = await prisma.documentPartenaire.update({
      where: { id },
      data: {
        statut,
        ...(commentaire !== undefined && { commentaire }),
      },
    });

    logger.info("Statut document partenaire mis à jour", {
      documentId: id,
      ancienStatut: existing.statut,
      nouveauStatut: statut,
      adminId: sessionUser.id,
    });

    return NextResponse.json(document);
  } catch (error) {
    logger.error("Erreur mise à jour document partenaire", { error: String(error) });
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
  if (!sessionUser) return unauthorizedResponse();

  try {
    const { id } = await params;

    const existing = await prisma.documentPartenaire.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
    }

    if (sessionUser.role === "PARTENAIRE" && existing.userId !== sessionUser.id) {
      return forbiddenResponse();
    }

    await prisma.documentPartenaire.delete({ where: { id } });

    logger.info("Document partenaire supprimé", {
      documentId: id,
      documentNom: existing.nom,
      userId: sessionUser.id,
      userRole: sessionUser.role,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erreur suppression document partenaire", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
