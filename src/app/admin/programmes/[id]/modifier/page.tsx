"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import FileUpload from "@/components/ui/FileUpload";
import { authFetch } from "@/lib/authFetch";

const DOC_TYPES_PROGRAMME = [
  { value: "PLAQUETTE", label: "Plaquette commerciale" },
  { value: "PLAN", label: "Plan" },
  { value: "NOTICE_DESCRIPTIVE", label: "Notice descriptive" },
  { value: "GRILLE_PRIX", label: "Grille de prix" },
  { value: "AUTRE", label: "Autre" },
];

interface LotForm {
  id?: string;
  numero: string;
  type: string;
  surface: string;
  etage: string;
  prix: string;
  nbChambres: string;
  statut: string;
  orientation: string;
  terrasse: string;
  balcon: string;
  jardin: string;
  parking: boolean;
  planUrl: string;
}

interface MediaPhoto {
  key: string;
  url: string;
  nom: string;
}

interface MediaDocument {
  key: string;
  url: string;
  nom: string;
  type: string;
  taille: number;
}

interface UploadedFile {
  url: string;
  nom: string;
  taille: number;
}

const emptyLot: LotForm = {
  numero: "",
  type: "T2",
  surface: "",
  etage: "0",
  prix: "",
  nbChambres: "1",
  statut: "DISPONIBLE",
  orientation: "",
  terrasse: "",
  balcon: "",
  jardin: "",
  parking: false,
  planUrl: "",
};

