import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demandeRechercheSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(ip, "demande", RATE_LIMITS.demande);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();

    const parsed = demandeRechercheSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      type, transaction, budgetMin, budgetMax, surfaceMin, surfaceMax,
      nbPiecesMin, ville, description,
      nom, prenom, telephone,
    } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    // Créer ou trouver l'utilisateur — toujours CLIENT, jamais PARTENAIRE depuis cette API publique
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          nom,
          prenom,
          telephone,
          password: "",
          role: "CLIENT", // toujours CLIENT — jamais depuis user input
        },
      });
    }

    const demande = await prisma.demandeRecherche.create({
      data: {
        type,
        transaction,
        budgetMin: budgetMin ?? null,
        budgetMax: budgetMax ?? null,
        surfaceMin: surfaceMin ?? null,
        surfaceMax: surfaceMax ?? null,
        nbPiecesMin: nbPiecesMin ?? null,
        ville: ville || null,
        description: description || null,
        userId: user.id,
      },
    });

    await prisma.lead.create({
      data: {
        nom, prenom, email, telephone,
        source: "RECHERCHE",
        statut: "NOUVEAU",
        notes: `Demande de recherche : ${type} ${transaction} à ${ville || "non précisé"}`,
      },
    });

    logger.info("Demande de recherche créée", { demandeId: demande.id, ip });

    return NextResponse.json(demande, { status: 201 });
  } catch (error) {
    logger.error("Erreur création demande", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
