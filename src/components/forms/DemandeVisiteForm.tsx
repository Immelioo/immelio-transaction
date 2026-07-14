"use client";

import { useState } from "react";

interface Props {
  bienId: string;
  bienTitre: string;
}

export default function DemandeVisiteForm({ bienId, bienTitre }: Props) {
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    dateSouhaitee: "", creneau: "MATIN", message: "",
    financement: "NON_DEFINI",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/visites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, bienId }),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ nom: "", prenom: "", email: "", telephone: "", dateSouhaitee: "", creneau: "MATIN", message: "", financement: "NON_DEFINI" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
        <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="font-medium text-green-800">Demande envoyée !</p>
        <p className="text-sm text-green-600 mt-1">Nous vous recontacterons rapidement pour confirmer votre visite.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-semibold text-gray-900">Programmer une visite</h3>
      <p className="text-xs text-gray-500 mb-2">{bienTitre}</p>

      <div className="grid grid-cols-2 gap-2">
        <input
          required placeholder="Prénom" value={form.prenom}
          onChange={(e) => setForm({ ...form, prenom: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        />
        <input
          required placeholder="Nom" value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <input
        required type="email" placeholder="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
      />

      <input
        type="tel" placeholder="Téléphone" value={form.telephone}
        onChange={(e) => setForm({ ...form, telephone: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
      />

      <input
        required type="date" value={form.dateSouhaitee}
        onChange={(e) => setForm({ ...form, dateSouhaitee: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
      />

      <select
        value={form.creneau}
        onChange={(e) => setForm({ ...form, creneau: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
      >
        <option value="MATIN">Matin (9h-12h)</option>
        <option value="APRES_MIDI">Après-midi (14h-17h)</option>
        <option value="SOIR">Soir (17h-19h)</option>
      </select>

      {/* Financement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Financement</label>
        <select
          value={form.financement}
          onChange={(e) => setForm({ ...form, financement: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="NON_DEFINI">Non défini</option>
          <option value="COMPTANT">Comptant (sans crédit)</option>
          <option value="PRET_ACCORDE">Prêt accordé</option>
          <option value="PRET_EN_COURS">Prêt en cours de demande</option>
          <option value="A_ETUDIER">À étudier</option>
        </select>
      </div>

      <textarea
        placeholder="Message (optionnel)" rows={3} value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-light transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Envoi en cours..." : "Demander une visite"}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-500 text-center">Une erreur est survenue. Réessayez.</p>
      )}
    </form>
  );
}
