import { MailConfigModel } from "../modules/mail/mailconfig.model";
import { MailTemplateModel, MailTemplateKey } from "../modules/mail/mailtemplates.model";

export async function seedMailConfig() {
  const exists = await MailConfigModel.findOne({});
  if (exists) return;

  await MailConfigModel.create({
    provider: "GMAIL",
    label: "Seva Foundation Gmail",
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    authUser: process.env.SMTP_USER || "",
    authPass: process.env.SMTP_PASS || "",
    fromName: process.env.SMTP_FROM_NAME || "Seva Foundation",
    fromEmail: process.env.SMTP_USER || "",
    isActive: true,
  });

  console.log("[seed] Mail config created from SMTP_* env vars.");
}

/**
 * Generates unified, bold, professional email HTML layout with Seva Foundation branding and logo.
 */
export function buildProfessionalEmailTemplate({
  heading,
  bodyHtml,
  detailsRows,
  ctaText,
  ctaUrl,
  noticeText,
}: {
  heading: string;
  bodyHtml: string;
  detailsRows?: { label: string; value: string; isHighlight?: boolean }[];
  ctaText?: string;
  ctaUrl?: string;
  noticeText?: string;
}): string {
  const detailsHtml =
    detailsRows && detailsRows.length > 0
      ? `
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin: 24px 0 28px 0; overflow: hidden;">
          ${detailsRows
            .map(
              (row, idx) => `
            <tr>
              <td style="padding: 14px 20px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; width: 38%; ${
                idx !== detailsRows.length - 1 ? "border-bottom: 1px solid #edf2f7;" : ""
              }">${row.label}</td>
              <td style="padding: 14px 20px; font-size: 14px; font-weight: 600; color: ${
                row.isHighlight ? "#E8542A; font-size: 17px; font-weight: 700" : "#0f2347"
              }; ${idx !== detailsRows.length - 1 ? "border-bottom: 1px solid #edf2f7;" : ""}">${row.value}</td>
            </tr>`
            )
            .join("")}
        </table>`
      : "";

  const ctaHtml =
    ctaText && ctaUrl
      ? `
        <table border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 20px 0;">
          <tr>
            <td align="center" style="border-radius: 10px; background-color: #E8542A; box-shadow: 0 4px 14px rgba(232, 84, 42, 0.28);">
              <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 10px; letter-spacing: 0.3px; font-family: Arial, Helvetica, sans-serif;">${ctaText}</a>
            </td>
          </tr>
        </table>`
      : "";

  const noticeHtml = noticeText
    ? `<p style="margin: 24px 0 0 0; font-size: 12px; color: #94a3b8; line-height: 1.5; font-style: italic;">${noticeText}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seva Foundation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #1e293b;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <!-- Top Orange Brand Accent Strip -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #E8542A 0%, #ff7849 100%); line-height: 5px; font-size: 1px;">&nbsp;</td>
          </tr>
          <!-- Header with Navy Background -->
          <tr>
            <td style="background-color: #0f2347; padding: 32px 40px 28px; text-align: center;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">SEVA FOUNDATION</h1>
                    <p style="margin: 6px 0 0; color: #E8542A; font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;">Serving Humanity • Empowering Lives</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Main Content Area -->
          <tr>
            <td style="padding: 38px 40px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #0f2347; font-size: 22px; font-weight: 700; line-height: 1.35;">${heading}</h2>
              <!-- SEVA_MESSAGE_START -->
              <div style="color: #334155; font-size: 15px; line-height: 1.65; margin: 0 0 16px 0;">
                ${bodyHtml}
              </div>
              <!-- SEVA_MESSAGE_END -->
              ${detailsHtml}
              ${ctaHtml}
              ${noticeHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #0f2347; letter-spacing: 0.5px;">SEVA FOUNDATION</p>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b; line-height: 1.5;">Dedicated to empowering communities through healthcare, education, and humanitarian relief.</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">© {{currentYear}} Seva Foundation. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function seedMailTemplates() {
  const templates = [
    {
      key: "USER_CREDENTIALS",
      name: "New User Credentials",
      category: "AUTH",
      subject: "Welcome to Seva Foundation — Your Account Credentials",
      htmlContent: buildProfessionalEmailTemplate({
        heading: "Welcome to the Team, {{name}}!",
        bodyHtml: `<p>Your official administrative account for the <strong>Seva Foundation</strong> platform has been created. You can now log in using the secure credentials provided below.</p>`,
        detailsRows: [
          { label: "Login Email", value: "{{email}}" },
          { label: "Temporary Password", value: "{{password}}", isHighlight: true },
        ],
        ctaText: "Log In to Dashboard",
        ctaUrl: "{{loginUrl}}",
        noticeText: "Important: For security reasons, please change your password immediately upon your first login.",
      }),
      availableVariables: ["name", "email", "password", "loginUrl"],
    },
    {
      key: "VOLUNTEER_APPLICATION_RECEIVED",
      name: "Volunteer Application Received",
      category: "VOLUNTEER",
      subject: "We've Received Your Volunteer Application, {{name}}!",
      htmlContent: buildProfessionalEmailTemplate({
        heading: "Thank You for Stepping Forward, {{name}}!",
        bodyHtml: `<p>We have successfully received your volunteer application. Your willingness to dedicate your valuable time and skills to our cause makes an immense difference to the communities we serve.</p>`,
        detailsRows: [
          { label: "Volunteer Name", value: "{{name}}" },
          { label: "Program Category", value: "{{category}}" },
          { label: "Availability", value: "{{availability}}" },
        ],
        noticeText: "Our volunteer coordination team is reviewing your profile and will connect with you within 48 hours regarding the next steps.",
      }),
      availableVariables: ["name", "availability", "category"],
    },
    {
      key: "CAMPAIGN_DONATION_RECEIPT",
      name: "Donation Receipt",
      category: "DONOR",
      subject: "Thank You for Your Generous Contribution, {{name}}!",
      htmlContent: buildProfessionalEmailTemplate({
        heading: "Heartfelt Gratitude, {{name}}!",
        bodyHtml: `<p>Thank you for standing with us. Your generous contribution directly empowers our relief initiatives and brings hope to individuals and families in need.</p>`,
        detailsRows: [
          { label: "Donor Name", value: "{{name}}" },
          { label: "Contribution Amount", value: "₹{{amount}}", isHighlight: true },
          { label: "Campaign / Cause", value: "{{campaignName}}" },
          { label: "Date of Donation", value: "{{donatedOn}}" },
          { label: "Certificate Number", value: "{{certificateNo}}" },
        ],
        ctaText: "View & Download 80G Certificate",
        ctaUrl: "{{certificateUrl}}",
        noticeText: "Your official 80G tax exemption certificate is ready. You can verify and download it using the button above.",
      }),
      availableVariables: ["name", "amount", "campaignName", "donatedOn", "certificateNo", "certificateUrl"],
    },
    {
      key: "CERTIFICATE_GENERATED",
      name: "Certificate Generated",
      category: "CERTIFICATE",
      subject: "Your Official Certificate from Seva Foundation is Ready",
      htmlContent: buildProfessionalEmailTemplate({
        heading: "Congratulations, {{name}}!",
        bodyHtml: `<p>We are proud to present your official certificate of recognition from Seva Foundation in honor of your valuable participation in <strong>{{programName}}</strong>.</p>`,
        detailsRows: [
          { label: "Recipient Name", value: "{{name}}" },
          { label: "Program / Cause", value: "{{programName}}" },
          { label: "Certificate Number", value: "{{certificateNo}}", isHighlight: true },
        ],
        ctaText: "Verify & View Certificate",
        ctaUrl: "{{verifyUrl}}",
        noticeText: "You can securely view, share, or verify the authenticity of your digital certificate at any time using the link above.",
      }),
      availableVariables: ["name", "certificateNo", "programName", "verifyUrl"],
    },
    {
      key: "VOLUNTEER_APPLICATION_STATUS_UPDATE",
      name: "Volunteer Application Status Updated",
      category: "VOLUNTEER",
      subject: "Update Regarding Your Volunteer Application — {{status}}",
      htmlContent: buildProfessionalEmailTemplate({
        heading: "Volunteer Application Update",
        bodyHtml: `<p>Dear {{name}},</p><p>We are writing to provide you with an update on your volunteer application with Seva Foundation.</p>`,
        detailsRows: [
          { label: "Applicant Name", value: "{{name}}" },
          { label: "Updated Status", value: "{{status}}", isHighlight: true },
        ],
        noticeText: "If you have any questions or need further clarification, our team is always here to assist you. Simply reply to this email.",
      }),
      availableVariables: ["name", "status"],
    },
    {
      key: "DONOR_PAYMENT_CONFIRMED",
      name: "Donor Payment Confirmed",
      category: "DONOR",
      subject: "Payment Confirmed — Thank You, {{name}}!",
      htmlContent: buildProfessionalEmailTemplate({
        heading: "Payment Confirmed, {{name}}!",
        bodyHtml: `<p>We are pleased to confirm that your donation payment has been successfully processed and verified. Thank you for your continued commitment to our mission.</p>`,
        detailsRows: [
          { label: "Donor Name", value: "{{name}}" },
          { label: "Amount Paid", value: "₹{{amount}}", isHighlight: true },
          { label: "Campaign", value: "{{campaignName}}" },
          { label: "Confirmation Date", value: "{{donatedOn}}" },
        ],
        noticeText: "Your support directly fuels our on-the-ground operations. An official 80G certificate has been logged in your donor profile.",
      }),
      availableVariables: ["name", "amount", "campaignName", "donatedOn"],
    },
  ];

  for (const t of templates) {
    await MailTemplateModel.findOneAndUpdate(
      { key: t.key as MailTemplateKey },
      {
        $set: {
          name: t.name,
          category: t.category,
          subject: t.subject,
          htmlContent: t.htmlContent,
          availableVariables: t.availableVariables,
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
  }

  // Also clean up any lingering img tags in existing DB templates
  const allExisting = await MailTemplateModel.find({});
  for (const doc of allExisting) {
    if (doc.htmlContent && (doc.htmlContent.includes("logoUrl") || doc.htmlContent.includes("alt=\"Seva Foundation\""))) {
      const cleaned = doc.htmlContent
        .replace(/<img[^>]*alt=["']Seva Foundation["'][^>]*\/?>/gi, "")
        .replace(/<img[^>]*src=["']\{\{logoUrl\}\}["'][^>]*\/?>/gi, "");
      await MailTemplateModel.findByIdAndUpdate(doc._id, { htmlContent: cleaned });
    }
  }

  console.log(`[seed] ${templates.length} mail templates ensured with unified professional layout.`);
}

if (require.main === module) {
  const dotenv = require("dotenv");
  dotenv.config();
  const mongoose = require("mongoose");
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not provided.");
    process.exit(1);
  }
  mongoose
    .connect(uri)
    .then(async () => {
      console.log("Connected to MongoDB for mail seed...");
      await seedMailConfig();
      await seedMailTemplates();
      await mongoose.disconnect();
      console.log("Mail seed finished successfully.");
      process.exit(0);
    })
    .catch((err: any) => {
      console.error("Mail seed error:", err);
      process.exit(1);
    });
}
