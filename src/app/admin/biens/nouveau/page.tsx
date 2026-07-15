"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FileUpload from "@/components/ui/FileUpload";
import { authFetch } from "@/lib/authFetch";

export default function NouveauBienPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    titre: "", description: "", type: "APPARTEMENT", transaction: "VENTE",
    prix: "", surface: "", nbPieces: "", nbChambres: "",
    etage: "", adresse: "", codePostal: "", ville: "",
    dpe: "", ges: "", anneeConstruction: "",
    parking: false, balcon: false, terrasse: false, ascenseur: false,
    gardien: false, piscine: false, cave: false, meuble: false,
    digicode: false, doubleVitrage: false, fibreOptique: false, alarme: false,
    cuisineEquipee: false, parquet: false, handicapAcces: false, portailAutomatique: false,
    chargesmensuelles: "", honoraires: "", commissionPartenaire: "",
    statut: "DISPONIBLE", enVedette: false,
    photoUrls: [] as { url: string; nom: string }[],
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await authFetch("/api/biens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        router.push("/admin/biens");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/biens" className="text-gray-500 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter un bien</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Infos principales */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l&apos;annonce *</label>
              <input required value={form.titre} onChange={(e) => update("titre", e.target.value)}
                placeholder="Ex: Magnifique T3 lumineux - Cœur de Lyon"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => update("type", e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction *</label>
              <select value={form.transaction} onChange={(e) => update("transaction", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="VENTE">Vente</option>
                <option value="LOCATION">Location</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
              <input required type="number" value={form.prix} onChange={(e) => update("prix", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²) *</label>
              <input required type="number" value={form.surface} onChange={(e) => update("surface", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de pièces *</label>
              <input required type="number" value={form.nbPieces} onChange={(e) => update("nbPieces", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de chambres</label>
              <input type="number" value={form.nbChambres} onChange={(e) => update("nbChambres", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Étage</label>
              <input type="number" value={form.etage} onChange={(e) => update("etage", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea required rows={4} value={form.description} onChange={(e) => update("description", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none" />
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
              <input required value={form.adresse} onChange={(e) => update("adresse", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
              <input required value={form.codePostal} onChange={(e) => update("codePostal", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
              <input required value={form.ville} onChange={(e) => update("ville", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
          </div>
        </div>

        {/* Diagnostics & Finances */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnostics & Finances</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DPE</label>
              <select value={form.dpe} onChange={(e) => update("dpe", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="">Non renseigné</option>
                {["A","B","C","D","E","F","G"].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GES</label>
              <select value={form.ges} onChange={(e) => update("ges", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="">Non renseigné</option>
                {["A","B","C","D","E","F","G"].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année construction</label>
              <input type="number" value={form.anneeConstruction} onChange={(e) => update("anneeConstruction", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Charges (€/mois)</label>
              <input type="number" value={form.chargesmensuelles} onChange={(e) => update("chargesmensuelles", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Honoraires (€)</label>
              <input type="number" value={form.honoraires} onChange={(e) => update("honoraires", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission partenaire (%)</label>
              <input type="number" step="0.1" value={form.commissionPartenaire} onChange={(e) => update("commissionPartenaire", e.target.value)}
                placeholder="Ex: 2.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
          </div>
        </div>

        {/* Équipements */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Équipements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "parking", label: "Parking" },
              { key: "balcon", label: "Balcon" },
              { key: "terrasse", label: "Terrasse" },
              { key: "ascenseur", label: "Ascenseur" },
              { key: "gardien", label: "Gardien / Concierge" },
              { key: "piscine", label: "Piscine" },
              { key: "cave", label: "Cave" },
              { key: "meuble", label: "Meublé" },
              { key: "digicode", label: "Digicode / Interphone" },
              { key: "doubleVitrage", label: "Double vitrage" },
              { key: "fibreOptique", label: "Fibre optique" },
              { key: "alarme", label: "Alarme" },
              { key: "cuisineEquipee", label: "Cuisine équipée" },
              { key: "parquet", label: "Parquet" },
              { key: "handicapAcces", label: "Accès PMR" },
              { key: "portailAutomatique", label: "Portail automatique" },
            ].map((eq) => (
              <label key={eq.key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input type="checkbox" checked={form[eq.key as keyof typeof form] as boolean}
                  onChange={(e) => update(eq.key, e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700">{eq.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos du bien</h2>
          <FileUpload
            type="photos"
            accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
            multiple={true}
            label="Ajouter des photos"
            onUpload={(files) => setForm((prev) => ({ ...prev, photoUrls: files.map(f => ({ url: f.url, nom: f.nom })) }))}
          />

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Statut du bien</label>
              <select value={form.statut} onChange={(e) => update("statut", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="DISPONIBLE">✅ Disponible</option>
                <option value="EN_OPTION">🟡 En option</option>
                <option value="SOUS_COMPROMIS">🔵 Sous compromis</option>
                <option value="VENDU">⬛ Vendu</option>
              </select>
            </div>
            <label className="flex items-center gap-2 mt-4">
              <input type="checkbox" checked={form.enVedette}
                onChange={(e) => update("enVedette", e.target.checked)}
                className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent" />
              <span className="text-sm font-medium text-gray-700">⭐ Mettre en vedette sur la page d&apos;accueil</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="submit" disabled={status === "loading"}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
            {status === "loading" ? "Création en cours..." : "Créer le bien"}
          </button>
          <Link href="/admin/biens" className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
            Annuler
          </Link>
        </div>

        {status === "error" && (
          <p className="text-sm text-red-500">Erreur lors de la création. Vérifiez les champs et réessayez.</p>
        )}
      </form>
    </div>
  );
}
