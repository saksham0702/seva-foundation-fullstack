import { Document, Types, Schema, model } from "mongoose";

export interface IFAQ {
  question: string;
  answer: string;
}

export interface IBlog extends Document {
  name: string;
  slug: string;
  type: "blog" | "news" | "event";
  images: string[];
  description: string;
  content: string;
  category: string;
  status: "draft" | "published" | "scheduled";
  metaTitle?: string;
  metaDescription?: string;
  faqs?: IFAQ[];

  // Event specific fields
  eventDate?: string;
  eventLocation?: string;
  eventOrganizer?: string;

  // News specific fields
  newsSource?: string;
  authorName?: string;
  readTime?: string;

  scheduledAt?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const BlogSchema = new Schema<IBlog>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["blog", "news", "event"],
      default: "blog",
      index: true,
    },
    images: { type: [String], default: [] },
    description: { type: String, required: true },
    content: { type: String, default: "" },
    category: { type: String, default: "General" },
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
      index: true,
    },
    metaTitle: { type: String },
    metaDescription: { type: String },
    faqs: { type: [FAQSchema], default: [] },

    // Event fields
    eventDate: { type: String },
    eventLocation: { type: String },
    eventOrganizer: { type: String },

    // News fields
    newsSource: { type: String },
    authorName: { type: String },
    readTime: { type: String },

    scheduledAt: { type: String },
    createdBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const BlogModel = model<IBlog>("Blog", BlogSchema);