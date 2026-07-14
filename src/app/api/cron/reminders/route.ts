import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

// Route appelée par le cron Vercel (voir vercel.json)
// Sécurisée par un token secret dans l'header Authorization
export async function GET(req: NextRequest) {
  // Vérifier le token cron
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "tf.immopro@gmail.com";
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  let emailsSent = 0;

  try {
    // ============================================
    // 1. Leads NOUVEAU depuis plus de 48h
    // ============================================
    const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const leadsNonTraites = await prisma.lead.findMany({
      where: {
        statut: "NOUVEAU",
        createdAt: { lt: cutoff48h },
      },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    if (leadsNonTraites.length > 0) {
      const lignes = leadsNonTraites.map(
        (l) => `• ${l.prenom} ${l.nom} (${l.email}) — créé le ${new Date(l.createdAt).toLocaleDateString("fr-FR")}`
      ).join("<br/>");

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `⏰ Relance CRM — ${leadsNonTraites.length} lead(s) en attente depuis +48h`,
        html: `
          <div style="background:#1e3a5f;padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-family:Arial;">⏰ Relance CRM — Immelio Transaction</h1>
          </div>
          <div style="padding:32px;font-family:Arial;color:#333;max-width:600px;margin:0 auto;">
            <h2 style="color:#1e3a5f;">${leadsNonTraites.length} lead(s) n'ont pas été contactés depuis plus de 48h</h2>
            <div style="background:#fff3cd;border-radius:12px;padding:20px;margin:24px 0;border-left:4px solid #d4a853;">
              ${lignes}
            </div>
            <a href="${SITE_URL}/admin/leads" style="display:inline-block;background:#1e3a5f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Gérer les leads
            </a>
          </div>
        `,
      });
      emailsSent++;
      logger.info(`Cron: ${leadsNonTraites.length} leads non traités notifiés`);
    }

    // ============================================
    // 2. Visites EN_ATTENTE depuis plus de 24h
    // ============================================
    const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const visitesEnAttente = await prisma.demandeVisite.findMany({
      where: {
        statut: "EN_ATTENTE",
        createdAt: { lt: cutoff24h },
      },
      include: {
        user: { select: { nom: true, prenom: true, email: true } },
        bien: { select: { titre: true, adresse: true, ville: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    if (visitesEnAttente.length > 0) {
      const lignes = visitesEnAttente.map(
        (v) => `• ${v.user.prenom} ${v.user.nom} — ${v.bien.titre} — ${new Date(v.datesouhaitee).toLocaleDateString("fr-FR")}`
      ).join("<br/>");

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `🏠 Rappel — ${visitesEnAttente.length} demande(s) de visite en attente`,
        html: `
          <div style="background:#1e3a5f;padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-family:Arial;">🏠 Rappel visites — Immelio Transaction</h1>
          </div>
          <div style="padding:32px;font-family:Arial;color:#333;max-width:600px;margin:0 auto;">
            <h2 style="color:#1e3a5f;">${visitesEnAttente.length} demande(s) de visite en attente depuis +24h</h2>
            <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:24px 0;">
              ${lignes}
            </div>
            <a href="${SITE_URL}/admin/visites" style="display:inline-block;background:#d4a853;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Gérer les visites
            </a>
          </div>
        `,
      });
      emailsSent++;
      logger.info(`Cron: ${visitesEnAttente.length} visites en attente notifiées`);
    }

    return NextResponse.json({
      success: true,
      leadsAlerted: leadsNonTraites.length,
      visitesAlerted: visitesEnAttente.length,
      emailsSent,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    logger.error("Erreur cron reminders", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
