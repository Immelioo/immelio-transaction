"use client";

import { useState, useEffect, useRef } from "react";
import { useProUser } from "@/hooks/useProUser";
import ProSidebar from "@/components/pro/ProSidebar";

const DOC_TYPES = [
  { value: "MANDAT", label: "Mandat" },
  { value: "COMPROMIS", label: "Compromis" },
  { value: "OFFRE", label: "Offre" },
  { value: "RESERVATION", label: "Réservation" },
  { value: "FINANCEMENT", label: "Financement" },
  { value: "AUTRE", label: "Autre" },
];

interface DocumentPartenaire {
  id: string;
  nom: string;
  type: string;
  url: string;
  taille: number;
  statut: string;
  createdAt: string;
}

function statusBadge(statut: string) {
  switch (statut) {
    case "ENVOYE":  return { label: "Envoyé",  cls: "bg-blue-100 text-blue-700" };
    case "VU":      return { label: "Vu",       cls: "bg-yellow-100 text-yellow-700" };
    case "VALIDE":  return { label: "Validé",   cls: "bg-green-100 text-green-700" };
    case "REFUSE":  return { label: "Refusé",   cls: "bg-red-100 text-red-700" };
    default:        return { label: statut,     cls: "bg-gray-100 text-gray-700" };
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function EnvoyerDocumentPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, loading: userLoading } = useProUser();

  const [docType, setDocType] = useState("MANDAT");
  const [docName, setDocName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [documents, setDocuments] = useState<DocumentPartenaire[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const fetchDocuments = () => {
    setLoadingDocs(true);
    fetch("/api/documents-partenaire", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: DocumentPartenaire[]) => setDocuments(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingDocs(false));
  };

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !docName) setDocName(selected.name.replace(/\.[^/.]+$/, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "documents");

      const uploadRes = await fetch("/api/upload", { method: "POST", credentials: "include", body: formData });
      if (!uploadRes.ok) throw new Error("Erreur lors de l'envoi du fichier");
      const uploadData = await uploadRes.json();

      const docRes = await fetch("/api/documents-partenaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nom: docName || file.name,
          type: docType,
          url: uploadData.url,
          taille: file.size,
        }),
      });

      if (!docRes.ok) throw new Error("Erreur lors de l'enregistrement du document");

      setSuccess(true);
      setDocName("");
      setFile(null);
      setMessage("");
      setDocType("MANDAT");
      if (fileInputRef.current) fileInputRef.current.value = "";

      fetchDocuments();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setUploading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProSidebar />

      <main className="flex-1 min-w-0 p-6 md:p-8 pt-20 md:pt-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Envoyer un Document</h1>
          <p className="text-gray-500 mt-1">Transmettez vos documents (mandats, compromis, diagnostics…) à l&apos;administration</p>
        </div>

        {/* Formulaire d'upload */}
        <section className="mb-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 max-w-2xl">
            {success && (
              <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3">
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Document envoyé avec succès !</span>
              </div>
            )}
            {error && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="docType" className="block text-sm font-medium text-gray-700 mb-1.5">Type de document</label>
              <select id="docType" value={docType} onChange={(e) => setDocType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors">
                {DOC_TYPES.map((dt) => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label htmlFor="docName" className="block text-sm font-medium text-gray-700 mb-1.5">Nom du document</label>
              <input id="docName" type="text" value={docName} onChange={(e) => setDocName(e.target.value)}
                placeholder="Ex : Mandat de vente - Dupont"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors" />
            </div>

            <div className="mb-5">
              <label htmlFor="docFile" className="block text-sm font-medium text-gray-700 mb-1.5">Fichier</label>
              <input ref={fileInputRef} id="docFile" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors" />
              <p className="text-xs text-gray-400 mt-1">Formats acceptés : PDF, JPG, PNG, WebP — Max 20 Mo</p>
            </div>

            <div className="mb-6">
              <label htmlFor="docMessage" className="block text-sm font-medium text-gray-700 mb-1.5">
                Commentaire <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea id="docMessage" value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                placeholder="Instructions ou précisions pour l'administration…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none" />
            </div>

            <button type="submit" disabled={!file || uploading}
              className="flex items-center justify-center gap-2 bg-primary text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {uploading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Envoi en cours…</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>Envoyer le document</>
              )}
            </button>
          </form>
        </section>

        {/* Liste des documents */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents envoyés</h2>

          {loadingDocs ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <svg className="w-6 h-6 animate-spin text-primary mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-500">Aucun document envoyé pour le moment</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      {["Nom", "Type", "Taille", "Date", "Statut"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => {
                      const badge = statusBadge(doc.statut);
                      return (
                        <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-5 py-3.5 font-medium text-gray-900">{doc.nom}</td>
                          <td className="px-5 py-3.5 text-gray-600">{DOC_TYPES.find((d) => d.value === doc.type)?.label ?? doc.type}</td>
                          <td className="px-5 py-3.5 text-gray-500">{formatFileSize(doc.taille)}</td>
                          <td className="px-5 py-3.5 text-gray-500">{new Date(doc.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-gray-100">
                {documents.map((doc) => {
                  const badge = statusBadge(doc.statut);
                  return (
                    <div key={doc.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900 text-sm">{doc.nom}</p>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{DOC_TYPES.find((d) => d.value === doc.type)?.label ?? doc.type}</span>
                        <span>&middot;</span>
                        <span>{formatFileSize(doc.taille)}</span>
                        <span>&middot;</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
