import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";

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
        dateContact: true, inviteToken: true, inviteTokenExpiry: true,
        createdAt: true, updatedAt: true,
        documents: true,
      },
    });

    if (!partenaire) {
      return NextResponse.json({ error: "Partenaire non trouvé" }, { status: 404 });
    }

    return NextResponse.json(partenaire);
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

    const data: Record<string, unknown> = {};

    // Mise à jour des champs fournis
    if (body.nom !== undefined) data.nom = body.nom;
    if (body.prenom !== undefined) data.prenom = body.prenom;
    if (body.email !== undefined) data.email = body.email;
    if (body.telephone !== undefined) data.telephone = body.telephone || null;
    if (body.entreprise !== undefined) data.entreprise = body.entreprise;

    // Marquer comme contacté
    if (body.contacte !== undefined) {
      data.contacte = body.contacte;
      if (body.contacte === true) {
        data.dateContact = new Date();
      }
    }

    // Ne hacher et mettre à jour le mot de passe que s'il est fourni
    if (body.password && body.password.trim() !== "") {
      data.password = await bcrypt.hash(body.password, 12);
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
