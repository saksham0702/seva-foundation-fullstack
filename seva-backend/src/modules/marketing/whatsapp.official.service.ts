import axios from "axios";
import { WhatsAppConfigModel } from "./marketing.model";

export class OfficialWhatsAppService {
  /**
   * Format phone number for Meta Cloud API (e.g. 919876543210 without +)
   */
  public static formatRecipientNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (!cleaned) throw new Error("Invalid phone number provided");

    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return `91${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Get configured Official API credentials from DB
   */
  public static async getCredentials() {
    const config = await WhatsAppConfigModel.findOne();
    const off = config?.officialApi;

    if (!off?.accessToken || !off?.phoneNumberId) {
      throw new Error(
        "WhatsApp Official Cloud API is not configured. Please set Phone Number ID and Access Token."
      );
    }

    return {
      phoneNumberId: off.phoneNumberId,
      accessToken: off.accessToken,
      apiVersion: off.apiVersion || "v20.0",
      businessAccountId: off.businessAccountId || "",
    };
  }

  /**
   * Send single text message via Meta Cloud API
   */
  public static async sendTextMessage(toPhone: string, text: string): Promise<string> {
    const creds = await this.getCredentials();
    const recipient = this.formatRecipientNumber(toPhone);

    const url = `https://graph.facebook.com/${creds.apiVersion}/${creds.phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: {
        preview_url: false,
        body: text,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const messageId = response.data?.messages?.[0]?.id || "OFFICIAL_MSG_" + Date.now();
    return messageId;
  }

  /**
   * Send media message (Image or Document)
   */
  public static async sendMediaMessage(
    toPhone: string,
    mediaUrl: string,
    caption?: string,
    mediaType: "IMAGE" | "DOCUMENT" = "IMAGE"
  ): Promise<string> {
    const creds = await this.getCredentials();
    const recipient = this.formatRecipientNumber(toPhone);

    const url = `https://graph.facebook.com/${creds.apiVersion}/${creds.phoneNumberId}/messages`;

    // Make sure media URL is public HTTP/HTTPS for Meta API
    let publicUrl = mediaUrl;
    if (publicUrl.startsWith("/uploads")) {
      const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
      publicUrl = `${backendUrl.replace(/\/$/, "")}${publicUrl}`;
    }

    const payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
    };

    if (mediaType === "IMAGE") {
      payload.type = "image";
      payload.image = {
        link: publicUrl,
        caption: caption || "",
      };
    } else {
      payload.type = "document";
      payload.document = {
        link: publicUrl,
        caption: caption || "",
      };
    }

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const messageId = response.data?.messages?.[0]?.id || "OFFICIAL_MEDIA_" + Date.now();
    return messageId;
  }

  /**
   * Test Official API credentials with a quick check
   */
  public static async testCredentials(credsOverride?: {
    phoneNumberId: string;
    accessToken: string;
    apiVersion?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      let phoneNumberId = credsOverride?.phoneNumberId;
      let accessToken = credsOverride?.accessToken;
      let apiVersion = credsOverride?.apiVersion || "v20.0";

      if (!phoneNumberId || !accessToken) {
        const creds = await this.getCredentials();
        phoneNumberId = creds.phoneNumberId;
        accessToken = creds.accessToken;
        apiVersion = creds.apiVersion;
      }

      const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (err: any) {
      return {
        success: false,
        error:
          err?.response?.data?.error?.message ||
          err.message ||
          "Failed to verify WhatsApp Cloud API credentials",
      };
    }
  }
}
