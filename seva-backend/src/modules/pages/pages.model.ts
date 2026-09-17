import { Document, Types, Schema, model } from "mongoose";

/**
 * Each sectionType maps 1:1 to a pre-built frontend component with a FIXED design.
 * Admin never chooses the design — only fills in title/content/images/items
 * for whichever sections a page already has.
 */
export type SectionType =
  | "hero"
  | "richText"
  | "imageText"
  | "gallery"
  | "stats"
  | "team"
  | "testimonials"
  | "faq"
  | "cta"
  | "cards"
  | "form";

// Generic repeatable item used inside a section (team member / stat / faq / testimonial / card)
export interface ISectionItem {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  value?: string; // e.g. "500+" for a stats section
  label?: string; // e.g. "Volunteers" for a stats section
  link?: string;
}

export interface ISection {
  _id?: Types.ObjectId;
  sectionType: SectionType;
  order: number;
  title?: string;
  subtitle?: string;
  content?: string; // rich text HTML from your editor
  images?: string[]; // section-level images (hero bg, gallery photos)
  items?: ISectionItem[]; // repeatable content for team/stats/faq/testimonials/cards
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
}

export interface IPage extends Document {
  name: string; // "About Us"
  slug: string; // "about-us"
  seoTitle?: string;
  seoDescription?: string;
  sections: ISection[];
  isPublished: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const SectionItemSchema = new Schema<ISectionItem>(
  {
    title: String,
    subtitle: String,
    description: String,
    image: String,
    value: String,
    label: String,
    link: String,
  },
  { _id: true }
);

const SectionSchema = new Schema<ISection>(
  {
    sectionType: {
      type: String,
      required: true,
      enum: [
        "hero",
        "richText",
        "imageText",
        "gallery",
        "stats",
        "team",
        "testimonials",
        "faq",
        "cta",
        "cards",
        "form",
        "quote"
      ],
    },
    order: { type: Number, required: true, default: 0 },
    title: String,
    subtitle: String,
    content: String,
    images: { type: [String], default: [] },
    items: { type: [SectionItemSchema], default: [] },
    buttonText: String,
    buttonLink: String,
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const PageSchema = new Schema<IPage>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    sections: { type: [SectionSchema], default: [] },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PageModel = model<IPage>("Page", PageSchema);