"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import FileUpload from "@/components/ui/FileUpload";
import { authFetch } from "@/lib/authFetch";

export default function ModifierBienPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "success" | "error">("loading");
  const uploadedPhotoUrlsRef = useRef<{ url: string; nom: string }[]>([]);
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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/biens/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Not found");
        const bien = await res.json();
        setForm({
          titre: bien.titre || "",
          description: bien.description || "",
          type: bien.type || "APPARTEMENT",
          transaction: bien.transaction || "VENTE",
          prix: bien.prix?.toString() || "",
          surface: bien.surface?.toString() || "",
          nbPieces: bien.nbPieces?.toString() || "",
          nbChambres: bien.nbChambres?.toString() || "",
          etage: bien.etage?.toString() || "",
          adresse: bien.adresse || "",
          codePostal: bien.codePostal || "",
          ville: bien.ville || "",
          dpe: bien.dpe || "",
          ges: bien.ges || "",
          anneeConstruction: bien.anneeConstruction?.toString() || "",
          parking: bien.parking || false,
          balcon: bien.balcon || false,
          terrasse: bien.terrasse || false,
          ascenseur: bien.ascenseur || false,
          gardien: bien.gardien || false,
          piscine: bien.piscine || false,
          cave: bien.cave || false,
          meuble: bien.meuble || false,
          digicode: bien.digicode || false,
          doubleVitrage: bien.doubleVitrage || false,
          fibreOptique: bien.fibreOptique || false,
          alarme: bien.alarme || false,
          cuisineEquipee: bien.cuisineEquipee || false,
          parquet: bien.parquet || false,
          handicapAcces: bien.handicapAcces || false,
          portailAutomatique: bien.portailAutomatique || false,
          chargesmensuelles: bien.chargesmensuelles?.toString() || "",
          honoraires: bien.honoraires?.toString() || "",
          commissionPartenaire: bien.commissionPartenaire?.toString() || "",
          statut: bien.statut || "DISPONIBLE",
          enVedette: bien.enVedette || false,
          photoUrls: bien.photos?.map((p: { url: string; alt: string }) => ({ url: p.url, nom: p.alt || "" })) || [],
        });
        uploadedPhotoUrlsRef.current = [];
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    }
    load();
  }, [id]);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function syncUploadedPhotos(nextUploadedPhotos: { url: string; nom: string }[]) {
    const previousUploadedPhotos = uploadedPhotoUrlsRef.current;
    uploadedPhotoUrlsRef.current = nextUploadedPhotos;

    setForm((prev) => ({
      ...prev,
      photoUrls: [
        ...prev.photoUrls.filter(
          (photo) => !previousUploadedPhotos.some((uploaded) => uploaded.url === photo.url),
        ),
        ...nextUploadedPhotos,
      ],
    }));
  }

  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorDetail(null);
    try {
      const res = await authFetch(`/api/biens/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        router.push(`/admin/biens/${id}`);
      } else {
        const data = await res.json().catch(() => null);
        if (data?.details) {
          const fields = Object.entries(data.details as Record<string, string[]>)
            .map(([k, v]) => `${k}: ${v.join(", ")}`)
            .join(" | ");
          setErrorDetail(fields);
        } else {
          setErrorDetail(data?.error || `Erreur ${res.status}`);
        }
        setStatus("error");
      }
    } catch {
      setErrorDetail("Erreur réseau");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-3 text-gray-500">Chargement du bien...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/biens/${id}`} className="text-gray-500 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier le bien</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Infos principales */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l&apos;annonce *</label>
              <input required value={form.titre} onChange={(e) => update("titre", e.target.value)}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Photos du bien</h2>
          <p className="text-xs text-gray-400 mb-4">La première photo est la photo principale affichée sur les annonces. Glissez ou utilisez les flèches pour réorganiser.</p>

          {form.photoUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-3">Photos actuelles ({form.photoUrls.length})</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {form.photoUrls.map((photo, i) => (
                  <div key={photo.url} className="relative group">
                    {/* Badge principale */}
                    {i === 0 && (
                      <div className="absolute top-1 left-1 z-10 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        PRINCIPALE
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt=""
                      className={`w-full aspect-square object-cover rounded-lg border-2 transition-all ${i === 0 ? "border-accent" : "border-transparent"}`}
                    />
                    {/* Actions au hover */}
                    <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      {i > 0 && (
                        <button type="button"
                          onClick={() => setForm((prev) => {
                            const arr = [...prev.photoUrls];
                            const [item] = arr.splice(i, 1);
                            arr.unshift(item);
                            return { ...prev, photoUrls: arr };
                          })}
                          className="text-[10px] font-bold text-white bg-accent px-2 py-0.5 rounded w-full text-center hover:bg-accent/80">
                          ★ Principale
                        </button>
                      )}
                      <div className="flex gap-1">
                        {i > 0 && (
                          <button type="button"
                            onClick={() => setForm((prev) => {
                              const arr = [...prev.photoUrls];
                              [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                              return { ...prev, photoUrls: arr };
                            })}
                            className="text-white bg-black/50 hover:bg-black/70 rounded px-1.5 py-0.5 text-xs">
                            ←
                          </button>
                        )}
                        {i < form.photoUrls.length - 1 && (
                          <button type="button"
                            onClick={() => setForm((prev) => {
                              const arr = [...prev.photoUrls];
                              [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                              return { ...prev, photoUrls: arr };
                            })}
                            className="text-white bg-black/50 hover:bg-black/70 rounded px-1.5 py-0.5 text-xs">
                            →
                          </button>
                        )}
                        <button type="button"
                          onClick={() => {
                            uploadedPhotoUrlsRef.current = uploadedPhotoUrlsRef.current.filter(
                              (uploadedPhoto) => uploadedPhoto.url !== photo.url,
                            );
                            setForm((prev) => ({ ...prev, photoUrls: prev.photoUrls.filter((_, idx) => idx !== i) }));
                          }}
                          className="text-white bg-red-500/80 hover:bg-red-600 rounded px-1.5 py-0.5 text-xs">
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <FileUpload
            type="photos"
            accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
            multiple={true}
            label="Ajouter de nouvelles photos"
            onUpload={(files) => syncUploadedPhotos(files.map((file) => ({ url: file.url, nom: file.nom })))}
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
              <span className="text-sm font-medium text-gray-700">⭐ Mettre en vedette</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="submit" disabled={status === "saving"}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
            {status === "saving" ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
          <Link href={`/admin/biens/${id}`} className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
            Annuler
          </Link>
        </div>

        {status === "error" && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700 font-medium">Erreur lors de la sauvegarde.</p>
            {errorDetail && <p className="text-xs text-red-600 mt-1">{errorDetail}</p>}
          </div>
        )}
        {status === "success" && (
          <p className="text-sm text-green-600">Bien modifié avec succès ! Redirection...</p>
        )}
      </form>
    </div>
  );
}
