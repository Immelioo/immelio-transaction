import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BienCard from "@/components/ui/BienCard";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import SearchBar from "@/components/ui/SearchBar";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import { formatPrix } from "@/lib/utils";
import ContactForm from "@/components/forms/ContactForm";

const services = [
  {
    title: "Recherche Personnalisée",
    description: "Décrivez votre projet, nos experts trouvent le bien idéal pour vous.",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    title: "Visite sur Mesure",
    description: "Programmez une visite en ligne, nous organisons tout pour vous.",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Accompagnement Complet",
    description: "De la recherche à la signature, nous vous guidons à chaque étape.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    title: "Espace Partenaires",
    description: "Accédez à vos documents, mandats et outils en toute simplicité.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

export default async function Home() {
  const siteSettings = await getSiteSettings();
  const biensVedette = await prisma.bien.findMany({
    where: { enVedette: true, disponible: true },
    include: { photos: { take: 1, orderBy: { ordre: "asc" } } },
    take: 6,
  });

  const programmesVedette = await prisma.programme.findMany({
    where: { statut: { not: "LIVRE" } },
    include: {
      photos: { take: 1, orderBy: { ordre: "asc" } },
      lots: { where: { statut: "DISPONIBLE" }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const temoignages = await prisma.temoignage.findMany({
    where: { visible: true },
    orderBy: { ordre: "asc" },
  });

  return (
    <>
      <Header />

      {/* ============================================ */}
      {/* HERO — avec barre de recherche               */}
      {/* ============================================ */}
      <section className="relative overflow-hidden min-h-[650px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-lyon.jpg"
            alt="Vue de la Basilique Notre-Dame de Fourvière et du Vieux Lyon au coucher du soleil"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/70" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-[fadeInUp_0.8s_ease-out]">
              {siteSettings.hero_title_line_1}
              <span className="text-accent"> {siteSettings.hero_title_highlight}</span>
              <br />
              {siteSettings.hero_title_line_2}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 animate-[fadeInUp_1s_ease-out]">
              {siteSettings.hero_subtitle}
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="animate-[fadeInUp_1.2s_ease-out]">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* STATS — compteurs animés                     */}
      {/* ============================================ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary"><AnimatedCounter end={Number(siteSettings.homepage_stats_biens) || 150} suffix="+" /></p>
              <p className="text-gray-500 mt-1">Biens disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary"><AnimatedCounter end={Number(siteSettings.homepage_stats_partenaires) || 50} suffix="+" /></p>
              <p className="text-gray-500 mt-1">Partenaires</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary"><AnimatedCounter end={Number(siteSettings.homepage_stats_villes) || 30} suffix="+" /></p>
              <p className="text-gray-500 mt-1">Villes couvertes</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary"><AnimatedCounter end={Number(siteSettings.homepage_stats_clients) || 500} suffix="+" /></p>
              <p className="text-gray-500 mt-1">Clients satisfaits</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* COMMENT ÇA MARCHE — 3 étapes                 */}
      {/* ============================================ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
              <p className="text-gray-600 max-w-xl mx-auto text-lg">
                En 3 étapes simples, trouvez le bien de vos rêves.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimateOnScroll delay={0}>
              <div className="relative text-center p-8">
                <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-3xl font-black text-accent">1</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Décrivez votre projet</h3>
                <p className="text-gray-600 leading-relaxed">
                  Remplissez notre formulaire en ligne ou appelez-nous. Décrivez le bien recherché, votre budget et vos critères.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <div className="relative text-center p-8">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-3xl font-black text-primary">2</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Visitez les biens</h3>
                <p className="text-gray-600 leading-relaxed">
                  Notre équipe sélectionne les meilleures opportunités et organise des visites sur mesure selon vos disponibilités.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={400}>
              <div className="relative text-center p-8">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-3xl font-black text-green-600">3</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Signez en toute sérénité</h3>
                <p className="text-gray-600 leading-relaxed">
                  Nous vous accompagnons jusqu&apos;à la signature. Financement, notaire, administratif — on gère tout.
                </p>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll delay={500}>
            <div className="text-center mt-10">
              <Link href="/demande-recherche"
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-xl font-semibold text-lg hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl">
                Démarrer ma recherche
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ============================================ */}
      {/* BIENS EN VEDETTE                              */}
      {/* ============================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Biens en Vedette</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Découvrez notre sélection de biens d&apos;exception, choisis pour leur qualité et leur emplacement.
            </p>
          </div>
        </AnimateOnScroll>

        {biensVedette.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {biensVedette.map((bien, i) => (
              <AnimateOnScroll key={bien.id} delay={i * 100}>
                <BienCard
                  id={bien.id}
                  titre={bien.titre}
                  type={bien.type}
                  transaction={bien.transaction}
                  prix={bien.prix}
                  surface={bien.surface}
                  nbPieces={bien.nbPieces}
                  ville={bien.ville}
                  codePostal={bien.codePostal}
                  photo={bien.photos[0]?.url}
                  dpe={bien.dpe || undefined}
                  enVedette={bien.enVedette}
                />
              </AnimateOnScroll>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <p className="text-gray-500 text-lg">Les biens en vedette arrivent bientôt !</p>
            <Link href="/biens" className="inline-block mt-4 text-primary font-medium hover:underline">
              Voir tous nos biens
            </Link>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/biens"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            Voir tous nos biens
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ============================================ */}
      {/* PROGRAMMES NEUFS                              */}
      {/* ============================================ */}
      {programmesVedette.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Programmes Neufs</h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                  Investissez dans le neuf. Découvrez nos programmes aux dernières normes énergétiques.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programmesVedette.map((prog, i) => (
                <AnimateOnScroll key={prog.id} delay={i * 150}>
                  <Link href={`/programmes/${prog.id}`} className="group block">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 group-hover:-translate-y-1">
                      <div className="relative h-52 bg-gray-200 overflow-hidden">
                        {prog.photos[0] ? (
                          <Image src={prog.photos[0].url} alt={prog.nom} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Programme neuf
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{prog.nom}</h3>
                        <p className="text-sm text-gray-500 mb-2">{prog.ville} ({prog.codePostal})</p>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                          <div>
                            {prog.prixMin && (
                              <p className="text-lg font-bold text-primary">
                                À partir de {formatPrix(prog.prixMin)}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-accent">
                            {prog.lots.length} lot{prog.lots.length > 1 ? "s" : ""} dispo
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/programmes"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                Voir tous les programmes
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* TÉMOIGNAGES                                   */}
      {/* ============================================ */}
      {temoignages.length > 0 && (
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ce que disent nos clients</h2>
              <p className="text-gray-600 max-w-xl mx-auto text-lg">
                La satisfaction de nos clients est notre meilleure récompense.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {temoignages.map((t, i) => (
              <AnimateOnScroll key={t.id} delay={i * 150}>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative">
                  {/* Guillemet décoratif */}
                  <div className="absolute -top-4 left-8">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                      </svg>
                    </div>
                  </div>
                  {/* Étoiles */}
                  <div className="flex gap-1 mb-4 mt-2">
                    {Array.from({ length: t.note }).map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 italic">&ldquo;{t.texte}&rdquo;</p>
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{t.nom[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.nom}</p>
                      <p className="text-xs text-gray-500">{t.ville}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ============================================ */}
      {/* QUI SOMMES-NOUS                               */}
      {/* ============================================ */}
      <section id="qui-sommes-nous" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Qui sommes-nous ?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Une expertise immobilière complète, un réseau national de partenaires, et une offre clés en main unique.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Expertise & Réseau */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <AnimateOnScroll delay={0}>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Notre Expertise</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Forts d&apos;une connaissance approfondie du marché immobilier, nous accompagnons nos clients dans chaque étape de leur projet.
                </p>
                <ul className="space-y-2">
                  {["Analyse de marché et estimation précise", "Conseil en investissement personnalisé", "Accompagnement juridique et administratif"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Notre Réseau</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Présents sur l&apos;ensemble du territoire national avec un réseau de partenaires solides.
                </p>
                <ul className="space-y-2">
                  {["Couverture nationale dans plus de 30 villes", "Plus de 50 partenaires professionnels", "Accès exclusif aux biens avant mise en marché"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Offre Clés en Main */}
          <AnimateOnScroll>
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Notre Offre Clés en Main</h3>
              <p className="text-gray-600 max-w-xl mx-auto">
                Un écosystème complet pour répondre à tous vos besoins immobiliers.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Immelio Transaction */}
            <AnimateOnScroll delay={0}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-primary/20 relative h-full">
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">Pilier principal</span>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">I</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary">Immelio Transaction</h4>
                      <p className="text-sm text-gray-500">Transaction immobilière</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-5">
                    Votre agence de référence. Achat, vente et investissement avec un service sur mesure.
                  </p>
                  <ul className="space-y-2 text-sm">
                    {["Achat & Vente", "Programmes neufs & Investissement", "Recherche personnalisée", "Réseau national de partenaires"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Immelio Gestion */}
            <AnimateOnScroll delay={200}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">IG</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-accent">Immelio Gestion</h4>
                      <p className="text-sm text-gray-500">Gestion immobilière</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-5">
                    La tranquillité d&apos;esprit pour les propriétaires. Gestion complète de vos biens.
                  </p>
                  <ul className="space-y-2 text-sm">
                    {["Gestion locative complète", "Recherche & sélection de locataires", "Suivi des loyers & charges", "États des lieux & contentieux"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Sfarbat */}
            <AnimateOnScroll delay={400}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-orange-600">Sfarbat</h4>
                      <p className="text-sm text-gray-500">Rénovation & Urgences</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-5">
                    Rénovation et prestations d&apos;urgence pour valoriser ou dépanner votre bien.
                  </p>
                  <ul className="space-y-2 text-sm">
                    {["Rénovation complète & partielle", "Prestations d'urgence 7j/7", "Plomberie, électricité, serrurerie", "Home staging & valorisation"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Contact */}
          <div id="contact" className="mt-16">
            <AnimateOnScroll>
              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Contactez-nous</h3>
                <p className="text-gray-600">
                  Un interlocuteur unique pour un service global.
                </p>
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <AnimateOnScroll className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <ContactForm />
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={200}>
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-4">Nos coordonnées</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Téléphone</p>
                          <a href="tel:0771556483" className="text-primary hover:underline">07 71 55 64 83</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <a href="mailto:tf.immopro@gmail.com" className="text-primary hover:underline">tf.immopro@gmail.com</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Adresse</p>
                          <p className="text-gray-600">Lyon, France</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3">Horaires</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Lundi - Vendredi</span><span className="font-medium">9h - 19h</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Samedi</span><span className="font-medium">10h - 17h</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Dimanche</span><span className="font-medium text-red-500">Fermé</span></div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SERVICES                                      */}
      {/* ============================================ */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Services</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Un accompagnement professionnel et personnalisé pour tous vos projets immobiliers.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <AnimateOnScroll key={service.title} delay={i * 100}>
                <div className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA PARTENAIRES                               */}
      {/* ============================================ */}
      <section className="bg-accent/10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateOnScroll>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Vous êtes professionnel ?</h2>
            <p className="text-gray-600 text-lg mb-8">
              Rejoignez notre réseau de partenaires et accédez à des outils exclusifs pour développer votre activité.
            </p>
            <Link href="/pro/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl">
              Accéder à l&apos;Espace Pro
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      <Footer />
    </>
  );
}
