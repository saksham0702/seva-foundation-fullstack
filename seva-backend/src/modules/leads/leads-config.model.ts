import { Document, Schema, model } from "mongoose";

export type FollowUpCategory = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "CALLBACK";

export interface IFollowUpConfig extends Document {
  name: string;
  category: FollowUpCategory;
  color: string;
  defaultNotes?: string;
  requiresNextAction: boolean;
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpConfigSchema = new Schema<IFollowUpConfig>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "CALLBACK"],
      default: "NEUTRAL",
    },
    color: {
      type: String,
      default: "#64748b", // slate
    },
    defaultNotes: {
      type: String,
      default: "",
    },
    requiresNextAction: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const FollowUpConfigModel = model<IFollowUpConfig>(
  "FollowUpConfig",
  FollowUpConfigSchema
);

// Standard default configurations to seed if none exist
export const DEFAULT_FOLLOW_UP_CONFIGS = [
  {
    name: "Interested - Callback Requested",
    category: "CALLBACK" as FollowUpCategory,
    color: "#0284c7", // sky
    defaultNotes: "Donor expressed interest and requested a follow-up call.",
    requiresNextAction: true,
    isSystem: true,
    sortOrder: 1,
  },
  {
    name: "Donation Promised",
    category: "POSITIVE" as FollowUpCategory,
    color: "#16a34a", // green
    defaultNotes: "Donor promised to contribute online within the next 2-3 days.",
    requiresNextAction: true,
    isSystem: true,
    sortOrder: 2,
  },
  {
    name: "Payment Link Resent",
    category: "POSITIVE" as FollowUpCategory,
    color: "#8b5cf6", // purple
    defaultNotes: "Sent payment link via WhatsApp and Email.",
    requiresNextAction: true,
    isSystem: true,
    sortOrder: 3,
  },
  {
    name: "Payment Assistance Required",
    category: "NEUTRAL" as FollowUpCategory,
    color: "#f59e0b", // amber
    defaultNotes: "Donor encountered payment gateway issue, assistance required.",
    requiresNextAction: true,
    isSystem: true,
    sortOrder: 4,
  },
  {
    name: "Ringing / No Answer",
    category: "CALLBACK" as FollowUpCategory,
    color: "#eab308", // yellow
    defaultNotes: "Call went unanswered. Scheduled retry.",
    requiresNextAction: true,
    isSystem: true,
    sortOrder: 5,
  },
  {
    name: "Call Back Later",
    category: "CALLBACK" as FollowUpCategory,
    color: "#3b82f6", // blue
    defaultNotes: "Donor is currently busy, requested callback at convenient time.",
    requiresNextAction: true,
    isSystem: true,
    sortOrder: 6,
  },
  {
    name: "Not Interested",
    category: "NEGATIVE" as FollowUpCategory,
    color: "#ef4444", // red
    defaultNotes: "Donor politely declined further contribution.",
    requiresNextAction: false,
    isSystem: true,
    sortOrder: 7,
  },
  {
    name: "Wrong Number / Invalid Contact",
    category: "NEGATIVE" as FollowUpCategory,
    color: "#6b7280", // gray
    defaultNotes: "Invalid or disconnected telephone number.",
    requiresNextAction: false,
    isSystem: true,
    sortOrder: 8,
  },
];
