import { IMailTemplate, MailTemplateModel, MailTemplateKey } from "./mailtemplates.model";

const createMailTemplate = async (
  payload: Partial<IMailTemplate>
): Promise<IMailTemplate> => {
  const result = await MailTemplateModel.create(payload);
  return result;
};

import { seedMailTemplates } from "../../seeds/seedMail";

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
  const mergedVariables: Record<string, string | number> = {
    siteUrl,
    logoUrl: `${siteUrl}/assets/seva-logo.png`,
    loginUrl: process.env.CLIENT_LOGIN_URL || `${siteUrl}/login`,
    currentYear: new Date().getFullYear(),
    ...variables,
  };
  return {
    subject: renderString(template.subject, mergedVariables),
    html: renderString(template.htmlContent, mergedVariables),
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