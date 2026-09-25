import * as XLSX from "xlsx";
import {
  WhatsAppConfigModel,
  WhatsAppTemplateModel,
  WhatsAppCampaignModel,
  WhatsAppLogModel,
} from "./marketing.model";
import { DonorModel } from "../donors/donors.model";
import { VolunteerApplicationModel } from "../volunteer/volunteerapplications.model";
import { LeadModel } from "../leads/leads.model";
import { BaileysService } from "./whatsapp.baileys.service";
import { OfficialWhatsAppService } from "./whatsapp.official.service";
import { WhatsAppQueueService } from "./whatsapp.queue.service";
import {
  AudienceType,
  IRecipient,
  WhatsAppProviderType,
} from "./marketing.types";

export class MarketingService {
  // ── 1. Audience Resolution & Counts ─────────────────────────────────────────

  /**
   * Helper to clean phone numbers and ensure valid digits
   */
  private static cleanPhone(phone?: string): string {
    if (!phone) return "";
    let digits = phone.replace(/\D/g, "");
    if (!digits) return "";
    // If it's 10 digits (e.g. 9876543210), automatically add India country code '91'
    if (digits.length === 10) {
      digits = `91${digits}`;
    } else if (digits.length === 11 && digits.startsWith("0")) {
      digits = `91${digits.substring(1)}`;
    }
    if (digits.length < 10) return "";
    return digits;
  }

  /**
   * Query database to resolve list of recipients for campaign
   */
  public static async resolveAudienceRecipients(
    audienceType: AudienceType,
    audienceFilter?: any,
    customRecipients?: Array<{ name: string; phone: string; variables?: any }>
  ): Promise<IRecipient[]> {
    const recipientsMap = new Map<string, IRecipient>();

    const addRecipient = (
      name: string,
      phone: string,
      source: string,
      email?: string,
      variables?: any
    ) => {
      const clean = this.cleanPhone(phone);
      if (!clean) return;
      if (!recipientsMap.has(clean)) {
        recipientsMap.set(clean, {
          name: name?.trim() || "Supporter",
          phone: clean,
          email: email?.trim() || "",
          source,
          status: "PENDING",
          variables: variables || {},
        });
      }
    };

    if (audienceType === "CUSTOM_FILE" && Array.isArray(customRecipients)) {
      for (const item of customRecipients) {
        addRecipient(
          item.name || "Supporter",
          item.phone,
          "CUSTOM_FILE",
          undefined,
          item.variables
        );
      }
      return Array.from(recipientsMap.values());
    }

    if (audienceType === "ALL_DONORS") {
      const donors = await DonorModel.find({
        isDeleted: false,
        phone: { $exists: true, $ne: "" },
      }).select("name phone email status frequency initiative tribute");
      for (const d of donors) {
        addRecipient(d.name || "Donor", d.phone || "", "DONOR", d.email, {
          frequency: d.frequency,
          status: d.status,
          initiative: d.initiative,
        });
      }
    } else if (audienceType === "PAID_DONORS") {
      const donors = await DonorModel.find({
        isDeleted: false,
        status: "PAID",
        phone: { $exists: true, $ne: "" },
      }).select("name phone email frequency initiative");
      for (const d of donors) {
        addRecipient(d.name || "Donor", d.phone || "", "PAID_DONOR", d.email, {
          frequency: d.frequency,
          initiative: d.initiative,
        });
      }
    } else if (audienceType === "RECURRING_DONORS") {
      const donors = await DonorModel.find({
        isDeleted: false,
        frequency: "MONTHLY",
        phone: { $exists: true, $ne: "" },
      }).select("name phone email status initiative");
      for (const d of donors) {
        addRecipient(d.name || "Donor", d.phone || "", "RECURRING_DONOR", d.email, {
          frequency: "MONTHLY",
        });
      }
    } else if (audienceType === "FAILED_PAYMENT_DONORS") {
      const donors = await DonorModel.find({
        isDeleted: false,
        status: { $in: ["PAYMENT_FAILED", "FILLED_NOT_PAID"] },
        phone: { $exists: true, $ne: "" },
      }).select("name phone email status initiative");
      for (const d of donors) {
        addRecipient(d.name || "Donor", d.phone || "", "FAILED_DONOR", d.email, {
          status: d.status,
        });
      }
    } else if (audienceType === "VOLUNTEERS") {
      const query: any = {
        isDeleted: false,
        phone: { $exists: true, $ne: "" },
      };
      if (audienceFilter?.volunteerCategory) {
        query.category = audienceFilter.volunteerCategory;
      }
      const volunteers = await VolunteerApplicationModel.find(query).select(
        "name phone email city availability status"
      );
      for (const v of volunteers) {
        addRecipient(v.name || "Volunteer", v.phone || "", "VOLUNTEER", v.email, {
          city: v.city,
          status: v.status,
        });
      }
    } else if (audienceType === "LEADS") {
      const query: any = {
        isDeleted: false,
        phone: { $exists: true, $ne: "" },
      };
      if (audienceFilter?.leadSource) {
        query.source = audienceFilter.leadSource;
      }
      if (audienceFilter?.leadStatus) {
        query.status = audienceFilter.leadStatus;
      }
      const leads = await LeadModel.find(query).select(
        "name phone email source status amount"
      );
      for (const l of leads) {
        addRecipient(l.name || "Lead", l.phone || "", "LEAD", l.email, {
          source: l.source,
          status: l.status,
          amount: l.amount,
        });
      }
    }

    return Array.from(recipientsMap.values());
  }

