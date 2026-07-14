"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authState, setAuthState] = useState<"loading" | "authorized" | "unauthorized">("loading");
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    async function checkAuth() {
      if (isLoginPage) {
        setAuthState("unauthorized");
        return;
      }

      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (data.user?.role === "ADMIN") {
          setAuthState("authorized");
        } else {
          window.location.href = "/admin/login";
        }
      } catch {
        window.location.href = "/admin/login";
      }
    }
    checkAuth();
  }, [isLoginPage, pathname]);

  if (isLoginPage) return <>{children}</>;

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gray-500 font-medium">Vérification en cours...</span>
        </div>
      </div>
    );
  }

  if (authState !== "authorized") return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 pt-16 px-4 pb-4 md:pt-8 md:px-8 md:pb-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
