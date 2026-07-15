import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailNouveauContactAdmin, emailConfirmationContact } from "@/lib/email";
import { contactSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  // Rate limiting : 5 messages / minute par IP
  const ip = getClientIp(req);
  const rl = await checkRateLimit(ip, "contact", RATE_LIMITS.contact);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();

    // Validation Zod
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nom, telephone, sujet, message } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    // Extraire prénom/nom
    const parts = nom.trim().split(" ");
    const prenom = parts[0] || "";
    const nomFamille = parts.slice(1).join(" ") || nom;

    // Créer un lead dans le CRM
    await prisma.lead.create({
      data: {
        nom: nomFamille,
        prenom,
        email,
        telephone: telephone || null,
        source: "SITE_WEB",
        statut: "NOUVEAU",
        notes: `Sujet: ${sujet}\n\n${message}`,
      },
    });

    // Emails en parallèle (non bloquant)
    const adminEmail = emailNouveauContactAdmin({ nom, email, telephone, sujet, message });
    const confirmEmail = emailConfirmationContact({ prenom, nom: nomFamille, sujet });

    await Promise.allSettled([
      sendEmail({ to: adminEmail.to, subject: adminEmail.subject, html: adminEmail.html }),
      sendEmail({ to: email, subject: confirmEmail.subject, html: confirmEmail.html }),
    ]);

    logger.info("Nouveau contact reçu", { email, sujet, ip });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logger.error("Erreur contact", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
