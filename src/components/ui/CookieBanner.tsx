"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    // setTimeout defer pour éviter setState synchrone dans un effet
    if (!consent) setTimeout(() => setVisible(true), 0);
  }, []);

  useEffect(() => {
    if (!visible) {
      document.body.style.paddingBottom = "";
      return;
    }

    const updateOffset = () => {
      const height = bannerRef.current?.offsetHeight ?? 0;
      document.body.style.paddingBottom = `${height + 16}px`;
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);

    return () => {
      window.removeEventListener("resize", updateOffset);
      document.body.style.paddingBottom = "";
    };
  }, [visible]);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  function refuse() {
    localStorage.setItem("cookie-consent", "refused");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div ref={bannerRef} className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-xl p-4 sm:p-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">🍪</span>
          <div>
            <p className="text-sm text-gray-700">
              Ce site utilise uniquement un cookie technique de session, strictement nécessaire à votre authentification.{" "}
              <Link href="/politique-confidentialite" className="text-primary hover:underline font-medium">
                En savoir plus
              </Link>
            </p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={refuse}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
