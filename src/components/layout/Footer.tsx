import Link from "next/link";
import { getSiteSettings } from "@/lib/siteSettings";

export default async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <div>
                <span className="text-xl font-bold">{settings.agency_name}</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {settings.footer_description}
            </p>
            <div className="mt-4 space-y-1 text-sm text-gray-300">
              <p>{settings.agency_phone}</p>
              <p>{settings.agency_email}</p>
            </div>
          </div>

          {/* Liens Rapides */}
          <div>
            <h3 className="font-semibold text-accent mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/biens" className="text-gray-300 hover:text-white transition-colors">Nos Biens</Link></li>
              <li><Link href="/programmes" className="text-gray-300 hover:text-white transition-colors">Programmes Neufs</Link></li>
              <li><Link href="/demande-recherche" className="text-gray-300 hover:text-white transition-colors">Demande de Recherche</Link></li>
              <li><Link href="/estimation" className="text-gray-300 hover:text-white transition-colors">Estimation gratuite</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">À propos</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Espace Pro */}
          <div>
            <h3 className="font-semibold text-accent mb-4">Professionnels</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pro/login" className="text-gray-300 hover:text-white transition-colors">Espace Partenaires</Link></li>
              <li><Link href="/pro/login" className="text-gray-300 hover:text-white transition-colors">Devenir Partenaire</Link></li>
              <li><Link href="/pro/documents" className="text-gray-300 hover:text-white transition-colors">Documents</Link></li>
              <li><Link href="/pro/biens" className="text-gray-300 hover:text-white transition-colors">Biens &amp; Commissions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-accent mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {settings.agency_phone}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {settings.agency_email}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {settings.agency_city}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 gap-4">
          <p>&copy; {new Date().getFullYear()} Immelio Transaction. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/favoris" className="hover:text-white transition-colors">❤️ Favoris</Link>
          </div>
          <Link href="/admin/login" className="text-accent hover:text-white transition-colors font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            CRM Administration
          </Link>
        </div>
      </div>
    </footer>
  );
}
