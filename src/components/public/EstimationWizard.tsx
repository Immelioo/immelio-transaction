"use client";

import Link from "next/link";
import { useState } from "react";

const etapes = [
  { num: 1, label: "Type de bien" },
  { num: 2, label: "Caractéristiques" },
  { num: 3, label: "Localisation" },
  { num: 4, label: "Vos coordonnées" },
];

const typesBien = [
  { value: "APPARTEMENT", label: "Appartement", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { value: "MAISON", label: "Maison", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { value: "STUDIO", label: "Studio", icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" },
  { value: "COMMERCE", label: "Local commercial", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { value: "BUREAU", label: "Bureau", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { value: "TERRAIN", label: "Terrain", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" },
];

export default function EstimationWizard() {
  const [etape, setEtape] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [stepError, setStepError] = useState("");
  const [form, setForm] = useState({
    type: "",
    surface: "",
    nbPieces: "",
    nbChambres: "",
    etage: "",
    anneeConstruction: "",
    etat: "",
    parking: false,
    terrasse: false,
    balcon: false,
    cave: false,
    piscine: false,
    ascenseur: false,
    adresse: "",
    codePostal: "",
    ville: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    commentaire: "",
  });

  function update(key: string, value: string | boolean) {
    setStepError("");
    setErrorMsg("");
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTypeSelection(value: string) {
    setStepError("");
    setErrorMsg("");
    setForm((f) => ({ ...f, type: value }));
    setEtape(2);
  }

  function canNext(): boolean {
    if (etape === 1) return !!form.type;
    if (etape === 2) return !!form.surface && !!form.nbPieces;
    if (etape === 3) return !!form.ville && !!form.codePostal;
    if (etape === 4) return !!form.nom && !!form.email;
    return false;
  }

  function goNext() {
    if (canNext()) {
      setStepError("");
      setEtape((prev) => Math.min(prev + 1, 4));
      return;
    }

    if (etape === 1) setStepError("Sélectionnez un type de bien pour continuer.");
    if (etape === 2) setStepError("Renseignez au minimum la surface et le nombre de pièces.");
    if (etape === 3) setStepError("Renseignez la ville et le code postal du bien.");
    if (etape === 4) setStepError("Renseignez au minimum votre nom et votre email.");
  }

  async function handleSubmit() {
    if (!canNext()) {
      goNext();
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/estimations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          surface: form.surface,
          nbPieces: form.nbPieces,
          nbChambres: form.nbChambres,
          etage: form.etage,
          anneeConstruction: form.anneeConstruction,
          etat: form.etat,
          parking: form.parking,
          terrasse: form.terrasse,
          balcon: form.balcon,
          cave: form.cave,
          piscine: form.piscine,
          ascenseur: form.ascenseur,
          adresse: form.adresse,
          codePostal: form.codePostal,
          ville: form.ville,
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: form.telephone,
          commentaire: form.commentaire,
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => null);
        const details = data?.details ? Object.values(data.details).flat().filter(Boolean).join(" ") : "";
        setErrorMsg(details || data?.error || `Erreur ${res.status} — veuillez réessayer.`);
        setStatus("error");
      }
    } catch {
      setErrorMsg("Erreur réseau — vérifiez votre connexion et réessayez.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-lg px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Demande envoyée !</h2>
          <p className="text-gray-600 text-lg mb-8">
            Votre demande d&apos;estimation a bien été reçue. Notre équipe vous recontactera sous 48h
            avec une estimation détaillée de votre bien.
          </p>
          <Link href="/" className="inline-block px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-primary text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-sm text-blue-200 px-3 py-1 rounded-full mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            100 % gratuit · Sans engagement
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Estimation <span className="text-accent">gratuite</span>
          </h1>
          <p className="text-blue-200 max-w-xl mx-auto">
            Obtenez une estimation professionnelle de votre bien en quelques minutes.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          {etapes.map((e, i) => (
            <div key={e.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    etape >= e.num ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {etape > e.num ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    e.num
                  )}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${etape >= e.num ? "text-primary font-medium" : "text-gray-400"}`}>
                  {e.label}
                </span>
              </div>
              {i < etapes.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${etape > e.num ? "bg-primary" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {etape === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quel type de bien souhaitez-vous estimer ?</h2>
              <p className="text-gray-500 mb-6">Sélectionnez le type de bien correspondant.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {typesBien.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleTypeSelection(t.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      form.type === t.value
                        ? "border-primary bg-slate-100 ring-2 ring-primary ring-offset-1"
                        : "border-gray-200 hover:border-primary hover:bg-gray-50"
                    }`}
                  >
                    <svg className={`w-8 h-8 mx-auto mb-2 ${form.type === t.value ? "text-primary" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                    </svg>
                    <span className={`text-sm font-medium ${form.type === t.value ? "text-primary font-bold" : "text-gray-700"}`}>{t.label}</span>
                  </button>
                ))}
              </div>
              {stepError && (
                <p className="mt-4 text-sm text-red-600">{stepError}</p>
              )}
            </div>
          )}

          {etape === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Caractéristiques du bien</h2>
              <p className="text-gray-500 mb-6">Décrivez les principales caractéristiques.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="estimation-surface" className="block text-sm font-medium text-gray-700 mb-1">Surface (m²) *</label>
                  <input id="estimation-surface" type="number" inputMode="decimal" value={form.surface} onChange={(e) => update("surface", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Ex: 75" />
                </div>
                <div>
                  <label htmlFor="estimation-pieces" className="block text-sm font-medium text-gray-700 mb-1">Nombre de pièces *</label>
                  <input id="estimation-pieces" type="number" inputMode="numeric" value={form.nbPieces} onChange={(e) => update("nbPieces", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Ex: 3" />
                </div>
                <div>
                  <label htmlFor="estimation-chambres" className="block text-sm font-medium text-gray-700 mb-1">Nombre de chambres</label>
                  <input id="estimation-chambres" type="number" inputMode="numeric" value={form.nbChambres} onChange={(e) => update("nbChambres", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Ex: 2" />
                </div>
                <div>
                  <label htmlFor="estimation-etage" className="block text-sm font-medium text-gray-700 mb-1">Étage</label>
                  <input id="estimation-etage" type="number" inputMode="numeric" value={form.etage} onChange={(e) => update("etage", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Ex: 3" />
                </div>
                <div>
                  <label htmlFor="estimation-annee" className="block text-sm font-medium text-gray-700 mb-1">Année de construction</label>
                  <input id="estimation-annee" type="number" inputMode="numeric" value={form.anneeConstruction} onChange={(e) => update("anneeConstruction", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Ex: 1990" />
                </div>
                <div>
                  <label htmlFor="estimation-etat" className="block text-sm font-medium text-gray-700 mb-1">État général</label>
                  <select id="estimation-etat" value={form.etat} onChange={(e) => update("etat", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                    <option value="">Sélectionnez</option>
                    <option value="Neuf">Neuf</option>
                    <option value="Très bon état">Très bon état</option>
                    <option value="Bon état">Bon état</option>
                    <option value="À rafraîchir">À rafraîchir</option>
                    <option value="À rénover">À rénover</option>
                  </select>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-700 mb-3">Équipements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: "parking", label: "Parking" },
                  { key: "terrasse", label: "Terrasse" },
                  { key: "balcon", label: "Balcon" },
                  { key: "cave", label: "Cave" },
                  { key: "piscine", label: "Piscine" },
                  { key: "ascenseur", label: "Ascenseur" },
                ].map((eq) => (
                  <label key={eq.key} className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    form[eq.key as keyof typeof form] ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input type="checkbox" checked={!!form[eq.key as keyof typeof form]}
                      onChange={(e) => update(eq.key, e.target.checked)} className="sr-only" />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      form[eq.key as keyof typeof form] ? "border-primary bg-primary" : "border-gray-300"
                    }`}>
                      {form[eq.key as keyof typeof form] && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{eq.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {etape === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Localisation du bien</h2>
              <p className="text-gray-500 mb-6">Indiquez l&apos;adresse du bien à estimer.</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="estimation-adresse" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input id="estimation-adresse" value={form.adresse} onChange={(e) => update("adresse", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Ex: 15 rue de la République" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="estimation-code-postal" className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                    <input id="estimation-code-postal" inputMode="numeric" autoComplete="postal-code" value={form.codePostal} onChange={(e) => update("codePostal", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Ex: 69001" />
                  </div>
                  <div>
                    <label htmlFor="estimation-ville" className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                    <input id="estimation-ville" autoComplete="address-level2" value={form.ville} onChange={(e) => update("ville", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Ex: Lyon" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {etape === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vos coordonnées</h2>
              <p className="text-gray-500 mb-6">Pour vous envoyer l&apos;estimation, nous avons besoin de vos coordonnées.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="estimation-prenom" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input id="estimation-prenom" autoComplete="given-name" value={form.prenom} onChange={(e) => update("prenom", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Votre prénom" />
                  </div>
                  <div>
                    <label htmlFor="estimation-nom" className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input id="estimation-nom" required autoComplete="family-name" value={form.nom} onChange={(e) => update("nom", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Votre nom" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="estimation-email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input id="estimation-email" type="email" required autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="votre@email.com" />
                  </div>
                  <div>
                    <label htmlFor="estimation-telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input id="estimation-telephone" type="tel" inputMode="tel" autoComplete="tel" value={form.telephone} onChange={(e) => update("telephone", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="06 12 34 56 78" />
                  </div>
                </div>
                <div>
                  <label htmlFor="estimation-commentaire" className="block text-sm font-medium text-gray-700 mb-1">Commentaire (optionnel)</label>
                  <textarea id="estimation-commentaire" rows={3} value={form.commentaire} onChange={(e) => update("commentaire", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    placeholder="Précisions supplémentaires sur votre bien..." />
                </div>
              </div>
            </div>
          )}

          {stepError && etape > 1 && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {stepError}
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {etape > 1 ? (
              <button type="button" onClick={() => { setStepError(""); setEtape(etape - 1); }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Précédent
              </button>
            ) : (
              <div />
            )}
            {etape < 4 ? (
              <button type="button" onClick={goNext}
                className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                Suivant
              </button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                {status === "error" && errorMsg && (
                  <p className="text-xs text-red-600 text-right">{errorMsg}</p>
                )}
                <button type="button" onClick={handleSubmit} disabled={status === "loading"}
                  className="px-8 py-2.5 bg-accent text-white rounded-lg font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {status === "loading" ? "Envoi..." : "Obtenir mon estimation gratuite"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">100% Gratuit</h3>
            <p className="text-sm text-gray-500">Sans engagement ni frais</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Réponse sous 48h</h3>
            <p className="text-sm text-gray-500">Par un expert immobilier</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Expertise locale</h3>
            <p className="text-sm text-gray-500">Connaissance du marché français</p>
          </div>
        </div>
      </section>
    </>
  );
}
