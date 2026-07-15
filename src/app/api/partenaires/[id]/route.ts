import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { partenaireUpdateSchema } from "@/lib/schemas";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  try {
    const { id } = await params;

    const partenaire = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, nom: true, prenom: true, telephone: true,
        role: true, codeAcces: true, entreprise: true, contacte: true,
        dateContact: true,
        createdAt: true, updatedAt: true,
        inviteTokenExpiry: true,
        documentsPartenaire: true,
      },
    });

    if (!partenaire) {
      return NextResponse.json({ error: "Partenaire non trouvé" }, { status: 404 });
    }
    return NextResponse.json({
      ...partenaire,
      invitationEnAttente: Boolean(partenaire.inviteTokenExpiry),
    });
  } catch (error) {
    logger.error("Erreur récupération partenaire", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = partenaireUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const data: Record<string, unknown> = {};

    // Mise à jour des champs fournis
    if (payload.nom !== undefined) data.nom = payload.nom;
    if (payload.prenom !== undefined) data.prenom = payload.prenom;
    if (payload.email !== undefined) data.email = payload.email.toLowerCase();
    if (payload.telephone !== undefined) data.telephone = payload.telephone || null;
    if (payload.entreprise !== undefined) data.entreprise = payload.entreprise;

    // Marquer comme contacté
    if (body.contacte !== undefined) {
      data.contacte = body.contacte;
      if (body.contacte === true) {
        data.dateContact = new Date();
      }
    }

    // Ne hacher et mettre à jour le mot de passe que s'il est fourni
    if (payload.password && payload.password.trim() !== "") {
      data.password = await bcrypt.hash(payload.password, 12);
    }

    const partenaire = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, nom: true, prenom: true, telephone: true,
        role: true, codeAcces: true, entreprise: true, contacte: true,
        dateContact: true, createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json(partenaire);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
    }
    logger.error("Erreur mise à jour partenaire", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  try {
    const { id } = await params;

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erreur suppression partenaire", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
