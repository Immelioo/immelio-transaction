import Link from "next/link";
import { getSiteSettings } from "@/lib/siteSettings";
import AdminParametresClient from "./AdminParametresClient";

export default async function AdminParametresPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500">Gérez votre compte et les informations de l&apos;agence</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Changement de mot de passe — Client Component */}
        <AdminParametresClient />

        {/* Informations agence — dynamiques */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Informations Agence</h2>
              <p className="text-sm text-gray-500 mb-4">
                Ces informations sont affichées sur le site public. Cliquez sur &quot;Modifier le site&quot; pour les éditer.
              </p>
            </div>
            <Link
              href="/admin/site"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
            >
              Modifier le site
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { label: "Nom de l'agence", value: settings.agency_name },
              { label: "Téléphone", value: settings.agency_phone },
              { label: "Email de contact", value: settings.agency_email },
              { label: "Ville / Zone", value: settings.agency_city },
              { label: "Horaires", value: settings.contact_hours },
            ].map((item) => (
              <div key={item.label}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{item.label}</label>
                <div className="px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
                  {item.value || <span className="text-gray-400 italic">Non renseigné</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
