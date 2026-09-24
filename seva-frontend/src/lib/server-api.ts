import { Campaign, PublicDonor } from "@/app/api/campaign";
import { CmsItem, CmsPage, CmsContentType } from "@/types/cms";
import { VolunteerCategory, FormType } from "@/app/api/volunteer";
import { Certificate } from "@/app/api/certificate";
import { Product } from "@/app/api/product";
import { GalleryItem } from "@/app/api/gallery";

const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

/**
 * Generic safe server fetch with ISR revalidation
 */
async function safeServerFetch<T>(
  endpoint: string,
  revalidateSeconds: number = 60,
  tags: string[] = []
): Promise<T | null> {
  try {
    const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, {
      next: {
        revalidate: revalidateSeconds,
        tags,
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data !== undefined ? json.data : json) as T;
  } catch (err) {
    console.error(`[ServerFetch Error] ${endpoint}:`, err);
    return null;
  }
}

// ── Campaigns ────────────────────────────────────────────────────────────────
export async function getServerCampaigns(): Promise<Campaign[]> {
  const data = await safeServerFetch<Campaign[]>("/campaigns", 60, ["campaigns"]);
  return Array.isArray(data) ? data : [];
}

export async function getServerCampaignBySlug(slug: string): Promise<Campaign | null> {
  const data = await safeServerFetch<Campaign>(`/campaigns/slug/${slug}`, 60, [
    `campaign-${slug}`,
  ]);
  return data;
}

export async function getServerCampaignDonors(
  slug: string,
  page = 1,
  limit = 5
): Promise<{ donors: PublicDonor[]; total: number; totalPages: number; page: number }> {
  const data = await safeServerFetch<{
    donors: PublicDonor[];
    total: number;
    totalPages: number;
    page: number;
  }>(`/campaigns/slug/${slug}/donors?page=${page}&limit=${limit}`, 15);

  return data || { donors: [], total: 0, totalPages: 1, page };
}

// ── CMS Items (Blogs / News / Events) ────────────────────────────────────────
function mapBackendToCmsItem(backendItem: any, contentType: CmsContentType): CmsItem {
  let images: string[] = [];
  if (Array.isArray(backendItem.images)) {
    images = backendItem.images;
  } else if (typeof backendItem.images === "string") {
    images = [backendItem.images];
  } else if (backendItem.featuredImage) {
    images = [backendItem.featuredImage];
  }

  let faqs = [];
  if (Array.isArray(backendItem.faqs)) {
    faqs = backendItem.faqs;
  } else if (typeof backendItem.faqs === "string") {
    try {
      faqs = JSON.parse(backendItem.faqs);
    } catch {}
  }

  return {
    id: backendItem._id || backendItem.id,
    _id: backendItem._id || backendItem.id,
    type: backendItem.type || contentType,
    title: backendItem.title || backendItem.name || "",
    slug: backendItem.slug || "",
    status: backendItem.status === "active" ? "published" : backendItem.status || "draft",
    category:
      typeof backendItem.category === "object" && backendItem.category?.name
        ? backendItem.category.name
        : backendItem.category || "General",
    publishedAt:
      backendItem.publishedAt ||
      (backendItem.createdAt
        ? new Date(backendItem.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })),
    featuredImage: images[0] || "",
    images,
    excerpt: backendItem.metaDescription || backendItem.description || "",
    content: backendItem.content || backendItem.description || "",
    metaTitle: backendItem.metaTitle || backendItem.title || "",
    metaDescription: backendItem.metaDescription || "",
    faqs,
    scheduledAt: backendItem.scheduledAt,
    eventDate: backendItem.eventDate,
    eventLocation: backendItem.eventLocation,
    eventOrganizer: backendItem.eventOrganizer,
    newsSource: backendItem.newsSource,
    authorName: backendItem.authorName,
    readTime: backendItem.readTime || "3 min read",
    createdAt: backendItem.createdAt,
    updatedAt: backendItem.updatedAt,
  };
}

export async function getServerCmsItems(type: CmsContentType): Promise<CmsItem[]> {
  const data = await safeServerFetch<any[]>(`/cms/type/${type}`, 60, [`cms-${type}`]);
  if (!Array.isArray(data)) return [];
  return data.map((item) => mapBackendToCmsItem(item, type));
}

export async function getServerRecentBlogs(limit: number = 4): Promise<CmsItem[]> {
  const data = await safeServerFetch<any[]>(`/blogs/recent?limit=${limit}`, 60, ["recent-blogs"]);
  if (Array.isArray(data) && data.length > 0) {
    return data.map((item) => mapBackendToCmsItem(item, item.type || "blog"));
  }
  // Fallback: fetch from /cms/type/blog
  const fallback = await getServerCmsItems("blog");
  return fallback.slice(0, limit);
}

export async function getServerCmsItemBySlug(
  type: CmsContentType,
  slug: string
): Promise<CmsItem | null> {
  const data = await safeServerFetch<any>(`/cms/type/${type}/${slug}`, 60, [
    `cms-${type}-${slug}`,
  ]);
  return data ? mapBackendToCmsItem(data, type) : null;
}

// ── CMS Pages (About / Our Work / Get Involved / Privacy / Terms) ─────────────
export async function getServerCmsPage(slug: string): Promise<CmsPage | null> {
  const data = await safeServerFetch<CmsPage>(`/cms/pages/${slug}`, 60, [`cms-page-${slug}`]);
  return data;
}

// ── Volunteer Categories ─────────────────────────────────────────────────────
export async function getServerPublicVolunteerCategories(
  formType?: FormType
): Promise<VolunteerCategory[]> {
  const url = formType
    ? `/volunteer-categories/public?formType=${formType}`
    : `/volunteer-categories/public`;
  const data = await safeServerFetch<VolunteerCategory[]>(
    url,
    60,
    [formType ? `volunteer-categories-${formType}` : `volunteer-categories-all`]
  );
  return Array.isArray(data) ? data : [];
}

// ── Certificates ─────────────────────────────────────────────────────────────
export async function getServerCertificate(
  certificateNo: string
): Promise<{ valid: boolean; certificate: Certificate | null; message?: string } | null> {
  try {
    const url = `${API_URL}/certificates/verify/${encodeURIComponent(certificateNo)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json || null;
  } catch (err) {
    console.error(`[ServerFetch Error] verify certificate ${certificateNo}:`, err);
    return null;
  }
}

// ── Categories ───────────────────────────────────────────────────────────────
export async function getServerCategories(): Promise<{ _id: string; name: string; slug?: string }[]> {
  const data = await safeServerFetch<any[]>("/categories", 60, ["categories"]);
  return Array.isArray(data) ? data : [];
}

// ── Products / Sponsorship Items ─────────────────────────────────────────────
export async function getServerProducts(): Promise<Product[]> {
  const data = await safeServerFetch<Product[]>("/products", 60, ["products"]);
  return Array.isArray(data) ? data : [];
}

// ── Gallery Items ────────────────────────────────────────────────────────────
export async function getServerGalleryImages(limit: number = 6): Promise<GalleryItem[]> {
  const data = await safeServerFetch<any>(`/gallery?limit=${limit}`, 60, ["gallery-images"]);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.images)) return data.images;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

