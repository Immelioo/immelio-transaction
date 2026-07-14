import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <section className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="text-center px-4 max-w-lg">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl font-bold text-primary">404</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Page introuvable</h1>
          <p className="text-gray-600 text-lg mb-8">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              Retour à l&apos;accueil
            </Link>
            <Link href="/biens" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Voir nos biens
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
