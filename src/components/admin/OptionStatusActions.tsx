"use client";

import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";

interface Props {
  optionId: string;
  currentStatut: string;
}

export default function OptionStatusActions({ optionId, currentStatut }: Props) {
  const router = useRouter();

  async function updateStatut(statut: string) {
    await authFetch(`/api/options/${optionId}`, {
      method: "PATCH",
      body: JSON.stringify({ statut }),
    });
    router.refresh();
  }

  return (
    <select
      value={currentStatut}
      onChange={(event) => updateStatut(event.target.value)}
      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
    >
      <option value="EN_COURS">En cours</option>
      <option value="ACCEPTEE">Acceptee</option>
      <option value="REFUSEE">Refusee</option>
      <option value="EXPIREE">Expiree</option>
      <option value="LEVEE">Levee</option>
    </select>
  );
}
