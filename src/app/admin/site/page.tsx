import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import { getAdminSiteSettings } from "@/lib/siteSettings";

export default async function AdminSitePage() {
  const settings = await getAdminSiteSettings();

  return <SiteSettingsForm initialSettings={settings} />;
}
