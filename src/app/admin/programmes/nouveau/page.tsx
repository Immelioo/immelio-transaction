"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FileUpload from "@/components/ui/FileUpload";
import { authFetch } from "@/lib/authFetch";

interface LotForm {
  numero: string;
  type: string;
  surface: string;
  etage: string;
  orientation: string;
  prix: string;
  nbChambres: string;
  terrasse: string;
  balcon: string;
  jardin: string;
  parking: boolean;
  statut: string;
  planUrl: string;
}

const emptyLot: LotForm = {
  numero: "", type: "T2", surface: "", etage: "0", orientation: "",
  prix: "", nbChambres: "1", terrasse: "", balcon: "", jardin: "",
  parking: false, statut: "DISPONIBLE", planUrl: "",
};

export default function NouveauProgrammePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    nom: "", description: "", promoteur: "", adresse: "", codePostal: "", ville: "",
    datelivraison: "", statut: "EN_COMMERCIALISATION", nbLotsTotal: "",
    prixMin: "", prixMax: "", surfaceMin: "", surfaceMax: "",
    normeRT: "", parking: false, terrasse: false, balcon: false,
    piscine: false, jardin: false, commissionPartenaire: "", enVedette: false,
    photos: [] as { url: string; nom: string }[],
    documents: [] as { url: string; nom: string; taille: number; type: string }[],
  });
  const [lots, setLots] = useState<LotForm[]>([]);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addLot() {
    setLots((prev) => [...prev, { ...emptyLot }]);
  }

  function updateLot(index: number, field: string, value: string | boolean) {
    setLots((prev) => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  }

  function removeLot(index: number) {
    setLots((prev) => prev.filter((_, i) => i !== index));
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setForm((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.photos.length) return prev;
      const photos = [...prev.photos];
      [photos[index], photos[target]] = [photos[target], photos[index]];
      return { ...prev, photos };
    });
  }

  function removePhoto(index: number) {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  }

  function updateDocumentType(index: number, type: string) {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.map((doc, i) => (i === index ? { ...doc, type } : doc)),
    }));
  }

  function removeDocument(index: number) {
    setForm((prev) => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await authFetch("/api/programmes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lots,
        }),
      });
      if (res.ok) {
        setStatus("success");
        router.push("/admin/programmes");
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
        <Link href="/admin/programmes" className="text-gray-500 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau programme neuf</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Infos principales */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du programme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du programme *</label>
              <input required value={form.nom} onChange={(e) => update("nom", e.target.value)}
                placeholder="Ex: Résidence Les Jardins de Lyon"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promoteur *</label>
              <input required value={form.promoteur} onChange={(e) => update("promoteur", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={form.statut} onChange={(e) => update("statut", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="EN_COMMERCIALISATION">En commercialisation</option>
                <option value="BIENTOT">Bientôt disponible</option>
                <option value="LIVRE">Livré</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison</label>
              <input value={form.datelivraison} onChange={(e) => update("datelivraison", e.target.value)}
                placeholder="Ex: T4 2026"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Norme énergétique</label>
              <select value={form.normeRT} onChange={(e) => update("normeRT", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="">Non renseigné</option>
                <option value="RE2020">RE2020</option>
                <option value="RT2012">RT2012</option>
              </select>
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

        {/* Prix & Surfaces */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Prix & Surfaces</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix min (€)</label>
              <input type="number" value={form.prixMin} onChange={(e) => update("prixMin", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix max (€)</label>
              <input type="number" value={form.prixMax} onChange={(e) => update("prixMax", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surface min (m²)</label>
              <input type="number" value={form.surfaceMin} onChange={(e) => update("surfaceMin", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surface max (m²)</label>
              <input type="number" value={form.surfaceMax} onChange={(e) => update("surfaceMax", e.target.value)}
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

        {/* Prestations */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Prestations</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { key: "parking", label: "Parking" },
              { key: "terrasse", label: "Terrasse" },
              { key: "balcon", label: "Balcon" },
              { key: "piscine", label: "Piscine" },
              { key: "jardin", label: "Jardin" },
            ].map((eq) => (
              <label key={eq.key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input type="checkbox" checked={form[eq.key as keyof typeof form] as boolean}
                  onChange={(e) => update(eq.key, e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700">{eq.label}</span>
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 mt-4">
            <input type="checkbox" checked={form.enVedette}
              onChange={(e) => update("enVedette", e.target.checked)}
              className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent" />
            <span className="text-sm font-medium text-gray-700">Mettre en vedette</span>
          </label>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos du programme</h2>
          <FileUpload
            type="photos"
            accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
            multiple={true}
            label="Ajouter des photos / perspectives"
            showUploadedList={false}
            onUpload={(files) => setForm((prev) => ({ ...prev, photos: files.map(f => ({ url: f.url, nom: f.nom })) }))}
          />
          {form.photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.photos.map((photo, index) => (
                <div key={`${photo.url}-${index}`} className="relative group rounded-xl overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.nom || form.nom || "Programme"} className="w-full h-28 object-cover" />
                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 text-xs font-semibold bg-accent text-white px-2 py-0.5 rounded-full">
                      Image vitrine
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/60 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" disabled={index === 0} onClick={() => movePhoto(index, -1)}
                      className="p-1 text-white hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => removePhoto(index)}
                      className="p-1 text-red-400 hover:text-red-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button type="button" disabled={index === form.photos.length - 1} onClick={() => movePhoto(index, 1)}
                      className="p-1 text-white hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            La première photo est utilisée comme image vitrine dans le site public, le portail partenaire et l&apos;admin.
          </p>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents commerciaux</h2>
          <FileUpload
            type="documents"
            accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp"
            multiple={true}
            label="Ajouter des documents (plaquette, grille de prix, notice...)"
            showUploadedList={false}
            onUpload={(files) => setForm((prev) => ({
              ...prev,
              documents: files.map(f => ({ url: f.url, nom: f.nom, taille: f.taille, type: "PLAQUETTE" })),
            }))}
          />
          {form.documents.length > 0 && (
            <div className="mt-3 space-y-2">
              {form.documents.map((doc, i) => (
                <div key={`${doc.url}-${i}`} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 truncate flex-1">{doc.nom}</span>
                  <select value={doc.type}
                    onChange={(e) => updateDocumentType(i, e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                    <option value="PLAQUETTE">Plaquette</option>
                    <option value="PLAN">Plan</option>
                    <option value="NOTICE_DESCRIPTIVE">Notice descriptive</option>
                    <option value="GRILLE_PRIX">Grille de prix</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                  <button type="button" onClick={() => removeDocument(i)}
                    className="text-red-400 hover:text-red-600 p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lots */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lots ({lots.length})</h2>
            <button type="button" onClick={addLot}
              className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
              + Ajouter un lot
            </button>
          </div>

          {lots.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Cliquez sur &quot;Ajouter un lot&quot; pour commencer à saisir les appartements
            </p>
          )}

          <div className="space-y-4">
            {lots.map((lot, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Lot #{i + 1}</h3>
                  <button type="button" onClick={() => removeLot(i)}
                    className="text-red-400 hover:text-red-600 text-sm">Supprimer</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">N° Lot *</label>
                    <input required value={lot.numero} onChange={(e) => updateLot(i, "numero", e.target.value)}
                      placeholder="A101" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type *</label>
                    <select value={lot.type} onChange={(e) => updateLot(i, "type", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      {["T1", "T2", "T3", "T4", "T5"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Surface (m²) *</label>
                    <input required type="number" value={lot.surface} onChange={(e) => updateLot(i, "surface", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Étage *</label>
                    <input required type="number" value={lot.etage} onChange={(e) => updateLot(i, "etage", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Prix (€) *</label>
                    <input required type="number" value={lot.prix} onChange={(e) => updateLot(i, "prix", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Chambres</label>
                    <input type="number" value={lot.nbChambres} onChange={(e) => updateLot(i, "nbChambres", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Orientation</label>
                    <select value={lot.orientation} onChange={(e) => updateLot(i, "orientation", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="">-</option>
                      {["NORD", "SUD", "EST", "OUEST", "NORD-EST", "NORD-OUEST", "SUD-EST", "SUD-OUEST"].map(o =>
                        <option key={o} value={o}>{o}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Statut</label>
                    <select value={lot.statut} onChange={(e) => updateLot(i, "statut", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="DISPONIBLE">Disponible</option>
                      <option value="OPTION">Optionné</option>
                      <option value="RESERVE">Réservé</option>
                      <option value="VENDU">Vendu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Terrasse (m²)</label>
                    <input type="number" value={lot.terrasse} onChange={(e) => updateLot(i, "terrasse", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Balcon (m²)</label>
                    <input type="number" value={lot.balcon} onChange={(e) => updateLot(i, "balcon", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Jardin (m²)</label>
                    <input type="number" value={lot.jardin} onChange={(e) => updateLot(i, "jardin", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 p-2">
                      <input type="checkbox" checked={lot.parking}
                        onChange={(e) => updateLot(i, "parking", e.target.checked)}
                        className="w-4 h-4 text-primary rounded" />
                      <span className="text-sm text-gray-700">Parking</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">URL du plan</label>
                    <input value={lot.planUrl} onChange={(e) => updateLot(i, "planUrl", e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="submit" disabled={status === "loading"}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
            {status === "loading" ? "Création en cours..." : "Créer le programme"}
          </button>
          <Link href="/admin/programmes" className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
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
