import { Document, Types, Schema, model } from "mongoose";

export type FormType = "volunteer" | "corporate" | "career";

export type Availability =
  | "weekends"
  | "weekdays"
  | "both"
  | "flexible"
  | "fulltime";

export type ApplicationStatus =
  | "pending"
  | "contacted"
  | "approved"
  | "rejected";

export interface IVolunteerApplication extends Document {
  formType: FormType;
  name: string;
  email: string;
  phone: string;
  city: string;
  category: Types.ObjectId; // ref VolunteerCategory
  availability: Availability;
  message?: string;
  status: ApplicationStatus;
  reviewedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const VolunteerApplicationSchema = new Schema<IVolunteerApplication>(
  {
    formType: {
      type: String,
      enum: ["volunteer", "corporate", "career"],
      default: "volunteer",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "please provide a valid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Types.ObjectId,
      ref: "VolunteerCategory",
      required: true,
    },
    availability: {
      type: String,
      enum: ["weekends", "weekdays", "both", "flexible", "fulltime"],
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
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

export const VolunteerApplicationModel = model<IVolunteerApplication>(
  "VolunteerApplication",
  VolunteerApplicationSchema
);