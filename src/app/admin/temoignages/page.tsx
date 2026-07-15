import { prisma } from "@/lib/prisma";
import TemoignagesManager from "./TemoignagesManager";

export const dynamic = "force-dynamic";

export default async function AdminTemoignagesPage() {
  const temoignages = await prisma.temoignage.findMany({ orderBy: { ordre: "asc" } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Témoignages clients</h1>
        <p className="text-gray-500">Gérez les avis affichés sur la page d&apos;accueil</p>
      </div>

      <TemoignagesManager initialTemoignages={temoignages} />
    </div>
  );
}
