import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getSessionUserFromCookies } from "@/lib/sessionUser";

export default async function AdminLoginPage() {
  const user = await getSessionUserFromCookies();
  if (user?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  return <AdminLoginForm />;
}
