import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { formatDate, formatPrix } from "@/lib/utils";
import ProSidebar from "@/components/pro/ProSidebar";

async function getProUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

const optionStatutColor: Record<string, string> = {
  EN_COURS: "bg-orange-100 text-orange-700",
  ACCEPTEE: "bg-green-100 text-green-700",
  REFUSEE: "bg-red-100 text-red-700",
  EXPIREE: "bg-gray-100 text-gray-600",
  LEVEE: "bg-blue-100 text-blue-700",
};
const optionStatutLabel: Record<string, string> = {
  EN_COURS: "En cours",
  ACCEPTEE: "Acceptée",
  REFUSEE: "Refusée",
  EXPIREE: "Expirée",
  LEVEE: "Levée",
};
const docStatutColor: Record<string, string> = {
  ENVOYE: "bg-gray-100 text-gray-600",
  TRAITE: "bg-green-100 text-green-700",
  REFUSE: "bg-red-100 text-red-700",
};
const docStatutLabel: Record<string, string> = {
  ENVOYE: "Envoyé",
  TRAITE: "Traité",
  REFUSE: "Refusé",
};
const demandeStatutColor: Record<string, string> = {
  NOUVELLE: "bg-blue-100 text-blue-700",
  EN_COURS: "bg-yellow-100 text-yellow-700",
  TRAITEE: "bg-green-100 text-green-700",
  FERMEE: "bg-gray-100 text-gray-600",
};
const demandeStatutLabel: Record<string, string> = {
  NOUVELLE: "Nouvelle",
  EN_COURS: "En cours",
  TRAITEE: "Traitée",
  FERMEE: "Fermée",
};

export default async function ProHistoriquePage() {
  const userId = await getProUserId();

  const [options, documentsPartenaire, demandesRecherche] = userId
    ? await Promise.all([
        prisma.optionLot.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          include: {
            lot: {
              include: { programme: { select: { nom: true, ville: true } } },
            },
          },
        }),
        prisma.documentPartenaire.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.demandeRecherche.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], [], []];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProSidebar />
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Mon Historique</h1>
            <p className="text-gray-500 mt-1">Options, documents envoyés et demandes de recherche</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Options */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mes options
              <span className="text-sm font-normal text-gray-400">({options.length})</span>
            </h2>

            {options.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400">Aucune option posée pour le moment.</p>
                <a href="/pro/programmes" className="mt-3 inline-block text-sm text-primary hover:underline">
                  Voir les programmes disponibles
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Programme / Lot</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden sm:table-cell">Prix</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Statut</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden md:table-cell">Expiration</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {options.map((opt) => (
                        <tr key={opt.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900">{opt.lot.programme.nom}</p>
                            <p className="text-xs text-gray-500">Lot {opt.lot.numero} · {opt.lot.programme.ville}</p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-primary hidden sm:table-cell">{formatPrix(opt.lot.prix)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${optionStatutColor[opt.statut] || "bg-gray-100 text-gray-600"}`}>
                              {optionStatutLabel[opt.statut] || opt.statut}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">
                            {opt.dateExpiration
                              ? new Date(opt.dateExpiration).toLocaleDateString("fr-FR")
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{formatDate(opt.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Documents envoyés */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documents envoyés
              <span className="text-sm font-normal text-gray-400">({documentsPartenaire.length})</span>
            </h2>

            {documentsPartenaire.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400">Aucun document envoyé.</p>
                <a href="/pro/envoyer-document" className="mt-3 inline-block text-sm text-primary hover:underline">
                  Envoyer un document
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {documentsPartenaire.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center gap-4">
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.nom}</p>
                      <p className="text-xs text-gray-500">{doc.type} · {formatDate(doc.createdAt)}</p>
                      {doc.commentaire && (
                        <p className="text-xs text-gray-400 mt-0.5 italic">{doc.commentaire}</p>
                      )}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${docStatutColor[doc.statut] || "bg-gray-100 text-gray-600"}`}>
                      {docStatutLabel[doc.statut] || doc.statut}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Demandes de recherche */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Demandes de recherche
              <span className="text-sm font-normal text-gray-400">({demandesRecherche.length})</span>
            </h2>

            {demandesRecherche.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400">Aucune demande de recherche envoyée.</p>
                <a href="/pro/demande-recherche" className="mt-3 inline-block text-sm text-primary hover:underline">
                  Soumettre une demande
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {demandesRecherche.map((dem) => (
                  <div key={dem.id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {dem.type} · {dem.transaction}
                        {dem.ville ? ` · ${dem.ville}` : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {dem.surfaceMin && dem.surfaceMax ? `${dem.surfaceMin}–${dem.surfaceMax} m² · ` : ""}
                        {dem.budgetMin && dem.budgetMax
                          ? `${formatPrix(dem.budgetMin)} – ${formatPrix(dem.budgetMax)}`
                          : dem.budgetMax
                          ? `Jusqu'à ${formatPrix(dem.budgetMax)}`
                          : ""}
                        {" · "}{formatDate(dem.createdAt)}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${demandeStatutColor[dem.statut] || "bg-gray-100 text-gray-600"}`}>
                      {demandeStatutLabel[dem.statut] || dem.statut}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
