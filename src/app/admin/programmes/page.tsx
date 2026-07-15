import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrix, formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";

const statutLabels: Record<string, { label: string; color: string }> = {
  EN_COMMERCIALISATION: { label: "En commercialisation", color: "bg-green-100 text-green-700" },
  BIENTOT: { label: "Bientôt", color: "bg-blue-100 text-blue-700" },
  LIVRE: { label: "Livré", color: "bg-gray-100 text-gray-700" },
};

export default async function AdminProgrammesPage() {
  const programmes = await prisma.programme.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { lots: true } },
      lots: { where: { statut: "DISPONIBLE" }, select: { id: true } },
      photos: { take: 1, orderBy: { ordre: "asc" } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programmes Neufs</h1>
          <p className="text-gray-500">{programmes.length} programme{programmes.length > 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/programmes/nouveau"
          className="px-4 py-2.5 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau programme
        </Link>
      </div>

      {programmes.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Programme</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Ville</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Promoteur</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Lots</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Disponibles</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Prix min</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {programmes.map((prog) => {
                const statut = statutLabels[prog.statut] || statutLabels.EN_COMMERCIALISATION;
                return (
                  <tr key={prog.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          {prog.photos[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={prog.photos[0].url}
                              alt={prog.nom}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{prog.nom}</p>
                          <p className="text-xs text-gray-500">
                            {prog.photos[0] ? "Image vitrine configurée" : "Aucune image vitrine"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{prog.ville}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{prog.promoteur}</td>
                    <td className="py-3 px-4 text-sm text-center font-medium">{prog._count.lots}</td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className="text-green-600 font-semibold">{prog.lots.length}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-primary">
                      {prog.prixMin ? formatPrix(prog.prixMin) : "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statut.color}`}>
                        {statut.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-center text-gray-500">{formatDate(prog.createdAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/programmes/${prog.id}/modifier`} className="text-primary hover:underline text-sm font-medium">
                          Modifier
                        </Link>
                        <Link href={`/programmes/${prog.id}`} className="text-gray-500 hover:underline text-sm">
                          Voir
                        </Link>
                        <DeleteButton id={prog.id} type="programmes" iconOnly />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">Aucun programme enregistré</p>
          <Link href="/admin/programmes/nouveau" className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-lg font-medium">
            Créer le premier programme
          </Link>
        </div>
      )}
    </div>
  );
}
