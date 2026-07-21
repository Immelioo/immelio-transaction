import { redirect } from "next/navigation";
import ProLoginShell from "@/components/pro/ProLoginShell";
import { getSessionUserFromCookies } from "@/lib/sessionUser";

export default async function ProLoginPage() {
  const user = await getSessionUserFromCookies();
  if (user?.role === "PARTENAIRE" || user?.role === "ADMIN") {
    redirect("/pro/dashboard");
  }
  return <ProLoginShell />;
}
