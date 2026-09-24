import { Types } from "mongoose";

export type WhatsAppProviderType = "BAILEYS" | "OFFICIAL_API";

export type BaileysConnectionStatus =
  | "DISCONNECTED"
  | "SCAN_QR"
  | "CONNECTING"
  | "CONNECTED";

export type AudienceType =
  | "ALL_DONORS"
  | "PAID_DONORS"
  | "RECURRING_DONORS"
  | "FAILED_PAYMENT_DONORS"
  | "VOLUNTEERS"
  | "LEADS"
  | "CUSTOM_FILE";

export type CampaignStatus =
  | "DRAFT"
  | "QUEUED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type RecipientDeliveryStatus = "PENDING" | "SENT" | "FAILED" | "SKIPPED";

export interface IRecipient {
  _id?: Types.ObjectId;
  recipientId?: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  status: RecipientDeliveryStatus;
  variables?: Record<string, any>;
  sentAt?: Date;
  errorReason?: string;
  messageId?: string;
}

export interface IAntiBanConfig {
  minDelaySeconds: number; // e.g. 3
  maxDelaySeconds: number; // e.g. 20
  maxMessagesIn20Seconds: number; // e.g. 5
  batchSize: number; // e.g. 50
  batchPauseSeconds: number; // e.g. 45
}

export interface IWhatsAppConfig {
  _id?: Types.ObjectId;
  activeProvider: WhatsAppProviderType;
  baileys: {
    sessionName: string;
    status: BaileysConnectionStatus;
    phoneNumber?: string;
    userName?: string;
    platform?: string;
    lastConnectedAt?: Date;
    qrCode?: string; // Base64 data URL
    disconnectReason?: string;
  };
  officialApi: {
    phoneNumberId?: string;
    businessAccountId?: string;
    accessToken?: string;
    apiVersion?: string;
    webhookVerifyToken?: string;
    senderPhoneNumber?: string;
    isConfigured: boolean;
  };
  antiBanDefaults: IAntiBanConfig;
  updatedAt?: Date;
}

export interface IWhatsAppTemplate {
  _id?: Types.ObjectId;
  name: string;
  category: "DONATION" | "VOLUNTEER" | "CAMPAIGN" | "NEWSLETTER" | "GENERAL";
  body: string;
  headerType: "NONE" | "TEXT" | "IMAGE" | "DOCUMENT";
  headerMediaUrl?: string;
  footerText?: string;
  sampleVariables?: Record<string, string>;
  isSystem: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWhatsAppCampaign {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  provider: WhatsAppProviderType;
  audienceType: AudienceType;
  audienceFilter?: {
    campaignId?: Types.ObjectId;
    volunteerCategory?: Types.ObjectId;
    leadSource?: string;
    leadStatus?: string;
  };
  messageType: "TEXT" | "IMAGE" | "DOCUMENT" | "TEMPLATE";
  templateId?: Types.ObjectId;
  messageBody: string;
  mediaUrl?: string;
  caption?: string;
  status: CampaignStatus;
  antiBanConfig: IAntiBanConfig;
  stats: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  recipients: IRecipient[];
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWhatsAppLog {
  _id?: Types.ObjectId;
  campaignId?: Types.ObjectId;
  provider: WhatsAppProviderType;
  recipientName: string;
  recipientPhone: string;
  messageBody: string;
  mediaUrl?: string;
  status: "SENT" | "FAILED";
  errorReason?: string;
  messageId?: string;
  sentAt: Date;
}
