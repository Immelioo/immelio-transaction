"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { authFetch } from "@/lib/authFetch";

export default function ModifierProgrammePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  interface LotForm {
    numero: string;
    type: string;
    surface: string;
    etage: string;
    prix: string;
    nbChambres: string;
    statut: string;
    orientation: string;
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
  };

  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "success" | "error">("loading");
  const [lots, setLots] = useState<LotForm[]>([]);
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
        if (!res.ok) throw new Error("Not found");
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
        if (data.lots && Array.isArray(data.lots)) {
          setLots(
            data.lots.map((lot: Record<string, unknown>) => ({
              numero: (lot.numero as string) || "",
              type: (lot.type as string) || "T2",
              surface: lot.surface?.toString() || "",
              etage: lot.etage?.toString() || "0",
              prix: lot.prix?.toString() || "",
              nbChambres: lot.nbChambres?.toString() || "1",
              statut: (lot.statut as string) || "DISPONIBLE",
              orientation: (lot.orientation as string) || "",
            }))
          );
        }
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    }
    fetchProgramme();
  }, [id]);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateLot(index: number, field: keyof LotForm, value: string) {
    setLots((prev) => prev.map((lot, i) => (i === index ? { ...lot, [field]: value } : lot)));
  }

  function addLot() {
    setLots((prev) => [...prev, { ...emptyLot }]);
  }

  function removeLot(index: number) {
    setLots((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await authFetch(`/api/programmes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lots }),
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
            else alert("Erreur lors de la suppression.");
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
        {/* Infos principales */}
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
                <option value="BIENTOT">Bientot disponible</option>
                <option value="LIVRE">Livre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison</label>
              <input value={form.datelivraison} onChange={(e) => update("datelivraison", e.target.value)}
                placeholder="Ex: T4 2026"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Norme energetique</label>
              <select value={form.normeRT} onChange={(e) => update("normeRT", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="">Non renseigne</option>
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
              <input type="number" step="0.1" value={form.commissionPartenaire}
                onChange={(e) => update("commissionPartenaire", e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix min (euros)</label>
              <input type="number" value={form.prixMin} onChange={(e) => update("prixMin", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix max (euros)</label>
              <input type="number" value={form.prixMax} onChange={(e) => update("prixMax", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surface min (m2)</label>
              <input type="number" value={form.surfaceMin} onChange={(e) => update("surfaceMin", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surface max (m2)</label>
              <input type="number" value={form.surfaceMax} onChange={(e) => update("surfaceMax", e.target.value)}
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

        {/* Lots */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lots ({lots.length})</h2>
            <button type="button" onClick={addLot}
              className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
              + Ajouter un lot
            </button>
          </div>
          {lots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500">N°</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500">Type</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500">Surface</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500">Étage</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500">Prix</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500">Chambres</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500">Statut</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500">Orient.</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lots.map((lot, i) => (
                    <tr key={i}>
                      <td className="px-1 py-1"><input value={lot.numero} onChange={(e) => updateLot(i, "numero", e.target.value)} className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="A101" /></td>
                      <td className="px-1 py-1">
                        <select value={lot.type} onChange={(e) => updateLot(i, "type", e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded text-sm">
                          {["STUDIO","T1","T2","T3","T4","T5"].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-1 py-1"><input type="number" value={lot.surface} onChange={(e) => updateLot(i, "surface", e.target.value)} className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="m²" /></td>
                      <td className="px-1 py-1"><input type="number" value={lot.etage} onChange={(e) => updateLot(i, "etage", e.target.value)} className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm" /></td>
                      <td className="px-1 py-1"><input type="number" value={lot.prix} onChange={(e) => updateLot(i, "prix", e.target.value)} className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="€" /></td>
                      <td className="px-1 py-1"><input type="number" value={lot.nbChambres} onChange={(e) => updateLot(i, "nbChambres", e.target.value)} className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm" /></td>
                      <td className="px-1 py-1">
                        <select value={lot.statut} onChange={(e) => updateLot(i, "statut", e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded text-sm">
                          {["DISPONIBLE","OPTIONE","RESERVE","VENDU"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-1 py-1"><input value={lot.orientation} onChange={(e) => updateLot(i, "orientation", e.target.value)} className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Sud" /></td>
                      <td className="px-1 py-1">
                        <button type="button" onClick={() => removeLot(i)} className="text-red-500 hover:text-red-700 p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Aucun lot. Cliquez sur &quot;Ajouter un lot&quot; pour commencer.</p>
          )}
        </div>

        {/* Submit */}
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
          <p className="text-sm text-red-500">Erreur lors de la mise a jour. Verifiez les champs et reessayez.</p>
        )}
      </form>
    </div>
  );
}
