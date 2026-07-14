"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function DemandeRecherchePage() {
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    type: "APPARTEMENT", transaction: "VENTE",
    budgetMin: "", budgetMax: "", surfaceMin: "", surfaceMax: "",
    nbPiecesMin: "", ville: "", description: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="bg-white rounded-xl p-12 border border-gray-100 shadow-sm">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h1>
            <p className="text-gray-600">Notre équipe va étudier votre demande et vous recontacter dans les plus brefs délais avec des propositions adaptées.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Demande de Recherche</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Décrivez le bien que vous recherchez. Nos experts immobiliers vous proposeront des biens correspondant à vos critères.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm space-y-6">
          {/* Infos personnelles */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vos coordonnées</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Critères */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vos critères</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction *</label>
                <select value={form.transaction} onChange={(e) => setForm({ ...form, transaction: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="VENTE">Achat</option>
                  <option value="LOCATION">Location</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="APPARTEMENT">Appartement</option>
                  <option value="MAISON">Maison</option>
                  <option value="STUDIO">Studio</option>
                  <option value="LOFT">Loft</option>
                  <option value="COMMERCE">Commerce</option>
                  <option value="BUREAU">Bureau</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget min (€)</label>
                <input type="number" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget max (€)</label>
                <input type="number" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surface min (m²)</label>
                <input type="number" value={form.surfaceMin} onChange={(e) => setForm({ ...form, surfaceMin: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surface max (m²)</label>
                <input type="number" value={form.surfaceMax} onChange={(e) => setForm({ ...form, surfaceMax: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nb pièces min</label>
                <input type="number" value={form.nbPiecesMin} onChange={(e) => setForm({ ...form, nbPiecesMin: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville souhaitée</label>
                <input value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Décrivez votre projet</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Décrivez votre recherche idéale, vos contraintes, vos souhaits..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none" />
          </div>

          <button type="submit" disabled={status === "loading"}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
            {status === "loading" ? "Envoi en cours..." : "Envoyer ma demande"}
          </button>

          {status === "error" && (
            <p className="text-sm text-red-500 text-center">Une erreur est survenue. Réessayez.</p>
          )}
        </form>
      </div>

      <Footer />
    </>
  );
}
