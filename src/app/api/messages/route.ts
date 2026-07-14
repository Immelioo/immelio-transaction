import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth, unauthorizedResponse, rateLimitResponse } from "@/lib/auth";
import { messageSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

const expediteurSelect = {
  expediteur: { select: { id: true, nom: true, prenom: true, role: true } },
};

export async function GET(request: NextRequest) {
  const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
  if (!sessionUser) return unauthorizedResponse();

  try {
    if (sessionUser.role === "PARTENAIRE") {
      // Un partenaire ne voit que son propre fil avec l'agence.
      const messages = await prisma.message.findMany({
        where: { OR: [{ expediteurId: sessionUser.id }, { destinataireId: sessionUser.id }] },
        orderBy: { createdAt: "asc" },
        include: expediteurSelect,
      });
      return NextResponse.json(messages);
    }

    // ADMIN
    const { searchParams } = new URL(request.url);
    const partenaireId = searchParams.get("partenaireId");

    if (partenaireId) {
      const messages = await prisma.message.findMany({
        where: { OR: [{ expediteurId: partenaireId }, { destinataireId: partenaireId }] },
        orderBy: { createdAt: "asc" },
        include: expediteurSelect,
      });
      return NextResponse.json(messages);
    }

    // Liste des conversations (une par partenaire)
    const partenaires = await prisma.user.findMany({
      where: { role: "PARTENAIRE" },
      select: { id: true, nom: true, prenom: true, entreprise: true },
    });

    const conversations = await Promise.all(
      partenaires.map(async (p) => {
        const [lastMessage, unreadCount] = await Promise.all([
          prisma.message.findFirst({
            where: { OR: [{ expediteurId: p.id }, { destinataireId: p.id }] },
            orderBy: { createdAt: "desc" },
          }),
          prisma.message.count({ where: { expediteurId: p.id, lu: false } }),
        ]);
        return { partenaire: p, lastMessage, unreadCount };
      })
    );

    conversations.sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
      }
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      return a.partenaire.nom.localeCompare(b.partenaire.nom);
    });

    return NextResponse.json(conversations);
  } catch (error) {
    logger.error("Erreur récupération messages", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
  if (!sessionUser) return unauthorizedResponse("Connexion requise pour envoyer un message.");

  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, "message", RATE_LIMITS.message);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await request.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { contenu } = parsed.data;
    let destinataireId = parsed.data.destinataireId;

    if (sessionUser.role === "PARTENAIRE") {
      // Un partenaire écrit toujours à l'agence — on résout n'importe quel compte ADMIN.
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
      if (!admin) {
        return NextResponse.json({ error: "Aucun administrateur disponible" }, { status: 500 });
      }
      destinataireId = admin.id;
    } else {
      if (!destinataireId) {
        return NextResponse.json({ error: "Destinataire requis" }, { status: 400 });
      }
      const destinataire = await prisma.user.findUnique({
        where: { id: destinataireId },
        select: { role: true },
      });
      if (!destinataire || destinataire.role !== "PARTENAIRE") {
        return NextResponse.json({ error: "Destinataire invalide" }, { status: 400 });
      }
    }

    const message = await prisma.message.create({
      data: {
        sujet: "Conversation",
        contenu,
        expediteurId: sessionUser.id,
        destinataireId,
      },
      include: expediteurSelect,
    });

    logger.info("Message envoyé", { messageId: message.id, expediteurId: sessionUser.id, destinataireId });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    logger.error("Erreur envoi message", { error: String(error) });
    return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const sessionUser = await verifyAuth(request, "ADMIN_OR_PARTENAIRE");
  if (!sessionUser) return unauthorizedResponse();

  try {
    const body = await request.json().catch(() => ({}));
    const partenaireId = typeof body.partenaireId === "string" ? body.partenaireId : null;

    if (sessionUser.role === "PARTENAIRE") {
      await prisma.message.updateMany({
        where: { destinataireId: sessionUser.id, lu: false },
        data: { lu: true },
      });
    } else {
      if (!partenaireId) {
        return NextResponse.json({ error: "partenaireId requis" }, { status: 400 });
      }
      await prisma.message.updateMany({
        where: { expediteurId: partenaireId, lu: false },
        data: { lu: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Erreur marquage messages lus", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
