import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { MailLogService } from "./maillogs.service";
import { MailerService } from "./mailer.service";

const getAllMailLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await MailLogService.getAllMailLogs({
    status: req.query.status as any,
    templateKey: req.query.templateKey as string | undefined,
    search: req.query.search as string | undefined,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mail logs fetched successfully",
    data: result,
  });
});

const getMailLogById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await MailLogService.getMailLogById(id);
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Mail log not found",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mail log fetched successfully",
    data: result,
  });
});

const resendMailLog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const result = await MailerService.resendFromLog(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Mail resent successfully",
      data: result,
    });
  } catch (err: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: err.message || "Failed to resend mail",
    });
  }
});

export const MailLogController = {
  getAllMailLogs,
  getMailLogById,
  resendMailLog,
};