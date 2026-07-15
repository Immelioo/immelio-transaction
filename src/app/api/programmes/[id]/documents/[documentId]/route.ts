import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { proxyFileDownload } from "@/lib/fileDownload";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  const { id, documentId } = await params;

  const document = await prisma.documentProgramme.findFirst({
    where: {
      id: documentId,
      programmeId: id,
    },
    select: {
      id: true,
      nom: true,
      url: true,
      type: true,
      public: true,
      programmeId: true,
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  if (!document.public) {
    const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
    if (!sessionUser) return unauthorizedResponse();
  }

  logger.info("Téléchargement document programme", {
    documentId: document.id,
    programmeId: document.programmeId,
    documentType: document.type,
    ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown",
  });

  return proxyFileDownload(request, document.url, document.nom);
}
