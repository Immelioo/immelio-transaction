"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  dossierId: string;
  currentStatut: string;
  href: string;
}

export default function PartnershipRequestActions({ dossierId, currentStatut, href }: Props) {
  const router = useRouter();

  async function updateStatut(statut: string) {
    await fetch(`/api/dossiers/${dossierId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ statut }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-3">
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
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
      >
        Créer le partenaire
      </Link>
    </div>
  );
}
