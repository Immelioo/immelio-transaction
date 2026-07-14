import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BienCard from "@/components/ui/BienCard";
import SearchFilters from "@/components/ui/SearchFilters";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Biens Anciens — Immelio Transaction",
  description: "Découvrez notre sélection de biens immobiliers anciens à vendre ou à louer : appartements, maisons, locaux professionnels dans toute la région.",
  openGraph: {
    title: "Biens Anciens — Immelio Transaction",
    description: "Appartements, maisons et locaux disponibles à la vente et à la location.",
    url: `${process.env.NEXTAUTH_URL || "https://immelio.fr"}/biens`,
  },
};

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function BiensPage({ searchParams }: Props) {
  const params = await searchParams;

  const where: Record<string, unknown> = { disponible: true };
  if (params.type) where.type = params.type;
  if (params.transaction) where.transaction = params.transaction;
  if (params.ville) where.ville = { contains: params.ville, mode: "insensitive" };
  if (params.prixMax) where.prix = { lte: parseFloat(params.prixMax) };

  const biens = await prisma.bien.findMany({
    where,
    include: { photos: { take: 1, orderBy: { ordre: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nos Biens Immobiliers</h1>
          <p className="text-gray-600">
            {biens.length} bien{biens.length > 1 ? "s" : ""} disponible{biens.length > 1 ? "s" : ""}
          </p>
        </div>

        <Suspense fallback={<div className="h-20 bg-gray-100 rounded-xl animate-pulse" />}>
          <SearchFilters />
        </Suspense>

        <div className="mt-8">
          {biens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {biens.map((bien) => (
                <BienCard
                  key={bien.id}
                  id={bien.id}
                  titre={bien.titre}
                  type={bien.type}
                  transaction={bien.transaction}
                  prix={bien.prix}
                  surface={bien.surface}
                  nbPieces={bien.nbPieces}
                  ville={bien.ville}
                  codePostal={bien.codePostal}
                  photo={bien.photos[0]?.url}
                  dpe={bien.dpe || undefined}
                  enVedette={bien.enVedette}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">Aucun bien ne correspond à vos critères</p>
              <p className="text-gray-400">Modifiez vos filtres ou envoyez-nous une demande de recherche</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
