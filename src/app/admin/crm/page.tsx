import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import LeadActions from "@/components/admin/LeadActions";
import DemandeActions from "@/components/admin/DemandeActions";
import VisiteActions from "@/components/admin/VisiteActions";
import OptionStatusActions from "@/components/admin/OptionStatusActions";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  NOUVEAU: "bg-blue-100 text-blue-700",
  CONTACTE: "bg-yellow-100 text-yellow-700",
  QUALIFIE: "bg-purple-100 text-purple-700",
  PROPOSITION: "bg-orange-100 text-orange-700",
  NEGOCE: "bg-pink-100 text-pink-700",
  GAGNE: "bg-green-100 text-green-700",
  PERDU: "bg-red-100 text-red-700",
  EN_ATTENTE: "bg-yellow-100 text-yellow-700",
  CONFIRMEE: "bg-blue-100 text-blue-700",
  EFFECTUEE: "bg-green-100 text-green-700",
  ANNULEE: "bg-red-100 text-red-700",
  EN_COURS: "bg-orange-100 text-orange-700",
  ACCEPTEE: "bg-green-100 text-green-700",
  REFUSEE: "bg-red-100 text-red-700",
  EXPIREE: "bg-gray-100 text-gray-700",
  LEVEE: "bg-gray-200 text-gray-800",
};

function badgeClass(status: string) {
  return statusColor[status] || "bg-gray-100 text-gray-700";
}

export default async function AdminCrmPage() {
  const [
    leads,
    demandes,
    visites,
    options,
    partenairesAContacter,
    partenairesAContacterCount,
    optionsEnCours,
    leadsNouveaux,
    visitesEnAttente,
    demandesNouvelles,
  ] = await Promise.all([
    prisma.lead.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.demandeRecherche.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.demandeVisite.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: true, bien: true },
    }),
    prisma.optionLot.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        lot: {
          include: { programme: true },
        },
        user: true,
      },
    }),
    prisma.user.findMany({
      where: { role: "PARTENAIRE", contacte: false },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: { role: "PARTENAIRE", contacte: false } }),
    prisma.optionLot.count({ where: { statut: "EN_COURS" } }),
    prisma.lead.count({ where: { statut: "NOUVEAU" } }),
    prisma.demandeVisite.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.demandeRecherche.count({ where: { statut: "NOUVELLE" } }),
  ]);

  const kpis = [
    { label: "Leads nouveaux", value: leadsNouveaux, href: "/admin/leads", tone: "bg-blue-500" },
    { label: "Demandes a traiter", value: demandesNouvelles, href: "/admin/demandes", tone: "bg-purple-500" },
    { label: "Visites en attente", value: visitesEnAttente, href: "/admin/visites", tone: "bg-orange-500" },
    { label: "Options en cours", value: optionsEnCours, href: "/admin/crm", tone: "bg-emerald-500" },
    { label: "Partenaires a rappeler", value: partenairesAContacterCount, href: "/admin/partenaires", tone: "bg-amber-500" },
    { label: "Mise a jour site", value: "Live", href: "/admin/site", tone: "bg-primary" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centre CRM</h1>
          <p className="text-gray-500 mt-1">
            Pilotez vos leads, demandes, visites, options et relances partenaires depuis un seul espace.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/leads"
            className="px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-sm"
          >
            Ouvrir le pipeline leads
          </Link>
          <Link
            href="/admin/site"
            className="px-4 py-2.5 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors text-sm"
          >
            Mettre a jour le site
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all"
          >
            <div className={`w-2 h-2 rounded-full ${kpi.tone} mb-3`} />
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Leads recents</h2>
              <p className="text-xs text-gray-500 mt-1">Qualification commerciale et suivi du pipeline</p>
            </div>
            <Link href="/admin/leads" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <div key={lead.id} className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {lead.prenom} {lead.nom}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lead.email} · {lead.source.replace("_", " ")} · {formatDate(lead.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(lead.statut)}`}>
                      {lead.statut}
                    </span>
                    <LeadActions leadId={lead.id} currentStatut={lead.statut} />
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-gray-400 text-center">Aucun lead recent</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Options partenaires</h2>
              <p className="text-xs text-gray-500 mt-1">Suivez les options posees et pilotez le statut des lots</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {options.length > 0 ? (
              options.map((option) => (
                <div key={option.id} className="p-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {option.lot.programme.nom} · Lot {option.lot.numero}
                      </p>
                      <p className="text-xs text-gray-500">
                        {option.user.prenom} {option.user.nom}
                        {option.user.entreprise ? ` · ${option.user.entreprise}` : ""}
                        {" · "}
                        {formatDate(option.createdAt)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(option.statut)}`}>
                      {option.statut}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-gray-600">
                      {option.message || "Aucun commentaire partenaire sur cette option."}
                    </p>
                    <OptionStatusActions optionId={option.id} currentStatut={option.statut} />
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-gray-400 text-center">Aucune option enregistree</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Demandes de recherche</h2>
            <Link href="/admin/demandes" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {demandes.length > 0 ? (
              demandes.map((demande) => (
                <div key={demande.id} className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {demande.user.prenom} {demande.user.nom}
                    </p>
                    <p className="text-xs text-gray-500">
                      {demande.type} · {demande.transaction} · {demande.ville || "Ville non precisee"} · {formatDate(demande.createdAt)}
                    </p>
                  </div>
                  <DemandeActions demandeId={demande.id} currentStatut={demande.statut} />
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-gray-400 text-center">Aucune demande recente</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Demandes de visite</h2>
            <Link href="/admin/visites" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {visites.length > 0 ? (
              visites.map((visite) => (
                <div key={visite.id} className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {visite.user.prenom} {visite.user.nom}
                    </p>
                    <p className="text-xs text-gray-500">
                      {visite.bien.titre} · {visite.creneau} · {formatDate(visite.createdAt)}
                    </p>
                  </div>
                  <VisiteActions visiteId={visite.id} currentStatut={visite.statut} />
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-gray-400 text-center">Aucune visite recente</p>
            )}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Partenaires a recontacter</h2>
            <p className="text-xs text-gray-500 mt-1">Suivi B2B a ne pas laisser retomber</p>
          </div>
          <Link href="/admin/partenaires" className="text-sm text-primary hover:underline">
            Ouvrir les partenaires
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {partenairesAContacter.length > 0 ? (
            partenairesAContacter.map((partenaire) => (
              <div key={partenaire.id} className="p-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {partenaire.prenom} {partenaire.nom}
                  </p>
                  <p className="text-xs text-gray-500">
                    {partenaire.entreprise || "Structure non renseignee"} · {partenaire.email}
                    {partenaire.telephone ? ` · ${partenaire.telephone}` : ""}
                  </p>
                </div>
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                  A appeler
                </span>
              </div>
            ))
          ) : (
            <p className="p-6 text-sm text-gray-400 text-center">Aucun partenaire en attente de relance</p>
          )}
        </div>
      </section>
    </div>
  );
}
