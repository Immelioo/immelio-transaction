"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProSidebar from "@/components/pro/ProSidebar";

interface Document {
  id: string;
  nom: string;
  type: string;
  taille: number;
  createdAt: string;
  url: string;
}

const typeLabels: Record<string, string> = {
  MANDAT: "Mandat",
  COMPROMIS: "Compromis",
  BAIL: "Bail",
  DIAGNOSTIC: "Diagnostic",
  FACTURE: "Facture",
  AUTRE: "Autre",
};

export default function ProDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/documents-partenaire", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        }
      } catch {
        // erreur silencieuse
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter ? documents.filter((d) => d.type === filter) : documents;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProSidebar />

      <main className="flex-1 min-w-0 p-6 md:p-8 pt-20 md:pt-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mes Documents</h1>
          <p className="text-gray-500 mt-1">Documents partagés avec vous par l&apos;agence Immelio Transaction</p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/pro/envoyer-document"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            Envoyer un document
          </Link>
          <button onClick={() => setFilter("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!filter ? "bg-primary text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`}>
            Tous ({documents.length})
          </button>
          {Object.entries(typeLabels).map(([key, label]) => {
            const count = documents.filter(d => d.type === key).length;
            return (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === key ? "bg-primary text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`}>
                {label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-3 text-gray-500">Chargement des documents...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {filtered.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {doc.nom.match(/\.pdf$/i) ? (
                      <span className="text-xs font-bold text-red-600">PDF</span>
                    ) : (
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doc.nom}</p>
                    <p className="text-sm text-gray-500">
                      {typeLabels[doc.type] || doc.type}
                      {doc.taille > 0 && ` · ${(doc.taille / 1024).toFixed(0)} Ko`}
                      {doc.createdAt && ` · ${new Date(doc.createdAt).toLocaleDateString("fr-FR")}`}
                    </p>
                  </div>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 text-primary border border-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors">
                  Télécharger
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">Aucun document disponible</p>
            <p className="text-gray-400 text-sm mt-1">Vos documents seront ajoutés par l&apos;agence Immelio Transaction</p>
          </div>
        )}
      </main>
    </div>
  );
}
