import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { CampaignService } from "./campaigns.service";
import { sendResponse } from "../../utils/apiResponse";
import { filePathToUrl } from "../../middlewares/upload";

const createCampaign = asyncHandler(async (req: Request, res: Response) => {
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const files = req.files as Express.Multer.File[];
    req.body.images = files.map((file) => filePathToUrl(file.path));
  } else if (req.body.images) {
    if (typeof req.body.images === "string") {
      req.body.images = [req.body.images];
    }
  }
  const result = await CampaignService.createCampaign(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Campaign created successfully",
    data: result,
  });
});

const getAllCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const { status, category, search } = req.query as {
    status?: string;
    category?: string;
    search?: string;
  };
  const result = await CampaignService.getAllCampaigns({
    status,
    category,
    search,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaigns fetched successfully",
    data: result,
  });
});

const getCampaignById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CampaignService.getCampaignById(id);
  if (!result) {
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
    data: result,
  });
});

const getCampaignBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const result = await CampaignService.getCampaignBySlug(slug);
  if (!result) {
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
    data: result,
  });
});

const toggleCampaignStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { status } = req.body as { status: "active" | "draft" | "completed" | "paused" };
  const result = await CampaignService.toggleCampaignStatus(id, status);
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Campaign not found",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaign status updated successfully",
    data: result,
  });
});

const updateCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const files = req.files as Express.Multer.File[];
    req.body.images = files.map((file) => filePathToUrl(file.path));
  } else if (req.body.images) {
    if (typeof req.body.images === "string") {
      req.body.images = [req.body.images];
    }
  } else {
    delete req.body.images;
  }

  const result = await CampaignService.updateCampaign(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaign updated successfully",
    data: result,
  });
});

const deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await CampaignService.deleteCampaign(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaign deleted successfully",
    data: null,
  });
});

const getCampaignOptions = asyncHandler(async (req: Request, res: Response) => {
  const result = await CampaignService.getCampaignOptions();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaign options fetched successfully",
    data: result,
  });
});

const getCampaignDonors = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
  const limit = Math.min(20, Math.max(1, parseInt((req.query.limit as string) || "5", 10)));

  const result = await CampaignService.getCampaignDonorsBySlug(slug, page, limit);
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Campaign not found",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Campaign donors fetched successfully",
    data: result,
  });
});

export const CampaignController = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getCampaignBySlug,
  updateCampaign,
  toggleCampaignStatus,
  deleteCampaign,
  getCampaignOptions,
  getCampaignDonors,
};
