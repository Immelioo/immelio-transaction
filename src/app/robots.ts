import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://immelio.fr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/biens", "/programmes", "/estimation", "/contact", "/about", "/demande-recherche"],
        disallow: ["/admin/", "/pro/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
