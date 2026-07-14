import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Programmes Neufs — Immelio Transaction",
  description: "Découvrez nos programmes immobiliers neufs : appartements du studio au 5 pièces, résidences modernes avec terrasses, parkings et prestations haut de gamme.",
  openGraph: {
    title: "Programmes Neufs — Immelio Transaction",
    description: "Appartements neufs et programmes résidentiels disponibles à la vente.",
    url: `${process.env.NEXTAUTH_URL || "https://immelio.fr"}/programmes`,
  },
};

const statutLabels: Record<string, { label: string; color: string }> = {
  EN_COMMERCIALISATION: { label: "En commercialisation", color: "bg-green-100 text-green-700" },
  BIENTOT: { label: "Bientôt disponible", color: "bg-blue-100 text-blue-700" },
  LIVRE: { label: "Livré", color: "bg-gray-100 text-gray-700" },
};

export default async function ProgrammesPage() {
  const programmes = await prisma.programme.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      photos: { take: 1, orderBy: { ordre: "asc" } },
      _count: { select: { lots: true } },
      lots: { where: { statut: "DISPONIBLE" } },
    },
  });

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Programmes Neufs</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Découvrez nos programmes immobiliers neufs. Appartements du T1 au T5, conformes aux dernières normes énergétiques.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-gray-500 mb-8">
          {programmes.length} programme{programmes.length > 1 ? "s" : ""} disponible{programmes.length > 1 ? "s" : ""}
        </p>

        {programmes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes.map((prog) => {
              const lotsDispos = prog.lots.length;
              const statut = statutLabels[prog.statut] || statutLabels.EN_COMMERCIALISATION;
              return (
                <Link key={prog.id} href={`/programmes/${prog.id}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 group-hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative h-56 bg-gray-200 overflow-hidden">
                      {prog.photos[0] ? (
                        <Image src={prog.photos[0].url} alt={prog.nom} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statut.color}`}>
                          {statut.label}
                        </span>
                        {prog.enVedette && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent text-white">
                            Coup de coeur
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{prog.nom}</h3>
                      <p className="text-sm text-gray-500 mb-3">{prog.ville} ({prog.codePostal})</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{prog.promoteur}</span>
                        {prog.datelivraison && <span>Livraison {prog.datelivraison}</span>}
                      </div>

                      {prog.normeRT && (
                        <span className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium mb-3">
                          {prog.normeRT}
                        </span>
                      )}

                      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                        <div>
                          {prog.prixMin && (
                            <p className="text-lg font-bold text-primary">
                              À partir de {formatPrix(prog.prixMin)}
                            </p>
                          )}
                          {prog.surfaceMin && prog.surfaceMax && (
                            <p className="text-xs text-gray-500">De {prog.surfaceMin} à {prog.surfaceMax} m²</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-accent">{lotsDispos} lot{lotsDispos > 1 ? "s" : ""}</p>
                          <p className="text-xs text-gray-500">disponible{lotsDispos > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500 text-lg">Les programmes neufs arrivent bientôt !</p>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
