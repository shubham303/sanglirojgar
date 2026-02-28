import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";

const BASE_URL = "https://sanglirojgar.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getDb();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/job/new`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic job pages
  const { data } = await db.getActiveJobsPaginated({
    page: 1,
    limit: 1000,
  });

  const jobPages: MetadataRoute.Sitemap = (data?.jobs ?? []).map((job) => ({
    url: `${BASE_URL}/job/${job.id}`,
    lastModified: new Date(job.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...jobPages];
}
