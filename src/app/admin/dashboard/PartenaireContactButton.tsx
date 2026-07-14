"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";

export default function PartenaireContactButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleContact() {
    setLoading(true);
    try {
      const res = await authFetch(`/api/partenaires/${id}`, {
        method: "PUT",
        body: JSON.stringify({ contacte: true }),
      });

      if (res.ok) {
        setDone(true);
        // Refresh la page après 1s pour retirer le partenaire de la liste
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
    setLoading(false);
  }

  if (done) {
    return (
      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Contacté
      </span>
    );
  }

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-1"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {loading ? "..." : "Appelé"}
    </button>
  );
}
