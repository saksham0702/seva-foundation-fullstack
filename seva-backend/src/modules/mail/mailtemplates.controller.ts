import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { MailTemplateService } from "./mailtemplates.service";
import { filePathToUrl } from "../../middlewares/upload";

const createMailTemplate = asyncHandler(async (req: Request, res: Response) => {
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const files = req.files as Express.Multer.File[];
    req.body.images = files.map((file) => filePathToUrl(file.path));
  } else if (req.body.images && typeof req.body.images === "string") {
    req.body.images = [req.body.images];
  }

  // availableVariables may arrive as a comma-separated string from a form field
  if (typeof req.body.availableVariables === "string") {
    req.body.availableVariables = req.body.availableVariables
      .split(",")
      .map((v: string) => v.trim())
      .filter(Boolean);
  }

  const result = await MailTemplateService.createMailTemplate(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Mail template created successfully",
    data: result,
  });
});

const getAllMailTemplates = asyncHandler(async (req: Request, res: Response) => {
  const result = await MailTemplateService.getAllMailTemplates({
    category: req.query.category as string | undefined,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mail templates fetched successfully",
    data: result,
  });
});

const getMailTemplateById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await MailTemplateService.getMailTemplateById(id);
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Mail template not found",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mail template fetched successfully",
    data: result,
  });
});

const updateMailTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const files = req.files as Express.Multer.File[];
    req.body.images = files.map((file) => filePathToUrl(file.path));
  } else {
    delete req.body.images; // keep existing images if none uploaded
  }

  if (typeof req.body.availableVariables === "string") {
    req.body.availableVariables = req.body.availableVariables
      .split(",")
      .map((v: string) => v.trim())
      .filter(Boolean);
  }

  const result = await MailTemplateService.updateMailTemplate(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mail template updated successfully",
    data: result,
  });
});

const deleteMailTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await MailTemplateService.deleteMailTemplate(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Mail template deleted successfully",
    data: null,
  });
});

/**
 * Renders the template with sample variables the admin passes in,
 * for preview in the admin panel — does not send any actual email.
 */
const previewMailTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { variables } = req.body as { variables: Record<string, string> };

  const template = await MailTemplateService.getMailTemplateById(id);
  if (!template) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Mail template not found",
    });
  }

  const result = MailTemplateService.previewMailTemplate(template, variables || {});
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Template rendered successfully",
    data: result,
  });
});

export const MailTemplateController = {
  createMailTemplate,
  getAllMailTemplates,
  getMailTemplateById,
  updateMailTemplate,
  deleteMailTemplate,
  previewMailTemplate,
};