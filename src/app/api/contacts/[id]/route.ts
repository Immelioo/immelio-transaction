import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";

interface RouteContext { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const user = await verifyAuth(req, "ADMIN");
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  const body = await req.json();

  if (body.dossier !== undefined) {
    // Upsert a dossier
    const { dossier } = body;
    if (dossier.id) {
      const updated = await prisma.dossier.update({
        where: { id: dossier.id },
        data: {
          titre: dossier.titre,
          type: dossier.type,
          statut: dossier.statut,
          bien: dossier.bien || null,
          montant: dossier.montant ? parseFloat(dossier.montant) : null,
          notes: dossier.notes || null,
          dateEcheance: dossier.dateEcheance ? new Date(dossier.dateEcheance) : null,
        },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.dossier.create({
        data: {
          titre: dossier.titre,
          type: dossier.type || "VENTE",
          statut: dossier.statut || "EN_COURS",
          bien: dossier.bien || null,
          montant: dossier.montant ? parseFloat(dossier.montant) : null,
          notes: dossier.notes || null,
          dateEcheance: dossier.dateEcheance ? new Date(dossier.dateEcheance) : null,
          contactId: id,
        },
      });
      return NextResponse.json(created, { status: 201 });
    }
  }

  // Update contact itself
  const { nom, prenom, telephone, email, entreprise, notes } = body;
  const contact = await prisma.contact.update({
    where: { id },
    data: { nom: nom?.trim(), prenom: prenom?.trim() || null, telephone: telephone?.trim() || null, email: email?.trim() || null, entreprise: entreprise?.trim() || null, notes: notes?.trim() || null },
    include: { dossiers: { orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json(contact);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const user = await verifyAuth(req, "ADMIN");
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  const url = new URL(req.url);
  const dossierId = url.searchParams.get("dossierId");

  if (dossierId) {
    await prisma.dossier.delete({ where: { id: dossierId } });
  } else {
    await prisma.contact.delete({ where: { id } });
  }
  return NextResponse.json({ success: true });
}
