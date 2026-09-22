import { Document, Types, Schema, model } from "mongoose";
import crypto from "crypto";

export type MailProvider = "SMTP" | "ZOHO" | "GMAIL" | "SES" | "OTHER";

export interface IMailConfig extends Document {
  provider: MailProvider;
  label: string; // e.g. "Zoho - info@sevaindia.org"
  host: string;
  port: number;
  secure: boolean; // true for 465, false for other ports (587 uses STARTTLS)
  authUser: string;
  authPass: string; // stored encrypted, see encrypt/decrypt below
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isActive: boolean; // only one config should be active at a time
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ── Simple AES-256-GCM encryption for the SMTP password at rest ──────────────
// Set MAIL_ENCRYPTION_KEY in your .env (any 32+ char random string).
// If it's missing we fall back to storing plaintext so local/dev setups
// still work, but you should always set this in production.
const ALGO = "aes-256-gcm";

function getKey(): Buffer | null {
  const raw = process.env.MAIL_ENCRYPTION_KEY;
  if (!raw) return null;
  return crypto.createHash("sha256").update(raw).digest(); // normalize to 32 bytes
}

export function encryptPass(plain: string): string {
  const key = getKey();
  if (!key) return plain; // dev fallback — no key configured
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // format: iv:authTag:ciphertext (all hex), prefixed so we can tell it's encrypted
  return `enc:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptPass(stored: string): string {
  if (!stored.startsWith("enc:")) return stored; // plaintext fallback
  const key = getKey();
  if (!key) {
    throw new Error(
      "MAIL_ENCRYPTION_KEY is missing but stored password is encrypted"
    );
  }
  const [, ivHex, tagHex, dataHex] = stored.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

const MailConfigSchema = new Schema<IMailConfig>(
  {
    provider: {
      type: String,
      enum: ["SMTP", "ZOHO", "GMAIL", "SES", "OTHER"],
      default: "SMTP",
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    host: {
      type: String,
      required: true,
      trim: true,
    },
    port: {
      type: Number,
      required: true,
      default: 587,
    },
    secure: {
      type: Boolean,
      default: false,
    },
    authUser: {
      type: String,
      required: true,
      trim: true,
    },
    authPass: {
      type: String,
      required: true,
      set: (v: string) => (v ? encryptPass(v) : v), // encrypt on save automatically
    },
    fromName: {
      type: String,
      required: true,
      default: "Seva India",
    },
    fromEmail: {
      type: String,
      required: true,
      trim: true,
    },
    replyTo: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const MailConfigModel = model<IMailConfig>("MailConfig", MailConfigSchema);