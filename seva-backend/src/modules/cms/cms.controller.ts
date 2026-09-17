import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { CmsService } from "./cms.service";

const getAllPages = asyncHandler(async (req: Request, res: Response) => {
  const result = await CmsService.getAllPages();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "CMS pages fetched successfully",
    data: result,
  });
});

const getPageBySlug = asyncHandler(async (req: Request, res: Response) => {
  const result = await CmsService.getPageBySlug(req.params.slug as string);

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Page not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "CMS page fetched successfully",
    data: result,
  });
});

const savePage = asyncHandler(async (req: Request, res: Response) => {
  const adminId = (req as any).user?.userId;
  const result = await CmsService.savePage(
    req.params.slug as string,
    req.body,
    adminId
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "CMS page saved successfully",
    data: result,
  });
});

const deletePage = asyncHandler(async (req: Request, res: Response) => {
  const result = await CmsService.deletePage(req.params.slug as string);

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Page not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "CMS page deleted successfully",
    data: null,
  });
});

export const CmsController = {
  getAllPages,
  getPageBySlug,
  savePage,
  deletePage,
};
