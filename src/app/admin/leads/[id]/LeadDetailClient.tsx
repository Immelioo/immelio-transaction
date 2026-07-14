"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  leadId: string;
  currentNotes: string;
  currentStatut: string;
  currentAssigneA: string;
}

const STATUTS = ["NOUVEAU", "CONTACTE", "QUALIFIE", "PROPOSITION", "NEGOCE", "GAGNE", "PERDU"];
const TYPES_ACTIVITE = ["APPEL", "EMAIL", "VISITE", "NOTE", "RELANCE", "OFFRE", "AUTRE"];

const typeLabels: Record<string, string> = {
  APPEL: "Appel téléphonique",
  EMAIL: "Email envoyé",
  VISITE: "Visite organisée",
  NOTE: "Note interne",
  RELANCE: "Relance",
  OFFRE: "Offre transmise",
  AUTRE: "Autre",
};

export default function LeadDetailClient({ leadId, currentNotes, currentStatut, currentAssigneA }: Props) {
  const router = useRouter();

  const [statut, setStatut] = useState(currentStatut);
  const [notes, setNotes] = useState(currentNotes);
  const [assigneA, setAssigneA] = useState(currentAssigneA);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [actType, setActType] = useState("NOTE");
  const [actDesc, setActDesc] = useState("");
  const [actDate, setActDate] = useState("");
  const [addingAct, setAddingAct] = useState(false);
  const [actError, setActError] = useState("");

  async function saveInfo() {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ statut, notes, assigneA }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function addActivite(e: React.FormEvent) {
    e.preventDefault();
    if (!actDesc.trim()) return;
    setActError("");
    setAddingAct(true);
    const res = await fetch(`/api/leads/${leadId}/activites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type: actType, description: actDesc, dateEcheance: actDate || null }),
    });
    setAddingAct(false);
    if (res.ok) {
      setActDesc("");
      setActDate("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setActError(data?.error || "Erreur lors de l'ajout");
    }
  }

  return (
    <div className="space-y-5">
      {/* Statut + assignation rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {STATUTS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Assigné à</label>
          <input
            value={assigneA}
            onChange={(e) => setAssigneA(e.target.value)}
            placeholder="Prénom Nom"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={saveInfo}
            disabled={saving}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : saved ? "✓ Sauvegardé" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Notes internes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Ajouter des notes sur ce lead..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
      </div>

      {/* Nouvelle activité */}
      <form onSubmit={addActivite} className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ajouter une activité</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
            <select
              value={actType}
              onChange={(e) => setActType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {TYPES_ACTIVITE.map((t) => (
                <option key={t} value={t}>{typeLabels[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Échéance (optionnel)</label>
            <input
              type="date"
              value={actDate}
              onChange={(e) => setActDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
        <textarea
          value={actDesc}
          onChange={(e) => setActDesc(e.target.value)}
          rows={2}
          placeholder="Décrivez l'activité, le résultat ou la prochaine étape..."
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-3"
        />
        {actError && (
          <p className="text-xs text-red-600 mb-2">{actError}</p>
        )}
        <button
          type="submit"
          disabled={addingAct || !actDesc.trim()}
          className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {addingAct ? "Ajout..." : "Ajouter l'activité"}
        </button>
      </form>
    </div>
  );
}
