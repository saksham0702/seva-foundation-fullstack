import { Document, Schema, model, Types } from "mongoose";

export type RecipientType = "DONOR" | "VOLUNTEER" | "BENEFICIARY" | "INTERN" | "STAFF" | "OTHER";

export type CertificateType =
  | "APPRECIATION"
  | "COMPLETION"
  | "PARTICIPATION"
  | "DONATION_ACKNOWLEDGEMENT"
  | "TRAINING"
  | "OTHER";

export type CertificateStatus = "ACTIVE" | "REVOKED";

interface ISignatureSnapshot {
  label: string;
  signatoryName?: string;
  imageUrl: string;
}

export interface ICertificate extends Document {
  certificateNo: string;
  recipientType: RecipientType;
  recipientModel?: "Donor" | "User" | "Beneficiary";
  recipientRef?: Types.ObjectId;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  campaign?: Types.ObjectId;
  donor?: Types.ObjectId;
  certificateType: CertificateType;
  designTheme: string;
  programName: string;
  projectName?: string;
  duration?: string;
  issueDate: Date;
  body: string;
  verifyUrl: string;
  qrCodeImage?: string;
  pdfUrl?: string;
  signatures: {
    president?: ISignatureSnapshot;
    secretary?: ISignatureSnapshot;
    seal?: { imageUrl: string };
  };
  status: CertificateStatus;
  revokedReason?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SignatureSnapshotSchema = new Schema<ISignatureSnapshot>(
  {
    label: { type: String, required: true },
    signatoryName: { type: String },
    imageUrl: { type: String, required: true },
  },
  { _id: false }
);

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateNo: { type: String, required: true, unique: true, index: true },
    recipientType: {
      type: String,
      enum: ["DONOR", "VOLUNTEER", "BENEFICIARY", "INTERN", "STAFF", "OTHER"],
      required: true,
    },
    recipientModel: { type: String, enum: ["Donor", "User", "Beneficiary"] },
    recipientRef: { type: Schema.Types.ObjectId, refPath: "recipientModel" },
    recipientName: { type: String, required: true, trim: true },
    recipientEmail: { type: String, trim: true, lowercase: true },
    recipientPhone: { type: String, trim: true },
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign" },
    donor: { type: Schema.Types.ObjectId, ref: "Donor" },
    certificateType: {
      type: String,
      enum: ["APPRECIATION", "COMPLETION", "PARTICIPATION", "DONATION_ACKNOWLEDGEMENT", "TRAINING", "OTHER"],
      default: "APPRECIATION",
    },
    designTheme: { type: String, default: "Premium Blue" },
    programName: { type: String, required: true },
    projectName: { type: String },
    duration: { type: String },
    issueDate: { type: Date, default: Date.now },
    body: { type: String, required: true },
    verifyUrl: { type: String, required: true },
    qrCodeImage: { type: String },
    pdfUrl: { type: String },
    signatures: {
      president: SignatureSnapshotSchema,
      secretary: SignatureSnapshotSchema,
      seal: { type: new Schema({ imageUrl: { type: String, required: true } }, { _id: false }) },
    },
    status: { type: String, enum: ["ACTIVE", "REVOKED"], default: "ACTIVE" },
    revokedReason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CertificateSchema.index({ recipientName: "text", certificateNo: "text" });

export const CertificateModel = model<ICertificate>("Certificate", CertificateSchema);