import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { documentPartenaireSchema } from "@/lib/schemas";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  // Auth obligatoire — userId depuis la session, jamais du body
  const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
  if (!sessionUser) return unauthorizedResponse("Connexion requise");

  try {
    const body = await request.json();
    const parsed = documentPartenaireSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { nom, type, url, taille, bienId, lotId, commentaire } = parsed.data;

    const document = await prisma.documentPartenaire.create({
      data: {
        nom,
        type,
        url,
        taille,
        userId: sessionUser.id, // toujours la session, jamais le body
        bienId: bienId ?? null,
        lotId: lotId ?? null,
        commentaire: commentaire || null,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    logger.error("Erreur creation document partenaire", { error: String(error) });
    return NextResponse.json(
      { error: "Erreur lors de la creation du document" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
  if (!sessionUser) return unauthorizedResponse();

  try {
    // ADMIN : peut filtrer par userId ou voir tout
    // PARTENAIRE : uniquement ses propres documents (query userId ignoré)
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    const where =
      sessionUser.role === "ADMIN" && queryUserId
        ? { userId: queryUserId }
        : sessionUser.role === "ADMIN"
        ? {}
        : { userId: sessionUser.id };

    const documents = await prisma.documentPartenaire.findMany({
      where,
      include: {
        user: {
          select: { id: true, nom: true, prenom: true, email: true, entreprise: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    logger.error("Erreur recuperation documents partenaire", { error: String(error) });
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des documents" },
      { status: 500 }
    );
  }
}
