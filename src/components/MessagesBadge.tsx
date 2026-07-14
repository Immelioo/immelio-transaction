"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";

/**
 * Badge "non lu" pour le lien Messages des sidebars admin/partenaire.
 * Interroge périodiquement l'API plutôt qu'un websocket — suffisant à l'échelle
 * d'une petite agence et évite l'infrastructure temps réel.
 */
export default function MessagesBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const res = await authFetch("/api/messages/unread-count");
        if (!res.ok || !active) return;
        const data = await res.json();
        if (active) setCount(data.count ?? 0);
      } catch {
        // silencieux — un badge qui ne se met pas à jour n'est pas critique
      }
    }

    poll();
    const interval = setInterval(poll, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto shrink-0 bg-accent text-white text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
      {count > 99 ? "99+" : count}
    </span>
  );
}
