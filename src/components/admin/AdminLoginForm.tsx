"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/branding/BrandLogo";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Identifiants incorrects");
        setLoading(false);
        return;
      }

      if (data.user.role !== "ADMIN") {
        setError("Accès réservé aux administrateurs");
        setLoading(false);
        return;
      }

      window.location.href = "/admin/dashboard";
    } catch {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,161,90,0.18),_transparent_34%),linear-gradient(180deg,_#0b3b2c_0%,_#06261c_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandLogo size="md" priority />
          </Link>
          <h1 className="mt-5 text-2xl font-bold text-white">Administration CRM</h1>
          <p className="mt-1 text-sm text-[rgba(246,243,236,0.72)]">Pilotage interne Immelio Groupe Immobilier</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-[rgba(246,243,236,0.98)] p-8 shadow-[0_24px_80px_rgba(3,18,13,0.32)]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@immelio.fr" autoComplete="email"
                className="w-full rounded-lg border border-primary/15 bg-white px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe" autoComplete="current-password"
                className="w-full rounded-lg border border-primary/15 bg-white px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connexion...
              </>
            ) : "Se connecter"}
          </button>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-primary">
              ← Retour au site
            </Link>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-[rgba(246,243,236,0.65)]">
          Connexion sécurisée — Session chiffrée HttpOnly
        </p>
      </div>
    </div>
  );
}
