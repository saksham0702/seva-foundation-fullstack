import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { PageService } from "./pages.service";
import { sendResponse } from "../../utils/apiResponse";

const createPage = asyncHandler(async (req: Request, res: Response) => {
  const result = await PageService.createPage(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Page created successfully",
    data: result,
  });
});

const getAllPages = asyncHandler(async (_req: Request, res: Response) => {
  const result = await PageService.getAllPages();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pages fetched successfully",
    data: result,
  });
});

const getPageById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await PageService.getPageById(id);
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
    message: "Page fetched successfully",
    data: result,
  });
});

// PUBLIC — no auth, called by the website itself
const getPageBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const result = await PageService.getPageBySlug(slug);
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
    message: "Page fetched successfully",
    data: result,
  });
});

const updatePageMeta = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await PageService.updatePageMeta(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Page updated successfully",
    data: result,
  });
});

// Admin panel saves the full sections array here (one form submit per page)
const updateSections = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { sections } = req.body as { sections: any[] };
  const result = await PageService.updateSections(id, sections, req.body.updatedBy);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Page content updated successfully",
    data: result,
  });
});

const togglePublish = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { isPublished } = req.body as { isPublished: boolean };
  const result = await PageService.togglePublish(id, isPublished, req.body.updatedBy);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Page status updated successfully",
    data: result,
  });
});

const deletePage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await PageService.deletePage(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Page deleted successfully",
    data: null,
  });
});

const getPageOptions = asyncHandler(async (_req: Request, res: Response) => {
  const result = await PageService.getPageOptions();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Page options fetched successfully",
    data: result,
  });
});

export const PageController = {
  createPage,
  getAllPages,
  getPageById,
  getPageBySlug,
  updatePageMeta,
  updateSections,
  togglePublish,
  deletePage,
  getPageOptions,
};