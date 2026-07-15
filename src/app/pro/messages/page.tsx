import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import ProSidebar from "@/components/pro/ProSidebar";
import PartnerMessageThread from "./PartnerMessageThread";

export const dynamic = "force-dynamic";

async function getProUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

export default async function ProMessagesPage() {
  const userId = await getProUserId();

  const messages = userId
    ? await prisma.message.findMany({
        where: { OR: [{ expediteurId: userId }, { destinataireId: userId }] },
        orderBy: { createdAt: "asc" },
        include: { expediteur: { select: { id: true, nom: true, prenom: true, role: true } } },
      })
    : [];

  // Normalise les dates en chaînes ISO pour rester cohérent avec les réponses JSON de l'API.
  const initialMessages = messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProSidebar />
      <main className="flex-1 min-w-0 p-6 md:p-8 pt-20 md:pt-8 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">Échangez directement avec l&apos;agence Immelio Transaction</p>
        </div>
        <PartnerMessageThread initialMessages={initialMessages} />
      </main>
    </div>
  );
}
