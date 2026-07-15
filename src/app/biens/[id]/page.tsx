import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { formatPrix, formatDate } from "@/lib/utils";
import DemandeVisiteForm from "@/components/forms/DemandeVisiteForm";
import PhotoGallery from "@/components/ui/PhotoGallery";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bien = await prisma.bien.findUnique({
    where: { id },
    select: { titre: true, ville: true, surface: true, prix: true, photos: { take: 1, orderBy: { ordre: "asc" } } },
  });
  if (!bien) return { title: "Bien introuvable" };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.immelio.fr";
  const description = `${bien.surface} m² à ${bien.ville} — ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(bien.prix)}`;

  return {
    title: `${bien.titre} — Immelio Transaction`,
    description,
    openGraph: {
      title: bien.titre,
      description,
      url: `${baseUrl}/biens/${id}`,
      ...(bien.photos[0] && { images: [{ url: bien.photos[0].url }] }),
    },
  };
}

const dpeColors: Record<string, string> = {
  A: "bg-green-500", B: "bg-green-400", C: "bg-yellow-400",
  D: "bg-yellow-500", E: "bg-orange-400", F: "bg-orange-500", G: "bg-red-500",
};

export default async function BienDetailPage({ params }: Props) {
  const { id } = await params;

  const bien = await prisma.bien.findUnique({
    where: { id },
    include: { photos: { orderBy: { ordre: "asc" } } },
  });

  if (!bien) notFound();

  const equipements = [
    { label: "Parking", value: bien.parking },
    { label: "Balcon", value: bien.balcon },
    { label: "Terrasse", value: bien.terrasse },
    { label: "Ascenseur", value: bien.ascenseur },
    { label: "Gardien", value: bien.gardien },
    { label: "Piscine", value: bien.piscine },
    { label: "Cave", value: bien.cave },
    { label: "Meublé", value: bien.meuble },
  ].filter((e) => e.value);

  return (
    <>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <Link href="/biens" className="hover:text-primary">Nos Biens</Link>
          <span>/</span>
          <span className="text-gray-900">{bien.titre}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galerie photos interactive */}
            <PhotoGallery
              photos={bien.photos}
              titre={bien.titre}
              aspectMain="h-96"
              sizesMain="(max-width: 1024px) 100vw, 66vw"
            />

            {/* Description */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{bien.titre}</h1>
              <p className="text-gray-500 mb-4">{bien.adresse}, {bien.ville} ({bien.codePostal})</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${bien.transaction === "VENTE" ? "bg-primary" : "bg-accent"}`}>
                  {bien.transaction === "VENTE" ? "Vente" : "Location"}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {bien.type}
                </span>
                {bien.dpe && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${dpeColors[bien.dpe]}`}>
                    DPE {bien.dpe}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{bien.description}</p>
            </div>

            {/* Caractéristiques */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Surface</span>
                  <span className="font-semibold">{bien.surface} m²</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Pièces</span>
                  <span className="font-semibold">{bien.nbPieces}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Chambres</span>
                  <span className="font-semibold">{bien.nbChambres}</span>
                </div>
                {bien.etage !== null && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-500">Étage</span>
                    <span className="font-semibold">{bien.etage === 0 ? "RDC" : bien.etage}</span>
                  </div>
                )}
                {bien.anneeConstruction && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-500">Année</span>
                    <span className="font-semibold">{bien.anneeConstruction}</span>
                  </div>
                )}
                {bien.chargesmensuelles && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-500">Charges</span>
                    <span className="font-semibold">{bien.chargesmensuelles} €/mois</span>
                  </div>
                )}
              </div>
            </div>

            {/* Équipements */}
            {equipements.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Équipements</h2>
                <div className="flex flex-wrap gap-2">
                  {equipements.map((e) => (
                    <span key={e.label} className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                      {e.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prix */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
              <p className="text-3xl font-bold text-primary mb-1">
                {formatPrix(bien.prix)}
                {bien.transaction === "LOCATION" && <span className="text-base font-normal text-gray-500">/mois</span>}
              </p>
              {bien.honoraires && (
                <p className="text-sm text-gray-500 mb-4">Honoraires : {formatPrix(bien.honoraires)}</p>
              )}
              <p className="text-sm text-gray-400 mb-6">Publié le {formatDate(bien.createdAt)}</p>

              {/* Formulaire de visite */}
              <DemandeVisiteForm bienId={bien.id} bienTitre={bien.titre} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
