import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default async function AdminBiensPage() {
  const biens = await prisma.bien.findMany({
    orderBy: { createdAt: "desc" },
    include: { photos: { take: 1 }, _count: { select: { demandesVisite: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Biens</h1>
          <p className="text-gray-500">{biens.length} bien{biens.length > 1 ? "s" : ""} au total</p>
        </div>
        <Link href="/admin/biens/nouveau"
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-sm">
          + Nouveau bien
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bien</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Prix</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ville</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Visites</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {biens.length > 0 ? biens.map((bien) => (
              <tr key={bien.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {bien.photos[0] ? (
                        <Image src={bien.photos[0].url} alt="" fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{bien.titre}</p>
                      <p className="text-xs text-gray-500">{bien.surface} m² - {bien.nbPieces}p</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${bien.transaction === "VENTE" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                    {bien.transaction}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-sm">{formatPrix(bien.prix)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{bien.ville}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{bien._count.demandesVisite}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${bien.disponible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {bien.disponible ? "Disponible" : "Indisponible"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/biens/${bien.id}`} className="text-primary hover:underline text-sm">
                    Modifier
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Aucun bien enregistré. Commencez par ajouter votre premier bien !
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
