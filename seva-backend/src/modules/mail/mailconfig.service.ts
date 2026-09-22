import nodemailer, { Transporter } from "nodemailer";
import {
  IMailConfig,
  MailConfigModel,
  decryptPass,
} from "./mailconfig.model";

const createMailConfig = async (
  payload: Partial<IMailConfig>
): Promise<IMailConfig> => {
  // If this new config is marked active, deactivate all others first
  // so there is always exactly one active config.
  if (payload.isActive) {
    await MailConfigModel.updateMany({}, { isActive: false });
  }
  const result = await MailConfigModel.create(payload);
  return result;
};

const getAllMailConfigs = async (): Promise<IMailConfig[]> => {
  // authPass is never sent to the client — stripped in the controller layer.
  const result = await MailConfigModel.find().sort({ createdAt: -1 });
  return result;
};

const getMailConfigById = async (id: string): Promise<IMailConfig | null> => {
  return MailConfigModel.findById(id);
};

const getActiveMailConfig = async (): Promise<IMailConfig | null> => {
  return MailConfigModel.findOne({ isActive: true });
};

const updateMailConfig = async (
  id: string,
  payload: Partial<IMailConfig>
): Promise<IMailConfig | null> => {
  if (payload.isActive) {
    await MailConfigModel.updateMany(
      { _id: { $ne: id } },
      { isActive: false }
    );
  }
  const result = await MailConfigModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const setActiveMailConfig = async (id: string): Promise<IMailConfig | null> => {
  await MailConfigModel.updateMany({}, { isActive: false });
  return MailConfigModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
};

const deleteMailConfig = async (id: string): Promise<IMailConfig | null> => {
  return MailConfigModel.findByIdAndDelete(id);
};

/**
 * Builds a live nodemailer transporter from a given config document.
 * Used both for the real send path (mailer.service.ts) and for the
 * "send test email" admin action.
 */
const buildTransporterFromConfig = (config: IMailConfig): Transporter => {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.authUser,
      pass: decryptPass(config.authPass),
    },
  });
};

/**
 * Sends a plain test email using a given (not necessarily active) config,
 * so an admin can validate settings before flipping it to active.
 */
const sendTestMail = async (
  configId: string,
  toEmail: string
): Promise<{ messageId: string }> => {
  const config = await MailConfigModel.findById(configId);
  if (!config) throw new Error("Mail configuration not found");

  const transporter = buildTransporterFromConfig(config);

  const info = await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to: toEmail,
    replyTo: config.replyTo,
    subject: "Test email from Seva India mail system",
    html: `<p>This is a test email confirming your <strong>${config.label}</strong> (${config.provider}) SMTP configuration is working correctly.</p>`,
  });

  return { messageId: info.messageId };
};

export const MailConfigService = {
  createMailConfig,
  getAllMailConfigs,
  getMailConfigById,
  getActiveMailConfig,
  updateMailConfig,
  setActiveMailConfig,
  deleteMailConfig,
  buildTransporterFromConfig,
  sendTestMail,
};