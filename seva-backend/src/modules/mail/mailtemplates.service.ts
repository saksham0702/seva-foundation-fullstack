import { IMailTemplate, MailTemplateModel, MailTemplateKey } from "./mailtemplates.model";
import { seedMailTemplates } from "../../seeds/seedMail";

const createMailTemplate = async (
  payload: Partial<IMailTemplate>
): Promise<IMailTemplate> => {
  const result = await MailTemplateModel.create(payload);
  return result;
};

const getAllMailTemplates = async (query: {
  category?: string;
}): Promise<IMailTemplate[]> => {
  const filter: Record<string, unknown> = { isDeleted: false };
  if (query.category) filter.category = query.category;

  let result = await MailTemplateModel.find(filter).sort({ createdAt: -1 });
  if (result.length === 0 && !query.category) {
    try {
      await seedMailTemplates();
      result = await MailTemplateModel.find(filter).sort({ createdAt: -1 });
    } catch (e) {
      console.error("[MailTemplate] Auto-seed failed:", e);
    }
  }
  return result;
};

const getMailTemplateById = async (
  id: string
): Promise<IMailTemplate | null> => {
  return MailTemplateModel.findOne({ _id: id, isDeleted: false });
};

const getMailTemplateByKey = async (
  key: MailTemplateKey
): Promise<IMailTemplate | null> => {
  return MailTemplateModel.findOne({ key, isDeleted: false, isActive: true });
};

const updateMailTemplate = async (
  id: string,
  payload: Partial<IMailTemplate>
): Promise<IMailTemplate | null> => {
  const result = await MailTemplateModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteMailTemplate = async (
  id: string
): Promise<IMailTemplate | null> => {
  const existing = await MailTemplateModel.findById(id);
  if (!existing) return null;
  if (!existing.isDynamicCampaign) {
    throw new Error("System trigger email templates are protected and cannot be deleted.");
  }
  return MailTemplateModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
};

/**
 * Replaces {{variableName}} placeholders in a string with values from
 * the variables object. Missing variables are left as empty string
 * rather than crashing the send — but logged, so you notice during testing.
 *
 * Supports dot-free flat variables only (e.g. {{name}}, {{amount}}), which
 * covers everything you've described. If you later need loops/conditionals
 * (e.g. itemized donation lists), swap this for the "handlebars" package —
 * the call site (mailer.service.ts) stays the same.
 */
const renderString = (
  template: string,
  variables: Record<string, string | number>
): string => {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key) => {
    if (variables[key] === undefined || variables[key] === null) {
      console.warn(`[MailTemplate] Missing variable "${key}" for template render`);
      return "";
    }
    return String(variables[key]);
  });
};

const renderTemplate = (
  template: IMailTemplate,
  variables: Record<string, string | number>
): { subject: string; html: string } => {
  const siteUrl = process.env.FRONTEND_URL || "http://187.126.112.144:3000";
  // Backend public URL — used to construct absolute image/asset URLs in emails
  const backendUrl =
    process.env.BACKEND_PUBLIC_URL ||
    process.env.API_URL ||
    "http://187.126.112.144:5000";
  const defaultLogo = `${siteUrl}/assets/seva-logo.png`;

  // Resolve relative logoUrl to an absolute URL so email clients can fetch it
  let logoUrl = String(variables.logoUrl || "");
  if (!logoUrl) {
    logoUrl = defaultLogo;
  } else if (logoUrl.startsWith("/")) {
    logoUrl = `${backendUrl}${logoUrl}`;
  }

  const mergedVariables: Record<string, string | number> = {
    siteUrl,
    loginUrl: process.env.CLIENT_LOGIN_URL || `${siteUrl}/login`,
    currentYear: new Date().getFullYear(),
    ...variables,
    // Ensure the resolved absolute URL wins over any relative value in variables
    logoUrl,
  };

  let html = renderString(template.htmlContent, mergedVariables);

  // Inject logo banner if the template hasn't already included one
  if (logoUrl) {
    const logoImgTag = `<div style="text-align: center; margin-bottom: 22px;">
      <div style="display: inline-block; background-color: #ffffff; padding: 12px 28px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.95);">
        <img src="${logoUrl}" alt="Seva Foundation" style="max-height: 120px; max-width: 280px; height: auto; width: auto; display: block; margin: 0 auto; object-fit: contain; border: 0; outline: none;" />
      </div>
    </div>`;

    if (html.includes("<!-- SEVA_LOGO_PLACEHOLDER -->")) {
      html = html.replace("<!-- SEVA_LOGO_PLACEHOLDER -->", logoImgTag);
    } else if (html.includes("SEVA FOUNDATION") && !html.includes("<img")) {
      html = html.replace(/(<h1[^>]*>SEVA)/i, `${logoImgTag}$1`);
    } else if (html.includes("SEVA INDIA FOUNDATION") && !html.includes("<img")) {
      html = html.replace(/(<h1[^>]*>SEVA INDIA)/i, `${logoImgTag}$1`);
    }
  }

  return {
    subject: renderString(template.subject, mergedVariables),
    html,
  };
};

/**
 * Admin preview endpoint helper — render with sample/placeholder data
 * without actually sending anything.
 */
const previewMailTemplate = (
  template: IMailTemplate,
  sampleVariables: Record<string, string | number>
) => {
  return renderTemplate(template, sampleVariables);
};

export const MailTemplateService = {
  createMailTemplate,
  getAllMailTemplates,
  getMailTemplateById,
  getMailTemplateByKey,
  updateMailTemplate,
  deleteMailTemplate,
  renderTemplate,
  previewMailTemplate,
};