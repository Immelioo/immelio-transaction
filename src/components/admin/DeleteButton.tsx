"use client";

import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";

interface DeleteButtonProps {
  id: string;
  type: "biens" | "programmes" | "partenaires";
  label?: string;
  className?: string;
  redirectTo?: string;
  onDeleted?: () => void;
  iconOnly?: boolean;
}

export default function DeleteButton({
  id,
  type,
  label = "Supprimer",
  className,
  redirectTo,
  onDeleted,
  iconOnly = false,
}: DeleteButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    const messages: Record<string, string> = {
      biens: "Êtes-vous sûr de vouloir supprimer ce bien ?",
      programmes: "Êtes-vous sûr de vouloir supprimer ce programme ?",
      partenaires: "Êtes-vous sûr de vouloir supprimer ce partenaire ?",
    };
    const message = messages[type] || "Êtes-vous sûr ?";

    if (!window.confirm(message)) return;

    try {
      const res = await authFetch(`/api/${type}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression");

      if (redirectTo) {
        router.push(redirectTo);
      } else if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression. Veuillez réessayer.");
    }
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleDelete}
        className={className || "text-red-500 hover:text-red-700 transition-colors"}
        title="Supprimer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className={className || "px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      {label}
    </button>
  );
}
