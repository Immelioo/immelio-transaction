import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { optionSchema } from "@/lib/schemas";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  // Auth obligatoire — l'userId vient de la session, jamais du body
  const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
  if (!sessionUser) return unauthorizedResponse("Connexion requise pour poser une option");

  try {
    const body = await request.json();
    const parsed = optionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { lotId, message } = parsed.data;

    // Vérifier que le lot est disponible
    const lot = await prisma.lot.findUnique({ where: { id: lotId } });
    if (!lot) {
      return NextResponse.json({ error: "Lot introuvable" }, { status: 404 });
    }
    if (lot.statut !== "DISPONIBLE") {
      return NextResponse.json(
        { error: "Ce lot n'est plus disponible" },
        { status: 409 }
      );
    }

    const existingActiveOption = await prisma.optionLot.findFirst({
      where: {
        lotId,
        statut: {
          in: ["EN_COURS", "ACCEPTEE"],
        },
      },
    });

    if (existingActiveOption) {
      return NextResponse.json(
        { error: "Une option est deja en cours sur ce lot." },
        { status: 409 },
      );
    }

    const dateExpiration = new Date();
    dateExpiration.setDate(dateExpiration.getDate() + 7);

    const option = await prisma.$transaction(async (tx) => {
      const created = await tx.optionLot.create({
        data: {
          lotId,
          userId: sessionUser.id, // userId depuis la session — jamais le body
          message: message ?? null,
          dateExpiration,
          statut: "EN_COURS",
        },
        include: {
          lot: {
            include: { programme: true },
          },
          user: {
            select: { id: true, nom: true, prenom: true, email: true, entreprise: true },
          },
        },
      });

      await tx.lot.update({
        where: { id: lotId },
        data: { statut: "OPTION" },
      });

      return created;
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    logger.error("Erreur creation option", { error: String(error) });
    return NextResponse.json(
      { error: "Erreur lors de la creation de l'option" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
  if (!sessionUser) return unauthorizedResponse();

  try {
    // ADMIN : peut filtrer par userId via query param
    // PARTENAIRE : ne voit que ses propres options (userId param ignoré)
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    const where =
      sessionUser.role === "ADMIN" && queryUserId
        ? { userId: queryUserId }
        : sessionUser.role === "ADMIN" && !queryUserId
        ? {}
        : { userId: sessionUser.id };

    const options = await prisma.optionLot.findMany({
      where,
      include: {
        lot: {
          include: { programme: true },
        },
        user: {
          select: { id: true, nom: true, prenom: true, email: true, entreprise: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(options);
  } catch (error) {
    logger.error("Erreur recuperation options", { error: String(error) });
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des options" },
      { status: 500 }
    );
  }
}