  /**
   * Get estimated counts for all audience segments
   */
  public static async getAudienceCounts(): Promise<Record<string, number>> {
    const [
      allDonors,
      paidDonors,
      recurringDonors,
      failedDonors,
      volunteers,
      leads,
    ] = await Promise.all([
      DonorModel.countDocuments({
        isDeleted: false,
        phone: { $exists: true, $ne: "" },
      }),
      DonorModel.countDocuments({
        isDeleted: false,
        status: "PAID",
        phone: { $exists: true, $ne: "" },
      }),
      DonorModel.countDocuments({
        isDeleted: false,
        frequency: "MONTHLY",
        phone: { $exists: true, $ne: "" },
      }),
      DonorModel.countDocuments({
        isDeleted: false,
        status: { $in: ["PAYMENT_FAILED", "FILLED_NOT_PAID"] },
        phone: { $exists: true, $ne: "" },
      }),
      VolunteerApplicationModel.countDocuments({
        isDeleted: false,
        phone: { $exists: true, $ne: "" },
      }),
      LeadModel.countDocuments({
        isDeleted: false,
        phone: { $exists: true, $ne: "" },
      }),
    ]);

    return {
      ALL_DONORS: allDonors,
      PAID_DONORS: paidDonors,
      RECURRING_DONORS: recurringDonors,
      FAILED_PAYMENT_DONORS: failedDonors,
      VOLUNTEERS: volunteers,
      LEADS: leads,
    };
  }

  // ── 2. Excel / CSV Parsing & Sample Export ──────────────────────────────────

  /**
   * Parse uploaded Excel or CSV buffer
   */
  public static parseExcelOrCsv(buffer: Buffer): {
    validRecipients: Array<{ name: string; phone: string; variables: any }>;
    totalRows: number;
    invalidCount: number;
  } {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

    const validRecipients: Array<{ name: string; phone: string; variables: any }> = [];
    let invalidCount = 0;
    const seen = new Set<string>();

    for (const row of rawData) {
      // Look for flexible column names
      const name =
        row.Name ||
        row.name ||
        row["Full Name"] ||
        row["full name"] ||
        row.Person ||
        "Supporter";

      const rawPhone =
        row.Phone ||
        row.phone ||
        row.Mobile ||
        row.mobile ||
        row["Phone Number"] ||
        row["phone number"] ||
        row["WhatsApp"] ||
        row["whatsapp"] ||
        row.Contact ||
        "";

      const cleanPhone = this.cleanPhone(String(rawPhone));
      if (!cleanPhone || seen.has(cleanPhone)) {
        invalidCount++;
        continue;
      }

      seen.add(cleanPhone);

      // Collect any other columns as variables
      const variables: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        const lowerK = k.toLowerCase();
        if (
          !lowerK.includes("phone") &&
          !lowerK.includes("mobile") &&
          !lowerK.includes("whatsapp") &&
          !lowerK.includes("name")
        ) {
          variables[k] = v;
        }
      }

      validRecipients.push({
        name: String(name).trim(),
        phone: cleanPhone,
        variables,
      });
    }

