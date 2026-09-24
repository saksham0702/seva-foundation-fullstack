import { Document, Types, Schema, model } from "mongoose";

/**
 * Extend this list as you add new mail-triggering points in the app.
 * Keeping it as a plain string (not a strict enum) at the DB level too,
 * but validated here, so adding a new key later is a one-line change
 * and doesn't need a migration.
 */
export type MailTemplateKey =
  | "USER_CREDENTIALS" // sent when admin creates a new user — contains id/password
  | "USER_UPDATED" // sent when a user's account is edited
  | "USER_PASSWORD_CHANGED"
  | "DONOR_DONATION_RECEIVED" // sent right after a donation is recorded
  | "DONOR_PAYMENT_CONFIRMED" // sent once payment status flips to PAID
  | "CAMPAIGN_DONATION_RECEIPT"
  | "VOLUNTEER_APPLICATION_RECEIVED"
  | "VOLUNTEER_APPLICATION_STATUS_UPDATE"
  | "CERTIFICATE_GENERATED"
  | "CORPORATE_PARTNERSHIP_INQUIRY"
  | "CONTACT_FORM_SUBMISSION"
  | "CUSTOM";

export type MailTemplateCategory =
  | "AUTH"
  | "DONOR"
  | "VOLUNTEER"
  | "CAMPAIGN"
  | "CERTIFICATE"
  | "PARTNERSHIP"
  | "GENERAL";

export interface IMailTemplate extends Document {
  key: string;
  name: string; // human-readable, e.g. "New User Credentials"
  category: string;
  subject: string; // supports {{placeholders}}
  htmlContent: string; // full HTML body, supports {{placeholders}}
  images: string[]; // uploaded via uploadMailTemplateImage, used inside htmlContent
  availableVariables: string[]; // documentation list, e.g. ["name","email","password"]
  isDynamicCampaign?: boolean; // true for custom user-created marketing campaigns
  isActive: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const MailTemplateSchema = new Schema<IMailTemplate>(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: "CAMPAIGN",
    },
    subject: {
      type: String,
      required: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    availableVariables: {
      type: [String],
      default: ["name", "email", "amount", "campaign", "date"],
    },
    isDynamicCampaign: {
      type: Boolean,
      default: false,
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

export const MailTemplateModel = model<IMailTemplate>(
  "MailTemplate",
  MailTemplateSchema
);