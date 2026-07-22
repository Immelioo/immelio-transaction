"use client";

import { useState } from "react";

export default function SearchBar() {
  const [ville, setVille] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (ville) params.set("ville", ville);
    if (type) params.set("type", type);
    if (budget) params.set("budget", budget);
    window.location.href = `/biens?${params.toString()}`;
  }

  return (
    <div className="max-w-4xl mx-auto rounded-lg border border-white/15 bg-[rgba(246,243,236,0.95)] p-3 sm:p-4 shadow-[0_24px_60px_rgba(4,24,18,0.24)] backdrop-blur-md">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="search-ville" className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-primary/65">Ville</label>
          <input
            id="search-ville"
            type="text"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Lyon, Paris, Marseille..."
            className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div className="sm:w-40">
          <label htmlFor="search-type" className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-primary/65">Type</label>
          <select
            id="search-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
          >
            <option value="">Tous</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="MAISON">Maison</option>
            <option value="STUDIO">Studio</option>
            <option value="LOFT">Loft</option>
            <option value="COMMERCE">Commerce</option>
            <option value="BUREAU">Bureau</option>
          </select>
        </div>
        <div className="sm:w-40">
          <label htmlFor="search-budget" className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-primary/65">Budget max</label>
          <select
            id="search-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
          >
            <option value="">Tous</option>
            <option value="200000">200 000 €</option>
            <option value="400000">400 000 €</option>
            <option value="600000">600 000 €</option>
            <option value="1000000">1 000 000 €</option>
            <option value="2000000">2 000 000 €+</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent/35 bg-accent px-6 py-2.5 font-semibold text-primary-dark shadow-[0_12px_28px_rgba(200,161,90,0.24)] transition-all hover:brightness-105 sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="sm:hidden">Rechercher</span>
          </button>
        </div>
      </div>
    </div>
  );
}
