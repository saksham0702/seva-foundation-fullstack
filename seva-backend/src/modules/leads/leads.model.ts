import { Document, Schema, model, Types } from "mongoose";

export type LeadSource =
  | "SUBSCRIBER"
  | "PAYMENT_FAILED"
  | "DONOR_DROP"
  | "CONTACT_FORM"
  | "VOLUNTEER"
  | "MANUAL";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "CONVERTED"
  | "LOST";

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  campaign?: Types.ObjectId;
  amount?: number;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  assignedTo?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      trim: true,
      default: "Prospective Donor",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: [
        "SUBSCRIBER",
        "PAYMENT_FAILED",
        "DONOR_DROP",
        "CONTACT_FORM",
        "VOLUNTEER",
        "MANUAL",
      ],
      default: "MANUAL",
      index: true,
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "LOST"],
      default: "NEW",
      index: true,
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
    },
    amount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LeadModel = model<ILead>("Lead", LeadSchema);
