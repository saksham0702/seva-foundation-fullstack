import { Document, Schema, model } from "mongoose";

export interface IViewLog extends Document {
  entityType: "campaign" | "blog" | "news" | "event";
  entityId: string;
  ipHash: string;
  viewedAt: Date;
}

const ViewLogSchema = new Schema<IViewLog>(
  {
    entityType: {
      type: String,
      enum: ["campaign", "blog", "news", "event"],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    ipHash: {
      type: String,
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      expires: 10800, // 3 hours (10,800 seconds) TTL index
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness within the 3-hour window
ViewLogSchema.index({ entityType: 1, entityId: 1, ipHash: 1 }, { unique: true });

export const ViewLogModel = model<IViewLog>("ViewLog", ViewLogSchema);
