// ─── Blog types ───────────────────────────────────────────────────────────────

export interface BlogFAQ {
  question: string;
  answer: string;
}

export type BlogStatus = "draft" | "published" | "scheduled";

export interface BlogForm {
  title: string;
  slug: string;
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
  metaTitle: "",
  metaDescription: "",
  featuredImage: "",
  content: "",
  faqs: [],
  status: "draft",
  scheduledAt: "",
};

// ─── Dummy blog list data ─────────────────────────────────────────────────────

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

export const DUMMY_BLOGS: BlogListItem[] = [
  {
    id: "1",
    title: "How Your Donation Feeds 100 Families This Winter",
    slug: "donation-feeds-100-families-winter",
    status: "published",
    category: "Humanitarian",
    publishedAt: "12 Jun 2025",
    featuredImage: "",
    excerpt: "This winter, our ground teams reached over 100 families across remote tribal belts. Here's how every rupee you donated translated into warm meals and hope.",
  },
  {
    id: "2",
    title: "Building Schools in Rural Rajasthan: A Year in Review",
    slug: "building-schools-rural-rajasthan-review",
    status: "published",
    category: "Education",
    publishedAt: "3 May 2025",
    featuredImage: "",
    excerpt: "We broke ground on four new classrooms and enrolled 240 children who had never stepped inside a school. This is their story.",
  },
  {
    id: "3",
    title: "Free Medical Camps: What We Learned from 5,000 Patients",
    slug: "free-medical-camps-5000-patients",
    status: "draft",
    category: "Healthcare",
    publishedAt: "—",
    featuredImage: "",
    excerpt: "Running free camps across six districts taught us what urban medicine misses entirely. Here are the five lessons that changed how we work.",
  },
];