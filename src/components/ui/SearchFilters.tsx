"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const types = [
  { value: "", label: "Tous types" },
  { value: "APPARTEMENT", label: "Appartement" },
  { value: "MAISON", label: "Maison" },
  { value: "STUDIO", label: "Studio" },
  { value: "LOFT", label: "Loft" },
  { value: "COMMERCE", label: "Commerce" },
  { value: "BUREAU", label: "Bureau" },
];

const transactions = [
  { value: "", label: "Achat & Location" },
  { value: "VENTE", label: "Achat" },
  { value: "LOCATION", label: "Location" },
];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [type, setType] = useState(searchParams.get("type") || "");
  const [transaction, setTransaction] = useState(searchParams.get("transaction") || "");
  const [ville, setVille] = useState(searchParams.get("ville") || "");
  const [prixMax, setPrixMax] = useState(searchParams.get("prixMax") || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (transaction) params.set("transaction", transaction);
    if (ville) params.set("ville", ville);
    if (prixMax) params.set("prixMax", prixMax);
    router.push(`/biens?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transaction</label>
          <select
            value={transaction}
            onChange={(e) => setTransaction(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {transactions.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
          <input
            type="text"
            placeholder="Paris, Lyon..."
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget max</label>
          <input
            type="number"
            placeholder="500 000 €"
            value={prixMax}
            onChange={(e) => setPrixMax(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Rechercher
          </button>
        </div>
      </div>
    </form>
  );
}