export default function ModifierProgrammePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [lots, setLots] = useState<LotForm[]>([]);
  const [photos, setPhotos] = useState<MediaPhoto[]>([]);
  const [documents, setDocuments] = useState<MediaDocument[]>([]);
  const [form, setForm] = useState({
    nom: "",
    description: "",
    promoteur: "",
    adresse: "",
    codePostal: "",
    ville: "",
    datelivraison: "",
    statut: "EN_COMMERCIALISATION",
    nbLotsTotal: "",
    prixMin: "",
    prixMax: "",
    surfaceMin: "",
    surfaceMax: "",
    normeRT: "",
    parking: false,
    terrasse: false,
    balcon: false,
    piscine: false,
    jardin: false,
    enVedette: false,
    commissionPartenaire: "",
  });

  useEffect(() => {
    async function fetchProgramme() {
      try {
        const res = await fetch(`/api/programmes/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Programme introuvable");

        const data = await res.json();
        setForm({
          nom: data.nom || "",
          description: data.description || "",
          promoteur: data.promoteur || "",
          adresse: data.adresse || "",
          codePostal: data.codePostal || "",
          ville: data.ville || "",
          datelivraison: data.datelivraison || "",
          statut: data.statut || "EN_COMMERCIALISATION",
          nbLotsTotal: data.nbLotsTotal?.toString() || "",
          prixMin: data.prixMin?.toString() || "",
          prixMax: data.prixMax?.toString() || "",
          surfaceMin: data.surfaceMin?.toString() || "",
          surfaceMax: data.surfaceMax?.toString() || "",
          normeRT: data.normeRT || "",
          parking: data.parking || false,
          terrasse: data.terrasse || false,
          balcon: data.balcon || false,
          piscine: data.piscine || false,
          jardin: data.jardin || false,
          enVedette: data.enVedette || false,
          commissionPartenaire: data.commissionPartenaire?.toString() || "",
        });

        setLots(
          Array.isArray(data.lots)
            ? data.lots.map((lot: Record<string, unknown>) => ({
                id: typeof lot.id === "string" ? lot.id : undefined,
                numero: (lot.numero as string) || "",
                type: (lot.type as string) || "T2",
                surface: lot.surface?.toString() || "",
                etage: lot.etage?.toString() || "0",
                prix: lot.prix?.toString() || "",
                nbChambres: lot.nbChambres?.toString() || "0",
                statut: (lot.statut as string) || "DISPONIBLE",
                orientation: (lot.orientation as string) || "",
                terrasse: lot.terrasse?.toString() || "",
                balcon: lot.balcon?.toString() || "",
                jardin: lot.jardin?.toString() || "",
                parking: Boolean(lot.parking),
                planUrl: (lot.planUrl as string) || "",
              }))
            : []
        );

        setPhotos(
          Array.isArray(data.photos)
            ? [...data.photos]
                .sort((a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre)
                .map((photo: { id: string; url: string; alt?: string | null }) => ({
                  key: photo.id,
                  url: photo.url,
                  nom: photo.alt || data.nom || "Programme",
                }))
            : []
        );

        setDocuments(
          Array.isArray(data.documentsProgramme)
            ? data.documentsProgramme.map((doc: { id: string; url: string; nom: string; type: string; taille?: number }) => ({
                key: doc.id,
                url: doc.url,
                nom: doc.nom,
                type: doc.type,
                taille: doc.taille || 0,
              }))
            : []
        );

        setStatus("idle");
        setErrorMessage("");
      } catch {
        setErrorMessage("Impossible de charger ce programme.");
        setStatus("error");
      }
    }

    fetchProgramme();
  }, [id]);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateLot(index: number, field: keyof LotForm, value: string | boolean) {
    setLots((prev) => prev.map((lot, i) => (i === index ? { ...lot, [field]: value } : lot)));
  }

  function addLot() {
    setLots((prev) => [...prev, { ...emptyLot }]);
  }

  function removeLot(index: number) {
    setLots((prev) => prev.filter((_, i) => i !== index));
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setPhotos((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function mergeUploadedPhotos(files: UploadedFile[]) {
    setPhotos((prev) => {
      const map = new Map(prev.map((photo) => [photo.url, photo]));
      files.forEach((file, index) => {
        if (!map.has(file.url)) {
          map.set(file.url, {
            key: `photo-${Date.now()}-${index}`,
            url: file.url,
            nom: file.nom,
          });
        }
      });
      return Array.from(map.values());
    });
  }

  function updateDocumentType(index: number, type: string) {
    setDocuments((prev) => prev.map((doc, i) => (i === index ? { ...doc, type } : doc)));
  }

  function removeDocument(index: number) {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  }

  function mergeUploadedDocuments(files: UploadedFile[]) {
    setDocuments((prev) => {
      const map = new Map(prev.map((doc) => [doc.url, doc]));
      files.forEach((file, index) => {
        if (!map.has(file.url)) {
          map.set(file.url, {
            key: `document-${Date.now()}-${index}`,
            url: file.url,
            nom: file.nom,
            type: "PLAQUETTE",
            taille: file.taille,
          });
        }
      });
      return Array.from(map.values());
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    try {
      const res = await authFetch(`/api/programmes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lots,
          photos: photos.map((photo) => ({ url: photo.url, nom: photo.nom })),
          documents: documents.map((doc) => ({
            url: doc.url,
            nom: doc.nom,
            type: doc.type,
            taille: doc.taille,
          })),
        }),
      });

      if (!res.ok) {
        let message = "Échec de la mise à jour";
        try {
          const data = await res.json();
          if (data?.error) {
            message = data.error;
          }
        } catch {
          // ignore parse error
        }
        throw new Error(message);
      }

      setStatus("success");
      router.push("/admin/programmes");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement. Vérifiez les champs, les documents et les photos.",
      );
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/programmes" className="text-gray-500 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Modifier le programme</h1>
        <button
          type="button"
          onClick={async () => {
            if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce programme ?")) return;
            const res = await authFetch(`/api/programmes/${id}`, { method: "DELETE" });
            if (res.ok) router.push("/admin/programmes");
            else window.alert("Erreur lors de la suppression.");
          }}
          className="px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Supprimer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du programme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du programme *</label>
              <input required value={form.nom} onChange={(e) => update("nom", e.target.value)}
                placeholder="Ex: Residence Les Jardins de Lyon"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de lots total</label>
              <input type="number" value={form.nbLotsTotal} onChange={(e) => update("nbLotsTotal", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission partenaire (%)</label>
              <input type="number" step="0.1" value={form.commissionPartenaire} onChange={(e) => update("commissionPartenaire", e.target.value)}
                placeholder="Ex: 3.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea required rows={4} value={form.description} onChange={(e) => update("description", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none" />
            </div>
          </div>
        </div>

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
          </div>
        </div>

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

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos ({photos.length})</h2>
          <FileUpload
            type="photos"
            accept="image/*,.heic,.heif"
            multiple
            label="Ajouter des photos"
            showUploadedList={false}
            onUpload={mergeUploadedPhotos}
          />
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo, index) => (
                <div key={photo.key} className="relative group rounded-xl overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.nom} className="w-full h-28 object-cover" />
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
                    <button type="button" disabled={index === photos.length - 1} onClick={() => movePhoto(index, 1)}
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
            La première photo est l&apos;image principale affichée dans la vitrine publique, le portail partenaire et l&apos;admin.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents ({documents.length})</h2>
          <FileUpload
            type="documents"
            accept=".pdf,image/*"
            multiple
            label="Ajouter des documents"
            showUploadedList={false}
            onUpload={mergeUploadedDocuments}
          />
          {documents.length > 0 && (
            <div className="mt-4 space-y-2">
              {documents.map((doc, index) => (
                <div key={doc.key} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.nom}</p>
                      <p className="text-xs text-gray-500 truncate">{doc.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={doc.type} onChange={(e) => updateDocumentType(index, e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                      {DOC_TYPES_PROGRAMME.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline">
                      Voir
                    </a>
                    <button type="button" onClick={() => removeDocument(index)}
                      className="text-red-400 hover:text-red-600 p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
              <div key={lot.id || `${lot.numero}-${i}`} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                      {["T1", "T2", "T3", "T4", "T5"].map((type) => <option key={type} value={type}>{type}</option>)}
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
                      {["NORD", "SUD", "EST", "OUEST", "NORD-EST", "NORD-OUEST", "SUD-EST", "SUD-OUEST"].map((orientation) => (
                        <option key={orientation} value={orientation}>{orientation}</option>
                      ))}
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

        <div className="flex gap-4">
          <button type="submit" disabled={status === "saving"}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
            {status === "saving" ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
          <Link href="/admin/programmes" className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
            Annuler
          </Link>
        </div>

        {status === "error" && (
          <p className="text-sm text-red-500">
            {errorMessage || "Erreur lors de l'enregistrement. Vérifiez les champs, les documents et les photos."}
          </p>
        )}
      </form>
    </div>
  );
}
