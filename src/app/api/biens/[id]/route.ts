import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { bienSchema } from "@/lib/schemas";
import { logger } from "@/lib/logger";

const NULLABLE_OPTIONAL_FIELDS = [
  "etage", "anneeConstruction", "chargesmensuelles", "honoraires",
  "commissionPartenaire", "latitude", "longitude", "dpe", "ges",
] as const;

function normalizeEmptyToNull(body: Record<string, unknown>) {
  const result = { ...body };
  for (const key of NULLABLE_OPTIONAL_FIELDS) {
    if (result[key] === "") result[key] = null;
  }
  return result;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const authUser = await verifyAuth(_req, "ADMIN");
  const { id } = await context.params;

  const bien = await prisma.bien.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { ordre: "asc" } },
      ...(authUser ? { documents: true } : {}),
    },
  });

  if (!bien) {
    return NextResponse.json({ error: "Bien non trouvé" }, { status: 404 });
  }

  if (!authUser && bien.disponible === false) {
    return NextResponse.json({ error: "Bien non trouvé" }, { status: 404 });
  }

  if (!authUser) {
    const bienPublic = { ...bien } as Record<string, unknown>;
    delete bienPublic.commissionPartenaire;
    delete bienPublic.documents;
    return NextResponse.json(bienPublic);
  }

  return NextResponse.json(bien);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = bienSchema.safeParse(normalizeEmptyToNull(body));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { photoUrls, ...data } = parsed.data;

    const bien = await prisma.bien.update({ where: { id }, data });

    // Mettre à jour les photos si fournies
    if (photoUrls && Array.isArray(photoUrls)) {
      // Supprimer les anciennes photos
      await prisma.photo.deleteMany({ where: { bienId: id } });
      // Créer les nouvelles
      for (let i = 0; i < photoUrls.length; i++) {
        const photo = photoUrls[i];
        const url = typeof photo === "string" ? photo : photo.url;
        const nom = typeof photo === "string" ? "" : photo.nom;
        await prisma.photo.create({
          data: {
            url,
            alt: nom || data.titre,
            ordre: i,
            bienId: bien.id,
          },
        });
      }
    }

    return NextResponse.json(bien);
  } catch (error) {
    logger.error("Erreur mise à jour bien", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  const { id } = await context.params;

  try {
    await prisma.bien.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erreur suppression bien", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
