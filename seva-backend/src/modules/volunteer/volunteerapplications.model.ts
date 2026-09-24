import { Document, Types, Schema, model } from "mongoose";

export type FormType = "volunteer" | "corporate" | "career" | "support";

export type Availability =
  | "weekends"
  | "weekdays"
  | "both"
  | "flexible"
  | "fulltime"
  | "parttime";

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
  city?: string;
  category?: Types.ObjectId; // ref VolunteerCategory (optional)
  selectedAreaTitle?: string;

  // Volunteer specific
  availability?: Availability;
  skills?: string;
  previousExperience?: string;
  reason?: string;

  // Corporate specific
  companyName?: string;
  contactPerson?: string;
  industry?: string;
  partnershipType?: string;
  csrFocusAreas?: string;
  partnershipGoals?: string;

  // Career specific
  positionAppliedFor?: string;
  currentLocation?: string;
  resumeUrl?: string;
  coverLetter?: string;

  // Support specific
  supportType?: string;
  address?: string;

  message?: string;
  status: ApplicationStatus;
  reviewedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const VolunteerApplicationSchema = new Schema<IVolunteerApplication>(
  {
    formType: {
      type: String,
      enum: ["volunteer", "corporate", "career", "support"],
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
      trim: true,
    },
    category: {
      type: Types.ObjectId,
      ref: "VolunteerCategory",
      required: false,
    },
    selectedAreaTitle: {
      type: String,
      trim: true,
    },

    // Volunteer specific
    availability: {
      type: String,
      enum: ["weekends", "weekdays", "both", "flexible", "fulltime", "parttime"],
    },
    skills: {
      type: String,
      trim: true,
    },
    previousExperience: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },

    // Corporate specific
    companyName: {
      type: String,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    partnershipType: {
      type: String,
      trim: true,
    },
    csrFocusAreas: {
      type: String,
      trim: true,
    },
    partnershipGoals: {
      type: String,
      trim: true,
    },

    // Career specific
    positionAppliedFor: {
      type: String,
      trim: true,
    },
    currentLocation: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    coverLetter: {
      type: String,
      trim: true,
    },

    // Support specific
    supportType: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      trim: true,
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