import { prisma } from "@/lib/prisma";
import MessagesManager from "./MessagesManager";

export default async function AdminMessagesPage() {
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messagerie Partenaires</h1>
        <p className="text-gray-500">Échangez directement avec vos partenaires</p>
      </div>
      <MessagesManager initialConversations={conversations} />
    </div>
  );
}
