import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PartenaireContactButton from "./PartenaireContactButton";

export default async function AdminDashboardPage() {
  const [totalBiens, totalDisponibles, totalDemandes, totalVisites, totalPartenaires, totalLeads, visitesPending, demandesNouvelles, optionsEnCours] = await Promise.all([
    prisma.bien.count(),
    prisma.bien.count({ where: { statut: { not: "VENDU" } } }),
    prisma.demandeRecherche.count(),
    prisma.demandeVisite.count(),
    prisma.user.count({ where: { role: "PARTENAIRE" } }),
    prisma.lead.count(),
    prisma.demandeVisite.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.demandeRecherche.count({ where: { statut: "NOUVELLE" } }),
    prisma.optionLot.count({ where: { statut: "EN_COURS" } }),
  ]);

  // A3 — Partenaires pas encore contactés
  const partenairesAContacter = await prisma.user.findMany({
    where: { role: "PARTENAIRE", contacte: false },
    orderBy: { createdAt: "desc" },
  });

  const recentVisites = await prisma.demandeVisite.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { bien: true, user: true },
  });

  const recentDemandes = await prisma.demandeRecherche.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const stats = [
    { label: "Biens totaux", value: totalBiens, color: "bg-blue-500", href: "/admin/biens" },
    { label: "Disponibles", value: totalDisponibles, color: "bg-green-500", href: "/admin/biens" },
    { label: "Demandes", value: totalDemandes, color: "bg-purple-500", href: "/admin/demandes", badge: demandesNouvelles },
    { label: "Visites", value: totalVisites, color: "bg-orange-500", href: "/admin/visites", badge: visitesPending },
    { label: "Partenaires", value: totalPartenaires, color: "bg-teal-500", href: "/admin/partenaires" },
    { label: "Leads CRM", value: totalLeads, color: "bg-pink-500", href: "/admin/leads" },
    { label: "Options", value: optionsEnCours, color: "bg-emerald-500", href: "/admin/crm" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard CRM</h1>
          <p className="text-gray-500">Bienvenue sur le tableau de bord Immelio Transaction</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/biens" className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-sm">
            + Ajouter un bien
          </Link>
          <Link href="/admin/crm" className="px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors text-sm">
            Ouvrir le centre CRM
          </Link>
          <Link href="/admin/site" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
            Mettre a jour le site
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all relative">
            <div className={`w-2 h-2 rounded-full ${stat.color} mb-3`} />
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            {stat.badge ? (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {stat.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {/* A3 — Partenaires à contacter */}
      {partenairesAContacter.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 mb-8">
          <div className="p-5 border-b border-amber-100 flex items-center gap-3 bg-amber-50 rounded-t-xl">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Partenaires à appeler</h2>
              <p className="text-xs text-amber-700">{partenairesAContacter.length} nouveau{partenairesAContacter.length > 1 ? "x" : ""} partenaire{partenairesAContacter.length > 1 ? "s" : ""} à contacter</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {partenairesAContacter.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{p.prenom[0]}{p.nom[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.prenom} {p.nom}</p>
                    <p className="text-xs text-gray-500">{p.entreprise || "—"} &middot; {p.email}</p>
                    {p.telephone && (
                      <a href={`tel:${p.telephone}`} className="text-xs text-primary font-medium hover:underline">{p.telephone}</a>
                    )}
                  </div>
                </div>
                <PartenaireContactButton id={p.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières visites */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Dernières demandes de visite</h2>
            <Link href="/admin/visites" className="text-sm text-primary hover:underline">Voir tout</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentVisites.length > 0 ? recentVisites.map((v) => (
              <div key={v.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{v.user.prenom} {v.user.nom}</p>
                  <p className="text-xs text-gray-500">{v.bien.titre}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  v.statut === "EN_ATTENTE" ? "bg-yellow-100 text-yellow-700" :
                  v.statut === "CONFIRMEE" ? "bg-green-100 text-green-700" :
                  v.statut === "ANNULEE" ? "bg-red-100 text-red-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {v.statut.replace("_", " ")}
                </span>
              </div>
            )) : (
              <p className="p-6 text-sm text-gray-400 text-center">Aucune demande de visite</p>
            )}
          </div>
        </div>

        {/* Dernières demandes de recherche */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Dernières demandes de recherche</h2>
            <Link href="/admin/demandes" className="text-sm text-primary hover:underline">Voir tout</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentDemandes.length > 0 ? recentDemandes.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{d.user.prenom} {d.user.nom}</p>
                  <p className="text-xs text-gray-500">{d.type} - {d.transaction} - {d.ville || "Non précisé"}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  d.statut === "NOUVELLE" ? "bg-blue-100 text-blue-700" :
                  d.statut === "EN_COURS" ? "bg-yellow-100 text-yellow-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {d.statut.replace("_", " ")}
                </span>
              </div>
            )) : (
              <p className="p-6 text-sm text-gray-400 text-center">Aucune demande de recherche</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
