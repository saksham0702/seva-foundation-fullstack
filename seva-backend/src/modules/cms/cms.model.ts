import { Document, Schema, model, Types } from "mongoose";

export interface ICmsSection {
  _id?: Types.ObjectId | string;
  key: string;
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  video?: string;
  items?: Array<Record<string, any>>;
  extra?: Record<string, any>;
}

export interface ICmsPage extends Document {
  pageSlug: string;
  pageName: string;
  title?: string;
  subtitle?: string;
  bannerImage?: string;
  bannerVideo?: string;
  content?: string;
  sections: ICmsSection[];
  settings?: Record<string, any>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  isPublished: boolean;
  isDeleted: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CmsSectionSchema = new Schema(
  {
    key: { type: String, required: true },
    name: { type: String },
    title: { type: String },
    subtitle: { type: String },
    description: { type: String },
    image: { type: String },
    video: { type: String },
    items: { type: [Schema.Types.Mixed], default: [] },
    extra: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

const CmsPageSchema = new Schema<ICmsPage>(
  {
    pageSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    pageName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    bannerImage: {
      type: String,
      default: "",
    },
    bannerVideo: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    sections: {
      type: [CmsSectionSchema],
      default: [],
    },
    settings: {
      type: Schema.Types.Mixed,
      default: {},
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      metaKeywords: { type: [String], default: [] },
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const CmsPageModel = model<ICmsPage>("CmsPage", CmsPageSchema);
