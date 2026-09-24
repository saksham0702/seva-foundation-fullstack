import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import pino from "pino";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { WhatsAppConfigModel } from "./marketing.model";
import { BaileysConnectionStatus } from "./marketing.types";

const SESSION_DIR = path.join(process.cwd(), "uploads", "whatsapp-sessions", "default");

export class BaileysService {
  private static socket: WASocket | null = null;
  private static status: BaileysConnectionStatus = "DISCONNECTED";
  private static qrCodeDataUrl: string = "";
  private static isInitializing = false;
  private static retryCount = 0;
  private static maxRetries = 5;

  /**
   * Helper to format phone number to WhatsApp JID
   * Accepts: +919876543210, 919876543210, 9876543210, etc.
   */
  public static formatJid(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (!cleaned) throw new Error("Invalid phone number provided");

    // If 10 digits (Standard Indian mobile), prepend 91
    let formattedNumber = cleaned;
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      formattedNumber = `91${cleaned}`;
    }

    return `${formattedNumber}@s.whatsapp.net`;
  }

  /**
   * Initialize or resume Baileys connection
   */
  public static async initSocket(forceNew = false): Promise<any> {
    if (forceNew) {
      if (this.socket) {
        try {
          this.socket.end(undefined);
        } catch {}
        this.socket = null;
      }
      this.isInitializing = false;
      this.status = "CONNECTING";
      this.qrCodeDataUrl = "";
      if (fs.existsSync(SESSION_DIR)) {
        try {
          fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        } catch (e) {
          console.error("Error clearing session dir:", e);
        }
      }
    }

    if (this.isInitializing && this.socket) {
      return this.getStatus();
    }
    this.isInitializing = true;

    return new Promise<any>(async (resolve) => {
      let resolved = false;
      const safeResolve = async () => {
        if (!resolved) {
          resolved = true;
          resolve(await this.getStatus());
        }
      };

      // Timeout fallback to return current status after 4 seconds
      const timeout = setTimeout(async () => {
        await safeResolve();
      }, 4000);

      try {
        fs.mkdirSync(SESSION_DIR, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
        const { version } = await fetchLatestBaileysVersion().catch(() => ({
          version: [2, 3000, 1015901307] as [number, number, number],
        }));

        const logger = pino({ level: "silent" });

        const sock = makeWASocket({
          version,
          logger,
          auth: state,
          printQRInTerminal: false,
          browser: ["Seva Foundation", "Chrome", "1.0.0"],
          syncFullHistory: false,
          connectTimeoutMs: 60000,
          keepAliveIntervalMs: 25000,
          generateHighQualityLinkPreview: true,
        });

        this.socket = sock;
        this.status = "CONNECTING";
        await this.updateConfigInDB({ status: "CONNECTING" });

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("connection.update", async (update) => {
          const { connection, lastDisconnect, qr } = update;

          if (qr) {
            try {
              this.qrCodeDataUrl = await QRCode.toDataURL(qr);
              this.status = "SCAN_QR";
              await this.updateConfigInDB({
                status: "SCAN_QR",
                qrCode: this.qrCodeDataUrl,
              });
              console.log("[Baileys] Generated QR code for authentication.");
              clearTimeout(timeout);
              await safeResolve();
            } catch (err) {
              console.error("[Baileys] Error generating QR data URL:", err);
            }
          }

          if (connection === "close") {
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            console.log(
              `[Baileys] Connection closed. Status: ${statusCode}, Should Reconnect: ${shouldReconnect}`
            );

            if (statusCode === DisconnectReason.loggedOut) {
              this.status = "DISCONNECTED";
              this.qrCodeDataUrl = "";
              this.socket = null;
              if (fs.existsSync(SESSION_DIR)) {
                try {
                  fs.rmSync(SESSION_DIR, { recursive: true, force: true });
                } catch {}
              }
              await this.updateConfigInDB({
                status: "DISCONNECTED",
                qrCode: "",
                phoneNumber: "",
                userName: "",
                disconnectReason: "Logged out from device",
              });
              clearTimeout(timeout);
              await safeResolve();
            } else if (shouldReconnect) {
              this.status = "CONNECTING";
              await this.updateConfigInDB({
                status: "CONNECTING",
                disconnectReason: "Reconnecting...",
              });

              if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                setTimeout(() => {
                  this.initSocket(false);
                }, 4000);
              } else {
                this.status = "DISCONNECTED";
                this.retryCount = 0;
                await this.updateConfigInDB({
                  status: "DISCONNECTED",
                  disconnectReason: "Max reconnection retries reached",
                });
              }
            }
          } else if (connection === "open") {
            this.status = "CONNECTED";
            this.qrCodeDataUrl = "";
            this.retryCount = 0;

            const userJid = sock.user?.id || "";
            const userPhone = userJid ? userJid.split(":")[0].replace(/\D/g, "") : "";
            const userName = sock.user?.name || "Seva Foundation Admin";

            console.log(`[Baileys] WhatsApp connected successfully as +${userPhone}`);

            await this.updateConfigInDB({
              status: "CONNECTED",
              qrCode: "",
              phoneNumber: userPhone,
              userName,
              platform: "WhatsApp Web Baileys",
              lastConnectedAt: new Date(),
              disconnectReason: "",
            });
            clearTimeout(timeout);
            await safeResolve();
          }
        });
      } catch (error) {
        console.error("[Baileys] Failed to initialize socket:", error);
        this.status = "DISCONNECTED";
        await this.updateConfigInDB({
          status: "DISCONNECTED",
          disconnectReason: (error as Error).message || "Init failed",
        });
        clearTimeout(timeout);
        await safeResolve();
      } finally {
        this.isInitializing = false;
      }
    });
  }

  /**
   * Get current Baileys connection state
   */
  public static async getStatus() {
    const config = await WhatsAppConfigModel.findOne();
    return {
      status: this.status,
      qrCode: this.qrCodeDataUrl || config?.baileys?.qrCode || "",
      phoneNumber: config?.baileys?.phoneNumber || "",
      userName: config?.baileys?.userName || "",
      lastConnectedAt: config?.baileys?.lastConnectedAt,
      disconnectReason: config?.baileys?.disconnectReason || "",
      isConnected: this.status === "CONNECTED" && !!this.socket,
    };
  }

  /**
   * Explicitly disconnect / logout
   */
  public static async disconnect(): Promise<void> {
    try {
      if (this.socket) {
        try {
          await this.socket.logout();
        } catch {}
        try {
          this.socket.end(undefined);
        } catch {}
        this.socket = null;
      }
      this.status = "DISCONNECTED";
      this.qrCodeDataUrl = "";

      if (fs.existsSync(SESSION_DIR)) {
        try {
          fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        } catch {}
      }

      await this.updateConfigInDB({
        status: "DISCONNECTED",
        qrCode: "",
        phoneNumber: "",
        userName: "",
        disconnectReason: "Manually disconnected by admin",
      });
    } catch (err) {
      console.error("[Baileys] Error during disconnect:", err);
    }
  }

  /**
   * Send single text message
   */
  public static async sendTextMessage(toPhone: string, text: string): Promise<string> {
    if (this.status !== "CONNECTED" || !this.socket) {
      throw new Error("WhatsApp Web (Baileys) is not connected. Please scan the QR code first.");
    }

    const jid = this.formatJid(toPhone);
    const sent = await this.socket.sendMessage(jid, { text });
    return sent?.key?.id || "BAILEYS_MSG_" + Date.now();
  }

  /**
   * Send media message (Image or Document) with caption
   */
  public static async sendMediaMessage(
    toPhone: string,
    mediaUrl: string,
    caption?: string,
    mediaType: "IMAGE" | "DOCUMENT" = "IMAGE"
  ): Promise<string> {
    if (this.status !== "CONNECTED" || !this.socket) {
      throw new Error("WhatsApp Web (Baileys) is not connected. Please scan the QR code first.");
    }

    const jid = this.formatJid(toPhone);

    // Resolve local upload path or external URL
    let resolvedUrl = mediaUrl;
    if (mediaUrl.startsWith("/uploads") || mediaUrl.startsWith("uploads/")) {
      const cleanPath = mediaUrl.replace(/^\/?/, "");
      resolvedUrl = path.join(process.cwd(), cleanPath);
    }

    let messagePayload: any = {};

    if (mediaType === "IMAGE") {
      if (resolvedUrl.startsWith("http://") || resolvedUrl.startsWith("https://")) {
        messagePayload = {
          image: { url: resolvedUrl },
          caption: caption || "",
        };
      } else if (fs.existsSync(resolvedUrl)) {
        const buffer = fs.readFileSync(resolvedUrl);
        messagePayload = {
          image: buffer,
          caption: caption || "",
        };
      } else {
        throw new Error(`Media file not found at: ${resolvedUrl}`);
      }
    } else {
      // Document
      const fileName = path.basename(resolvedUrl) || "document.pdf";
      if (resolvedUrl.startsWith("http://") || resolvedUrl.startsWith("https://")) {
        messagePayload = {
          document: { url: resolvedUrl },
          fileName,
          caption: caption || "",
        };
      } else if (fs.existsSync(resolvedUrl)) {
        const buffer = fs.readFileSync(resolvedUrl);
        messagePayload = {
          document: buffer,
          fileName,
          caption: caption || "",
        };
      } else {
        throw new Error(`Document file not found at: ${resolvedUrl}`);
      }
    }

    const sent = await this.socket.sendMessage(jid, messagePayload);
    return sent?.key?.id || "BAILEYS_MEDIA_" + Date.now();
  }

  /**
   * Sync connection status to DB
   */
  private static async updateConfigInDB(partialBaileys: Partial<any>): Promise<void> {
    try {
      const config = await WhatsAppConfigModel.findOne();
      if (!config) {
        await WhatsAppConfigModel.create({
          activeProvider: "BAILEYS",
          baileys: partialBaileys,
        });
      } else {
        config.baileys = { ...config.baileys, ...partialBaileys };
        await config.save();
      }
    } catch (err) {
      console.error("[Baileys] Error updating DB status:", err);
    }
  }
}
