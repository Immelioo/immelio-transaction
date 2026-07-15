"use client";

import { useState } from "react";

interface ReinviteButtonProps {
  partnerId: string;
  partnerEmail: string;
}

export default function ReinviteButton({ partnerId, partnerEmail }: ReinviteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReinvite() {
    if (!confirm(`Renvoyer une invitation à ${partnerEmail} ?`)) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/partenaires/${partnerId}/reinvite`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur inconnue");
      } else {
        setDone(true);
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <span className="text-xs text-green-600 font-medium">✓ Renvoyée</span>;
  }

  return (
    <div className="flex flex-col items-start gap-0.5">
      <button
        onClick={handleReinvite}
        disabled={loading}
        className="text-xs text-amber-600 hover:text-amber-800 font-medium disabled:opacity-50"
      >
        {loading ? "Envoi…" : "Réinviter"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
