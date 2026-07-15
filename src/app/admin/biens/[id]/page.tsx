import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatPrix, formatDate } from "@/lib/utils";
import DocumentManager from "@/components/admin/DocumentManager";
import DeleteButton from "@/components/admin/DeleteButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminBienDetailPage({ params }: Props) {
  const { id } = await params;

  const bien = await prisma.bien.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { ordre: "asc" } },
      documents: true,
      demandesVisite: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!bien) notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/biens" className="text-gray-500 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{bien.titre}</h1>
          <p className="text-gray-500">{bien.adresse}, {bien.ville} ({bien.codePostal})</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/biens/${bien.id}/modifier`}
            className="px-4 py-2.5 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </Link>
          <DeleteButton id={bien.id} type="biens" redirectTo="/admin/biens" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo */}
          {bien.photos.length > 0 && (
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bien.photos[0].url} alt={bien.titre} className="w-full h-64 object-cover" />
              {bien.photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {bien.photos.map((p) => (
                    <div key={p.id} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Détails */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Prix</p>
                <p className="font-bold text-primary">{formatPrix(bien.prix)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Surface</p>
                <p className="font-bold">{bien.surface} m²</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Pièces</p>
                <p className="font-bold">{bien.nbPieces}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-bold">{bien.type} - {bien.transaction}</p>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{bien.description}</p>
          </div>

          {/* Documents du bien */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents du bien</h2>
            <DocumentManager bienId={bien.id} existingDocuments={bien.documents} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statut */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Statut</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Disponible</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${bien.disponible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {bien.disponible ? "Oui" : "Non"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">En vedette</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${bien.enVedette ? "bg-accent/20 text-accent" : "bg-gray-100 text-gray-500"}`}>
                  {bien.enVedette ? "Oui" : "Non"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Créé le</span>
                <span className="text-sm">{formatDate(bien.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Documents</span>
                <span className="text-sm font-medium">{bien.documents.length}</span>
              </div>
            </div>
          </div>

          {/* Dernières visites */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Demandes de visite</h3>
            {bien.demandesVisite.length > 0 ? (
              <div className="space-y-3">
                {bien.demandesVisite.map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{v.user.prenom} {v.user.nom}</p>
                      <p className="text-xs text-gray-500">{formatDate(v.datesouhaitee)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      v.statut === "EN_ATTENTE" ? "bg-yellow-100 text-yellow-700" :
                      v.statut === "CONFIRMEE" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {v.statut.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucune demande</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
