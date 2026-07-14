import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import VisiteActions from "@/components/admin/VisiteActions";

export default async function AdminVisitesPage() {
  const visites = await prisma.demandeVisite.findMany({
    orderBy: { createdAt: "desc" },
    include: { bien: true, user: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demandes de Visite</h1>
        <p className="text-gray-500">{visites.length} demande{visites.length > 1 ? "s" : ""}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bien</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date souhaitée</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Créneau</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visites.length > 0 ? visites.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 text-sm">{v.user.prenom} {v.user.nom}</p>
                  <p className="text-xs text-gray-500">{v.user.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{v.bien.titre}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(v.datesouhaitee)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {v.creneau === "MATIN" ? "Matin" : v.creneau === "APRES_MIDI" ? "Après-midi" : "Soir"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    v.statut === "EN_ATTENTE" ? "bg-yellow-100 text-yellow-700" :
                    v.statut === "CONFIRMEE" ? "bg-green-100 text-green-700" :
                    v.statut === "ANNULEE" ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {v.statut.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <VisiteActions visiteId={v.id} currentStatut={v.statut} />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  Aucune demande de visite
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
