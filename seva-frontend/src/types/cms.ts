export type CmsContentType = "blog" | "news" | "event";

// ── CMS Page / Section types (mirrors backend cms.model.ts) ────────────────────
export interface ICmsSection {
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
  _id?: string;
  pageSlug: string;
  pageName: string;
  title?: string;
  subtitle?: string;
  bannerImage?: string;
  content?: string;
  sections: ICmsSection[];
  settings?: Record<string, any>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CmsStatus = "draft" | "published" | "scheduled";

export interface CmsFAQ {
  question: string;
  answer: string;
}

export interface CmsItem {
  id: string;
  _id?: string;
  type: CmsContentType;
  title: string;
  slug: string;
  status: CmsStatus;
  category: string;
  publishedAt: string;
  featuredImage: string;
  images?: string[];
  excerpt: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  faqs?: CmsFAQ[];
  scheduledAt?: string;

  // Event specific fields
  eventDate?: string;
  eventLocation?: string;
  eventOrganizer?: string;

  // News specific fields
  newsSource?: string;
  authorName?: string;
  readTime?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CmsForm {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage: File | string | null;
  content: string;
  category: string;
  faqs: CmsFAQ[];
  status: CmsStatus;
  scheduledAt: string;

  // Event specific fields
  eventDate: string;
  eventLocation: string;
  eventOrganizer: string;

  // News specific fields
  newsSource: string;
  authorName: string;
  readTime: string;
}

export const initialCmsForm: CmsForm = {
  title: "",
  slug: "",
  metaTitle: "",
  metaDescription: "",
  featuredImage: null,
  content: "",
  category: "General",
  faqs: [],
  status: "draft",
  scheduledAt: "",
  eventDate: "",
  eventLocation: "",
  eventOrganizer: "",
  newsSource: "",
  authorName: "",
  readTime: "3 min read",
};
