import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { formatPrix } from "@/lib/utils";
import ProSidebar from "@/components/pro/ProSidebar";

export const dynamic = "force-dynamic";

const optionStatutColor: Record<string, string> = {
  EN_COURS: "bg-orange-100 text-orange-700",
  ACCEPTEE: "bg-green-100 text-green-700",
  REFUSEE: "bg-red-100 text-red-700",
  EXPIREE: "bg-gray-100 text-gray-600",
};
const optionStatutLabel: Record<string, string> = {
  EN_COURS: "En cours",
  ACCEPTEE: "Acceptée",
  REFUSEE: "Refusée",
  EXPIREE: "Expirée",
};

async function getProUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, prenom: true, nom: true, entreprise: true, role: true },
  });
}

export default async function ProDashboardPage() {
  const user = await getProUser();

  const [biensDisponibles, programmesActifs, options, documentsEnvoyes, documentsPartenaire] =
    await Promise.all([
      prisma.bien.count({ where: { statut: { not: "VENDU" } } }),
      prisma.programme.count({ where: { statut: "EN_COMMERCIALISATION" } }),
      user
        ? prisma.optionLot.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 6,
            include: {
              lot: { include: { programme: { select: { nom: true } } } },
            },
          })
        : Promise.resolve([]),
      user
        ? prisma.documentPartenaire.count({ where: { userId: user.id } })
        : Promise.resolve(0),
      user
        ? prisma.documentPartenaire.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 3,
          })
        : Promise.resolve([]),
    ]);

  const optionsEnCours = options.filter((o) => o.statut === "EN_COURS").length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProSidebar />
      <main className="flex-1 min-w-0 p-6 md:p-8 pt-20 md:pt-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bonjour{user?.prenom ? `, ${user.prenom}` : ""}
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.entreprise
              ? `${user.entreprise} — Espace Partenaire Immelio Transaction`
              : "Bienvenue sur votre espace partenaire Immelio Transaction"}
          </p>
        </div>

        {/* Options en cours */}
        {options.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mes options
              </h2>
              <Link href="/pro/historique" className="text-sm text-primary hover:underline">Voir tout</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {options.map((opt) => (
                <div key={opt.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Lot n°{opt.lot.numero}</p>
                      <p className="font-semibold text-gray-900 mt-0.5 text-sm">{opt.lot.programme.nom}</p>
                      <p className="text-sm font-bold text-primary mt-1">{formatPrix(opt.lot.prix)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${optionStatutColor[opt.statut] || "bg-gray-100 text-gray-600"}`}>
                      {optionStatutLabel[opt.statut] || opt.statut}
                    </span>
                  </div>
                  {opt.dateExpiration && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Expire le {new Date(opt.dateExpiration).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* KPIs */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vue d&apos;ensemble</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Biens disponibles", value: biensDisponibles, color: "bg-primary/10", iconColor: "text-primary", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", href: "/pro/biens" },
              { label: "Programmes actifs", value: programmesActifs, color: "bg-accent/10", iconColor: "text-accent", icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z", href: "/pro/programmes" },
              { label: "Options en cours", value: optionsEnCours, color: "bg-green-100", iconColor: "text-green-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", href: "/pro/historique" },
              { label: "Documents envoyés", value: documentsEnvoyes, color: "bg-purple-100", iconColor: "text-purple-600", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", href: "/pro/historique" },
            ].map((s) => (
              <Link key={s.label} href={s.href} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all">
                <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
                  <svg className={`w-5 h-5 ${s.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Documents récents */}
        {documentsPartenaire.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Documents récents</h2>
              <Link href="/pro/historique" className="text-sm text-primary hover:underline">Voir tout</Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              {documentsPartenaire.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center gap-4">
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.nom}</p>
                    <p className="text-xs text-gray-500">{doc.type}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    doc.statut === "TRAITE" ? "bg-green-100 text-green-700" :
                    doc.statut === "REFUSE" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {doc.statut === "TRAITE" ? "Traité" : doc.statut === "REFUSE" ? "Refusé" : "Envoyé"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Accès rapide */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Accès rapide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/pro/biens", title: "Biens Anciens", desc: "Consultez le catalogue des biens disponibles", color: "bg-primary/10 group-hover:bg-primary/20", iconColor: "text-primary", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
              { href: "/pro/programmes", title: "Programmes Neufs", desc: "Lots disponibles et pose d'options", color: "bg-accent/10 group-hover:bg-accent/20", iconColor: "text-accent", icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" },
              { href: "/pro/envoyer-document", title: "Envoyer Document", desc: "Transmettez vos mandats et compromis", color: "bg-green-100 group-hover:bg-green-200", iconColor: "text-green-600", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
              { href: "/pro/historique", title: "Mon Historique", desc: "Options, demandes et documents envoyés", color: "bg-purple-100 group-hover:bg-purple-200", iconColor: "text-purple-600", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((card) => (
              <Link key={card.href} href={card.href} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all group">
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3 transition-colors`}>
                  <svg className={`w-5 h-5 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{card.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
