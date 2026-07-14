import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import DocumentStatutActions from "./DocumentStatutActions";

const TYPE_LABELS: Record<string, string> = {
  MANDAT: "Mandat",
  COMPROMIS: "Compromis",
  OFFRE: "Offre",
  RESERVATION: "Reservation",
  FINANCEMENT: "Financement",
  AUTRE: "Autre",
};

const STATUT_BADGE: Record<string, string> = {
  ENVOYE: "bg-blue-100 text-blue-700",
  VU: "bg-yellow-100 text-yellow-700",
  VALIDE: "bg-green-100 text-green-700",
  REFUSE: "bg-red-100 text-red-700",
};

const STATUT_LABELS: Record<string, string> = {
  ENVOYE: "Envoye",
  VU: "Vu",
  VALIDE: "Valide",
  REFUSE: "Refuse",
};

export default async function AdminDocumentsProPage() {
  const documents = await prisma.documentPartenaire.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents Partenaires</h1>
          <p className="text-gray-500">
            {documents.length} document{documents.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Partenaire</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Document</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date d&apos;envoi</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">
                      {doc.user.prenom} {doc.user.nom}
                    </p>
                    <p className="text-xs text-gray-500">{doc.user.entreprise || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{doc.nom}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {TYPE_LABELS[doc.type] || doc.type}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(doc.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUT_BADGE[doc.statut] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUT_LABELS[doc.statut] || doc.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DocumentStatutActions documentId={doc.id} currentStatut={doc.statut} />
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                      >
                        Telecharger
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  Aucun document partenaire
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
