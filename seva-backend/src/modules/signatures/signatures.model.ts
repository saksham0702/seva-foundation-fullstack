import { Document, Schema, model, Types } from "mongoose";

export type SignatureType = "PRESIDENT" | "SECRETARY" | "SEAL";

export interface ISignature extends Document {
  type: SignatureType;
  label: string;
  signatoryName?: string;
  imageUrl: string;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SignatureSchema = new Schema<ISignature>(
  {
    type: {
      type: String,
      enum: ["PRESIDENT", "SECRETARY", "SEAL"],
      required: true,
    },
    label: { type: String, required: true },
    signatoryName: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SignatureModel = model<ISignature>("Signature", SignatureSchema);