import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailConfirmationVisite, emailNouvelleVisiteAdmin } from "@/lib/email";
import { visiteSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(ip, "visite", RATE_LIMITS.visite);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = visiteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { nom, prenom, telephone, dateSouhaitee, creneau, message, bienId, financement } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    // Créer ou trouver l'utilisateur
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, nom, prenom, telephone, password: "", role: "CLIENT" },
      });
    }

    // Récupérer les infos du bien pour l'email
    const bien = await prisma.bien.findUnique({ where: { id: bienId } });

    // Créer la demande de visite
    const visite = await prisma.demandeVisite.create({
      data: {
        datesouhaitee: new Date(dateSouhaitee),
        creneau: creneau || "MATIN",
        message: message || null,
        userId: user.id,
        bienId,
      },
    });

    // Créer un lead automatiquement (CRM)
    await prisma.lead.create({
      data: {
        nom, prenom, email, telephone,
        source: "VISITE",
        statut: "NOUVEAU",
        notes: `Demande de visite pour le bien ${bien?.titre || bienId}${financement ? ` — Financement: ${financement}` : ""}`,
      },
    });

    // ✉️ A1 — Email de confirmation au client (async, ne bloque pas la réponse)
    const dateFormatee = new Date(dateSouhaitee).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    const confirmationEmail = emailConfirmationVisite({
      prenom,
      nom,
      bienTitre: bien?.titre || "Bien immobilier",
      bienAdresse: bien ? `${bien.adresse}, ${bien.ville} (${bien.codePostal})` : "",
      dateSouhaitee: dateFormatee,
      creneau: creneau || "MATIN",
    });

    sendEmail({
      to: email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
    }).catch((err) => logger.error("Erreur email confirmation visite", { error: String(err) }));

    // ✉️ A1 bis — Notification à l'admin
    const notifAdmin = emailNouvelleVisiteAdmin({
      clientNom: `${prenom} ${nom}`,
      clientEmail: email,
      clientTelephone: telephone,
      bienTitre: bien?.titre || bienId,
      dateSouhaitee: dateFormatee,
      creneau: creneau || "MATIN",
      message,
    });

    sendEmail(notifAdmin).catch((err) => logger.error("Erreur email notif admin", { error: String(err) }));

    return NextResponse.json(visite, { status: 201 });
  } catch (error) {
    logger.error("Erreur création visite", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
