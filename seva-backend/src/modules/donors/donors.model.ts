import { Document, Schema, model, Types } from "mongoose";

export interface IDonor extends Document {
  campaign?: Types.ObjectId;
  targetType?: "CAMPAIGN" | "INITIATIVE" | "GENERAL";
  initiative?: string;
  frequency?: "ONE_TIME" | "MONTHLY";
  tribute?: string;
  message?: string;
  name?: string;
  email?: string;
  phone?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isAnonymous?: boolean;
  status: "FILLED_NOT_PAID" | "PAYMENT_FAILED" | "PAID";
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DonorSchema = new Schema<IDonor>(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: false,
    },

    targetType: {
      type: String,
      enum: ["CAMPAIGN", "INITIATIVE", "GENERAL"],
      default: "CAMPAIGN",
    },

    initiative: {
      type: String,
      trim: true,
    },

    frequency: {
      type: String,
      enum: ["ONE_TIME", "MONTHLY"],
      default: "ONE_TIME",
    },

    tribute: {
      type: String,
      default: "No Tribute",
    },

    message: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    pan: {
      type: String,
      uppercase: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["FILLED_NOT_PAID", "PAYMENT_FAILED", "PAID"],
      default: "FILLED_NOT_PAID",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const DonorModel = model<IDonor>("Donor", DonorSchema);