    return {
      validRecipients,
      totalRows: rawData.length,
      invalidCount,
    };
  }

  /**
   * Generate downloadable sample Excel template buffer
   */
  public static generateSampleExcelBuffer(): Buffer {
    const sampleData = [
      {
        Name: "Saksham Sharma",
        "Mobile Number": "+919876543210",
      },
      {
        Name: "Priya Verma",
        "Mobile Number": "+919123456789",
      },
      {
        Name: "Amitabh Sen",
        "Mobile Number": "+919988776655",
      },
      {
        Name: "Rohan Gupta",
        "Mobile Number": "9811223344",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet["!cols"] = [{ wch: 25 }, { wch: 20 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recipients");
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  }

  // ── 3. Campaign CRUD & Execution ───────────────────────────────────────────

  public static async createCampaign(data: any, userId?: string) {
    const recipients = await this.resolveAudienceRecipients(
      data.audienceType,
      data.audienceFilter,
      data.customRecipients
    );

    if (recipients.length === 0) {
      throw new Error(
        "No valid recipients with phone numbers found for the selected audience."
      );
    }

    const campaign = await WhatsAppCampaignModel.create({
      ...data,
      recipients,
      stats: {
        total: recipients.length,
        sent: 0,
        failed: 0,
        pending: recipients.length,
      },
      status: data.scheduleType === "now" || !data.scheduledAt ? "QUEUED" : "DRAFT",
      createdBy: userId,
    });

    // If immediate execution requested, trigger queue
    if (data.scheduleType === "now" || !data.scheduledAt) {
      WhatsAppQueueService.startCampaign(campaign._id.toString()).catch((err) => {
        console.error("Failed to auto-start campaign queue:", err);
      });
    }

    return campaign;
  }

  public static async getAllCampaigns(query: any = {}) {
    const filter: any = { isDeleted: false };
    if (query.status && query.status !== "ALL") {
      filter.status = query.status.toUpperCase();
    }
    if (query.provider && query.provider !== "ALL") {
      filter.provider = query.provider.toUpperCase();
    }
    if (query.search) {
      filter.name = { $regex: query.search, $options: "i" };
    }

    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "10", 10);
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      WhatsAppCampaignModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-recipients"),
      WhatsAppCampaignModel.countDocuments(filter),
    ]);

    return {
      campaigns,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public static async getCampaignById(id: string) {
    const campaign = await WhatsAppCampaignModel.findOne({
      _id: id,
      isDeleted: false,
    });
    return campaign;
  }

  public static async deleteCampaign(id: string) {
    await WhatsAppCampaignModel.findByIdAndUpdate(id, { isDeleted: true });
  }

  public static async startCampaign(id: string) {
    await WhatsAppQueueService.startCampaign(id);
    return await WhatsAppCampaignModel.findById(id);
  }

  public static async pauseCampaign(id: string) {
    await WhatsAppQueueService.pauseCampaign(id);
    return await WhatsAppCampaignModel.findById(id);
  }

  public static async resumeCampaign(id: string) {
    await WhatsAppQueueService.resumeCampaign(id);
    return await WhatsAppCampaignModel.findById(id);
  }

  public static async retryFailedRecipients(id: string) {
    await WhatsAppQueueService.retryFailedRecipients(id);
    return await WhatsAppCampaignModel.findById(id);
  }

  // ── 4. Templates CRUD ──────────────────────────────────────────────────────

  public static async getAllTemplates() {
    let result = await WhatsAppTemplateModel.find().sort({ createdAt: -1 });
    if (result.length === 0) {
      try {
        const { seedWhatsAppDefaults } = await import("./whatsapp.seed");
        await seedWhatsAppDefaults();
        result = await WhatsAppTemplateModel.find().sort({ createdAt: -1 });
      } catch (e) {
        console.error("[MarketingService] Auto-seed WhatsApp templates failed:", e);
      }
    }
    return result;
  }

  public static async getTemplateById(id: string) {
    return await WhatsAppTemplateModel.findById(id);
  }

  public static async createTemplate(data: any) {
    return await WhatsAppTemplateModel.create(data);
  }

  public static async updateTemplate(id: string, data: any) {
    return await WhatsAppTemplateModel.findByIdAndUpdate(id, data, { new: true });
  }

  public static async deleteTemplate(id: string) {
    return await WhatsAppTemplateModel.findByIdAndDelete(id);
  }

  // ── 5. WhatsApp Settings & Configurations ─────────────────────────────────

  public static async getConfig() {
    let config = await WhatsAppConfigModel.findOne();
    if (!config) {
      config = await WhatsAppConfigModel.create({
        activeProvider: "BAILEYS",
      });
    }

    const baileysStatus = await BaileysService.getStatus();
    return {
      config,
      baileysLive: baileysStatus,
    };
  }

  public static async updateConfig(data: any) {
    let config = await WhatsAppConfigModel.findOne();
    if (!config) {
      config = new WhatsAppConfigModel(data);
    } else {
      if (data.activeProvider) config.activeProvider = data.activeProvider;
      if (data.officialApi) {
        config.officialApi = {
          ...config.officialApi,
          ...data.officialApi,
          isConfigured: !!(
            data.officialApi.accessToken && data.officialApi.phoneNumberId
          ),
        };
      }
      if (data.antiBanDefaults) {
        config.antiBanDefaults = {
          ...config.antiBanDefaults,
          ...data.antiBanDefaults,
        };
      }
    }
    await config.save();
    return config;
  }

  public static async reconnectBaileys() {
    await BaileysService.initSocket(true);
    return await BaileysService.getStatus();
  }

  public static async disconnectBaileys() {
    await BaileysService.disconnect();
    return await BaileysService.getStatus();
  }

  public static async testOfficialApi(creds?: any) {
    return await OfficialWhatsAppService.testCredentials(creds);
  }

  // ── 6. Direct / Test Single Message ────────────────────────────────────────

  public static async sendTestMessage(params: {
    provider: WhatsAppProviderType;
    phone: string;
    message: string;
    mediaUrl?: string;
    mediaType?: "IMAGE" | "DOCUMENT";
  }) {
    const { provider, phone, message, mediaUrl, mediaType } = params;

    let messageId = "";
    if (provider === "BAILEYS") {
      if (mediaUrl) {
        messageId = await BaileysService.sendMediaMessage(
          phone,
          mediaUrl,
          message,
          mediaType || "IMAGE"
        );
      } else {
        messageId = await BaileysService.sendTextMessage(phone, message);
      }
    } else {
      if (mediaUrl) {
        messageId = await OfficialWhatsAppService.sendMediaMessage(
          phone,
          mediaUrl,
          message,
          mediaType || "IMAGE"
        );
      } else {
        messageId = await OfficialWhatsAppService.sendTextMessage(phone, message);
      }
    }

    // Write log
    await WhatsAppLogModel.create({
      provider,
      recipientName: "Test Recipient",
      recipientPhone: phone,
      messageBody: message,
      mediaUrl,
      status: "SENT",
      messageId,
      sentAt: new Date(),
    });

    return { success: true, messageId };
  }

  // ── 7. Delivery Logs & Stats ───────────────────────────────────────────────

  public static async getLogs(query: any = {}) {
    const filter: any = {};
    if (query.campaignId) filter.campaignId = query.campaignId;
    if (query.status) filter.status = query.status.toUpperCase();
    if (query.search) {
      filter.$or = [
        { recipientPhone: { $regex: query.search, $options: "i" } },
        { recipientName: { $regex: query.search, $options: "i" } },
      ];
    }

    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "50", 10);
    const skip = (page - 1) * limit;

    // Get IDs of deleted campaigns to exclude their logs
    const deletedCampaignIds = await WhatsAppCampaignModel.distinct("_id", {
      isDeleted: true,
    });
    if (deletedCampaignIds.length > 0) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { campaignId: { $exists: false } },
          { campaignId: null },
          { campaignId: { $nin: deletedCampaignIds } },
        ],
      });
    }

    const [logs, total] = await Promise.all([
      WhatsAppLogModel.find(filter)
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "campaignId",
          select: "name isDeleted",
          match: { isDeleted: false },
        }),
      WhatsAppLogModel.countDocuments(filter),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  public static async getOverallStats() {
    const [totalCampaigns, completedCampaigns, totalLogsSent, totalLogsFailed] =
      await Promise.all([
        WhatsAppCampaignModel.countDocuments({ isDeleted: false }),
        WhatsAppCampaignModel.countDocuments({
          isDeleted: false,
          status: "COMPLETED",
        }),
        WhatsAppLogModel.countDocuments({ status: "SENT" }),
        WhatsAppLogModel.countDocuments({ status: "FAILED" }),
      ]);

    const totalDelivered = totalLogsSent;
    const totalAttempted = totalLogsSent + totalLogsFailed;
    const successRate =
      totalAttempted > 0 ? Math.round((totalDelivered / totalAttempted) * 100) : 100;

    return {
      totalCampaigns,
      completedCampaigns,
      totalMessagesSent: totalLogsSent,
      totalMessagesFailed: totalLogsFailed,
      successRate,
    };
  }
}
