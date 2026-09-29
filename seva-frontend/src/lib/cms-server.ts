import { CmsPage } from "@/types/cms";

const CMS_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getCmsPageServer(slug: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(`${CMS_API}/cms/pages/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (error) {
    console.error(`[getCmsPageServer] Failed to fetch CMS page for slug "${slug}":`, error);
    return null;
  }
}