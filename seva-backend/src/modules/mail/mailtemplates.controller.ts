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

  if (!req.body.key) {
    const slug = (req.body.name || "CAMPAIGN")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_")
      .slice(0, 30);
    req.body.key = `CAMPAIGN_${slug}_${Date.now().toString(36).toUpperCase()}`;
    req.body.isDynamicCampaign = true;
  }

  // Wrap basic message in standard email layout if raw text/snippet was provided
  if (req.body.htmlContent && !req.body.htmlContent.includes("<!DOCTYPE html>")) {
    const rawMsg = req.body.htmlContent;
    req.body.htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${req.body.subject || "Seva Foundation"}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #0f2347; padding: 24px 32px; text-align: left;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">SEVA INDIA FOUNDATION</h1>
              <p style="color: #c99e32; margin: 4px 0 0 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Humanitarian & Development Outreach</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <!-- SEVA_MESSAGE_START -->
              <div style="color: #334155; font-size: 15px; line-height: 1.65; margin: 0 0 16px 0;">
                ${rawMsg}
              </div>
              <!-- SEVA_MESSAGE_END -->
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 8px 0;">Seva India Foundation • Registered Section 8 NGO</p>
              <p style="margin: 0; font-size: 11px;">80G Tax Exemption Available on all contributions.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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