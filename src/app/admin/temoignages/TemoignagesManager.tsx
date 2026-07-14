"use client";

import { useState } from "react";
import { authFetch } from "@/lib/authFetch";

interface Temoignage {
  id: string;
  nom: string;
  ville: string;
  texte: string;
  note: number;
  ordre: number;
  visible: boolean;
}

const emptyForm = { nom: "", ville: "", texte: "", note: 5, ordre: 0, visible: true };

export default function TemoignagesManager({ initialTemoignages }: { initialTemoignages: Temoignage[] }) {
  const [temoignages, setTemoignages] = useState<Temoignage[]>(initialTemoignages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function startEdit(t: Temoignage) {
    setForm({ nom: t.nom, ville: t.ville, texte: t.texte, note: t.note, ordre: t.ordre, visible: t.visible });
    setEditingId(t.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = editingId ? `/api/temoignages/${editingId}` : "/api/temoignages";
      const method = editingId ? "PUT" : "POST";
      const res = await authFetch(url, { method, body: JSON.stringify(form) });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'enregistrement");
        return;
      }

      if (editingId) {
        setTemoignages((prev) => prev.map((t) => (t.id === editingId ? data : t)).sort((a, b) => a.ordre - b.ordre));
      } else {
        setTemoignages((prev) => [...prev, data].sort((a, b) => a.ordre - b.ordre));
      }
      setShowForm(false);
    } catch {
      setError("Erreur serveur, veuillez réessayer");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    const res = await authFetch(`/api/temoignages/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTemoignages((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Témoignages ({temoignages.length})
          </h2>
          <button
            onClick={startCreate}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            + Ajouter un témoignage
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Seuls les témoignages marqués &quot;visible&quot; apparaissent sur la page d&apos;accueil, triés par ordre croissant.
        </p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">{editingId ? "Modifier le témoignage" : "Nouveau témoignage"}</h3>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ex: Sophie M."
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
                placeholder="Ex: Lyon"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Témoignage</label>
            <textarea
              value={form.texte}
              onChange={(e) => setForm({ ...form, texte: e.target.value })}
              rows={3}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (1-5)</label>
              <input
                type="number" min={1} max={5}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d&apos;affichage</label>
              <input
                type="number" min={0}
                value={form.ordre}
                onChange={(e) => setForm({ ...form, ordre: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                id="visible"
                checked={form.visible}
                onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="visible" className="text-sm text-gray-700">Visible sur le site</label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {temoignages.length === 0 ? (
          <p className="p-8 text-center text-gray-400">Aucun témoignage pour le moment.</p>
        ) : (
          temoignages.map((t) => (
            <div key={t.id} className="p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{t.nom}</p>
                  <span className="text-xs text-gray-400">· {t.ville}</span>
                  <span className="text-xs text-amber-500">{"★".repeat(t.note)}</span>
                  {!t.visible && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Masqué</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 italic">&ldquo;{t.texte}&rdquo;</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(t)} className="text-sm text-primary hover:underline">Modifier</button>
                <button onClick={() => handleDelete(t.id)} className="text-sm text-red-600 hover:underline">Supprimer</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
