"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BienCard from "@/components/ui/BienCard";
import Link from "next/link";

interface Bien {
  id: string;
  titre: string;
  type: string;
  transaction: string;
  prix: number;
  surface: number;
  nbPieces: number;
  ville: string;
  codePostal: string;
  dpe?: string;
  enVedette?: boolean;
  photos: { url: string }[];
}

export default function FavorisPage() {
  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      const ids = JSON.parse(localStorage.getItem("favorites") || "[]") as string[];
      if (ids.length === 0) { setLoading(false); return; }

      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/biens/${id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null)
        )
      );
      setBiens(results.filter(Boolean));
      setLoading(false);
    }

    loadFavorites();
    window.addEventListener("favoritesUpdated", loadFavorites);
    return () => window.removeEventListener("favoritesUpdated", loadFavorites);
  }, []);

  function clearAll() {
    localStorage.removeItem("favorites");
    setBiens([]);
  }

  return (
    <>
      <Header />

      <section className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes favoris</h1>
            <p className="text-gray-300 mt-1">{biens.length} bien{biens.length > 1 ? "s" : ""} sauvegardé{biens.length > 1 ? "s" : ""}</p>
          </div>
          {biens.length > 0 && (
            <button onClick={clearAll} className="px-4 py-2 border border-white/30 text-white rounded-lg text-sm hover:bg-white/10 transition-colors">
              Tout effacer
            </button>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : biens.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun favori</h2>
            <p className="text-gray-500 mb-6">Parcourez nos biens et cliquez sur ❤️ pour les sauvegarder.</p>
            <Link href="/biens" className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              Voir nos biens
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                photo={bien.photos?.[0]?.url}
                dpe={bien.dpe}
                enVedette={bien.enVedette}
              />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
