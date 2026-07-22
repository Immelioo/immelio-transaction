"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/branding/BrandLogo";

export default function ProLoginShell() {
  const [tab, setTab] = useState<"login" | "partenariat">("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [partForm, setPartForm] = useState({ nom: "", prenom: "", email: "", telephone: "", societe: "", ville: "", message: "" });
  const [partError, setPartError] = useState("");
  const [partStatus, setPartStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = "/pro/dashboard";
      } else {
        setLoginError(data.error || "Identifiants incorrects");
      }
    } catch {
      setLoginError("Erreur de connexion au serveur");
    }
    setLoginLoading(false);
  }

  async function handlePartenariat(e: React.FormEvent) {
    e.preventDefault();
    setPartStatus("loading");
    setPartError("");
    try {
      const res = await fetch("/api/partenariat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: partForm.prenom,
          nom: partForm.nom,
          email: partForm.email,
          telephone: partForm.telephone,
          societe: partForm.societe,
          ville: partForm.ville,
          message: partForm.message,
        }),
      });
      if (res.ok) {
        setPartStatus("success");
      } else {
        const data = await res.json().catch(() => null);
        const details = data?.details
          ? Object.values(data.details as Record<string, string[]>).flat().filter(Boolean).join(" ")
          : "";
        setPartError(details || data?.error || "Erreur lors de l'envoi de la demande.");
        setPartStatus("error");
      }
    } catch {
      setPartError("Erreur réseau lors de l'envoi de la demande.");
      setPartStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f6f3ec_0%,_#efe8da_100%)] flex flex-col justify-center py-12">
      <div className="max-w-lg mx-auto w-full px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="md" priority />
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Espace Partenaires</h1>
          <p className="mt-2 text-gray-600">Promoteurs, agents, courtiers — un accès sobre, sécurisé et opérationnel.</p>
        </div>

        <div className="mb-6 flex rounded-lg border border-primary/10 bg-white/90 p-1 shadow-sm">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "login" ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Se connecter
          </button>
          <button
            onClick={() => setTab("partenariat")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "partenariat" ? "bg-accent text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Devenir partenaire
          </button>
        </div>

        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4 rounded-xl border border-primary/10 bg-white p-8 shadow-[0_18px_45px_rgba(5,28,20,0.08)]">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
              <input required type="email" value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full rounded-lg border border-primary/15 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="partenaire@entreprise.fr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input required type="password" value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full rounded-lg border border-primary/15 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="Votre mot de passe" />
            </div>
            <button type="submit" disabled={loginLoading}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
              {loginLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        )}

        {tab === "partenariat" && (
          <div className="rounded-xl border border-primary/10 bg-white p-8 shadow-[0_18px_45px_rgba(5,28,20,0.08)]">
            {partStatus === "success" ? (
              <div className="text-center py-6">
                <svg className="w-14 h-14 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h3>
                <p className="text-gray-600">Notre équipe vous contactera sous 48h pour discuter de votre partenariat.</p>
                <button onClick={() => { setPartStatus("idle"); setTab("login"); }} className="mt-4 text-primary font-medium hover:underline">
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handlePartenariat} className="space-y-4">
                <p className="text-sm text-gray-600 mb-2">
                  Remplissez ce formulaire et nous vous recontacterons pour finaliser votre partenariat.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input required value={partForm.prenom} onChange={(e) => setPartForm({ ...partForm, prenom: e.target.value })}
                      className="w-full rounded-lg border border-primary/15 px-4 py-2.5 focus:border-accent focus:ring-2 focus:ring-accent/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input required value={partForm.nom} onChange={(e) => setPartForm({ ...partForm, nom: e.target.value })}
                      className="w-full rounded-lg border border-primary/15 px-4 py-2.5 focus:border-accent focus:ring-2 focus:ring-accent/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Société / Structure *</label>
                  <input required value={partForm.societe} onChange={(e) => setPartForm({ ...partForm, societe: e.target.value })}
                    className="w-full rounded-lg border border-primary/15 px-4 py-2.5 focus:border-accent focus:ring-2 focus:ring-accent/20"
                    placeholder="Nom du promoteur, agence, cabinet..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input required type="email" value={partForm.email} onChange={(e) => setPartForm({ ...partForm, email: e.target.value })}
                      className="w-full rounded-lg border border-primary/15 px-4 py-2.5 focus:border-accent focus:ring-2 focus:ring-accent/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                    <input required type="tel" value={partForm.telephone} onChange={(e) => setPartForm({ ...partForm, telephone: e.target.value })}
                      className="w-full rounded-lg border border-primary/15 px-4 py-2.5 focus:border-accent focus:ring-2 focus:ring-accent/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                  <input required value={partForm.ville} onChange={(e) => setPartForm({ ...partForm, ville: e.target.value })}
                    className="w-full rounded-lg border border-primary/15 px-4 py-2.5 focus:border-accent focus:ring-2 focus:ring-accent/20"
                    placeholder="Ville d'exercice" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message (optionnel)</label>
                  <textarea rows={3} value={partForm.message} onChange={(e) => setPartForm({ ...partForm, message: e.target.value })}
                    className="w-full resize-none rounded-lg border border-primary/15 px-4 py-2.5 focus:border-accent focus:ring-2 focus:ring-accent/20"
                    placeholder="Décrivez votre activité, le type de partenariat souhaité..." />
                </div>
                <button type="submit" disabled={partStatus === "loading"}
                  className="w-full py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50">
                  {partStatus === "loading" ? "Envoi..." : "Envoyer ma demande de partenariat"}
                </button>
                {partStatus === "error" && (
                  <p className="text-sm text-red-500 text-center">
                    {partError || "Erreur lors de l'envoi. Réessayez."}
                  </p>
                )}
              </form>
            )}
          </div>
        )}

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary">
            Retour au site
          </Link>
        </p>
      </div>
    </div>
  );
}
