import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import LeadActions from "@/components/admin/LeadActions";
import PartenaireContactButton from "@/app/admin/dashboard/PartenaireContactButton";

export const dynamic = "force-dynamic";

const statutDossierColors: Record<string, string> = {
  EN_COURS: "bg-blue-100 text-blue-700",
  GAGNE: "bg-green-100 text-green-700",
  PERDU: "bg-red-100 text-red-700",
};

const statutLeadColors: Record<string, string> = {
  NOUVEAU: "bg-blue-100 text-blue-700",
  CONTACTE: "bg-yellow-100 text-yellow-700",
  QUALIFIE: "bg-purple-100 text-purple-700",
  PROPOSITION: "bg-orange-100 text-orange-700",
  NEGOCE: "bg-pink-100 text-pink-700",
  GAGNE: "bg-green-100 text-green-700",
  PERDU: "bg-red-100 text-red-700",
};

export default async function AdminB2BPage() {
  const [
    leadsB2B,
    leadsB2BTotal,
    dossiers,
    partenairesActifs,
    partenairesARappeler,
    kpiProspects,
    kpiActifs,
    kpiARappeler,
    kpiDossiers,
  ] = await Promise.all([
    // Leads B2B (source PARTENARIAT)
    prisma.lead.findMany({
      where: { source: "PARTENARIAT" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { _count: { select: { activites: true } }, activites: { where: { effectuee: false }, orderBy: { dateEcheance: "asc" }, take: 1 } },
    }),
    prisma.lead.count({ where: { source: "PARTENARIAT" } }),
    // Dossiers partenariat
    prisma.dossier.findMany({
      where: { type: "PARTENARIAT" },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { contact: true },
    }),
    // Partenaires actifs (confirmés)
    prisma.user.findMany({
      where: { role: "PARTENAIRE", contacte: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // Partenaires à rappeler
    prisma.user.findMany({
      where: { role: "PARTENAIRE", contacte: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // KPIs
    prisma.lead.count({ where: { source: "PARTENARIAT", statut: "NOUVEAU" } }),
    prisma.user.count({ where: { role: "PARTENAIRE", contacte: true } }),
    prisma.user.count({ where: { role: "PARTENAIRE", contacte: false } }),
    prisma.dossier.count({ where: { type: "PARTENARIAT", statut: "EN_COURS" } }),
  ]);

  const kpis = [
    { label: "Prospects B2B", value: kpiProspects, tone: "bg-blue-500", sub: "leads PARTENARIAT non traités" },
    { label: "Dossiers en cours", value: kpiDossiers, tone: "bg-orange-500", sub: "partenariats actifs" },
    { label: "Partenaires actifs", value: kpiActifs, tone: "bg-green-500", sub: "confirmés et contactés" },
    { label: "À rappeler", value: kpiARappeler, tone: "bg-amber-500", sub: "partenaires non contactés" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Partenaires B2B</h1>
          <p className="text-gray-500 mt-1">
            Prospects, dossiers partenariats et suivi des partenaires actifs.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/partenaires/nouveau"
            className="px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-sm"
          >
            + Nouveau partenaire
          </Link>
          <Link
            href="/admin/partenaires"
            className="px-4 py-2.5 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors text-sm"
          >
            Tous les partenaires
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-2 h-2 rounded-full ${kpi.tone} mb-3`} />
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Leads B2B pipeline */}
        <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Prospects B2B</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {leadsB2BTotal} lead{leadsB2BTotal > 1 ? "s" : ""} source PARTENARIAT — à qualifier et convertir
              </p>
            </div>
            <Link href="/admin/leads" className="text-sm text-primary hover:underline">
              Pipeline complet
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {leadsB2B.length > 0 ? leadsB2B.map((lead) => {
              const prochaine = lead.activites[0];
              return (
                <div key={lead.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/admin/leads/${lead.id}`} className="font-medium text-gray-900 text-sm hover:text-primary transition-colors">
                        {lead.prenom} {lead.nom}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{lead.email}</p>
                      {lead.notes && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {lead.notes.replace("[B2B] ", "")}
                        </p>
                      )}
                      {prochaine && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {prochaine.description} · {formatDate(prochaine.dateEcheance!)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statutLeadColors[lead.statut] || "bg-gray-100 text-gray-600"}`}>
                        {lead.statut}
                      </span>
                      <LeadActions leadId={lead.id} currentStatut={lead.statut} />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="p-8 text-center text-sm text-gray-400">
                Aucun prospect B2B — ils apparaîtront ici quand quelqu&apos;un remplit le formulaire &ldquo;Devenir partenaire&rdquo;.
              </p>
            )}
          </div>
        </section>

        {/* Dossiers partenariat */}
        <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Dossiers partenariat</h2>
              <p className="text-xs text-gray-500 mt-0.5">Suivi structuré des demandes et onboardings</p>
            </div>
            <Link href="/admin/contacts" className="text-sm text-primary hover:underline">
              Voir contacts
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {dossiers.length > 0 ? dossiers.map((dossier) => (
              <div key={dossier.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{dossier.titre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dossier.contact.prenom} {dossier.contact.nom}
                    {dossier.contact.entreprise ? ` · ${dossier.contact.entreprise}` : ""}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(dossier.createdAt)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statutDossierColors[dossier.statut] || "bg-gray-100 text-gray-600"}`}>
                  {dossier.statut.replace("_", " ")}
                </span>
              </div>
            )) : (
              <p className="p-8 text-center text-sm text-gray-400">Aucun dossier partenariat enregistré.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Partenaires actifs */}
        <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Partenaires actifs</h2>
              <p className="text-xs text-gray-500 mt-0.5">Confirmés et déjà contactés — accès portail Pro</p>
            </div>
            <Link href="/admin/partenaires" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {partenairesActifs.length > 0 ? partenairesActifs.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{p.prenom} {p.nom}</p>
                  <p className="text-xs text-gray-500">
                    {p.entreprise || "Structure non renseignée"} · {p.email}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 shrink-0">
                  Actif
                </span>
              </div>
            )) : (
              <p className="p-8 text-center text-sm text-gray-400">Aucun partenaire actif.</p>
            )}
          </div>
        </section>

        {/* À rappeler */}
        <section className="bg-white rounded-xl border border-amber-100 overflow-hidden">
          <div className="p-5 border-b border-amber-100 bg-amber-50/50 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">À rappeler</h2>
              <p className="text-xs text-amber-700 mt-0.5">
                {kpiARappeler} partenaire{kpiARappeler > 1 ? "s" : ""} jamais contacté{kpiARappeler > 1 ? "s" : ""}
              </p>
            </div>
            <Link href="/admin/partenaires" className="text-sm text-primary hover:underline">
              Gérer
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {partenairesARappeler.length > 0 ? partenairesARappeler.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{p.prenom} {p.nom}</p>
                  <p className="text-xs text-gray-500">
                    {p.entreprise || "Indépendant"} · {p.email}
                    {p.telephone ? ` · ${p.telephone}` : ""}
                  </p>
                  <p className="text-xs text-gray-400">Inscrit le {formatDate(p.createdAt)}</p>
                </div>
                <PartenaireContactButton id={p.id} />
              </div>
            )) : (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">Tous les partenaires ont été contactés.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
