import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Immelio Transaction",
  description: "Politique de confidentialité et protection des données d'Immelio Transaction.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Header />
      <section className="bg-primary text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
          <p className="text-gray-300 mt-2">Conformité RGPD — Dernière mise à jour : janvier 2025</p>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {[
            {
              titre: "1. Responsable du traitement",
              contenu: "Immelio Transaction, Lyon, France. Contact DPO : tf.immopro@gmail.com"
            },
            {
              titre: "2. Données collectées",
              contenu: "Nous collectons : nom, prénom, adresse email, numéro de téléphone, données relatives aux biens immobiliers que vous nous soumettez. Ces données sont collectées lors des formulaires de contact, de demande de visite, d'estimation ou de partenariat."
            },
            {
              titre: "3. Finalités du traitement",
              contenu: "Vos données sont utilisées pour : répondre à vos demandes de contact, organiser des visites de biens, réaliser des estimations immobilières, gérer la relation commerciale, vous envoyer des communications relatives à votre projet immobilier (avec votre accord)."
            },
            {
              titre: "4. Base légale",
              contenu: "Le traitement de vos données est fondé sur : l'exécution d'un contrat ou de mesures précontractuelles (art. 6.1.b RGPD), notre intérêt légitime à développer notre activité (art. 6.1.f RGPD), votre consentement pour les communications marketing (art. 6.1.a RGPD)."
            },
            {
              titre: "5. Durée de conservation",
              contenu: "Données clients actifs : durée de la relation + 3 ans. Prospects sans suite : 1 an après le dernier contact. Documents contractuels : 10 ans (obligation légale). Données de connexion : 1 an."
            },
            {
              titre: "6. Destinataires des données",
              contenu: "Vos données sont traitées par Immelio Transaction et ses collaborateurs. Elles peuvent être transmises à des prestataires techniques (hébergement Vercel, service email Resend) dans le respect du RGPD. Elles ne sont jamais vendues à des tiers."
            },
            {
              titre: "7. Transferts hors UE",
              contenu: "Certains prestataires (Vercel, Resend) sont basés aux États-Unis. Ces transferts sont encadrés par des clauses contractuelles types approuvées par la Commission Européenne."
            },
            {
              titre: "8. Vos droits",
              contenu: "Vous disposez des droits suivants : accès, rectification, effacement, limitation, portabilité, opposition. Pour les exercer : tf.immopro@gmail.com. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr)."
            },
            {
              titre: "9. Sécurité",
              contenu: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des connexions (HTTPS), authentification sécurisée (JWT), stockage chiffré des mots de passe (bcrypt)."
            },
            {
              titre: "10. Cookies",
              contenu: "Ce site utilise uniquement un cookie de session technique (auth-token, HttpOnly, Secure) pour maintenir votre connexion. Ce cookie est strictement nécessaire et ne requiert pas votre consentement. Aucun cookie publicitaire n'est utilisé."
            },
          ].map((section) => (
            <div key={section.titre}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.titre}</h2>
              <p className="text-gray-600 leading-relaxed">{section.contenu}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
