import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";
import ReinviteButton from "@/components/admin/ReinviteButton";

export default async function AdminPartenairesPage() {
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
