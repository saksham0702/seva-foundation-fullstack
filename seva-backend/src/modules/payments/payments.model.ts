import { Document, Schema, model, Types } from "mongoose";

export interface IDonationItem {
  product?: Types.ObjectId;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IDonation extends Document {
  donor: Types.ObjectId;
  campaign: Types.ObjectId;
  amount: number;
  currency?: string;
  quantity: number;
  campaignProduct?: Types.ObjectId;
  items?: IDonationItem[];
  donationType: "MONEY" | "PRODUCT";
  paymentMethod: "ONLINE" | "OFFLINE";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  receiptNumber?: string;
  remarks: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    donor: {
      type: Schema.Types.ObjectId,
      ref: "Donor",
      required: true,
    },

    campaign: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    campaignProduct: {
      type: Schema.Types.ObjectId,
      ref: "CampaignProduct",
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "CampaignProduct",
        },
        name: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    ],

    quantity: {
      type: Number,
      default: 1,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    donationType: {
      type: String,
      enum: ["MONEY", "PRODUCT"],
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      default: "ONLINE",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    transactionId: {
      type: String,
    },

    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },

    razorpaySignature: {
      type: String,
    },

    receiptNumber: {
      type: String,
    },

    remarks: {
      type: String,
      default: "",
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

export const DonationModel = model<IDonation>(
  "Donation",
  DonationSchema
);