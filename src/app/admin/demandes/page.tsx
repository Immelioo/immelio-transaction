import { prisma } from "@/lib/prisma";
import { formatDate, formatPrix } from "@/lib/utils";
import DemandeActions from "@/components/admin/DemandeActions";

export default async function AdminDemandesPage() {
  const demandes = await prisma.demandeRecherche.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demandes de Recherche</h1>
        <p className="text-gray-500">{demandes.length} demande{demandes.length > 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-4">
        {demandes.length > 0 ? demandes.map((d) => (
          <div key={d.id} className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{d.user.prenom} {d.user.nom}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    d.statut === "NOUVELLE" ? "bg-blue-100 text-blue-700" :
                    d.statut === "EN_COURS" ? "bg-yellow-100 text-yellow-700" :
                    d.statut === "TRAITEE" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {d.statut.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{d.user.email} &middot; {formatDate(d.createdAt)}</p>
              </div>
              <DemandeActions demandeId={d.id} currentStatut={d.statut} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium text-sm">{d.type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Transaction</p>
                <p className="font-medium text-sm">{d.transaction === "VENTE" ? "Achat" : "Location"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Budget</p>
                <p className="font-medium text-sm">
                  {d.budgetMin ? formatPrix(d.budgetMin) : "—"} - {d.budgetMax ? formatPrix(d.budgetMax) : "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Ville</p>
                <p className="font-medium text-sm">{d.ville || "Non précisé"}</p>
              </div>
            </div>

            {d.description && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{d.description}</p>
            )}
          </div>
        )) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-400">Aucune demande de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
}
