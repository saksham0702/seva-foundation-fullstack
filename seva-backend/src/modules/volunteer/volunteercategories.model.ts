import { Document, Types, Schema, model } from "mongoose";

export type FormType = "volunteer" | "corporate" | "career";

export interface IVolunteerCategory extends Document {
  formType: FormType;
  title: string;
  slug: string;
  description: string;
  icon: string; // URL to uploaded .svg file
  color: string; // hex color, e.g. "#E8542A"
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
      enum: ["volunteer", "corporate", "career"],
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
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true, // URL of the uploaded SVG
    },
    color: {
      type: String,
      required: true,
      match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "color must be a valid hex code"],
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