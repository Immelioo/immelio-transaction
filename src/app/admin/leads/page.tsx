import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import LeadActions from "@/components/admin/LeadActions";
import NouveauLeadButton from "./NouveauLeadButton";

const PAGE_SIZE = 50;

const statutColors: Record<string, string> = {
  NOUVEAU: "bg-blue-100 text-blue-700",
  CONTACTE: "bg-yellow-100 text-yellow-700",
  QUALIFIE: "bg-purple-100 text-purple-700",
  PROPOSITION: "bg-orange-100 text-orange-700",
  NEGOCE: "bg-pink-100 text-pink-700",
  GAGNE: "bg-green-100 text-green-700",
  PERDU: "bg-red-100 text-red-700",
};

const sourceLabels: Record<string, string> = {
  SITE_WEB: "Site web",
  PARTENAIRE: "Partenaire",
  RECOMMANDATION: "Recommandation",
  APPEL_ENTRANT: "Appel entrant",
  RESEAU_SOCIAL: "Réseau social",
  AUTRE: "Autre",
};

interface PageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page ?? "1") || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const [leads, totalLeads] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { activites: true } } },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.lead.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalLeads / PAGE_SIZE));

  const pipeline = ["NOUVEAU", "CONTACTE", "QUALIFIE", "PROPOSITION", "NEGOCE", "GAGNE", "PERDU"];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Leads</h1>
          <p className="text-gray-500">{totalLeads} lead{totalLeads > 1 ? "s" : ""} au total</p>
        </div>
        <NouveauLeadButton />
      </div>

      {/* Pipeline KPI strip — défilement horizontal sur mobile avec dégradé indiquant le contenu masqué */}
      <div className="relative mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {pipeline.map((statut) => {
            const count = leads.filter((l) => l.statut === statut).length;
            return (
              <div key={statut} className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap flex flex-col items-center gap-0.5 min-w-[90px] ${statutColors[statut]}`}>
                <span className="text-xl font-bold">{count}</span>
                <span className="text-xs font-medium opacity-80">{statut.replace(/_/g, " ")}</span>
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent sm:hidden" />
      </div>

      {/* Tableau leads */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Activités</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.length > 0 ? leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="block group-hover:text-primary transition-colors">
                      <p className="font-semibold text-gray-900 text-sm group-hover:text-primary">{lead.prenom} {lead.nom}</p>
                      <p className="text-xs text-gray-500">{lead.email}</p>
                      {lead.notes && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{lead.notes}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sourceLabels[lead.source] || lead.source.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statutColors[lead.statut] || "bg-gray-100 text-gray-700"}`}>
                      {lead.statut.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                    <Link href={`/admin/leads/${lead.id}`} className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {lead._count.activites}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        Détail
                      </Link>
                      <LeadActions leadId={lead.id} currentStatut={lead.statut} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <p className="text-gray-400 mb-3">Aucun lead enregistré.</p>
                    <p className="text-xs text-gray-300">Les leads sont créés manuellement ou via les formulaires du site.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <p>
            Page {currentPage} sur {totalPages} — {totalLeads} leads
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={currentPage > 1 ? `/admin/leads?page=${currentPage - 1}` : "/admin/leads?page=1"}
              aria-disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg border ${currentPage === 1 ? "pointer-events-none border-gray-200 text-gray-300" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              Précédent
            </Link>
            <Link
              href={currentPage < totalPages ? `/admin/leads?page=${currentPage + 1}` : `/admin/leads?page=${totalPages}`}
              aria-disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg border ${currentPage === totalPages ? "pointer-events-none border-gray-200 text-gray-300" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              Suivant
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
