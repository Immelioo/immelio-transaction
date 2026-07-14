import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Immelio Transaction",
  description: "Mentions légales et informations juridiques d'Immelio Transaction.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <section className="bg-primary text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Mentions légales</h1>
          <p className="text-gray-300 mt-2">Dernière mise à jour : janvier 2025</p>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-gray max-w-none">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Éditeur du site</h2>
            <p className="text-gray-600">
              <strong>Immelio Transaction</strong><br />
              Agent immobilier indépendant<br />
              Lyon, France<br />
              Téléphone : 07 71 55 64 83<br />
              Email : tf.immopro@gmail.com<br />
              SIRET : en cours d&apos;enregistrement<br />
              Carte professionnelle T (Transaction) délivrée par la CCI de Lyon
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Hébergement</h2>
            <p className="text-gray-600">
              Ce site est hébergé par :<br />
              <strong>Vercel Inc.</strong><br />
              440 N Barranca Ave #4133, Covina, CA 91723, USA<br />
              <a href="https://vercel.com" className="text-primary hover:underline">https://vercel.com</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Propriété intellectuelle</h2>
            <p className="text-gray-600">
              L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos) est protégé par le droit d&apos;auteur.
              Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est interdite.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Données personnelles (RGPD)</h2>
            <p className="text-gray-600 mb-3">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés,
              vous disposez des droits suivants sur vos données personnelles :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Droit d&apos;accès et de rectification</li>
              <li>Droit à l&apos;effacement (droit à l&apos;oubli)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d&apos;opposition</li>
            </ul>
            <p className="text-gray-600 mt-3">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:tf.immopro@gmail.com" className="text-primary hover:underline">tf.immopro@gmail.com</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Données collectées</h2>
            <p className="text-gray-600">
              Nous collectons uniquement les données nécessaires à la relation commerciale :
              nom, prénom, email, téléphone, dans le cadre de demandes de visite, d&apos;estimation ou de contact.
              Ces données sont conservées 3 ans à compter du dernier contact.
              Elles ne sont jamais revendues à des tiers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
            <p className="text-gray-600">
              Ce site utilise uniquement des cookies techniques strictement nécessaires au fonctionnement
              (authentification). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Responsabilité</h2>
            <p className="text-gray-600">
              Immelio Transaction s&apos;efforce de fournir des informations exactes et à jour. Cependant,
              nous ne pouvons garantir l&apos;exactitude absolue des informations présentées. Les prix et
              disponibilités des biens sont susceptibles d&apos;évoluer sans préavis.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Loi applicable</h2>
            <p className="text-gray-600">
              Les présentes mentions légales sont régies par le droit français. Tout litige sera soumis
              aux tribunaux compétents de Lyon, France.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
