"use client";

import { useRouter } from "next/navigation";

interface Props {
  demandeId: string;
  currentStatut: string;
}

export default function DemandeActions({ demandeId, currentStatut }: Props) {
  const router = useRouter();

  async function updateStatut(statut: string) {
    await fetch(`/api/demandes/${demandeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ statut }),
    });
    router.refresh();
  }

  return (
    <select
      value={currentStatut}
      onChange={(e) => updateStatut(e.target.value)}
      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
    >
      <option value="NOUVELLE">Nouvelle</option>
      <option value="EN_COURS">En cours</option>
      <option value="TRAITEE">Traitée</option>
      <option value="ARCHIVEE">Archivée</option>
    </select>
  );
}
