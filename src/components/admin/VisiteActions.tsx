"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  visiteId: string;
  currentStatut: string;
}

const STATUTS = [
  { value: "EN_ATTENTE", label: "En attente", cls: "text-yellow-700 bg-yellow-100" },
  { value: "CONFIRMEE", label: "Confirmée", cls: "text-green-700 bg-green-100" },
  { value: "ANNULEE", label: "Annulée", cls: "text-red-700 bg-red-100" },
  { value: "EFFECTUEE", label: "Effectuée", cls: "text-blue-700 bg-blue-100" },
];

export default function VisiteActions({ visiteId, currentStatut }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(currentStatut);

  async function updateStatut(statut: string) {
    if (statut === selected) return;
    setLoading(true);
    await fetch(`/api/visites/${visiteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ statut }),
    });
    setSelected(statut);
    setLoading(false);
    router.refresh();
  }

  const current = STATUTS.find((s) => s.value === selected);

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => updateStatut(e.target.value)}
        disabled={loading}
        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-primary disabled:opacity-50 ${current?.cls ?? "bg-gray-100 text-gray-700"}`}
      >
        {STATUTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      {loading && (
        <svg className="w-3 h-3 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
    </div>
  );
}
