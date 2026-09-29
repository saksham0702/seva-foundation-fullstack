// ─── Blog types ───────────────────────────────────────────────────────────────

export interface BlogFAQ {
  question: string;
  answer: string;
}

export type BlogStatus = "draft" | "published" | "scheduled";

export interface BlogForm {
  title: string;
  slug: string;
  category?: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  content: string;
  faqs: BlogFAQ[];
  status: BlogStatus;
  scheduledAt: string;
}

export const initialBlogForm: BlogForm = {
  title: "",
  slug: "",
  category: "Stories",
  metaTitle: "",
  metaDescription: "",
  featuredImage: "",
  content: "",
  faqs: [],
  status: "draft",
  scheduledAt: "",
};

// ─── Blog list data ─────────────────────────────────────────────────────

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  status: BlogStatus;
  category: string;
  publishedAt: string;
  featuredImage: string;
  excerpt: string;
}

export const DUMMY_BLOGS: BlogListItem[] = [];