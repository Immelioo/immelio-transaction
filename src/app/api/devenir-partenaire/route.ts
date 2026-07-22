import { NextRequest, NextResponse } from "next/server";
import { sendEmail, emailDemandePartenariat } from "@/lib/email";
import { devenirPartenaireSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/auth";
import { createPartnershipRequest } from "@/lib/partnershipRequest";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { createAutoActivity } from "@/lib/leadAutomation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.immelio.fr";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(ip, "contact", RATE_LIMITS.contact);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();

    const parsed = devenirPartenaireSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { prenom, nom, entreprise, message } = parsed.data;
    const email = parsed.data.email.toLowerCase();
    const telephone = parsed.data.telephone || undefined;

    const { contact, dossier } = await createPartnershipRequest({
      prenom,
      nom,
      email,
      telephone: telephone || null,
      entreprise,
      message: message || null,
      origin: "SITE_PUBLIC",
    });

    // Lien pré-rempli vers le formulaire de création partenaire
    const params = new URLSearchParams({
      dossierId: dossier.id,
      contactId: contact.id,
      prenom,
      nom,
      email,
      ...(telephone && { telephone }),
      entreprise,
    });
    const prefillUrl = `${SITE_URL}/admin/partenaires/nouveau?${params.toString()}`;

    // Créer un lead B2B dans le pipeline CRM
    const b2bLead = await prisma.lead.create({
      data: {
        nom,
        prenom,
        email,
        telephone: telephone || null,
        source: "PARTENARIAT",
        statut: "NOUVEAU",
        notes: `[B2B] Demande partenariat — ${entreprise}${message ? `\n\n${message}` : ""}`,
      },
    });
    void createAutoActivity(b2bLead.id, "PARTENARIAT");

    const adminEmail = emailDemandePartenariat({ prenom, nom, email, telephone, entreprise, message, prefillUrl });
    await sendEmail({ to: adminEmail.to, subject: adminEmail.subject, html: adminEmail.html });

    logger.info("Demande de partenariat reçue", { email, entreprise, dossierId: dossier.id, contactId: contact.id, ip });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logger.error("Erreur demande de partenariat", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
