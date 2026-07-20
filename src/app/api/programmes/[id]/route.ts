import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { programmeSchema, lotSchema, photoProgrammeSchema, documentProgrammeSchema } from "@/lib/schemas";
import { planProgrammeLotChanges } from "@/lib/programmeLots";
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
    let photosParsed: z.infer<typeof photoProgrammeSchema>[] | undefined;
    let documentsParsed: z.infer<typeof documentProgrammeSchema>[] | undefined;

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

    if (body.photos !== undefined) {
      const result = z.array(photoProgrammeSchema).safeParse(body.photos);
      if (!result.success) {
        return NextResponse.json(
          { error: "Données de photos invalides", details: result.error.flatten() },
          { status: 400 }
        );
      }
      photosParsed = result.data;
    }

    if (body.documents !== undefined) {
      const result = z.array(documentProgrammeSchema).safeParse(body.documents);
      if (!result.success) {
        return NextResponse.json(
          { error: "Données de documents invalides", details: result.error.flatten() },
          { status: 400 }
        );
      }
      documentsParsed = result.data;
    }

    const existingLots = lotsParsed
      ? await prisma.lot.findMany({
          where: { programmeId: id },
          include: { options: { select: { id: true } } },
        })
      : [];

    const lotPlan = lotsParsed
      ? planProgrammeLotChanges(
          existingLots.map((lot) => ({
            id: lot.id,
            optionCount: lot.options.length,
          })),
          lotsParsed,
        )
      : null;

    if (lotPlan && lotPlan.blocked.length > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer un lot qui porte déjà des options actives. Retirez ou clôturez d'abord les options liées.",
          blockedLotIds: lotPlan.blocked.map((lot) => lot.id),
        },
        { status: 409 },
      );
    }

    const programme = await prisma.$transaction(async (tx) => {
      const updatedProgramme = await tx.programme.update({
        where: { id },
        data: parsed.data,
      });

      if (lotPlan) {
        for (const lot of lotPlan.toUpdate) {
          const { id: lotId, ...lotData } = lot;
          await tx.lot.update({
            where: { id: lotId },
            data: lotData,
          });
        }

        if (lotPlan.toDelete.length > 0) {
          await tx.lot.deleteMany({
            where: {
              programmeId: id,
              id: { in: lotPlan.toDelete },
            },
          });
        }

        for (const lot of lotPlan.toCreate) {
          await tx.lot.create({
            data: { ...lot, programmeId: id },
          });
        }
      }

      if (photosParsed) {
        await tx.photoProgramme.deleteMany({ where: { programmeId: id } });
        for (let i = 0; i < photosParsed.length; i++) {
          const photo = photosParsed[i];
          await tx.photoProgramme.create({
            data: {
              url: photo.url,
              alt: photo.nom || updatedProgramme.nom,
              ordre: i,
              type: "PHOTO",
              programmeId: id,
            },
          });
        }
      }

      if (documentsParsed) {
        await tx.documentProgramme.deleteMany({ where: { programmeId: id } });
        for (const doc of documentsParsed) {
          await tx.documentProgramme.create({
            data: {
              url: doc.url,
              nom: doc.nom,
              type: doc.type,
              taille: doc.taille,
              public: doc.public,
              programmeId: id,
            },
          });
        }
      }

      return updatedProgramme;
    });

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
