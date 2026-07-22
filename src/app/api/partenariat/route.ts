import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/auth";
import { createPartnershipRequest } from "@/lib/partnershipRequest";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { createAutoActivity } from "@/lib/leadAutomation";

const phoneRegex = /^[0-9\s+\-.()]{6,20}$/;

const partenariatSchema = z.object({
  prenom: z.string().trim().min(1).max(100),
  nom: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  telephone: z.string().trim().regex(phoneRegex, "Téléphone invalide"),
  societe: z.string().trim().min(1).max(200),
  ville: z.string().trim().min(1).max(100),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(ip, "partenariat", RATE_LIMITS.contact);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = partenariatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { prenom, nom, telephone, societe, ville, message } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    const { contact, dossier } = await createPartnershipRequest({
      prenom,
      nom,
      email,
      telephone,
      entreprise: societe,
      ville,
      message: message || null,
      origin: "PORTAIL_PARTENAIRE",
    });

    // Créer un lead B2B dans le pipeline CRM
    const b2bLead = await prisma.lead.create({
      data: {
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        email: parsed.data.email.toLowerCase(),
        telephone: parsed.data.telephone || null,
        source: "PARTENARIAT",
        statut: "NOUVEAU",
        notes: `[B2B] Partenariat via portail — ${parsed.data.societe}, ${parsed.data.ville}${parsed.data.message ? `\n\n${parsed.data.message}` : ""}`,
      },
    });
    void createAutoActivity(b2bLead.id, "PARTENARIAT");

    logger.info("Demande de partenariat créée", {
      contactId: contact.id,
      dossierId: dossier.id,
      leadId: b2bLead.id,
      email,
      ip,
    });

    return NextResponse.json(
      {
        success: true,
        contactId: contact.id,
        dossierId: dossier.id,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Erreur création demande partenariat", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
