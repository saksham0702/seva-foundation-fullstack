import {Document , Types , Schema , model} from "mongoose";

export interface ICampaign extends Document {
  name: string;
  slug: string;
  images: string[];
  description: string;
  content: string;
  location: string;
  category: Types.ObjectId;
  status: "active" | "draft" | "completed" | "paused";
  goal: number;
  raisedAmount: number;
  donorCount: number;
  startDate?: Date;
  endDate?: Date;
  urgent?: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      default: "India",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "draft", "completed", "paused"],
      default: "active",
    },
    goal: {
      type: Number,
      default: 0,
    },
    raisedAmount: {
      type: Number,
      default: 0,
    },
    donorCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    urgent: {
      type: Boolean,
      default: false,
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

export const CampaignModel = model<ICampaign>("Campaign", CampaignSchema);
