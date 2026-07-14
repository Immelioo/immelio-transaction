"use client";

import { useRouter } from "next/navigation";

interface Props {
  visiteId: string;
  currentStatut: string;
}

export default function VisiteActions({ visiteId, currentStatut }: Props) {
  const router = useRouter();

  async function updateStatut(statut: string) {
    await fetch(`/api/visites/${visiteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ statut }),
    });
    router.refresh();
  }

  if (currentStatut === "EN_ATTENTE") {
    return (
      <div className="flex gap-2 justify-end">
        <button onClick={() => updateStatut("CONFIRMEE")}
          className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600">
          Confirmer
        </button>
        <button onClick={() => updateStatut("ANNULEE")}
          className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600">
          Annuler
        </button>
      </div>
    );
  }

  if (currentStatut === "CONFIRMEE") {
    return (
      <button onClick={() => updateStatut("EFFECTUEE")}
        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600">
        Marquer effectuée
      </button>
    );
  }

  return <span className="text-xs text-gray-400">-</span>;
}
