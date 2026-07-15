"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authFetch } from "@/lib/authFetch";

export default function NouveauPartenairePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    entreprise: "",
    documents: [] as { nom: string; type: string; url: string; taille: number }[],
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState("MANDAT");
  const docFileRef = useRef<HTMLInputElement>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleDocUpload() {
    const file = docFileRef.current?.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "documents");

      const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          documents: [...prev.documents, { nom: data.nom, type: docType, url: data.url, taille: data.taille }],
        }));
        if (docFileRef.current) docFileRef.current.value = "";
        setDocType("MANDAT");
      }
    } catch {
      // erreur
    }
    setUploadingDoc(false);
  }

  function removeDocument(index: number) {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await authFetch("/api/partenaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/admin/partenaires");
      } else {
        const data = await res.json().catch(() => null);
        if (res.status === 409) {
          setErrorMsg("Un compte existe déjà avec cet email.");
        } else if (data?.details) {
          const fields = Object.entries(data.details as Record<string, string[]>)
            .map(([k, v]) => `${k}: ${v.join(", ")}`)
            .join(" | ");
          setErrorMsg(fields);
        } else {
          setErrorMsg(data?.error || `Erreur ${res.status}`);
        }
        setStatus("error");
      }
    } catch {
      setErrorMsg("Erreur réseau — réessayez.");
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/partenaires" className="text-gray-500 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau Partenaire</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Infos partenaire */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du partenaire</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input required value={form.prenom} onChange={(e) => update("prenom", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input required value={form.nom} onChange={(e) => update("nom", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel *</label>
              <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input type="tel" value={form.telephone} onChange={(e) => update("telephone", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise *</label>
              <input required value={form.entreprise} onChange={(e) => update("entreprise", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Un email d&apos;invitation sécurisé sera envoyé automatiquement. Le partenaire définira son propre mot de passe via le lien reçu (valable 48h).</p>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents du partenaire</h2>

          {/* Documents déjà uploadés */}
          {form.documents.length > 0 && (
            <div className="space-y-2 mb-4">
              {form.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {doc.nom.match(/\.pdf$/i) ? "PDF" : "DOC"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.nom}</p>
                      <p className="text-xs text-gray-500">{doc.type} &middot; {(doc.taille / 1024).toFixed(0)} Ko</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeDocument(index)}
                    className="text-red-400 hover:text-red-600 p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload nouveau document */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type de document</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="MANDAT">Mandat</option>
                  <option value="COMPROMIS">Compromis</option>
                  <option value="OFFRE">Offre d&apos;achat</option>
                  <option value="RESERVATION">Réservation</option>
                  <option value="FINANCEMENT">Financement</option>
                  <option value="CARTE_T">Carte T (carte professionnelle)</option>
                  <option value="KBIS">Kbis (extrait registre)</option>
                  <option value="CONTRAT_PARTENARIAT">Contrat de partenariat</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fichier (PDF, JPEG, HEIC...)</label>
                <input ref={docFileRef} type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary" />
              </div>
            </div>
            <button type="button" onClick={handleDocUpload} disabled={uploadingDoc}
              className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50">
              {uploadingDoc ? "Upload en cours..." : "+ Ajouter ce document"}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="submit" disabled={status === "loading"}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50">
            {status === "loading" ? "Création..." : "Créer le partenaire"}
          </button>
          <Link href="/admin/partenaires" className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
            Annuler
          </Link>
        </div>

        {status === "error" && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700 font-medium">Erreur lors de la création.</p>
            {errorMsg && <p className="text-xs text-red-600 mt-1">{errorMsg}</p>}
          </div>
        )}
      </form>
    </div>
  );
}
