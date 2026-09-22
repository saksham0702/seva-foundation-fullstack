import type { MetadataRoute } from "next";

const BASE_URL = "https://sevaindiafoundation.org";

// Static pages with priorities
const staticPages: MetadataRoute.Sitemap = [
  { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
  { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${BASE_URL}/campaigns`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE_URL}/donations`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${BASE_URL}/blogs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE_URL}/our-work`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE_URL}/get-involved`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE_URL}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/gallery`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE_URL}/verify`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dynamicPages: MetadataRoute.Sitemap = [];

  // Try to fetch dynamic campaign and blog slugs
  try {
    const API_BASE =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:5000/api";

    // Fetch campaigns
    const campaignsRes = await fetch(`${API_BASE}/campaigns`, {
      next: { revalidate: 3600 },
    });
    if (campaignsRes.ok) {
      const data = await campaignsRes.json();
      const campaigns: Array<{ slug: string; updatedAt?: string }> =
        data?.data || data?.campaigns || [];
      dynamicPages.push(
        ...campaigns.map((c) => ({
          url: `${BASE_URL}/campaigns/${c.slug}`,
          lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }))
      );
    }

    // Fetch blogs
    const blogsRes = await fetch(`${API_BASE}/blogs`, {
      next: { revalidate: 3600 },
    });
    if (blogsRes.ok) {
      const data = await blogsRes.json();
      const blogs: Array<{ slug: string; updatedAt?: string }> =
        data?.data || data?.blogs || [];
      dynamicPages.push(
        ...blogs.map((b) => ({
          url: `${BASE_URL}/blogs/${b.slug}`,
          lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }))
      );
    }
  } catch (e) {
    // Return static-only sitemap if API is unreachable
  }

  return [...staticPages, ...dynamicPages];
}
