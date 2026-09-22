import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { MailConfigService } from "./mailconfig.service";
import { invalidateTransporterCache } from "./mailer.service";

/** Never send authPass (even encrypted) back to the client. */
const sanitize = (config: any) => {
  if (!config) return config;
  const obj = config.toObject ? config.toObject() : config;
  const { authPass, ...safe } = obj;
  return safe;
};

const createMailConfig = asyncHandler(async (req: Request, res: Response) => {
  const result = await MailConfigService.createMailConfig(req.body);
  if (result.isActive) invalidateTransporterCache();
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Mail configuration created successfully",
    data: sanitize(result),
  });
});

const getAllMailConfigs = asyncHandler(async (_req: Request, res: Response) => {
  const result = await MailConfigService.getAllMailConfigs();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mail configurations fetched successfully",
    data: result.map(sanitize),
  });
});

const getMailConfigById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await MailConfigService.getMailConfigById(id);
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Mail configuration not found",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mail configuration fetched successfully",
    data: sanitize(result),
  });
});

const updateMailConfig = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  // if authPass field is empty string, don't overwrite the existing one
  if (req.body.authPass === "") delete req.body.authPass;
  const result = await MailConfigService.updateMailConfig(id, req.body);
  invalidateTransporterCache();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mail configuration updated successfully",
    data: sanitize(result),
  });
});

const setActiveMailConfig = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await MailConfigService.setActiveMailConfig(id);
  invalidateTransporterCache();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mail configuration set as active",
    data: sanitize(result),
  });
});

const deleteMailConfig = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await MailConfigService.deleteMailConfig(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mail configuration deleted successfully",
    data: null,
  });
});

const sendTestMail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { toEmail } = req.body as { toEmail: string };

  try {
    const result = await MailConfigService.sendTestMail(id, toEmail);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Test email sent successfully to ${toEmail}`,
      data: result,
    });
  } catch (err: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: err.message || "Failed to send test email. Check your SMTP settings.",
    });
  }
});

export const MailConfigController = {
  createMailConfig,
  getAllMailConfigs,
  getMailConfigById,
  updateMailConfig,
  setActiveMailConfig,
  deleteMailConfig,
  sendTestMail,
};