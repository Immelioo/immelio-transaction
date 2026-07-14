import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { temoignageSchema } from "@/lib/schemas";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const authUser = await verifyAuth(req, "ADMIN");

  const temoignages = await prisma.temoignage.findMany({
    where: authUser ? {} : { visible: true },
    orderBy: { ordre: "asc" },
  });

  return NextResponse.json(temoignages);
}

export async function POST(req: NextRequest) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = temoignageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const temoignage = await prisma.temoignage.create({ data: parsed.data });
    return NextResponse.json(temoignage, { status: 201 });
  } catch (error) {
    logger.error("Erreur création témoignage", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
