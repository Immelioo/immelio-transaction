import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { programmeSchema, lotSchema } from "@/lib/schemas";
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(req, "ADMIN");
    const { id } = await params;
    const programme = await prisma.programme.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { ordre: "asc" } },
        documentsProgramme: authUser
          ? { orderBy: { createdAt: "desc" } }
          : { where: { public: true }, orderBy: { createdAt: "desc" } },
        lots: {
          orderBy: { numero: "asc" },
          ...(authUser ? { include: { options: true } } : {}),
        },
      },
    });

    if (!programme) {
      return NextResponse.json({ error: "Programme introuvable" }, { status: 404 });
    }

    if (!authUser) {
      const programmePublic = { ...programme } as Record<string, unknown>;
      delete programmePublic.commissionPartenaire;
      return NextResponse.json(programmePublic);
    }

    return NextResponse.json(programme);
  } catch (error) {
    logger.error("Erreur GET programme", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = programmeSchema.safeParse(normalizeEmptyToNull(body));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let lotsParsed: z.infer<typeof lotSchema>[] | undefined;
    if (body.lots && Array.isArray(body.lots)) {
      const result = z.array(lotSchema).safeParse(body.lots);
      if (!result.success) {
        return NextResponse.json(
          { error: "Données de lots invalides", details: result.error.flatten() },
          { status: 400 }
        );
      }
      lotsParsed = result.data;
    }

    const programme = await prisma.programme.update({
      where: { id },
      data: parsed.data,
    });

    // Mettre à jour les lots si fournis
    if (lotsParsed) {
      await prisma.lot.deleteMany({ where: { programmeId: id } });
      for (const lot of lotsParsed) {
        await prisma.lot.create({
          data: { ...lot, programmeId: id },
        });
      }
    }

    // Mettre à jour les photos si fournies
    if (body.photos !== undefined && Array.isArray(body.photos)) {
      await prisma.photoProgramme.deleteMany({ where: { programmeId: id } });
      for (let i = 0; i < body.photos.length; i++) {
        const photo = body.photos[i] as { url: string; nom?: string };
        await prisma.photoProgramme.create({
          data: {
            url: photo.url,
            alt: photo.nom || programme.nom,
            ordre: i,
            type: "PHOTO",
            programmeId: id,
          },
        });
      }
    }

    // Mettre à jour les documents si fournis
    if (body.documents !== undefined && Array.isArray(body.documents)) {
      await prisma.documentProgramme.deleteMany({ where: { programmeId: id } });
      for (const doc of body.documents as { url: string; nom: string; type?: string; taille?: number }[]) {
        await prisma.documentProgramme.create({
          data: {
            url: doc.url,
            nom: doc.nom,
            type: doc.type || "PLAQUETTE",
            taille: doc.taille || 0,
            public: true,
            programmeId: id,
          },
        });
      }
    }

    return NextResponse.json(programme);
  } catch (error) {
    logger.error("Erreur PUT programme", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  try {
    const { id } = await params;
    await prisma.programme.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erreur DELETE programme", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
