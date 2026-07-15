"use client";

import { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/lib/authFetch";
import { formatDate } from "@/lib/utils";

interface Dossier {
  id: string;
  titre: string;
  type: string;
  statut: string;
  bien: string | null;
  montant: number | null;
  notes: string | null;
  dateEcheance: string | null;
  createdAt: string;
}

interface Contact {
  id: string;
  nom: string;
  prenom: string | null;
  telephone: string | null;
  email: string | null;
  entreprise: string | null;
  notes: string | null;
  createdAt: string;
  dossiers: Dossier[];
}

const DOSSIER_TYPES = ["VENTE", "ACHAT", "LOCATION", "PARTENARIAT", "AUTRE"];
const DOSSIER_STATUTS = ["EN_COURS", "SIGNE", "ABANDONNE"];
const STATUT_LABELS: Record<string, { label: string; cls: string }> = {
  EN_COURS:  { label: "En cours",  cls: "bg-blue-100 text-blue-700" },
  SIGNE:     { label: "Signé",     cls: "bg-green-100 text-green-700" },
  ABANDONNE: { label: "Abandonné", cls: "bg-gray-100 text-gray-500" },
  NOUVELLE:  { label: "Nouvelle",  cls: "bg-blue-100 text-blue-700" },
  TRAITEE:   { label: "Traitée",   cls: "bg-green-100 text-green-700" },
  ARCHIVEE:  { label: "Archivée",  cls: "bg-gray-100 text-gray-500" },
};
const TYPE_LABELS: Record<string, string> = {
  VENTE: "Vente", ACHAT: "Achat", LOCATION: "Location", PARTENARIAT: "Partenariat", AUTRE: "Autre",
};

const EMPTY_CONTACT = { nom: "", prenom: "", telephone: "", email: "", entreprise: "", notes: "" };
const EMPTY_DOSSIER = { titre: "", type: "VENTE", statut: "EN_COURS", bien: "", montant: "", notes: "", dateEcheance: "" };

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");

  // Contact modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT);
  const [savingContact, setSavingContact] = useState(false);

  // Dossier modal
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [editingDossier, setEditingDossier] = useState<Dossier | null>(null);
  const [dossierForm, setDossierForm] = useState(EMPTY_DOSSIER);
  const [savingDossier, setSavingDossier] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/contacts");
    if (res.ok) {
      const data: Contact[] = await res.json();
      setContacts(data);
      if (selected) {
        const refreshed = data.find((c) => c.id === selected.id);
        setSelected(refreshed ?? null);
      }
    }
    setLoading(false);
  }, [selected]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.nom.toLowerCase().includes(q) ||
      (c.prenom ?? "").toLowerCase().includes(q) ||
      (c.telephone ?? "").includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.entreprise ?? "").toLowerCase().includes(q)
    );
  });

  function openNewContact() {
    setEditingContact(null);
    setContactForm(EMPTY_CONTACT);
    setShowContactModal(true);
  }

  function openEditContact(c: Contact) {
    setEditingContact(c);
    setContactForm({ nom: c.nom, prenom: c.prenom ?? "", telephone: c.telephone ?? "", email: c.email ?? "", entreprise: c.entreprise ?? "", notes: c.notes ?? "" });
    setShowContactModal(true);
  }

  async function saveContact() {
    if (!contactForm.nom.trim()) return;
    setSavingContact(true);
    try {
      const res = editingContact
        ? await authFetch(`/api/contacts/${editingContact.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contactForm) })
        : await authFetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contactForm) });
      if (res.ok) {
        setShowContactModal(false);
        await load();
      }
    } finally {
      setSavingContact(false);
    }
  }

  async function deleteContact(id: string) {
    if (!confirm("Supprimer ce contact et tous ses dossiers ?")) return;
    await authFetch(`/api/contacts/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    await load();
  }

  function openNewDossier() {
    setEditingDossier(null);
    setDossierForm(EMPTY_DOSSIER);
    setShowDossierModal(true);
  }

  function openEditDossier(d: Dossier) {
    setEditingDossier(d);
    setDossierForm({
      titre: d.titre, type: d.type, statut: d.statut,
      bien: d.bien ?? "", montant: d.montant?.toString() ?? "",
      notes: d.notes ?? "",
      dateEcheance: d.dateEcheance ? d.dateEcheance.slice(0, 10) : "",
    });
    setShowDossierModal(true);
  }

  async function saveDossier() {
    if (!selected || !dossierForm.titre.trim()) return;
    setSavingDossier(true);
    try {
      const payload = { dossier: { ...dossierForm, id: editingDossier?.id } };
      const res = await authFetch(`/api/contacts/${selected.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        setShowDossierModal(false);
        await load();
      }
    } finally {
      setSavingDossier(false);
    }
  }

  async function deleteDossier(dossierId: string) {
    if (!selected || !confirm("Supprimer ce dossier ?")) return;
    await authFetch(`/api/contacts/${selected.id}?dossierId=${dossierId}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500">{contacts.length} contact{contacts.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openNewContact}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-sm"
        >
          + Nouveau contact
        </button>
      </div>

      <div className="flex gap-4 h-[calc(100vh-180px)] min-h-[500px]">
        {/* Left panel — contact list */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-6 text-center text-gray-400 text-sm">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">Aucun contact</div>
            ) : filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selected?.id === c.id ? "bg-primary/5 border-l-4 border-primary" : ""}`}
              >
                <p className="font-medium text-gray-900 text-sm">{c.prenom} {c.nom}</p>
                {c.telephone && <p className="text-xs text-gray-500 mt-0.5">{c.telephone}</p>}
                {c.entreprise && <p className="text-xs text-gray-400">{c.entreprise}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{c.dossiers.length} dossier{c.dossiers.length > 1 ? "s" : ""}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel — contact detail */}
        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm">Sélectionnez un contact</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Contact card */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selected.prenom} {selected.nom}</h2>
                    {selected.entreprise && <p className="text-sm text-gray-500">{selected.entreprise}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEditContact(selected)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                      Modifier
                    </button>
                    <button type="button" onClick={() => deleteContact(selected.id)} className="px-3 py-1.5 text-sm border border-red-200 rounded-lg hover:bg-red-50 text-red-600 font-medium">
                      Supprimer
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selected.telephone && (
                    <div>
                      <span className="text-gray-400 text-xs uppercase font-medium">Téléphone</span>
                      <a href={`tel:${selected.telephone}`} className="block text-primary font-medium mt-0.5">{selected.telephone}</a>
                    </div>
                  )}
                  {selected.email && (
                    <div>
                      <span className="text-gray-400 text-xs uppercase font-medium">Email</span>
                      <a href={`mailto:${selected.email}`} className="block text-primary font-medium mt-0.5 truncate">{selected.email}</a>
                    </div>
                  )}
                  {selected.notes && (
                    <div className="col-span-2">
                      <span className="text-gray-400 text-xs uppercase font-medium">Notes</span>
                      <p className="text-gray-700 mt-0.5 whitespace-pre-line">{selected.notes}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-300 mt-4">Créé le {formatDate(new Date(selected.createdAt))}</p>
              </div>

              {/* Dossiers */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Dossiers en cours ({selected.dossiers.length})</h3>
                  <button type="button" onClick={openNewDossier} className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                    + Ajouter un dossier
                  </button>
                </div>

                {selected.dossiers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <svg className="w-10 h-10 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">Aucun dossier — cliquez sur &quot;+ Ajouter un dossier&quot;</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selected.dossiers.map((d) => {
                      const st = STATUT_LABELS[d.statut] ?? STATUT_LABELS.EN_COURS;
                      return (
                        <div key={d.id} className="border border-gray-100 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{TYPE_LABELS[d.type] ?? d.type}</span>
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm">{d.titre}</h4>
                              {d.bien && <p className="text-xs text-gray-500 mt-0.5">{d.bien}</p>}
                              {d.montant != null && (
                                <p className="text-sm font-bold text-primary mt-1">
                                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(d.montant)}
                                </p>
                              )}
                              {d.dateEcheance && (
                                <p className="text-xs text-gray-400 mt-1">Échéance : {formatDate(new Date(d.dateEcheance))}</p>
                              )}
                              {d.notes && (
                                <p className="text-xs text-gray-600 mt-2 whitespace-pre-line border-t border-gray-50 pt-2">{d.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button type="button" onClick={() => openEditDossier(d)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button type="button" onClick={() => deleteDossier(d.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingContact ? "Modifier le contact" : "Nouveau contact"}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prénom</label>
                  <input value={contactForm.prenom} onChange={(e) => setContactForm((f) => ({ ...f, prenom: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Prénom" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                  <input required value={contactForm.nom} onChange={(e) => setContactForm((f) => ({ ...f, nom: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Nom de famille" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                <input type="tel" value={contactForm.telephone} onChange={(e) => setContactForm((f) => ({ ...f, telephone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="06 12 34 56 78" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={contactForm.email} onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="email@exemple.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Entreprise</label>
                <input value={contactForm.entreprise} onChange={(e) => setContactForm((f) => ({ ...f, entreprise: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Nom de la société" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea rows={3} value={contactForm.notes} onChange={(e) => setContactForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none" placeholder="Informations complémentaires..." />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => setShowContactModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
              <button type="button" onClick={saveContact} disabled={savingContact || !contactForm.nom.trim()}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
                {savingContact ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dossier modal */}
      {showDossierModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingDossier ? "Modifier le dossier" : "Nouveau dossier"}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{selected?.prenom} {selected?.nom}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Titre du dossier *</label>
                <input value={dossierForm.titre} onChange={(e) => setDossierForm((f) => ({ ...f, titre: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Ex : Vente appartement Lyon" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select value={dossierForm.type} onChange={(e) => setDossierForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                    {DOSSIER_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
                  <select value={dossierForm.statut} onChange={(e) => setDossierForm((f) => ({ ...f, statut: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                    {DOSSIER_STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s].label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bien / Adresse</label>
                <input value={dossierForm.bien} onChange={(e) => setDossierForm((f) => ({ ...f, bien: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Ex : 12 rue de la Paix, Paris 75001" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Montant (€)</label>
                  <input type="number" value={dossierForm.montant} onChange={(e) => setDossierForm((f) => ({ ...f, montant: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Ex : 250000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date d&apos;échéance</label>
                  <input type="date" value={dossierForm.dateEcheance} onChange={(e) => setDossierForm((f) => ({ ...f, dateEcheance: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Détails du dossier</label>
                <textarea rows={4} value={dossierForm.notes} onChange={(e) => setDossierForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  placeholder="Informations importantes, étapes, documents manquants, remarques..." />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => setShowDossierModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
              <button type="button" onClick={saveDossier} disabled={savingDossier || !dossierForm.titre.trim()}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
                {savingDossier ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
