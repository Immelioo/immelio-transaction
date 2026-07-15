import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";
import ReinviteButton from "@/components/admin/ReinviteButton";

export const dynamic = "force-dynamic";

export default async function AdminPartenairesPage() {
  const demandesPartenariat = await prisma.lead.findMany({
    where: { notes: { startsWith: "Demande de partenariat" }, statut: "NOUVEAU" },
    orderBy: { createdAt: "desc" },
  });

  const partenaires = await prisma.user.findMany({
    where: { role: "PARTENAIRE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, email: true, nom: true, prenom: true,
      entreprise: true, codeAcces: true, createdAt: true,
      inviteToken: true, inviteTokenExpiry: true,
      password: true,
      _count: { select: { documents: true, demandesRecherche: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partenaires</h1>
          <p className="text-gray-500">{partenaires.length} partenaire{partenaires.length > 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/partenaires/nouveau"
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-sm"
        >
          + Nouveau partenaire
        </Link>
      </div>

      {/* Demandes de partenariat entrantes */}
      {demandesPartenariat.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 mb-8">
          <div className="p-5 border-b border-amber-100 flex items-center gap-3 bg-amber-50 rounded-t-xl">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Demandes de partenariat</h2>
              <p className="text-xs text-amber-700">{demandesPartenariat.length} demande{demandesPartenariat.length > 1 ? "s" : ""} en attente depuis /devenir-partenaire</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {demandesPartenariat.map((lead) => {
              const params = new URLSearchParams({
                prenom: lead.prenom || "",
                nom: lead.nom || "",
                email: lead.email,
                ...(lead.telephone && { telephone: lead.telephone }),
                ...(lead.notes && { entreprise: lead.notes.replace(/^Demande de partenariat — /, "").split("\n")[0] }),
              });
              return (
                <div key={lead.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{lead.prenom} {lead.nom}</p>
                    <p className="text-xs text-gray-500">{lead.email}{lead.telephone ? ` · ${lead.telephone}` : ""}</p>
                    {lead.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{lead.notes}</p>
                    )}
                  </div>
                  <Link
                    href={`/admin/partenaires/nouveau?${params.toString()}`}
                    className="shrink-0 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                  >
                    Créer le compte
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Partenaire</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Entreprise</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Code d&apos;accès</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Docs</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Inscrit le</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {partenaires.length > 0 ? partenaires.map((p) => {
              const isActivated = p.password && p.password.length > 0;
              const hasExpiredToken = p.inviteToken && p.inviteTokenExpiry && new Date(p.inviteTokenExpiry) < new Date();
              const hasPendingToken = p.inviteToken && !hasExpiredToken;

              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{p.prenom} {p.nom}</p>
                    <p className="text-xs text-gray-500">{p.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.entreprise || "—"}</td>
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{p.codeAcces || "—"}</code>
                  </td>
                  <td className="px-4 py-3">
                    {isActivated ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Activé
                      </span>
                    ) : hasPendingToken ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Invitation envoyée
                        </span>
                        <ReinviteButton partnerId={p.id} partnerEmail={p.email} />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Token expiré
                        </span>
                        <ReinviteButton partnerId={p.id} partnerEmail={p.email} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p._count.documents}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/partenaires/${p.id}/modifier`} className="text-primary hover:underline text-sm font-medium">
                        Modifier
                      </Link>
                      <DeleteButton id={p.id} type="partenaires" iconOnly />
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Aucun partenaire enregistré
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
