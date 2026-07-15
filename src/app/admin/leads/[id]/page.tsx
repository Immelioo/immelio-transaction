import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import LeadDetailClient from "./LeadDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const statutColors: Record<string, string> = {
  NOUVEAU: "bg-blue-100 text-blue-700",
  CONTACTE: "bg-yellow-100 text-yellow-700",
  QUALIFIE: "bg-purple-100 text-purple-700",
  PROPOSITION: "bg-orange-100 text-orange-700",
  NEGOCE: "bg-pink-100 text-pink-700",
  GAGNE: "bg-green-100 text-green-700",
  PERDU: "bg-red-100 text-red-700",
};

const typeActiviteLabel: Record<string, string> = {
  APPEL: "Appel",
  EMAIL: "Email",
  VISITE: "Visite",
  NOTE: "Note",
  RELANCE: "Relance",
  OFFRE: "Offre",
  AUTRE: "Autre",
};

const typeActiviteIcon: Record<string, string> = {
  APPEL: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  EMAIL: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  VISITE: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  NOTE: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  RELANCE: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  OFFRE: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  AUTRE: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { activites: { orderBy: { createdAt: "desc" } } },
  });

  if (!lead) notFound();

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/leads" className="text-gray-400 hover:text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.prenom} {lead.nom}</h1>
          <p className="text-sm text-gray-500">{lead.email}{lead.telephone ? ` · ${lead.telephone}` : ""} · Créé le {formatDate(lead.createdAt)}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${statutColors[lead.statut] || "bg-gray-100 text-gray-700"}`}>
          {lead.statut}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale — activités */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline activités */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Historique & activités</h2>
              <span className="text-sm text-gray-400">{lead.activites.length} entrée{lead.activites.length > 1 ? "s" : ""}</span>
            </div>

            {/* Formulaire ajout activité — client */}
            <div className="p-5 border-b border-gray-50">
              <LeadDetailClient leadId={id} currentNotes={lead.notes || ""} currentStatut={lead.statut} currentAssigneA={lead.assigneA || ""} />
            </div>

            {/* Timeline */}
            <div className="divide-y divide-gray-50">
              {lead.activites.length > 0 ? lead.activites.map((act) => (
                <div key={act.id} className={`p-4 flex gap-4 ${act.effectuee ? "opacity-60" : ""}`}>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeActiviteIcon[act.type] || typeActiviteIcon.AUTRE} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{typeActiviteLabel[act.type] || act.type}</span>
                      <span className="text-xs text-gray-400">{formatDate(act.createdAt)}</span>
                      {act.dateEcheance && (
                        <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                          Échéance {new Date(act.dateEcheance).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      {act.effectuee && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Effectuée</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{act.description}</p>
                  </div>
                </div>
              )) : (
                <p className="p-6 text-sm text-gray-400 text-center">Aucune activité enregistrée. Ajoutez la première ci-dessus.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — infos lead */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 uppercase font-medium tracking-wide">Source</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{lead.source.replace(/_/g, " ")}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase font-medium tracking-wide">Email</dt>
                <dd className="text-sm mt-0.5">
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
                </dd>
              </div>
              {lead.telephone && (
                <div>
                  <dt className="text-xs text-gray-500 uppercase font-medium tracking-wide">Téléphone</dt>
                  <dd className="text-sm mt-0.5">
                    <a href={`tel:${lead.telephone}`} className="text-primary hover:underline">{lead.telephone}</a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500 uppercase font-medium tracking-wide">Activités</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{lead.activites.length}</dd>
              </div>
              {lead.assigneA && (
                <div>
                  <dt className="text-xs text-gray-500 uppercase font-medium tracking-wide">Assigné à</dt>
                  <dd className="text-sm text-gray-900 mt-0.5">{lead.assigneA}</dd>
                </div>
              )}
            </dl>
          </div>

          {lead.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Notes
              </h3>
              <p className="text-sm text-amber-800 whitespace-pre-line">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
