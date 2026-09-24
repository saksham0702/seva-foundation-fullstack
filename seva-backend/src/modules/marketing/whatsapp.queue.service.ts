import { WhatsAppCampaignModel, WhatsAppLogModel } from "./marketing.model";
import { BaileysService } from "./whatsapp.baileys.service";
import { OfficialWhatsAppService } from "./whatsapp.official.service";
import { IAntiBanConfig, IRecipient } from "./marketing.types";

export class WhatsAppQueueService {
  private static activeJobs: Map<string, { paused: boolean; cancelled: boolean }> = new Map();
  private static isProcessing = false;

  /**
   * Helper: Sleep for given milliseconds
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Helper: Replace template variables with recipient data
   */
  public static interpolateMessage(
    template: string,
    recipient: { name?: string; phone: string; variables?: Record<string, any> }
  ): string {
    let result = template;
    const name = recipient.name || "Supporter";
    const phone = recipient.phone || "";
    const amount = recipient.variables?.amount ? `₹${recipient.variables.amount}` : "";
    const campaignName = recipient.variables?.campaign || "Seva Foundation";
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    result = result.replace(/\{\{\s*name\s*\}\}/gi, name);
    result = result.replace(/\{\{\s*phone\s*\}\}/gi, phone);
    result = result.replace(/\{\{\s*amount\s*\}\}/gi, amount);
    result = result.replace(/\{\{\s*campaign\s*\}\}/gi, campaignName);
    result = result.replace(/\{\{\s*date\s*\}\}/gi, dateStr);

    if (recipient.variables) {
      for (const [k, v] of Object.entries(recipient.variables)) {
        const regex = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "gi");
        result = result.replace(regex, String(v));
      }
    }

