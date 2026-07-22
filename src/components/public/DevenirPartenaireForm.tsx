"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/branding/BrandLogo";

const avantages = [
  { icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", label: "Accès catalogue exclusif", desc: "Biens anciens & programmes neufs en avant-première" },
  { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Commissions attractives", desc: "Jusqu'à 40% de commission sur les ventes réalisées" },
  { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Outils & documents", desc: "Mandats, compromis, contrats partagés en temps réel" },
  { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", label: "Support dédié", desc: "Un interlocuteur unique disponible pour vous accompagner" },
];

export default function DevenirPartenaireForm() {
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", telephone: "", entreprise: "", message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const payload = {
        ...form,
        telephone: form.telephone || undefined,
        message: form.message || undefined,
      };
      const res = await fetch("/api/devenir-partenaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => null);
        const details = data?.details
          ? Object.values(data.details as Record<string, string[]>).flat().filter(Boolean).join(" ")
          : "";
        setErrorMsg(details || data?.error || "Une erreur est survenue. Réessayez.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Erreur réseau — vérifiez votre connexion et réessayez.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="bg-white rounded-xl p-12 border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Demande envoyée !</h1>
          <p className="text-gray-600 mb-2">
            Merci pour votre intérêt. Notre équipe va étudier votre candidature et vous recontactera rapidement.
          </p>
          <p className="text-gray-500 text-sm mb-8">Réponse généralement sous 48h ouvrées.</p>
          <Link href="/" className="inline-block px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-[linear-gradient(180deg,_#0b3b2c_0%,_#06261c_100%)] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 flex justify-center">
            <BrandLogo size="md" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Devenez <span className="text-accent">Partenaire</span>
          </h1>
          <p className="text-xl text-[rgba(246,243,236,0.8)] max-w-2xl mx-auto">
            Rejoignez le réseau Immelio Transaction et développez votre activité immobilière
            avec des outils exclusifs et des commissions attractives.
          </p>
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-[rgba(236,231,220,0.45)] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {avantages.map((a) => (
              <div key={a.label} className="bg-white rounded-xl p-5 border border-primary/10 text-center shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={a.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{a.label}</h3>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Soumettre ma candidature</h2>
          <p className="text-gray-500">Remplissez ce formulaire, notre équipe vous contacte sous 48h.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 border border-primary/10 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className="w-full px-4 py-2.5 border border-primary/15 rounded-lg focus:ring-2 focus:ring-primary/15 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full px-4 py-2.5 border border-primary/15 rounded-lg focus:ring-2 focus:ring-primary/15 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-primary/15 rounded-lg focus:ring-2 focus:ring-primary/15 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="w-full px-4 py-2.5 border border-primary/15 rounded-lg focus:ring-2 focus:ring-primary/15 focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de votre agence / entreprise *</label>
            <input required value={form.entreprise} onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
              placeholder="Ex : Dupont Immobilier"
              className="w-full px-4 py-2.5 border border-primary/15 rounded-lg focus:ring-2 focus:ring-primary/15 focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optionnel)</label>
            <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Présentez votre activité, votre zone géographique, vos attentes..."
              className="w-full px-4 py-2.5 border border-primary/15 rounded-lg focus:ring-2 focus:ring-primary/15 focus:border-primary resize-none" />
          </div>

          <button type="submit" disabled={status === "loading"}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
            {status === "loading" ? "Envoi en cours..." : "Envoyer ma candidature"}
          </button>

          {status === "error" && (
            <p className="text-sm text-red-500 text-center">{errorMsg}</p>
          )}

          <p className="text-xs text-gray-400 text-center">
            Vos données sont confidentielles et ne seront utilisées que dans le cadre de votre candidature.
          </p>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Déjà partenaire ?{" "}
          <Link href="/pro/login" className="text-primary font-medium hover:underline">
            Accéder à votre espace
          </Link>
        </div>
      </section>
    </>
  );
}
