import { Document, Types, Schema, model } from "mongoose";
import { MailTemplateKey } from "./mailtemplates.model";

export type MailLogStatus = "SENT" | "FAILED" | "PENDING";

export interface IMailLog extends Document {
  to: string;
  cc?: string[];
  templateKey: MailTemplateKey;
  subject: string;
  variables: Record<string, unknown>;
  status: MailLogStatus;
  error?: string;
  messageId?: string;
  // Polymorphic-ish reference so you can trace "this mail was for donor X"
  // or "this mail was for volunteer application Y" without a hard ref type.
  relatedToModel?: "Donor" | "User" | "VolunteerApplication" | "Certificate" | "Campaign";
  relatedToId?: Types.ObjectId;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const MailLogSchema = new Schema<IMailLog>(
  {
    to: {
      type: String,
      required: true,
    },
    cc: {
      type: [String],
      default: [],
    },
    templateKey: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    variables: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["SENT", "FAILED", "PENDING"],
      default: "PENDING",
    },
    error: {
      type: String,
    },
    messageId: {
      type: String,
    },
    relatedToModel: {
      type: String,
      enum: ["Donor", "User", "VolunteerApplication", "Certificate", "Campaign"],
    },
    relatedToId: {
      type: Schema.Types.ObjectId,
    },
    attempts: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const MailLogModel = model<IMailLog>("MailLog", MailLogSchema);