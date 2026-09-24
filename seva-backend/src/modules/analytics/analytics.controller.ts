import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { trackEntityView } from "./analytics.service";

const recordView = asyncHandler(async (req: Request, res: Response) => {
  const { entityType, entityId } = req.body;
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    req.ip ||
    "127.0.0.1";

  if (!entityType || !entityId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "entityType and entityId are required",
    });
  }

  const result = await trackEntityView(entityType, entityId, ip);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.counted ? "View tracked successfully" : "View within active window",
    data: result,
  });
});

export const AnalyticsController = {
  recordView,
};
