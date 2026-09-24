import crypto from "crypto";
import { ViewLogModel } from "./viewLog.model";
import { CampaignModel } from "../campaigns/campaigns.model";
import { BlogModel } from "../blogs/blogs.model";
import { isValidObjectId } from "mongoose";

export const trackEntityView = async (
  entityType: "campaign" | "blog" | "news" | "event",
  entityIdentifier: string,
  ipAddress: string
): Promise<{ counted: boolean; viewsCount: number }> => {
  if (!entityIdentifier) return { counted: false, viewsCount: 0 };

  const cleanIp = ipAddress || "127.0.0.1";
  const ipHash = crypto.createHash("sha256").update(cleanIp).digest("hex");
  const cleanId = entityIdentifier.trim();

  try {
    const existingLog = await ViewLogModel.findOne({
      entityType,
      entityId: cleanId,
      ipHash,
    });

    if (existingLog) {
      const currentEntity =
        entityType === "campaign"
          ? await CampaignModel.findOne(
              isValidObjectId(cleanId) ? { _id: cleanId } : { slug: cleanId }
            ).select("viewsCount")
          : await BlogModel.findOne(
              isValidObjectId(cleanId) ? { _id: cleanId } : { slug: cleanId }
            ).select("viewsCount");

      return { counted: false, viewsCount: (currentEntity as any)?.viewsCount || 0 };
    }

    // New view from this IP within 3 hours -> record view
    await ViewLogModel.create({
      entityType,
      entityId: cleanId,
      ipHash,
      viewedAt: new Date(),
    });

    let updatedEntity: any = null;
    if (entityType === "campaign") {
      updatedEntity = await CampaignModel.findOneAndUpdate(
        isValidObjectId(cleanId) ? { _id: cleanId } : { slug: cleanId },
        { $inc: { viewsCount: 1 } },
        { new: true }
      ).select("viewsCount");
    } else {
      updatedEntity = await BlogModel.findOneAndUpdate(
        isValidObjectId(cleanId) ? { _id: cleanId } : { slug: cleanId },
        { $inc: { viewsCount: 1 } },
        { new: true }
      ).select("viewsCount");
    }

    return { counted: true, viewsCount: updatedEntity?.viewsCount || 1 };
  } catch (err: any) {
    if (err?.code === 11000) {
      return { counted: false, viewsCount: 0 };
    }
    console.error("View tracking error:", err);
    return { counted: false, viewsCount: 0 };
  }
};
