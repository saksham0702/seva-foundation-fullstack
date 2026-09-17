import axiosInstance from "./index";
import { endpoint } from "./endpoints";
import type { CmsContentType, CmsForm, CmsItem } from "@/types/cms";

// ── Static Pages CMS ─────────────────────────────────────────────────────────

export interface CmsSection {
  key: string;
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  items?: Array<Record<string, any>>;
  extra?: Record<string, any>;
}

export interface CmsPage {
  _id: string;
  pageSlug: string;
  pageName: string;
  title?: string;
  subtitle?: string;
  bannerImage?: string;
  content?: string;
  sections: CmsSection[];
  settings?: Record<string, any>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  isPublished: boolean;
  isDeleted: boolean;
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const getCmsPages = async (): Promise<CmsPage[]> => {
  const response = await axiosInstance.get(endpoint.cms.getPages);
  return response.data?.data || response.data || [];
};

export const getCmsPageBySlug = async (slug: string): Promise<CmsPage> => {
  const response = await axiosInstance.get(endpoint.cms.getPage(slug));
  return response.data?.data || response.data;
};

export const saveCmsPage = async (
  slug: string,
  payload: Partial<CmsPage>
): Promise<CmsPage> => {
  const response = await axiosInstance.post(endpoint.cms.savePage(slug), payload);
  return response.data?.data || response.data;
};

export const deleteCmsPage = async (slug: string): Promise<void> => {
  await axiosInstance.delete(endpoint.cms.deletePage(slug));
};

// ── Blogs / Stories / Events / News CMS API ─────────────────────────────────

const buildFormData = (contentType: CmsContentType, form: CmsForm): FormData => {
  const formData = new FormData();
  formData.append("title", form.title);
  if (form.slug) formData.append("slug", form.slug);
  formData.append("category", form.category || "General");
  formData.append("content", form.content);
  formData.append("status", form.status);

  if (form.metaTitle) formData.append("metaTitle", form.metaTitle);
  if (form.metaDescription) formData.append("metaDescription", form.metaDescription);
  if (form.faqs?.length) formData.append("faqs", JSON.stringify(form.faqs));
  if (form.scheduledAt) formData.append("scheduledAt", form.scheduledAt);

  if (form.featuredImage instanceof File) {
    formData.append("images", form.featuredImage);
  } else if (typeof form.featuredImage === "string" && form.featuredImage) {
    formData.append("images", form.featuredImage);
  }

  // Type specific fields
  if (contentType === "event") {
    if (form.eventDate) formData.append("eventDate", form.eventDate);
    if (form.eventLocation) formData.append("eventLocation", form.eventLocation);
    if (form.eventOrganizer) formData.append("eventOrganizer", form.eventOrganizer);
  } else if (contentType === "news") {
    if (form.newsSource) formData.append("newsSource", form.newsSource);
    if (form.authorName) formData.append("authorName", form.authorName);
    if (form.readTime) formData.append("readTime", form.readTime);
  }

  return formData;
};

const mapBackendToCmsItem = (backendItem: any, contentType: CmsContentType): CmsItem => {
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
    type: contentType,
    title: backendItem.title || backendItem.name || "",
    slug: backendItem.slug || "",
    status: backendItem.status === "active" ? "published" : backendItem.status || "draft",
    category: backendItem.category?.name || backendItem.category || "General",
    publishedAt: backendItem.publishedAt || backendItem.createdAt || new Date().toISOString(),
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
};

export const cmsAPI = {
  getItems: async (contentType: CmsContentType): Promise<CmsItem[]> => {
    const res = await axiosInstance.get(endpoint.blogs.getAll);
    const list = res.data?.data || res.data || [];
    return list.map((item: any) => mapBackendToCmsItem(item, contentType));
  },

  getItemById: async (contentType: CmsContentType, id: string): Promise<CmsItem | null> => {
    const res = await axiosInstance.get(endpoint.blogs.getById + id);
    const data = res.data?.data || res.data;
    if (!data) return null;
    return mapBackendToCmsItem(data, contentType);
  },

  createItem: async (contentType: CmsContentType, form: CmsForm): Promise<CmsItem> => {
    const payload = buildFormData(contentType, form);
    const res = await axiosInstance.post(endpoint.blogs.create, payload);
    const data = res.data?.data || res.data;
    return mapBackendToCmsItem(data, contentType);
  },

  updateItem: async (contentType: CmsContentType, id: string, form: CmsForm): Promise<CmsItem> => {
    const payload = buildFormData(contentType, form);
    const res = await axiosInstance.patch(endpoint.blogs.update + id, payload);
    const data = res.data?.data || res.data;
    return mapBackendToCmsItem(data, contentType);
  },

  deleteItem: async (contentType: CmsContentType, id: string): Promise<void> => {
    await axiosInstance.delete(endpoint.blogs.delete + id);
  },

  toggleStatus: async (contentType: CmsContentType, id: string, currentStatus: string): Promise<string> => {
    const nextStatus = currentStatus === "published" || currentStatus === "active" ? "draft" : "active";
    await axiosInstance.patch(endpoint.blogs.toggleStatus(id), { status: nextStatus });
    return nextStatus === "active" ? "published" : "draft";
  },
};
