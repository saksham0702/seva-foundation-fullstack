import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { MarketingService } from "./marketing.service";
import { seedWhatsAppDefaults } from "./whatsapp.seed";
import {
  CreateCampaignSchema,
  CreateTemplateSchema,
  UpdateTemplateSchema,
  UpdateConfigSchema,
  SendTestMessageSchema,
} from "./marketing.validation";

// ── Overall Stats ─────────────────────────────────────────────────────────────
const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await MarketingService.getOverallStats();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Marketing stats fetched successfully",
    data,
  });
});

// ── Audience Counts ──────────────────────────────────────────────────────────
const getAudienceCounts = asyncHandler(async (_req: Request, res: Response) => {
  const data = await MarketingService.getAudienceCounts();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Audience counts fetched successfully",
    data,
  });
});

// ── Campaigns ────────────────────────────────────────────────────────────────
const getAllCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const data = await MarketingService.getAllCampaigns(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaigns fetched successfully",
    data,
  });
});

const getCampaignById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = await MarketingService.getCampaignById(id);
  if (!data) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Campaign not found",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaign fetched successfully",
    data,
  });
});

const createCampaign = asyncHandler(async (req: Request, res: Response) => {
  const validated = CreateCampaignSchema.parse(req.body);
  const userId = (req as any).user?._id;
  const data = await MarketingService.createCampaign(validated, userId);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Campaign created and queued successfully",
    data,
  });
});

const deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await MarketingService.deleteCampaign(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaign deleted successfully",
    data: null,
  });
});

const startCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = await MarketingService.startCampaign(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaign started successfully",
    data,
  });
});

const pauseCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = await MarketingService.pauseCampaign(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaign paused",
    data,
  });
});

const resumeCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = await MarketingService.resumeCampaign(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaign resumed",
    data,
  });
});

const retryFailedRecipients = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = await MarketingService.retryFailedRecipients(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Failed recipients re-queued for delivery",
    data,
  });
});

// ── Templates ────────────────────────────────────────────────────────────────
const getAllTemplates = asyncHandler(async (_req: Request, res: Response) => {
  const data = await MarketingService.getAllTemplates();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Templates fetched successfully",
    data,
  });
});

const getTemplateById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = await MarketingService.getTemplateById(id);
  if (!data) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Template not found",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Template fetched successfully",
    data,
  });
});

const createTemplate = asyncHandler(async (req: Request, res: Response) => {
  const validated = CreateTemplateSchema.parse(req.body);
  const data = await MarketingService.createTemplate(validated);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Template created successfully",
    data,
  });
});

const updateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const validated = UpdateTemplateSchema.parse(req.body);
  const data = await MarketingService.updateTemplate(id, validated);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Template updated successfully",
    data,
  });
});

const deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await MarketingService.deleteTemplate(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Template deleted successfully",
    data: null,
  });
});

const seedTemplates = asyncHandler(async (_req: Request, res: Response) => {
  await seedWhatsAppDefaults();
  const data = await MarketingService.getAllTemplates();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Default templates seeded successfully",
    data,
  });
});

// ── Config & Baileys / Official API ──────────────────────────────────────────
const getConfig = asyncHandler(async (_req: Request, res: Response) => {
  const data = await MarketingService.getConfig();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "WhatsApp configuration fetched successfully",
    data,
  });
});

const updateConfig = asyncHandler(async (req: Request, res: Response) => {
  const validated = UpdateConfigSchema.parse(req.body);
  const data = await MarketingService.updateConfig(validated);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "WhatsApp configuration updated successfully",
    data,
  });
});

const getBaileysStatus = asyncHandler(async (_req: Request, res: Response) => {
  const data = await MarketingService.getConfig();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Baileys status fetched successfully",
    data: data.baileysLive,
  });
});

const reconnectBaileys = asyncHandler(async (_req: Request, res: Response) => {
  const data = await MarketingService.reconnectBaileys();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Baileys session reset and QR generated",
    data,
  });
});

const disconnectBaileys = asyncHandler(async (_req: Request, res: Response) => {
  const data = await MarketingService.disconnectBaileys();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Baileys session disconnected",
    data,
  });
});

const testOfficialApi = asyncHandler(async (req: Request, res: Response) => {
  const result = await MarketingService.testOfficialApi(req.body);
  if (!result.success) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: result.error || "Failed to verify credentials",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "WhatsApp Cloud API connection verified successfully",
    data: result.data,
  });
});

// ── Direct / Test Single Message ─────────────────────────────────────────────
const sendTestMessage = asyncHandler(async (req: Request, res: Response) => {
  const validated = SendTestMessageSchema.parse(req.body);
  const data = await MarketingService.sendTestMessage(validated);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Test message sent successfully to ${validated.phone}`,
    data,
  });
});

// ── Excel Upload & Sample File ───────────────────────────────────────────────
const parseExcelUpload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Please upload an Excel (.xlsx/.xls) or CSV file",
    });
  }

  const result = MarketingService.parseExcelOrCsv(req.file.buffer);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Parsed ${result.validRecipients.length} valid contacts from file`,
    data: result,
  });
});

const downloadSampleExcel = asyncHandler(async (_req: Request, res: Response) => {
  const buffer = MarketingService.generateSampleExcelBuffer();
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=whatsapp_recipients_sample.xlsx"
  );
  res.send(buffer);
});

// ── Logs ─────────────────────────────────────────────────────────────────────
const getLogs = asyncHandler(async (req: Request, res: Response) => {
  const data = await MarketingService.getLogs(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Delivery logs fetched successfully",
    data,
  });
});

export const MarketingController = {
  getStats,
  getAudienceCounts,
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  deleteCampaign,
  startCampaign,
  pauseCampaign,
  resumeCampaign,
  retryFailedRecipients,
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  seedTemplates,
  getConfig,
  updateConfig,
  getBaileysStatus,
  reconnectBaileys,
  disconnectBaileys,
  testOfficialApi,
  sendTestMessage,
  parseExcelUpload,
  downloadSampleExcel,
  getLogs,
};
