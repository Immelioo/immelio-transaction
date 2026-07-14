import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/utils";
import LotGrid from "./LotGrid";
import ProSidebar from "@/components/pro/ProSidebar";

const docTypeLabels: Record<string, string> = {
  PLAQUETTE: "Plaquette",
  GRILLE_PRIX: "Grille de prix",
  PLAN: "Plan",
  NOTICE_DESCRIPTIVE: "Notice descriptive",
  AUTRE: "Autre",
};

const statutBadge: Record<string, string> = {
  EN_COMMERCIALISATION: "bg-green-50 text-green-700",
  LIVRE: "bg-blue-50 text-blue-700",
  TERMINE: "bg-gray-100 text-gray-500",
};

const statutLabel: Record<string, string> = {
  EN_COMMERCIALISATION: "En commercialisation",
  LIVRE: "Livré",
  TERMINE: "Terminé",
};

export default async function ProProgrammesPage() {
  const programmes = await prisma.programme.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      photos: { take: 1, orderBy: { ordre: "asc" } },
      documentsProgramme: true,
      lots: { orderBy: [{ etage: "asc" }, { numero: "asc" }] },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProSidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Programmes Neufs</h1>
            <p className="text-gray-500 mt-1">
              {programmes.length} programme{programmes.length > 1 ? "s" : ""} disponible{programmes.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Programmes list */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {programmes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <p className="text-gray-500 text-lg">Aucun programme disponible pour le moment</p>
            </div>
          ) : (
            <div className="space-y-8">
              {programmes.map((programme) => {
                const prixList = programme.lots.map((l) => l.prix).filter((p): p is number => p != null);
                const surfaceList = programme.lots.map((l) => l.surface).filter((s): s is number => s != null);
                const prixMin = prixList.length > 0 ? Math.min(...prixList) : null;
                const prixMax = prixList.length > 0 ? Math.max(...prixList) : null;
                const surfaceMin = surfaceList.length > 0 ? Math.min(...surfaceList) : null;
                const surfaceMax = surfaceList.length > 0 ? Math.max(...surfaceList) : null;

                return (
                  <div key={programme.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Programme header */}
                    <div className="flex flex-col md:flex-row">
                      {/* Thumbnail */}
                      <div className="relative w-full md:w-64 h-48 flex-shrink-0">
                        {programme.photos[0] ? (
                          <Image
                            src={programme.photos[0].url}
                            alt={programme.nom}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 256px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Programme info */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h2 className="font-bold text-gray-900 text-lg">{programme.nom}</h2>
                            {programme.promoteur && (
                              <p className="text-sm text-gray-500 mt-0.5">
                                Promoteur : {programme.promoteur}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              {programme.ville}
                              {programme.datelivraison && (
                                <> &middot; Livraison : {programme.datelivraison}</>
                              )}
                            </p>
                          </div>
                          {programme.statut && (
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statutBadge[programme.statut] || "bg-gray-100 text-gray-600"}`}>
                              {statutLabel[programme.statut] || programme.statut}
                            </span>
                          )}
                        </div>

                        {/* Prix and surface ranges */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                          {prixMin != null && prixMax != null && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {prixMin === prixMax ? formatPrix(prixMin) : `${formatPrix(prixMin)} - ${formatPrix(prixMax)}`}
                            </span>
                          )}
                          {surfaceMin != null && surfaceMax != null && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                {surfaceMin === surfaceMax ? `${surfaceMin} m\u00B2` : `${surfaceMin} - ${surfaceMax} m\u00B2`}
                              </span>
                            </>
                          )}
                          <span className="text-gray-300">|</span>
                          <span>{programme.lots.length} lot{programme.lots.length > 1 ? "s" : ""}</span>
                        </div>

                        {/* Commission partenaire */}
                        {programme.commissionPartenaire != null && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-amber-800">
                              Commission : {programme.commissionPartenaire}%
                            </span>
                          </div>
                        )}

                        {/* Documents */}
                        {programme.documentsProgramme.length > 0 ? (
                          <details className="group mt-1">
                            <summary className="cursor-pointer select-none flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors py-1">
                              <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              Documents ({programme.documentsProgramme.length})
                            </summary>
                            <div className="pt-2 pl-6 flex flex-wrap gap-2">
                              {programme.documentsProgramme.map((doc) => (
                                <a
                                  key={doc.id}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-primary/5 hover:border-primary/30 transition-colors group/doc"
                                >
                                  <svg className="w-4 h-4 text-gray-400 group-hover/doc:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-gray-700 group-hover/doc:text-primary truncate max-w-[200px]">
                                    {doc.nom}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {docTypeLabels[doc.type] || doc.type}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </details>
                        ) : (
                          <p className="text-xs text-gray-400 italic mt-1">Aucun document pour ce programme</p>
                        )}
                      </div>
                    </div>

                    {/* Lot grid */}
                    {programme.lots.length > 0 && (
                      <div className="border-t border-gray-100 px-5 py-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Grille des lots ({programme.lots.length})
                        </h3>
                        <LotGrid
                          lots={programme.lots.map((lot) => ({
                            id: lot.id,
                            numero: lot.numero,
                            type: lot.type,
                            surface: lot.surface,
                            etage: lot.etage,
                            orientation: lot.orientation,
                            prix: lot.prix,
                            statut: lot.statut,
                          }))}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
