"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";

interface Document {
  id: string;
  nom: string;
  type: string;
  url: string;
  createdAt: string | Date;
}

interface Props {
  bienId: string;
  existingDocuments: Document[];
}

const typeLabels: Record<string, string> = {
  MANDAT: "Mandat", COMPROMIS: "Compromis", BAIL: "Bail",
  DIAGNOSTIC: "Diagnostic", FACTURE: "Facture", AUTRE: "Autre",
};

export default function DocumentManager({ bienId, existingDocuments }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [docType, setDocType] = useState("DIAGNOSTIC");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. Upload le fichier
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "documents");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();

      // 2. Créer le document en BDD
      await authFetch("/api/documents", {
        method: "POST",
        body: JSON.stringify({
          nom: uploadData.nom,
          type: docType,
          url: uploadData.url,
          taille: uploadData.taille,
          bienId,
        }),
      });

      setShowForm(false);
      setDocType("DIAGNOSTIC");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch {
      // erreur
    }
    setLoading(false);
  }

  function getFileIcon(nom: string) {
    if (nom.match(/\.pdf$/i)) return "PDF";
    if (nom.match(/\.(jpg|jpeg|png|heic|heif|webp)$/i)) return "IMG";
    return "DOC";
  }

  return (
    <div>
      {/* Liste des documents existants */}
      {existingDocuments.length > 0 ? (
        <div className="space-y-2 mb-4">
          {existingDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{getFileIcon(doc.nom)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.nom}</p>
                  <p className="text-xs text-gray-500">{typeLabels[doc.type] || doc.type}</p>
                </div>
              </div>
              <a href={doc.url} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 text-primary border border-primary rounded-lg text-xs font-medium hover:bg-primary hover:text-white transition-colors">
                Ouvrir
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-4">Aucun document associé à ce bien</p>
      )}

      {/* Formulaire upload */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
          + Ajouter un document
        </button>
      ) : (
        <form onSubmit={handleUpload} className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type de document</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fichier (PDF, JPEG, HEIC...)</label>
              <input ref={fileRef} required type="file"
                accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {loading ? "Upload en cours..." : "Ajouter le document"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
