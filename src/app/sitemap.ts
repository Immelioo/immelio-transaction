import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://immelio.fr";

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/biens`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/programmes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/estimation`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/demande-recherche`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  // Pages dynamiques — biens
  const biens = await prisma.bien.findMany({
    where: { disponible: true },
    select: { id: true, updatedAt: true },
  });

  const biensPages: MetadataRoute.Sitemap = biens.map((bien) => ({
    url: `${baseUrl}/biens/${bien.id}`,
    lastModified: bien.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Pages dynamiques — programmes
  const programmes = await prisma.programme.findMany({
    select: { id: true, updatedAt: true },
  });

  const programmesPages: MetadataRoute.Sitemap = programmes.map((p) => ({
    url: `${baseUrl}/programmes/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...biensPages, ...programmesPages];
}
