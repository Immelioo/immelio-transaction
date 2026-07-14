import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { leadSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  const sessionUser = await verifyAuth(req, "ADMIN");
  if (!sessionUser) return unauthorizedResponse();

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { activites: true } } },
  });

  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const sessionUser = await verifyAuth(req, "ADMIN");
  if (!sessionUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { nom, prenom, email, telephone, source, notes } = parsed.data;

    const lead = await prisma.lead.create({
      data: {
        nom,
        prenom,
        email: email.toLowerCase(),
        telephone: telephone || null,
        source,
        notes: notes || null,
        statut: "NOUVEAU",
      },
    });

    logger.info("Lead créé manuellement", { leadId: lead.id, adminId: sessionUser.id });
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    logger.error("Erreur création lead", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
