import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/utils";
import PhotoGallery from "@/components/ui/PhotoGallery";

const statutLotLabels: Record<string, { label: string; color: string }> = {
  DISPONIBLE: { label: "Disponible", color: "bg-green-100 text-green-700" },
  OPTION: { label: "Optionné", color: "bg-yellow-100 text-yellow-700" },
  RESERVE: { label: "Réservé", color: "bg-orange-100 text-orange-700" },
  VENDU: { label: "Vendu", color: "bg-red-100 text-red-700" },
};

const docTypeLabels: Record<string, string> = {
  PLAQUETTE: "Plaquette commerciale",
  PLAN: "Plan",
  NOTICE_DESCRIPTIVE: "Notice descriptive",
  GRILLE_PRIX: "Grille de prix",
  AUTRE: "Document",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProgrammeDetailPage({ params }: Props) {
  const { id } = await params;

  const programme = await prisma.programme.findUnique({
    where: { id },
    include: {
      lots: { orderBy: [{ etage: "asc" }, { numero: "asc" }] },
      photos: { orderBy: { ordre: "asc" } },
      documentsProgramme: { where: { public: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!programme) notFound();

  const lotsDispos = programme.lots.filter((l) => l.statut === "DISPONIBLE").length;

  return (
    <>
      <Header />

      {/* Hero avec galerie interactive */}
      <section className="bg-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PhotoGallery
            photos={programme.photos}
            titre={programme.nom}
            aspectMain="h-72 md:h-[480px]"
            sizesMain="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1280px"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Titre & infos */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/programmes" className="text-primary hover:underline text-sm">Programmes Neufs</Link>
                <span className="text-gray-400">/</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{programme.nom}</h1>
              <p className="text-lg text-gray-500">{programme.adresse}, {programme.ville} ({programme.codePostal})</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {programme.promoteur}
                </span>
                {programme.datelivraison && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    Livraison {programme.datelivraison}
                  </span>
                )}
                {programme.normeRT && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    {programme.normeRT}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Présentation du programme</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{programme.description}</p>
            </div>

            {/* Prestations */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Prestations</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: "parking", label: "Parking", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                  { key: "terrasse", label: "Terrasse", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                  { key: "balcon", label: "Balcon", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
                  { key: "piscine", label: "Piscine", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
                  { key: "jardin", label: "Jardin", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
                ].filter((p) => programme[p.key as keyof typeof programme]).map((p) => (
                  <div key={p.key} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tableau des lots */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Lots disponibles
                <span className="ml-2 text-sm font-normal text-gray-500">({lotsDispos} sur {programme.lots.length})</span>
              </h2>

              {programme.lots.length > 0 ? (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Lot</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Type</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Surface</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Étage</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Ch.</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Orientation</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Ext.</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">Prix</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-600">Statut</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-600">Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programme.lots.map((lot) => {
                        const statut = statutLotLabels[lot.statut] || statutLotLabels.DISPONIBLE;
                        const exterieurs: string[] = [];
                        if (lot.terrasse) exterieurs.push(`Terrasse ${lot.terrasse}m²`);
                        if (lot.balcon) exterieurs.push(`Balcon ${lot.balcon}m²`);
                        if (lot.jardin) exterieurs.push(`Jardin ${lot.jardin}m²`);
                        if (lot.parking) exterieurs.push("Parking");
                        return (
                          <tr key={lot.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-2 font-medium">{lot.numero}</td>
                            <td className="py-3 px-2">{lot.type}</td>
                            <td className="py-3 px-2">{lot.surface} m²</td>
                            <td className="py-3 px-2">{lot.etage === 0 ? "RDC" : `${lot.etage}e`}</td>
                            <td className="py-3 px-2">{lot.nbChambres}</td>
                            <td className="py-3 px-2">{lot.orientation || "-"}</td>
                            <td className="py-3 px-2 text-xs">{exterieurs.length > 0 ? exterieurs.join(", ") : "-"}</td>
                            <td className="py-3 px-2 text-right font-bold text-primary">{formatPrix(lot.prix)}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statut.color}`}>{statut.label}</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              {lot.planUrl ? (
                                <a href={lot.planUrl} target="_blank" rel="noopener noreferrer"
                                  className="text-primary hover:underline text-xs font-medium">
                                  Voir plan
                                </a>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 mt-4">Aucun lot enregistré pour le moment</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Résumé prix */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-20">
              <div className="text-center mb-4">
                {programme.prixMin && (
                  <p className="text-2xl font-bold text-primary">
                    À partir de {formatPrix(programme.prixMin)}
                  </p>
                )}
                {programme.prixMax && programme.prixMin && (
                  <p className="text-sm text-gray-500">Jusqu&apos;à {formatPrix(programme.prixMax)}</p>
                )}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lots disponibles</span>
                  <span className="font-semibold text-green-600">{lotsDispos}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total lots</span>
                  <span className="font-medium">{programme.lots.length}</span>
                </div>
                {programme.surfaceMin && programme.surfaceMax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Surfaces</span>
                    <span className="font-medium">{programme.surfaceMin} - {programme.surfaceMax} m²</span>
                  </div>
                )}
                {programme.datelivraison && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Livraison</span>
                    <span className="font-medium">{programme.datelivraison}</span>
                  </div>
                )}
              </div>

              {/* Bouton plaquette en premier si dispo */}
              {programme.documentsProgramme.length > 0 && (
                <a href={programme.documentsProgramme[0].url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-6 px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger la plaquette
                </a>
              )}

              <Link href="/#qui-sommes-nous" className={`block w-full ${programme.documentsProgramme.length > 0 ? "mt-2" : "mt-6"} px-6 py-3 bg-primary text-white text-center rounded-lg font-semibold hover:bg-primary-dark transition-colors`}>
                Nous contacter
              </Link>
              <Link href={`/demande-recherche`} className="block w-full mt-2 px-6 py-3 border border-primary text-primary text-center rounded-lg font-medium hover:bg-primary hover:text-white transition-colors">
                Demande de recherche
              </Link>
            </div>

            {/* Tous les documents téléchargeables */}
            {programme.documentsProgramme.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Documents à télécharger</h3>
                <div className="space-y-2">
                  {programme.documentsProgramme.map((doc) => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors group">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-primary truncate">{doc.nom}</p>
                        <p className="text-xs text-gray-500">{docTypeLabels[doc.type] || doc.type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
