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
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-2xl max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Ville</label>
          <input
            type="text"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Lyon, Paris, Marseille..."
            className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:bg-white border-0 outline-none"
          />
        </div>
        <div className="sm:w-40">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:bg-white border-0 outline-none"
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
          <label className="text-xs font-medium text-gray-500 mb-1 block">Budget max</label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:bg-white border-0 outline-none"
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
            className="w-full sm:w-auto px-6 py-2.5 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg"
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
