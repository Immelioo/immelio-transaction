"use client";

import { useRouter } from "next/navigation";

interface Props {
  leadId: string;
  currentStatut: string;
}

export default function LeadActions({ leadId, currentStatut }: Props) {
  const router = useRouter();

  async function updateStatut(statut: string) {
    await fetch(`/api/leads/${leadId}`, {
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
      <option value="NOUVEAU">Nouveau</option>
      <option value="CONTACTE">Contacté</option>
      <option value="QUALIFIE">Qualifié</option>
      <option value="PROPOSITION">Proposition</option>
      <option value="NEGOCE">Négoce</option>
      <option value="GAGNE">Gagné</option>
      <option value="PERDU">Perdu</option>
    </select>
  );
}
