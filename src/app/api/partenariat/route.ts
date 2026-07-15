import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";

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
        { status: 400 }
      );
    }

    const { prenom, nom, telephone, societe, ville, message } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    let contact = await prisma.contact.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          nom,
          prenom,
          telephone,
          email,
          entreprise: societe,
          notes: `Ville: ${ville}`,
        },
      });
    } else {
      contact = await prisma.contact.update({
        where: { id: contact.id },
        data: {
          nom,
          prenom,
          telephone,
          entreprise: societe,
          notes: [contact.notes, `Ville: ${ville}`].filter(Boolean).join("\n"),
        },
      });
    }

    const dossier = await prisma.dossier.create({
      data: {
        titre: `Demande de partenariat - ${societe}`,
        type: "PARTENARIAT",
        statut: "NOUVELLE",
        notes: [
          `Origine: portail partenaire`,
          `Ville: ${ville}`,
          message ? `Message: ${message}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        contactId: contact.id,
      },
    });

    await prisma.lead.create({
      data: {
        nom,
        prenom,
        email,
        telephone,
        source: "PARTENAIRE",
        statut: "NOUVEAU",
        notes: [
          `Demande de partenariat`,
          `Société: ${societe}`,
          `Ville: ${ville}`,
          message ? `Message: ${message}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    });

    logger.info("Demande de partenariat créée", {
      contactId: contact.id,
      dossierId: dossier.id,
      email,
      ip,
    });

    return NextResponse.json(
      {
        success: true,
        contactId: contact.id,
        dossierId: dossier.id,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Erreur création demande partenariat", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
