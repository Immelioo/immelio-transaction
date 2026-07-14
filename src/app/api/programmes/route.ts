import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { programmeSchema, photoProgrammeSchema, documentProgrammeSchema, lotSchema } from "@/lib/schemas";
import { logger } from "@/lib/logger";
import { z } from "zod";

const NULLABLE_OPTIONAL_FIELDS = ["prixMin", "prixMax", "surfaceMin", "surfaceMax", "commissionPartenaire", "normeRT", "datelivraison"] as const;

function normalizeEmptyToNull(body: Record<string, unknown>) {
  const result = { ...body };
  for (const key of NULLABLE_OPTIONAL_FIELDS) {
    if (result[key] === "") result[key] = null;
  }
  return result;
}

export async function GET() {
  const programmes = await prisma.programme.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      photos: { take: 1, orderBy: { ordre: "asc" } },
      _count: { select: { lots: true } },
    },
  });
  const programmesPublics = programmes.map((programme) => {
    const programmePublic = { ...programme } as Record<string, unknown>;
    delete programmePublic.commissionPartenaire;
    return programmePublic;
  });
  return NextResponse.json(programmesPublics);
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req, "ADMIN");
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = programmeSchema.safeParse(normalizeEmptyToNull(body));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const photosParsed = z.array(photoProgrammeSchema).safeParse(body.photos ?? []);
    const documentsParsed = z.array(documentProgrammeSchema).safeParse(body.documents ?? []);
    const lotsParsed = z.array(lotSchema).safeParse(body.lots ?? []);
    if (!photosParsed.success || !documentsParsed.success || !lotsParsed.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: {
            photos: photosParsed.success ? undefined : photosParsed.error.flatten(),
            documents: documentsParsed.success ? undefined : documentsParsed.error.flatten(),
            lots: lotsParsed.success ? undefined : lotsParsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const programme = await prisma.programme.create({ data: parsed.data });

    // Ajouter les photos
    for (let i = 0; i < photosParsed.data.length; i++) {
      const photo = photosParsed.data[i];
      await prisma.photoProgramme.create({
        data: {
          url: photo.url,
          alt: photo.nom || programme.nom,
          ordre: i,
          type: photo.type,
          programmeId: programme.id,
        },
      });
    }

    // Ajouter les documents
    for (const doc of documentsParsed.data) {
      await prisma.documentProgramme.create({
        data: { ...doc, programmeId: programme.id },
      });
    }

    // Ajouter les lots
    for (const lot of lotsParsed.data) {
      await prisma.lot.create({
        data: { ...lot, programmeId: programme.id },
      });
    }

    return NextResponse.json(programme, { status: 201 });
  } catch (error) {
    logger.error("Erreur création programme", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