    return result;
  }

  /**
   * Helper: Generate random jitter delay between min and max seconds
   * e.g. min 3s, max 20s
   */
  private static getRandomDelayMs(minSec: number, maxSec: number): number {
    const min = Math.max(1, minSec);
    const max = Math.max(min, maxSec);
    const randomSec = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomSec * 1000;
  }

  /**
   * Start or resume running a campaign in the background
   */
  public static async startCampaign(campaignId: string): Promise<void> {
    const campaign = await WhatsAppCampaignModel.findById(campaignId);
    if (!campaign) throw new Error("Campaign not found");

    if (campaign.status === "COMPLETED" || campaign.status === "CANCELLED") {
      throw new Error(`Cannot start campaign with status ${campaign.status}`);
    }

    this.activeJobs.set(campaignId, { paused: false, cancelled: false });
    campaign.status = "IN_PROGRESS";
    if (!campaign.startedAt) campaign.startedAt = new Date();
    await campaign.save();

    // Trigger async loop (non-blocking)
    this.processCampaign(campaignId).catch((err) => {
      console.error(`[WhatsAppQueue] Error processing campaign ${campaignId}:`, err);
    });
  }

  /**
   * Pause a running campaign
   */
  public static async pauseCampaign(campaignId: string): Promise<void> {
    const job = this.activeJobs.get(campaignId);
    if (job) {
      job.paused = true;
    }
    await WhatsAppCampaignModel.findByIdAndUpdate(campaignId, {
      status: "PAUSED",
    });
  }

  /**
   * Resume a paused campaign
   */
  public static async resumeCampaign(campaignId: string): Promise<void> {
    const job = this.activeJobs.get(campaignId);
    if (job) {
      job.paused = false;
      await WhatsAppCampaignModel.findByIdAndUpdate(campaignId, {
        status: "IN_PROGRESS",
      });
    } else {
      await this.startCampaign(campaignId);
    }
  }

  /**
   * Cancel a campaign
   */
  public static async cancelCampaign(campaignId: string): Promise<void> {
    const job = this.activeJobs.get(campaignId);
    if (job) {
      job.cancelled = true;
    }
    this.activeJobs.delete(campaignId);
    await WhatsAppCampaignModel.findByIdAndUpdate(campaignId, {
      status: "CANCELLED",
      completedAt: new Date(),
    });
  }

  /**
   * Re-queue only failed recipients for retry
   */
  public static async retryFailedRecipients(campaignId: string): Promise<void> {
    const campaign = await WhatsAppCampaignModel.findById(campaignId);
    if (!campaign) throw new Error("Campaign not found");

    let failedCount = 0;
    campaign.recipients.forEach((r) => {
      if (r.status === "FAILED") {
        r.status = "PENDING";
        r.errorReason = undefined;
        failedCount++;
      }
    });

    if (failedCount === 0) {
      throw new Error("No failed recipients to retry in this campaign");
    }

    campaign.stats.pending += failedCount;
    campaign.stats.failed -= failedCount;
    campaign.status = "QUEUED";
    await campaign.save();

    await this.startCampaign(campaignId);
  }

  /**
   * Background processor loop for a single campaign
   */
  private static async processCampaign(campaignId: string): Promise<void> {
    const campaign = await WhatsAppCampaignModel.findById(campaignId);
    if (!campaign) return;

    const antiBan: IAntiBanConfig = campaign.antiBanConfig || {
      minDelaySeconds: 3,
      maxDelaySeconds: 20,
      maxMessagesIn20Seconds: 5,
      batchSize: 50,
      batchPauseSeconds: 45,
    };

    let sentInCurrentBatch = 0;
    const rollingTimestamps: number[] = [];

    console.log(
      `[WhatsAppQueue] Starting execution for campaign: "${campaign.name}" (${campaign.recipients.length} recipients) via ${campaign.provider}`
    );

    for (let i = 0; i < campaign.recipients.length; i++) {
      const jobState = this.activeJobs.get(campaignId);
      if (!jobState || jobState.cancelled) {
        console.log(`[WhatsAppQueue] Campaign ${campaignId} cancelled.`);
        return;
      }

      // If paused, wait in a gentle loop
      while (jobState.paused) {
        await this.sleep(2000);
        const currentJob = this.activeJobs.get(campaignId);
        if (!currentJob || currentJob.cancelled) return;
      }

      const recipient = campaign.recipients[i];
      if (recipient.status !== "PENDING") {
        continue;
      }

      // Check rolling window: max 5 messages in 20 seconds
      const now = Date.now();
      const windowStart = now - 20000;
      const recentSends = rollingTimestamps.filter((t) => t > windowStart);
      if (recentSends.length >= antiBan.maxMessagesIn20Seconds) {
        const oldestInWindow = recentSends[0];
        const waitTime = Math.max(1000, oldestInWindow + 20000 - now + 500);
        console.log(
          `[WhatsAppQueue] Rate limit reached (5 msgs in 20s). Cooling down for ${Math.round(waitTime / 1000)}s...`
        );
        await this.sleep(waitTime);
      }

      // Prepare interpolated message text
      const finalMessage = this.interpolateMessage(campaign.messageBody, recipient);
      let isSuccess = false;
      let errorReason = "";
      let messageId = "";

      try {
        if (campaign.provider === "BAILEYS") {
          if (campaign.mediaUrl) {
            const mediaType = campaign.messageType === "DOCUMENT" ? "DOCUMENT" : "IMAGE";
            messageId = await BaileysService.sendMediaMessage(
              recipient.phone,
              campaign.mediaUrl,
              finalMessage,
              mediaType
            );
          } else {
            messageId = await BaileysService.sendTextMessage(recipient.phone, finalMessage);
          }
        } else {
          // OFFICIAL_API
          if (campaign.mediaUrl) {
            const mediaType = campaign.messageType === "DOCUMENT" ? "DOCUMENT" : "IMAGE";
            messageId = await OfficialWhatsAppService.sendMediaMessage(
              recipient.phone,
              campaign.mediaUrl,
              finalMessage,
              mediaType
            );
          } else {
            messageId = await OfficialWhatsAppService.sendTextMessage(
              recipient.phone,
              finalMessage
            );
          }
        }

        isSuccess = true;
      } catch (err: any) {
        isSuccess = false;
        errorReason = err.message || "Failed to deliver WhatsApp message";
        console.error(`[WhatsAppQueue] Failed to send to ${recipient.phone}:`, errorReason);
      }

      // Update recipient state
      recipient.status = isSuccess ? "SENT" : "FAILED";
      recipient.sentAt = new Date();
      recipient.messageId = messageId;
      recipient.errorReason = errorReason;

      // Update delivery stats
      if (isSuccess) {
        campaign.stats.sent++;
      } else {
        campaign.stats.failed++;
      }
      campaign.stats.pending = Math.max(0, campaign.stats.pending - 1);

      // Track rolling timestamp & batch count
      rollingTimestamps.push(Date.now());
      if (rollingTimestamps.length > 20) rollingTimestamps.shift();
      sentInCurrentBatch++;

      // Write individual log record for audit
      await WhatsAppLogModel.create({
        campaignId: campaign._id,
        provider: campaign.provider,
        recipientName: recipient.name,
        recipientPhone: recipient.phone,
        messageBody: finalMessage,
        mediaUrl: campaign.mediaUrl,
        status: isSuccess ? "SENT" : "FAILED",
        errorReason: errorReason || undefined,
        messageId: messageId || undefined,
        sentAt: new Date(),
      }).catch((e) => console.error("Error creating log:", e));

      // Periodic save to DB (every 3 recipients or when batch hits)
      if (i % 3 === 0 || i === campaign.recipients.length - 1) {
        await campaign.save();
      }

      // Anti-ban Batch break: after 50 messages, take a cooling break
      if (sentInCurrentBatch >= antiBan.batchSize && i < campaign.recipients.length - 1) {
        console.log(
          `[WhatsAppQueue] Batch limit of ${antiBan.batchSize} reached. Taking cooling break of ${antiBan.batchPauseSeconds}s...`
        );
        sentInCurrentBatch = 0;
        await this.sleep(antiBan.batchPauseSeconds * 1000);
      } else if (i < campaign.recipients.length - 1) {
        // Random Jitter Delay (min 3s, max 20s)
        const delay = this.getRandomDelayMs(
          antiBan.minDelaySeconds,
          antiBan.maxDelaySeconds
        );
        console.log(
          `[WhatsAppQueue] Jitter delay of ${Math.round(delay / 1000)}s before next message...`
        );
        await this.sleep(delay);
      }
    }

    // Mark completion
    campaign.status = campaign.stats.sent > 0 ? "COMPLETED" : "FAILED";
    campaign.completedAt = new Date();
    await campaign.save();
    this.activeJobs.delete(campaignId);

    console.log(
      `[WhatsAppQueue] Campaign "${campaign.name}" finished! Sent: ${campaign.stats.sent}, Failed: ${campaign.stats.failed}`
    );
  }
}
