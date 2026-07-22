import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  emailConfirmationEstimation,
  emailNouvelleEstimationAdmin,
} from "@/lib/email";
import { estimationSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { createAutoActivity } from "@/lib/leadAutomation";

function formatOptionalNumber(value: number | "" | null | undefined) {
  if (value === "" || value === null || value === undefined) return "N/A";
  return String(value);
}

function formatOptionalText(value: string | null | undefined) {
  if (!value) return "N/A";
  return value;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(ip, "estimation", RATE_LIMITS.estimation);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = estimationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      type,
      surface,
      nbPieces,
      nbChambres,
      etage,
      anneeConstruction,
      etat,
      parking,
      terrasse,
      balcon,
      cave,
      piscine,
      ascenseur,
      adresse,
      codePostal,
      ville,
      nom,
      prenom,
      email,
      telephone,
      commentaire,
    } = parsed.data;

    const emailNormalized = email.toLowerCase();
    const fullName = [prenom, nom].filter(Boolean).join(" ").trim();
    const equipements = [
      parking && "Parking",
      terrasse && "Terrasse",
      balcon && "Balcon",
      cave && "Cave",
      piscine && "Piscine",
      ascenseur && "Ascenseur",
    ].filter(Boolean);

    const details = [
      `Type: ${type}`,
      `Surface: ${surface} m²`,
      `Pièces: ${nbPieces}`,
      `Chambres: ${formatOptionalNumber(nbChambres)}`,
      `Étage: ${formatOptionalNumber(etage)}`,
      `Année de construction: ${formatOptionalNumber(anneeConstruction)}`,
      `État: ${formatOptionalText(etat)}`,
      `Adresse: ${formatOptionalText(adresse)}, ${codePostal} ${ville}`,
      `Équipements: ${equipements.length > 0 ? equipements.join(", ") : "Aucun"}`,
      `Commentaire: ${formatOptionalText(commentaire)}`,
    ].join("\n");

    const lead = await prisma.lead.create({
      data: {
        nom,
        prenom: prenom || "",
        email: emailNormalized,
        telephone: telephone || null,
        source: "ESTIMATION",
        statut: "NOUVEAU",
        notes: `[ESTIMATION]\n${details}`,
      },
    });

    void createAutoActivity(lead.id, "ESTIMATION");

    const adminEmail = emailNouvelleEstimationAdmin({
      nom: fullName || nom,
      email: emailNormalized,
      telephone: telephone || "Non renseigné",
      type,
      surface: String(surface),
      ville,
      details,
    });
    const confirmEmail = emailConfirmationEstimation({
      prenom: prenom || "",
      type,
      surface: String(surface),
      ville,
    });

    await Promise.allSettled([
      sendEmail({ to: adminEmail.to, subject: adminEmail.subject, html: adminEmail.html }),
      sendEmail({ to: emailNormalized, subject: confirmEmail.subject, html: confirmEmail.html }),
    ]);

    logger.info("Nouvelle estimation reçue", { leadId: lead.id, email: emailNormalized, ville, ip });
    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    logger.error("Erreur estimation", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
