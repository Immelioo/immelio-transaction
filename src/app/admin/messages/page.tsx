import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MessagesManager from "./MessagesManager";

const PAGE_SIZE = 50;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const rawPage = Number(params?.page ?? "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const totalPartenaires = await prisma.user.count({ where: { role: "PARTENAIRE" } });

  const partenaires = await prisma.user.findMany({
    where: { role: "PARTENAIRE" },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
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

  const totalPages = Math.max(1, Math.ceil(totalPartenaires / PAGE_SIZE));
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messagerie Partenaires</h1>
          <p className="text-gray-500">
            {totalPartenaires} partenaire{totalPartenaires > 1 ? "s" : ""} — page {page} / {totalPages}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {previousPage ? (
            <Link
              href={`/admin/messages?page=${previousPage}`}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Précédent
            </Link>
          ) : (
            <span className="rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-300">
              Précédent
            </span>
          )}
          {nextPage ? (
            <Link
              href={`/admin/messages?page=${nextPage}`}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Suivant
            </Link>
          ) : (
            <span className="rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-300">
              Suivant
            </span>
          )}
        </div>
      </div>
      <MessagesManager initialConversations={conversations} />
    </div>
  );
}
