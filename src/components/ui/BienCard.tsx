import Link from "next/link";
import Image from "next/image";
import { formatPrix } from "@/lib/utils";
import FavoriteButton from "@/components/ui/FavoriteButton";

interface BienCardProps {
  id: string;
  titre: string;
  type: string;
  transaction: string;
  prix: number;
  surface: number;
  nbPieces: number;
  ville: string;
  codePostal: string;
  photo?: string;
  dpe?: string;
  enVedette?: boolean;
}

const dpeColors: Record<string, string> = {
  A: "bg-green-500",
  B: "bg-green-400",
  C: "bg-yellow-400",
  D: "bg-yellow-500",
  E: "bg-orange-400",
  F: "bg-orange-500",
  G: "bg-red-500",
};

export default function BienCard({
  id, titre, type, transaction, prix, surface, nbPieces, ville, codePostal, photo, dpe, enVedette
}: BienCardProps) {
  return (
    <Link href={`/biens/${id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-52 bg-gray-200 overflow-hidden">
          {photo ? (
            <Image src={photo} alt={titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${transaction === "VENTE" ? "bg-primary" : "bg-accent"}`}>
              {transaction === "VENTE" ? "Vente" : "Location"}
            </span>
            {enVedette && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent text-white">
                En vedette
              </span>
            )}
          </div>

          {/* DPE + Favori */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {dpe && (
              <span className={`${dpeColors[dpe] || "bg-gray-400"} text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center`}>
                {dpe}
              </span>
            )}
            <FavoriteButton bienId={id} />
          </div>
        </div>

        {/* Infos */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-1">{titre}</h3>
          </div>

          <p className="text-sm text-gray-500 mb-3">{ville} ({codePostal})</p>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {surface} m²
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {nbPieces} pièce{nbPieces > 1 ? "s" : ""}
            </span>
            <span className="text-xs text-gray-400 uppercase">{type}</span>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xl font-bold text-primary">
              {formatPrix(prix)}
              {transaction === "LOCATION" && <span className="text-sm font-normal text-gray-500">/mois</span>}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
