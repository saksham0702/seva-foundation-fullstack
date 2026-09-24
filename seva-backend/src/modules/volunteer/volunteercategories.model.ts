import { Document, Types, Schema, model } from "mongoose";

export type FormType = "volunteer" | "individual" | "corporate" | "career" | "support";

export interface IVolunteerCategory extends Document {
  formType: FormType;
  title: string;
  slug: string;
  description?: string;
  icon?: string; // URL to uploaded .svg file (for volunteer/individual roles)
  color?: string; // hex color, e.g. "#E8542A"
  badge?: string; // e.g. "MULTIPLE LOCATIONS • FULL-TIME"
  isActive: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const VolunteerCategorySchema = new Schema<IVolunteerCategory>(
  {
    formType: {
      type: String,
      enum: ["volunteer", "individual", "corporate", "career", "support"],
      default: "volunteer",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#1a3a6b",
    },
    badge: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const VolunteerCategoryModel = model<IVolunteerCategory>(
  "VolunteerCategory",
  VolunteerCategorySchema
);