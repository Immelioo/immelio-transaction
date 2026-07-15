"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <div>
              <span className="text-xl font-bold text-primary">Immelio</span>
              <span className="text-xl font-bold text-accent"> Transaction</span>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Accueil
            </Link>
            <Link href="/biens" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Nos Biens
            </Link>
            <Link href="/programmes" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Programmes Neufs
            </Link>
            <Link href="/estimation" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Estimation
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary font-medium transition-colors">
              À propos
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Contact
            </Link>
          </nav>

          {/* Boutons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/estimation"
              className="px-4 py-2 text-accent border border-accent rounded-lg font-medium hover:bg-accent hover:text-white transition-all"
            >
              Estimer gratuitement
            </Link>
            <Link
              href="/devenir-partenaire"
              className="px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-all"
            >
              Devenir Partenaire
            </Link>
            <Link
              href="/pro/login"
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
            >
              Espace Pro
            </Link>
          </div>

          {/* Menu Mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu Mobile Ouvert */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4 space-y-3">
            <Link href="/" className="block text-gray-700 hover:text-primary font-medium py-1" onClick={() => setMenuOpen(false)}>
              Accueil
            </Link>
            <Link href="/biens" className="block text-gray-700 hover:text-primary font-medium py-1" onClick={() => setMenuOpen(false)}>
              Nos Biens
            </Link>
            <Link href="/programmes" className="block text-gray-700 hover:text-primary font-medium py-1" onClick={() => setMenuOpen(false)}>
              Programmes Neufs
            </Link>
            <Link href="/estimation" className="block text-gray-700 hover:text-primary font-medium py-1" onClick={() => setMenuOpen(false)}>
              Estimation gratuite
            </Link>
            <Link href="/about" className="block text-gray-700 hover:text-primary font-medium py-1" onClick={() => setMenuOpen(false)}>
              À propos
            </Link>
            <Link href="/contact" className="block text-gray-700 hover:text-primary font-medium py-1" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <Link href="/estimation" className="px-4 py-2 text-accent border border-accent rounded-lg font-medium text-center" onClick={() => setMenuOpen(false)}>
                Estimer gratuitement
              </Link>
              <Link href="/devenir-partenaire" className="px-4 py-2 border border-primary text-primary rounded-lg font-medium text-center" onClick={() => setMenuOpen(false)}>
                Devenir Partenaire
              </Link>
              <Link href="/pro/login" className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-center" onClick={() => setMenuOpen(false)}>
                Espace Pro
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
