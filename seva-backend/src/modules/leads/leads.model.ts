import { Document, Schema, model, Types } from "mongoose";
import "../campaigns/campaigns.model";
import "../auth/auth.model";
import "../donors/donors.model";

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

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "NOT_APPLICABLE";

export type FollowUpChannel = "CALL" | "WHATSAPP" | "EMAIL" | "MEETING" | "NOTE";

export interface IFollowUp {
  _id?: Types.ObjectId;
  channel: FollowUpChannel;
  disposition: string;
  notes: string;
  nextFollowUpDate?: Date;
  loggedBy?: Types.ObjectId;
  loggedByName?: string;
  createdAt: Date;
}

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  paymentStatus: PaymentStatus;
  campaign?: Types.ObjectId;
  amount?: number;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  assignedTo?: Types.ObjectId;
  donor?: Types.ObjectId;
  followUps: IFollowUp[];
  latestFollowUp?: {
    channel: FollowUpChannel;
    disposition: string;
    notes: string;
    nextFollowUpDate?: Date;
    loggedByName?: string;
    createdAt: Date;
  };
  nextFollowUpDate?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    channel: {
      type: String,
      enum: ["CALL", "WHATSAPP", "EMAIL", "MEETING", "NOTE"],
      default: "CALL",
    },
    disposition: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
    nextFollowUpDate: {
      type: Date,
    },
    loggedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    loggedByName: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

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
      index: true,
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
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "NOT_APPLICABLE"],
      default: "NOT_APPLICABLE",
      index: true,
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      index: true,
    },
    donor: {
      type: Schema.Types.ObjectId,
      ref: "Donor",
      index: true,
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
    followUps: {
      type: [FollowUpSchema],
      default: [],
    },
    latestFollowUp: {
      channel: { type: String },
      disposition: { type: String },
      notes: { type: String },
      nextFollowUpDate: { type: Date },
      loggedByName: { type: String },
      createdAt: { type: Date },
    },
    nextFollowUpDate: {
      type: Date,
      index: true,
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
