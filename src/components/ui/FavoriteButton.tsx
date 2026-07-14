"use client";

import { useState, useEffect } from "react";

interface FavoriteButtonProps {
  bienId: string;
  className?: string;
}

export default function FavoriteButton({ bienId, className = "" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function syncFavorite() {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]") as string[];
      setIsFavorite(favorites.includes(bienId));
    }
    syncFavorite();
  }, [bienId]);

  function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]") as string[];
    let updated: string[];

    if (favorites.includes(bienId)) {
      updated = favorites.filter((id) => id !== bienId);
    } else {
      updated = [...favorites, bienId];
    }

    localStorage.setItem("favorites", JSON.stringify(updated));
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event("favoritesUpdated"));
  }

  return (
    <button
      onClick={toggleFavorite}
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`p-2 rounded-full transition-all ${
        isFavorite
          ? "bg-red-500 text-white shadow-md"
          : "bg-white/80 text-gray-500 hover:bg-white hover:text-red-500 shadow"
      } ${className}`}
    >
      <svg
        className="w-5 h-5"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
