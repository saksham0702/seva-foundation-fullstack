import { Transporter } from "nodemailer";
import { MailConfigService } from "./mailconfig.service";
import { MailTemplateService } from "./mailtemplates.service";
import { MailTemplateKey } from "./mailtemplates.model";
import { MailLogModel } from "./maillogs.model";

let cachedTransporter: Transporter | null = null;
let cachedConfigId: string | null = null;

async function getTransporter(): Promise<{
  transporter: Transporter;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
}> {
  const config = await MailConfigService.getActiveMailConfig();
  if (!config) {
    throw new Error(
      "No active mail configuration found. Set one up in Mail Settings first."
    );
  }

  if (!cachedTransporter || cachedConfigId !== String(config._id)) {
    cachedTransporter = MailConfigService.buildTransporterFromConfig(config);
    cachedConfigId = String(config._id);
  }

  return {
    transporter: cachedTransporter,
    fromName: config.fromName,
    fromEmail: config.fromEmail,
    replyTo: config.replyTo,
  };
}

export function invalidateTransporterCache() {
  cachedTransporter = null;
  cachedConfigId = null;
}

export interface SendTemplatedMailInput {
  to: string;
  cc?: string[];
  templateKey: MailTemplateKey;
  variables: Record<string, string | number>;
  relatedToModel?: "Donor" | "User" | "VolunteerApplication" | "Certificate" | "Campaign";
  relatedToId?: string;
  attachments?: { filename: string; path?: string; content?: Buffer }[];
}

const sendTemplatedMail = async (
  input: SendTemplatedMailInput,
  options: { throwOnError?: boolean } = {}
): Promise<{ sent: boolean; messageId?: string; logId: string }> => {
  const template = await MailTemplateService.getMailTemplateByKey(input.templateKey);

  if (!template) {
    const message = `No active mail template found for key "${input.templateKey}"`;
    const log = await MailLogModel.create({
      to: input.to,
      cc: input.cc,
      templateKey: input.templateKey,
      subject: "(template missing)",
      variables: input.variables,
      status: "FAILED",
      error: message,
      relatedToModel: input.relatedToModel,
      relatedToId: input.relatedToId,
    });
    if (options.throwOnError) throw new Error(message);
    console.warn(`[Mailer] ${message}`);
    return { sent: false, logId: String(log._id) };
  }

  const activeConf = await MailConfigService.getActiveMailConfig();
  const mergedInputVariables = {
    ...(activeConf?.logoUrl ? { logoUrl: activeConf.logoUrl } : {}),
    ...input.variables,
  };
  const { subject, html } = MailTemplateService.renderTemplate(template, mergedInputVariables);

  const log = await MailLogModel.create({
    to: input.to,
    cc: input.cc,
    templateKey: input.templateKey,
    subject,
    variables: input.variables,
    status: "PENDING",
    relatedToModel: input.relatedToModel,
    relatedToId: input.relatedToId,
  });

  try {
    const { transporter, fromName, fromEmail, replyTo } = await getTransporter();

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: input.to,
      cc: input.cc,
      replyTo,
      subject,
      html,
      attachments: input.attachments,
    });

    log.status = "SENT";
    log.messageId = info.messageId;
    await log.save();

    return { sent: true, messageId: info.messageId, logId: String(log._id) };
  } catch (err: any) {
    log.status = "FAILED";
    log.error = err.message || "Unknown error while sending mail";
    await log.save();

    console.error(`[Mailer] Failed to send "${input.templateKey}" to ${input.to}:`, err.message);

    if (options.throwOnError) throw err;
    return { sent: false, logId: String(log._id) };
  }
};

const resendFromLog = async (logId: string) => {
  const log = await MailLogModel.findById(logId);
  if (!log) throw new Error("Mail log not found");

  return sendTemplatedMail(
    {
      to: log.to,
      cc: log.cc,
      templateKey: log.templateKey,
      variables: log.variables as Record<string, string>,
      relatedToModel: log.relatedToModel,
      relatedToId: log.relatedToId ? String(log.relatedToId) : undefined,
    },
    { throwOnError: true }
  );
};

export const MailerService = {
  sendTemplatedMail,
  resendFromLog,
};