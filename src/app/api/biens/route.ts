import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { bienSchema } from "@/lib/schemas";
import { logger } from "@/lib/logger";

// Les champs numériques optionnels arrivent en "" depuis les formulaires admin —
// on les normalise en null avant validation pour préserver la sémantique "non renseigné".
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

export async function GET() {
  // Afficher tout sauf VENDU sur le site public (avec badges statut)
  const biens = await prisma.bien.findMany({
    where: { statut: { not: "VENDU" } },
    include: { photos: { take: 1, orderBy: { ordre: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const biensPublic = biens.map(({ commissionPartenaire, ...rest }) => rest);
  return NextResponse.json(biensPublic);
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req, "ADMIN");
  if (!user) return unauthorizedResponse();

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
    // disponible dérivé du statut
    data.disponible = data.statut === "DISPONIBLE";

    const bien = await prisma.bien.create({ data });

    // Ajouter les photos (format: array d'objets {url, nom} ou string séparée par \n)
    if (photoUrls) {
      const photos = Array.isArray(photoUrls)
        ? photoUrls
        : photoUrls.split("\n").filter((u: string) => u.trim()).map((u: string) => ({ url: u.trim(), nom: "" }));
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
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

    return NextResponse.json(bien, { status: 201 });
  } catch (error) {
    logger.error("Erreur création bien", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
