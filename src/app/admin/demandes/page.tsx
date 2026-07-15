import { prisma } from "@/lib/prisma";
import { formatDate, formatPrix } from "@/lib/utils";
import DemandeActions from "@/components/admin/DemandeActions";
import PartnershipRequestActions from "@/components/admin/PartnershipRequestActions";
import { unstable_noStore as noStore } from "next/cache";

function getDemandeStatutClass(statut: string) {
  if (statut === "NOUVELLE") return "bg-blue-100 text-blue-700";
  if (statut === "EN_COURS") return "bg-yellow-100 text-yellow-700";
  if (statut === "TRAITEE") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
}

function buildPartnerPrefillHref({
  dossierId,
  contactId,
  prenom,
  nom,
  email,
  telephone,
  entreprise,
}: {
  dossierId: string;
  contactId: string;
  prenom: string | null;
  nom: string;
  email: string | null;
  telephone: string | null;
  entreprise: string | null;
}) {
  const params = new URLSearchParams();
  params.set("dossierId", dossierId);
  params.set("contactId", contactId);
  params.set("nom", nom);
  if (prenom) params.set("prenom", prenom);
  if (email) params.set("email", email);
  if (telephone) params.set("telephone", telephone);
  if (entreprise) params.set("entreprise", entreprise);
  return `/admin/partenaires/nouveau?${params.toString()}`;
}

export default async function AdminDemandesPage() {
  noStore();

  const demandesRecherche = await prisma.demandeRecherche.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const demandesPartenariat = await prisma.dossier.findMany({
    where: { type: "PARTENARIAT" },
    orderBy: { createdAt: "desc" },
    include: { contact: true },
  });

  const demandes = [
    ...demandesRecherche.map((demande) => ({
      kind: "RECHERCHE" as const,
      createdAt: demande.createdAt,
      data: demande,
    })),
    ...demandesPartenariat.map((demande) => ({
      kind: "PARTENARIAT" as const,
      createdAt: demande.createdAt,
      data: demande,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demandes</h1>
        <p className="text-gray-500">{demandes.length} demande{demandes.length > 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-4">
        {demandes.length > 0 ? demandes.map((d) => (
          <div key={`${d.kind}-${d.data.id}`} className="bg-white rounded-xl p-6 border border-gray-100">
            {d.kind === "RECHERCHE" ? (
              <>
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{d.data.user.prenom} {d.data.user.nom}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Recherche
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandeStatutClass(d.data.statut)}`}>
                        {d.data.statut.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{d.data.user.email} &middot; {formatDate(d.data.createdAt)}</p>
                  </div>
                  <DemandeActions demandeId={d.data.id} currentStatut={d.data.statut} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-medium text-sm">{d.data.type}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Transaction</p>
                    <p className="font-medium text-sm">{d.data.transaction === "VENTE" ? "Achat" : "Location"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-medium text-sm">
                      {d.data.budgetMin ? formatPrix(d.data.budgetMin) : "—"} - {d.data.budgetMax ? formatPrix(d.data.budgetMax) : "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Ville</p>
                    <p className="font-medium text-sm">{d.data.ville || "Non précisé"}</p>
                  </div>
                </div>

                {d.data.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{d.data.description}</p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {d.data.contact.prenom} {d.data.contact.nom}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        Partenariat
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandeStatutClass(d.data.statut)}`}>
                        {d.data.statut.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {d.data.contact.email || "Email non renseigné"} &middot; {formatDate(d.data.createdAt)}
                    </p>
                  </div>
                  <PartnershipRequestActions
                    dossierId={d.data.id}
                    currentStatut={d.data.statut}
                    href={buildPartnerPrefillHref({
                      dossierId: d.data.id,
                      contactId: d.data.contact.id,
                      prenom: d.data.contact.prenom,
                      nom: d.data.contact.nom,
                      email: d.data.contact.email,
                      telephone: d.data.contact.telephone,
                      entreprise: d.data.contact.entreprise,
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Structure</p>
                    <p className="font-medium text-sm">{d.data.contact.entreprise || "Non précisée"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p className="font-medium text-sm">{d.data.contact.telephone || "Non précisé"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-medium text-sm">{d.data.type}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Titre</p>
                    <p className="font-medium text-sm">{d.data.titre}</p>
                  </div>
                </div>

                {d.data.notes && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-line">{d.data.notes}</p>
                )}
              </>
            )}
          </div>
        )) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-400">Aucune demande</p>
          </div>
        )}
      </div>
    </div>
  );
}
