import { CmsItem } from "@/types/cms";

export const DUMMY_BLOGS: CmsItem[] = [];
export const DUMMY_NEWS: CmsItem[] = [];
export const DUMMY_EVENTS: CmsItem[] = [];

export const CMS_SEED_MAP: Record<string, CmsItem[]> = {
  blog: [],
  news: [],
  event: [],
};

export const CMS_CATEGORIES: Record<string, string[]> = {
  blog: ["General", "Humanitarian", "Education", "Healthcare", "Stories of Hope", "Volunteer Insights"],
  news: ["General", "Press Release", "Partnership", "Governance", "Media Coverage", "Announcements"],
  event: ["General", "Fundraiser", "Healthcare", "Environment", "Community Drive", "Workshop & Seminar"],
};
