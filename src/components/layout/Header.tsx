"use client";

import Link from "next/link";
import { useState } from "react";
import BrandLogo from "@/components/branding/BrandLogo";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-[rgba(246,243,236,0.94)] shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center justify-between gap-6 py-3">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <BrandLogo size="md" priority />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-[15px] font-medium text-gray-700 transition-colors hover:text-primary">
              Accueil
            </Link>
            <Link href="/biens" className="text-[15px] font-medium text-gray-700 transition-colors hover:text-primary">
              Nos Biens
            </Link>
            <Link href="/programmes" className="text-[15px] font-medium text-gray-700 transition-colors hover:text-primary">
              Programmes Neufs
            </Link>
            <Link href="/estimation" className="text-[15px] font-medium text-gray-700 transition-colors hover:text-primary">
              Estimation
            </Link>
            <Link href="/about" className="text-[15px] font-medium text-gray-700 transition-colors hover:text-primary">
              À propos
            </Link>
            <Link href="/contact" className="text-[15px] font-medium text-gray-700 transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>

          {/* Boutons */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/estimation"
              className="px-3.5 py-2 text-sm text-primary border border-primary/25 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
            >
              Estimer gratuitement
            </Link>
            <Link
              href="/devenir-partenaire"
              className="px-3.5 py-2 text-sm border border-accent/50 text-accent rounded-lg font-medium hover:bg-accent/10 transition-colors"
            >
              Devenir Partenaire
            </Link>
            <Link
              href="/pro/login"
              className="px-3.5 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
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
              <Link href="/estimation" className="px-4 py-2 border border-primary/25 text-primary rounded-lg font-medium text-center" onClick={() => setMenuOpen(false)}>
                Estimer gratuitement
              </Link>
              <Link href="/devenir-partenaire" className="px-4 py-2 border border-accent/50 text-accent rounded-lg font-medium text-center" onClick={() => setMenuOpen(false)}>
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
