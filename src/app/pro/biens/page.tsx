import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrix } from "@/lib/utils";
import ProSidebar from "@/components/pro/ProSidebar";

export default async function ProBiensPage() {
  const biens = await prisma.bien.findMany({
    where: { disponible: true },
    include: {
      photos: { take: 1, orderBy: { ordre: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProSidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Biens Anciens</h1>
            <p className="text-gray-500 mt-1">
              {biens.length} bien{biens.length > 1 ? "s" : ""} disponible{biens.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Listings */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {biens.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-500 text-lg">Aucun bien disponible pour le moment</p>
            </div>
          ) : (
            <div className="space-y-5">
              {biens.map((bien) => (
                <div key={bien.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Thumbnail */}
                    <div className="relative w-full md:w-56 h-44 flex-shrink-0">
                      {bien.photos[0] ? (
                        <Image
                          src={bien.photos[0].url}
                          alt={bien.titre}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 224px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-5">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <Link
                            href={`/biens/${bien.id}`}
                            className="font-bold text-gray-900 text-lg hover:text-primary transition-colors"
                          >
                            {bien.titre}
                          </Link>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {bien.adresse}, {bien.ville} ({bien.codePostal})
                          </p>
                        </div>
                        <p className="text-xl font-bold text-primary whitespace-nowrap">
                          {formatPrix(bien.prix)}
                        </p>
                      </div>

                      {/* Property details */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          {bien.surface} m²
                        </span>
                        <span className="text-gray-300">|</span>
                        <span>{bien.nbPieces} pièce{bien.nbPieces > 1 ? "s" : ""}</span>
                        <span className="text-gray-300">|</span>
                        <span>{bien.type}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          bien.transaction === "VENTE"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-green-50 text-green-700"
                        }`}>
                          {bien.transaction}
                        </span>
                      </div>

                      {/* Commission partenaire */}
                      {bien.commissionPartenaire != null && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-amber-800">
                            Commission partenaire : {bien.commissionPartenaire}%
                          </span>
                        </div>
                      )}

                      {/* Contact CTA */}
                      <div className="mt-3">
                        <Link
                          href={`/biens/${bien.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                        >
                          Voir la fiche complète
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
