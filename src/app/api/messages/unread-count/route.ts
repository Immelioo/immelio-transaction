import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
  if (!sessionUser) return unauthorizedResponse();

  try {
    const count =
      sessionUser.role === "PARTENAIRE"
        ? await prisma.message.count({ where: { destinataireId: sessionUser.id, lu: false } })
        : await prisma.message.count({ where: { lu: false, expediteur: { role: "PARTENAIRE" } } });

    return NextResponse.json({ count });
  } catch (error) {
    logger.error("Erreur unread count messages", { error: String(error) });
    return NextResponse.json({ count: 0 });
  }
}
