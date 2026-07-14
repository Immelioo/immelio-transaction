import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { z } from "zod";

const documentSchema = z.object({
  nom: z.string().trim().min(1).max(200),
  type: z.string().trim().max(50).optional().default("AUTRE"),
  url: z.string().trim().min(1).max(2000),
  taille: z.coerce.number().min(0).max(50_000_000).optional().default(0),
  bienId: z.string().cuid().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = documentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { nom, type, url, taille, bienId } = parsed.data;

    const document = await prisma.document.create({
      data: {
        nom,
        type,
        url,
        taille,
        userId: authUser.id,
        bienId: bienId || null,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    logger.error("Erreur création document", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const bienId = searchParams.get("bienId");
  const userId = searchParams.get("userId");

  const where: Record<string, string> = {};
  if (bienId) where.bienId = bienId;
  if (userId) where.userId = userId;

  const documents = await prisma.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}
