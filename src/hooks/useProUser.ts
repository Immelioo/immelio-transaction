"use client";

import { useState, useEffect } from "react";

export interface ProUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: "ADMIN" | "PARTENAIRE";
  entreprise?: string;
  telephone?: string;
  codeAcces?: string;
}

interface UseProUserResult {
  user: ProUser | null;
  loading: boolean;
  isAdmin: boolean;
}

/**
 * Récupère l'utilisateur authentifié depuis la session cookie (via /api/auth/me).
 * Ne lit jamais localStorage — la source de vérité est le cookie HttpOnly.
 * Redirige vers /pro/login si non authentifié.
 */
export function useProUser(redirectOnUnauth = true): UseProUserResult {
  const [user, setUser] = useState<ProUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (!r.ok) {
          if (redirectOnUnauth) window.location.href = "/pro/login";
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.user) setUser(data.user as ProUser);
      })
      .catch(() => {
        if (redirectOnUnauth) window.location.href = "/pro/login";
      })
      .finally(() => setLoading(false));
  }, [redirectOnUnauth]);

  return {
    user,
    loading,
    isAdmin: user?.role === "ADMIN",
  };
}

/**
 * Déconnexion sécurisée : appelle l'API logout pour expirer le cookie côté serveur.
 */
export async function proLogout() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
  window.location.href = "/pro/login";
}
