import { Schema, model, Document } from "mongoose";
import {
  IWhatsAppConfig,
  IWhatsAppTemplate,
  IWhatsAppCampaign,
  IWhatsAppLog,
} from "./marketing.types";

// ── WhatsApp Configuration Schema ───────────────────────────────────────────
const WhatsAppConfigSchema = new Schema<IWhatsAppConfig & Document>(
  {
    activeProvider: {
      type: String,
      enum: ["BAILEYS", "OFFICIAL_API"],
      default: "BAILEYS",
    },
    baileys: {
      sessionName: { type: String, default: "seva_whatsapp_session" },
      status: {
        type: String,
        enum: ["DISCONNECTED", "SCAN_QR", "CONNECTING", "CONNECTED"],
        default: "DISCONNECTED",
      },
      phoneNumber: { type: String, default: "" },
      userName: { type: String, default: "" },
      platform: { type: String, default: "" },
      lastConnectedAt: { type: Date },
      qrCode: { type: String, default: "" },
      disconnectReason: { type: String, default: "" },
    },
    officialApi: {
      phoneNumberId: { type: String, default: "" },
      businessAccountId: { type: String, default: "" },
      accessToken: { type: String, default: "" },
      apiVersion: { type: String, default: "v20.0" },
      webhookVerifyToken: { type: String, default: "" },
      senderPhoneNumber: { type: String, default: "" },
      isConfigured: { type: Boolean, default: false },
    },
    antiBanDefaults: {
      minDelaySeconds: { type: Number, default: 3 },
      maxDelaySeconds: { type: Number, default: 20 },
      maxMessagesIn20Seconds: { type: Number, default: 5 },
      batchSize: { type: Number, default: 50 },
      batchPauseSeconds: { type: Number, default: 45 },
    },
  },
  { timestamps: true }
);

// ── WhatsApp Template Schema ────────────────────────────────────────────────
const WhatsAppTemplateSchema = new Schema<IWhatsAppTemplate & Document>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["DONATION", "VOLUNTEER", "CAMPAIGN", "NEWSLETTER", "GENERAL"],
      default: "GENERAL",
    },
    body: { type: String, required: true },
    headerType: {
      type: String,
      enum: ["NONE", "TEXT", "IMAGE", "DOCUMENT"],
      default: "NONE",
    },
    headerMediaUrl: { type: String, default: "" },
    footerText: { type: String, default: "" },
    sampleVariables: { type: Schema.Types.Mixed, default: {} },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Recipient Sub-Schema ────────────────────────────────────────────────────
const RecipientSchema = new Schema(
  {
    recipientId: { type: String },
    name: { type: String, default: "Supporter" },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    source: { type: String, default: "MANUAL" },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED", "SKIPPED"],
      default: "PENDING",
    },
    variables: { type: Schema.Types.Mixed, default: {} },
    sentAt: { type: Date },
    errorReason: { type: String },
    messageId: { type: String },
  },
  { _id: true }
);

// ── WhatsApp Campaign Schema ────────────────────────────────────────────────
const WhatsAppCampaignSchema = new Schema<IWhatsAppCampaign & Document>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    provider: {
      type: String,
      enum: ["BAILEYS", "OFFICIAL_API"],
      default: "BAILEYS",
    },
    audienceType: {
      type: String,
      enum: [
        "ALL_DONORS",
        "PAID_DONORS",
        "RECURRING_DONORS",
        "FAILED_PAYMENT_DONORS",
        "VOLUNTEERS",
        "LEADS",
        "CUSTOM_FILE",
      ],
      required: true,
    },
    audienceFilter: {
      campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
      volunteerCategory: {
        type: Schema.Types.ObjectId,
        ref: "VolunteerCategory",
      },
      leadSource: { type: String },
      leadStatus: { type: String },
    },
    messageType: {
      type: String,
      enum: ["TEXT", "IMAGE", "DOCUMENT", "TEMPLATE"],
      default: "TEXT",
    },
    templateId: { type: Schema.Types.ObjectId, ref: "WhatsAppTemplate" },
    messageBody: { type: String, required: true },
    mediaUrl: { type: String, default: "" },
    caption: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "QUEUED",
        "IN_PROGRESS",
        "PAUSED",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
      ],
      default: "DRAFT",
    },
    antiBanConfig: {
      minDelaySeconds: { type: Number, default: 3 },
      maxDelaySeconds: { type: Number, default: 20 },
      maxMessagesIn20Seconds: { type: Number, default: 5 },
      batchSize: { type: Number, default: 50 },
      batchPauseSeconds: { type: Number, default: 45 },
    },
    stats: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    recipients: { type: [RecipientSchema], default: [] },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── WhatsApp Log Schema ─────────────────────────────────────────────────────
const WhatsAppLogSchema = new Schema<IWhatsAppLog & Document>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "WhatsAppCampaign" },
    provider: {
      type: String,
      enum: ["BAILEYS", "OFFICIAL_API"],
      required: true,
    },
    recipientName: { type: String, default: "" },
    recipientPhone: { type: String, required: true },
    messageBody: { type: String, default: "" },
    mediaUrl: { type: String, default: "" },
    status: { type: String, enum: ["SENT", "FAILED"], required: true },
    errorReason: { type: String, default: "" },
    messageId: { type: String, default: "" },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const WhatsAppConfigModel = model<IWhatsAppConfig & Document>(
  "WhatsAppConfig",
  WhatsAppConfigSchema
);
export const WhatsAppTemplateModel = model<IWhatsAppTemplate & Document>(
  "WhatsAppTemplate",
  WhatsAppTemplateSchema
);
export const WhatsAppCampaignModel = model<IWhatsAppCampaign & Document>(
  "WhatsAppCampaign",
  WhatsAppCampaignSchema
);
export const WhatsAppLogModel = model<IWhatsAppLog & Document>(
  "WhatsAppLog",
  WhatsAppLogSchema
);
