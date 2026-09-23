import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { VolunteerCategoryService } from "./volunteercategories.service";
import { sendResponse } from "../../utils/apiResponse";
import { iconFilePathToUrl, sanitizeSvgFile } from "../../middlewares/uploadIcon";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createVolunteerCategory = asyncHandler(
  async (req: Request, res: Response) => {
    // single SVG upload via uploadVolunteerIcon.single("icon")
    if (req.file) {
      sanitizeSvgFile(req.file.path);
      req.body.icon = iconFilePathToUrl(req.file.path);
    }

    if (req.body.title && !req.body.slug) {
      req.body.slug = slugify(req.body.title);
    }

    if ((req as any).user?._id) {
      req.body.createdBy = (req as any).user._id;
    }

    const result = await VolunteerCategoryService.createVolunteerCategory(
      req.body
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Volunteer category created successfully",
      data: result,
    });
  }
);

const getAllVolunteerCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const { formType } = req.query as { formType?: string };
    const result = await VolunteerCategoryService.getAllVolunteerCategories(formType);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Volunteer categories fetched successfully",
      data: result,
    });
  }
);

/**
 * Public endpoint — no auth. Used by the frontend "Select Your Role" grid.
 */
const getPublicVolunteerCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const { formType } = req.query as { formType?: string };
    const result =
      await VolunteerCategoryService.getPublicVolunteerCategories(formType);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Volunteer categories fetched successfully",
      data: result,
    });
  }
);

const getVolunteerCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await VolunteerCategoryService.getVolunteerCategoryById(id);
    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Volunteer category not found",
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Volunteer category fetched successfully",
      data: result,
    });
  }
);

const updateVolunteerCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (req.file) {
      sanitizeSvgFile(req.file.path);
      req.body.icon = iconFilePathToUrl(req.file.path);
    } else {
      delete req.body.icon; // keep existing icon if none uploaded
    }

    const result = await VolunteerCategoryService.updateVolunteerCategory(
      id,
      req.body
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Volunteer category updated successfully",
      data: result,
    });
  }
);

const deleteVolunteerCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await VolunteerCategoryService.deleteVolunteerCategory(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Volunteer category deleted successfully",
      data: null,
    });
  }
);

const getVolunteerCategoryOptions = asyncHandler(
  async (req: Request, res: Response) => {
    const { formType } = req.query as { formType?: string };
    const result =
      await VolunteerCategoryService.getVolunteerCategoryOptions(formType);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Volunteer category options fetched successfully",
      data: result,
    });
  }
);

export const VolunteerCategoryController = {
  createVolunteerCategory,
  getAllVolunteerCategories,
  getPublicVolunteerCategories,
  getVolunteerCategoryById,
  updateVolunteerCategory,
  deleteVolunteerCategory,
  getVolunteerCategoryOptions,
};