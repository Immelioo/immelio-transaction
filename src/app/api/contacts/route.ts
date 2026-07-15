import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req, "ADMIN");
  if (!user) return unauthorizedResponse();

  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
    include: { dossiers: { orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req, "ADMIN");
  if (!user) return unauthorizedResponse();

  const body = await req.json();
  const { nom, prenom, telephone, email, entreprise, notes } = body;

  if (!nom?.trim()) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: { nom: nom.trim(), prenom: prenom?.trim() || null, telephone: telephone?.trim() || null, email: email?.trim() || null, entreprise: entreprise?.trim() || null, notes: notes?.trim() || null },
    include: { dossiers: true },
  });
  return NextResponse.json(contact, { status: 201 });
}
