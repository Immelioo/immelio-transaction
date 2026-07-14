import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Link from "next/link";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "À propos — Immelio Transaction",
  description:
    "Découvrez Immelio Transaction, votre agence immobilière de confiance. Notre histoire, nos valeurs et notre engagement à vos côtés pour tous vos projets immobiliers.",
};

const valeurs = [
  {
    titre: "Transparence",
    description: "Nous communiquons clairement à chaque étape de votre projet. Pas de frais cachés, pas de mauvaises surprises.",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    titre: "Expertise",
    description: "Une connaissance approfondie du marché immobilier français et des réglementations en vigueur.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
  {
    titre: "Proximité",
    description: "Un interlocuteur dédié qui comprend vos besoins et vous accompagne personnellement tout au long du projet.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    titre: "Innovation",
    description: "Des outils digitaux modernes et un espace partenaire dédié pour simplifier vos démarches immobilières.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
];

const etapes = [
  { num: "01", titre: "Premier contact", desc: "Nous échangeons sur votre projet, vos critères et votre budget pour bien comprendre vos attentes." },
  { num: "02", titre: "Recherche ciblée", desc: "Notre équipe sélectionne les biens correspondants et organise les visites selon vos disponibilités." },
  { num: "03", titre: "Accompagnement", desc: "Négociation, financement, aspects juridiques : nous vous guidons à chaque étape jusqu'à la signature." },
  { num: "04", titre: "Après-vente", desc: "Notre relation ne s'arrête pas à la vente. Nous restons disponibles pour tout conseil ou besoin futur." },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            À propos d&apos;<span className="text-accent">Immelio Transaction</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {settings.about_hero_subtitle}
          </p>
        </div>
      </section>

      {/* Notre histoire */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimateOnScroll>
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">{settings.about_story_label}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                {settings.about_story_title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                {settings.about_story_paragraph_1}
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                {settings.about_story_paragraph_2}
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                {settings.about_story_paragraph_3}
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <div className="relative">
              <div className="relative bg-gray-200 rounded-2xl h-96 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                  alt="Équipe Immelio Transaction"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-accent text-white p-6 rounded-xl shadow-lg">
                <p className="text-3xl font-bold"><AnimatedCounter end={500} suffix="+" /></p>
                <p className="text-sm">transactions réalisées</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-accent"><AnimatedCounter end={Number(settings.homepage_stats_biens) || 150} suffix="+" /></p>
              <p className="text-gray-300 mt-1">Biens en portefeuille</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent"><AnimatedCounter end={Number(settings.homepage_stats_partenaires) || 50} suffix="+" /></p>
              <p className="text-gray-300 mt-1">Partenaires actifs</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent"><AnimatedCounter end={Number(settings.about_stats_satisfaction) || 98} suffix="%" /></p>
              <p className="text-gray-300 mt-1">Clients satisfaits</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent"><AnimatedCounter end={Number(settings.about_stats_delai) || 30} suffix="j" /></p>
              <p className="text-gray-300 mt-1">Délai moyen de vente</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Ce qui nous anime</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Nos valeurs</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {valeurs.map((v, i) => (
            <AnimateOnScroll key={v.titre} delay={i * 100}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center h-full hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={v.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{v.titre}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Notre méthode */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Comment ça marche</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Notre méthode</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {etapes.map((e, i) => (
              <AnimateOnScroll key={e.num} delay={i * 150}>
                <div className="relative">
                  <span className="text-6xl font-bold text-primary/10">{e.num}</span>
                  <h3 className="text-xl font-bold text-gray-900 -mt-4 mb-2">{e.titre}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{e.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{settings.about_cta_title}</h2>
          <p className="text-gray-300 text-lg mb-8">
            {settings.about_cta_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-light transition-colors">
              Nous contacter
            </Link>
            <Link href="/estimation" className="px-8 py-3 bg-white/10 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors">
              Estimer mon bien
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
