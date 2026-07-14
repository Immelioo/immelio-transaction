"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DocumentStatutActions({
  documentId,
  currentStatut,
}: {
  documentId: string;
  currentStatut: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatut(statut: string) {
    setLoading(true);
    try {
      await fetch(`/api/documents-partenaire/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ statut }),
      });
      router.refresh();
    } catch (error) {
      console.error("Erreur mise a jour statut:", error);
    } finally {
      setLoading(false);
    }
  }

  if (currentStatut === "VALIDE" || currentStatut === "REFUSE") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => updateStatut("VALIDE")}
        disabled={loading}
        className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors disabled:opacity-50"
      >
        Valider
      </button>
      <button
        onClick={() => updateStatut("REFUSE")}
        disabled={loading}
        className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        Refuser
      </button>
    </>
  );
}
