import { z } from "zod";

export const CreateCampaignSchema = z.object({
  name: z.string().min(2, "Campaign name is required"),
  description: z.string().optional(),
  provider: z.enum(["BAILEYS", "OFFICIAL_API"]).default("BAILEYS"),
  audienceType: z.enum([
    "ALL_DONORS",
    "PAID_DONORS",
    "RECURRING_DONORS",
    "FAILED_PAYMENT_DONORS",
    "VOLUNTEERS",
    "LEADS",
    "CUSTOM_FILE",
  ]),
  audienceFilter: z
    .object({
      campaignId: z.string().optional(),
      volunteerCategory: z.string().optional(),
      leadSource: z.string().optional(),
      leadStatus: z.string().optional(),
    })
    .optional(),
  customRecipients: z
    .array(
      z.object({
        name: z.string().optional(),
        phone: z.string(),
        variables: z.record(z.string(), z.any()).optional(),
      })
    )
    .optional(),
  messageType: z.enum(["TEXT", "IMAGE", "DOCUMENT", "TEMPLATE"]).default("TEXT"),
  templateId: z.string().optional(),
  messageBody: z.string().min(1, "Message body is required"),
  mediaUrl: z.string().optional(),
  caption: z.string().optional(),
  scheduleType: z.enum(["now", "later"]).default("now"),
  scheduledAt: z.string().optional(),
  antiBanConfig: z
    .object({
      minDelaySeconds: z.number().min(1).max(60).default(3),
      maxDelaySeconds: z.number().min(1).max(120).default(20),
      maxMessagesIn20Seconds: z.number().min(1).max(20).default(5),
      batchSize: z.number().min(5).max(500).default(50),
      batchPauseSeconds: z.number().min(5).max(300).default(45),
    })
    .optional(),
});

export const CreateTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  category: z.string().default("GENERAL"),
  body: z.string().min(1, "Template body is required"),
  headerType: z.enum(["NONE", "TEXT", "IMAGE", "DOCUMENT"]).default("NONE"),
  headerMediaUrl: z.string().optional().default(""),
  footerText: z.string().optional().default(""),
  sampleVariables: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().default(true),
}).passthrough();

export const UpdateTemplateSchema = CreateTemplateSchema.partial().passthrough();

export const UpdateConfigSchema = z.object({
  activeProvider: z.enum(["BAILEYS", "OFFICIAL_API"]).optional(),
  officialApi: z
    .object({
      phoneNumberId: z.string().optional(),
      businessAccountId: z.string().optional(),
      accessToken: z.string().optional(),
      apiVersion: z.string().optional(),
      webhookVerifyToken: z.string().optional(),
      senderPhoneNumber: z.string().optional(),
    })
    .optional(),
  antiBanDefaults: z
    .object({
      minDelaySeconds: z.number().optional(),
      maxDelaySeconds: z.number().optional(),
      maxMessagesIn20Seconds: z.number().optional(),
      batchSize: z.number().optional(),
      batchPauseSeconds: z.number().optional(),
    })
    .optional(),
});

export const SendTestMessageSchema = z.object({
  provider: z.enum(["BAILEYS", "OFFICIAL_API"]).default("BAILEYS"),
  phone: z.string().min(10, "Valid 10-digit phone number is required"),
  message: z.string().min(1, "Message text is required"),
  mediaUrl: z.string().optional(),
  mediaType: z.enum(["IMAGE", "DOCUMENT"]).optional(),
});
