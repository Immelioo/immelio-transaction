"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface InviteInfo {
  prenom: string;
  nom: string;
  email: string;
  entreprise: string;
}

function SetupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "expired" | "done">("loading");
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!token) { setStatus("invalid"); return; }

      try {
        const r = await fetch(`/api/auth/setup?token=${encodeURIComponent(token)}`);
        const data = await r.json();
        if (!data.valid) {
          setStatus(data.error?.includes("expiré") ? "expired" : "invalid");
        } else {
          setInviteInfo({ prenom: data.prenom, nom: data.nom, email: data.email, entreprise: data.entreprise });
          setStatus("valid");
        }
      } catch {
        setStatus("invalid");
      }
    }
    verify();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setSubmitting(false);
        return;
      }
      setStatus("done");
      setTimeout(() => router.push("/pro/dashboard"), 2000);
    } catch {
      setError("Erreur de connexion au serveur.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-primary">Immelio</span>
              <span className="text-2xl font-bold text-accent"> Transaction</span>
            </div>
          </Link>
        </div>

        {status === "loading" && (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
            <svg className="w-8 h-8 animate-spin text-primary mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-500">Vérification du lien…</p>
          </div>
        )}

        {status === "invalid" && (
          <div className="bg-white rounded-xl p-8 border border-red-200 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Lien invalide</h2>
            <p className="text-gray-500 text-sm mb-6">Ce lien d&apos;invitation est invalide ou a déjà été utilisé.</p>
            <Link href="/pro/login" className="text-primary font-medium hover:underline text-sm">
              Retour à la connexion
            </Link>
          </div>
        )}

        {status === "expired" && (
          <div className="bg-white rounded-xl p-8 border border-amber-200 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Lien expiré</h2>
            <p className="text-gray-500 text-sm mb-6">
              Ce lien d&apos;activation a expiré (valable 48h). Contactez votre administrateur pour en recevoir un nouveau.
            </p>
            <a href="mailto:tf.immopro@gmail.com" className="text-primary font-medium hover:underline text-sm">
              Contacter l&apos;administration
            </a>
          </div>
        )}

        {status === "done" && (
          <div className="bg-white rounded-xl p-8 border border-green-200 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Compte activé !</h2>
            <p className="text-gray-500 text-sm">Redirection vers votre espace partenaire…</p>
          </div>
        )}

        {status === "valid" && inviteInfo && (
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Bienvenue, {inviteInfo.prenom} !
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Définissez votre mot de passe pour activer votre compte <strong>{inviteInfo.entreprise}</strong>.
            </p>

            <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6 text-sm text-gray-600">
              <span className="font-medium">Email : </span>{inviteInfo.email}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Activation en cours…" : "Activer mon compte"}
              </button>
            </form>
          </div>
        )}

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary">
            Retour au site
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement…</div>
      </div>
    }>
      <SetupForm />
    </Suspense>
  );
}
