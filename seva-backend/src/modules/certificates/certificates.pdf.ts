import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { ICertificate } from "./certificates.model";

const OUTPUT_DIR = path.join(process.cwd(), "uploads", "certificates");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function certificateTypeLabel(type: ICertificate["certificateType"]): string {
  const map: Record<string, string> = {
    APPRECIATION: "CERTIFICATE OF APPRECIATION",
    COMPLETION: "CERTIFICATE OF COMPLETION",
    PARTICIPATION: "CERTIFICATE OF PARTICIPATION",
    DONATION_ACKNOWLEDGEMENT: "CERTIFICATE OF DONATION",
    TRAINING: "CERTIFICATE OF TRAINING",
    OTHER: "CERTIFICATE",
  };
  return map[type] || "CERTIFICATE";
}

export const generateCertificatePdf = async (certificate: ICertificate): Promise<string> => {
  const filePath = path.join(OUTPUT_DIR, `${certificate.certificateNo}.pdf`);
  const relativePath = `/uploads/certificates/${certificate.certificateNo}.pdf`;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const { width, height } = doc.page;

    // ── 1. Decorative Borders ────────────────────────────────────────────────
    // Outer Navy Border (30px inset)
    doc.lineWidth(3).strokeColor("#0B2C6B").rect(28, 28, width - 56, height - 56).stroke();
    // Inner Gold Border (40px inset)
    doc.lineWidth(1.2).strokeColor("#D4A843").rect(40, 40, width - 80, height - 80).stroke();

    // Corner decorative accents
    const cornerSize = 12;
    // Top-left
    doc.moveTo(40, 40 + cornerSize).lineTo(40 + cornerSize, 40).strokeColor("#D4A843").lineWidth(1.5).stroke();
    // Top-right
    doc.moveTo(width - 40 - cornerSize, 40).lineTo(width - 40, 40 + cornerSize).strokeColor("#D4A843").lineWidth(1.5).stroke();
    // Bottom-left
    doc.moveTo(40, height - 40 - cornerSize).lineTo(40 + cornerSize, height - 40).strokeColor("#D4A843").lineWidth(1.5).stroke();
    // Bottom-right
    doc.moveTo(width - 40 - cornerSize, height - 40).lineTo(width - 40, height - 40 - cornerSize).strokeColor("#D4A843").lineWidth(1.5).stroke();

    // ── 2. Top Header ────────────────────────────────────────────────────────
    doc.fillColor("#0B2C6B").fontSize(25).font("Times-Bold").text("SEVA INDIA FOUNDATION", 0, 58, { align: "center" });

    doc
      .fillColor("#555")
      .fontSize(9)
      .font("Times-Roman")
      .text("Registered Section 8 Social Impact Organization | Education • Healthcare • Relief", 0, 88, { align: "center" })
      .text("CARE • COMPASSION • CHANGE", 0, 101, { align: "center" });

    doc.moveTo(180, 118).lineTo(width - 180, 118).strokeColor("#D4A843").lineWidth(1.2).stroke();

    // ── 3. Certificate Title & Presentation ──────────────────────────────────
    doc
      .fillColor("#0B2C6B")
      .fontSize(18)
      .font("Times-Bold")
      .text(certificateTypeLabel(certificate.certificateType), 0, 130, { align: "center" });

    doc
      .fillColor("#444")
      .fontSize(11)
      .font("Times-Italic")
      .text("This certificate is proudly presented to", 0, 156, { align: "center" });

    // Recipient Name (Always UPPERCASE)
    const capitalizedRecipient = (certificate.recipientName || "").toUpperCase().trim();
    doc
      .fillColor("#111")
      .fontSize(23)
      .font("Times-Bold")
      .text(capitalizedRecipient, 0, 175, { align: "center" });

    // ── 4. Middle Content (Body & Cause/Program) with Dynamic Sizing ──────────
    const contentStartX = 100;
    const contentWidth = width - 200;
    const bodyStartY = 210;
    // Hard ceiling for middle text before signatures/QR area starts at height - 165 (430)
    const maxContentBottomY = height - 165;
    const maxAvailableContentHeight = maxContentBottomY - bodyStartY; // ~220 points

    const bodyText = (certificate.body || "").trim();
    const causeTitle = certificate.projectName && certificate.projectName !== certificate.programName
      ? `${certificate.programName} — ${certificate.projectName}`
      : certificate.programName;

    // Dynamically calculate font size so multi-line volunteer/campaign citations never overflow
    let bodyFontSize = 10.5;
    let measuredBodyHeight = doc
      .font("Times-Roman")
      .fontSize(bodyFontSize)
      .heightOfString(bodyText, { width: contentWidth, align: "center", lineGap: 3 });

    let causeFontSize = 11;
    let measuredCauseHeight = causeTitle
      ? doc.font("Times-Bold").fontSize(causeFontSize).heightOfString(`Program / Cause: "${causeTitle}"`, { width: contentWidth, align: "center", lineGap: 2 })
      : 0;

    while (measuredBodyHeight + measuredCauseHeight + 16 > maxAvailableContentHeight && bodyFontSize > 7.5) {
      bodyFontSize -= 0.5;
      if (causeFontSize > 8.5) causeFontSize -= 0.5;

      measuredBodyHeight = doc
        .font("Times-Roman")
        .fontSize(bodyFontSize)
        .heightOfString(bodyText, { width: contentWidth, align: "center", lineGap: 2.5 });

      measuredCauseHeight = causeTitle
        ? doc.font("Times-Bold").fontSize(causeFontSize).heightOfString(`Program / Cause: "${causeTitle}"`, { width: contentWidth, align: "center", lineGap: 2 })
        : 0;
    }

    // Render Body Text
    doc
      .fillColor("#374151")
      .fontSize(bodyFontSize)
      .font("Times-Roman")
      .text(bodyText, contentStartX, bodyStartY, {
        width: contentWidth,
        align: "center",
        lineGap: 3,
      });

    // Render Cause / Program Text
    if (causeTitle) {
      const causeY = bodyStartY + measuredBodyHeight + 10;
      doc
        .fillColor("#0B2C6B")
        .fontSize(causeFontSize)
        .font("Times-Bold")
        .text(`Program / Cause: "${causeTitle}"`, contentStartX, causeY, {
          width: contentWidth,
          align: "center",
          lineGap: 2,
        });
    }

    // ── 5. Image Resolver ────────────────────────────────────────────────────
    const resolveImage = (imgSrc?: string): Buffer | string | null => {
      if (!imgSrc) return null;
      try {
        if (imgSrc.startsWith("data:image/")) {
          const base64Data = imgSrc.split(",")[1];
          if (base64Data) return Buffer.from(base64Data, "base64");
        }
        const cleaned = imgSrc.replace(/\\/g, "/").replace(/^\/+/, "");
        const localPath = path.join(process.cwd(), cleaned);
        if (fs.existsSync(localPath)) return localPath;

        const uploadPath = path.join(process.cwd(), "uploads", path.basename(imgSrc));
        if (fs.existsSync(uploadPath)) return uploadPath;
      } catch (err) {
        console.warn("Failed to resolve image for certificate:", imgSrc, err);
      }
      return null;
    };

    // ── 6. Bottom Signatures & QR Section (Anchored to Page Bottom) ──────────
    const sigBaselineY = height - 98; // 497.28
    const sigImgY = sigBaselineY - 38; // 459.28
    const qrY = height - 150; // 445.28

    // Seal (Left of center QR)
    if (certificate.signatures?.seal?.imageUrl) {
      const sealPath = resolveImage(certificate.signatures.seal.imageUrl);
      if (sealPath) {
        try {
          doc.image(sealPath, width / 2 - 95, qrY + 4, { fit: [48, 48], align: "center" });
        } catch (err) {
          console.warn("Seal image render error:", err);
        }
      }
    }

    // Center QR Code
    if (certificate.qrCodeImage) {
      try {
        const base64 = certificate.qrCodeImage.split(",")[1];
        const qrBuffer = Buffer.from(base64, "base64");
        doc.image(qrBuffer, width / 2 - 27, qrY, { width: 54, height: 54 });
        doc
          .fontSize(6.5)
          .fillColor("#4B5563")
          .font("Times-Roman")
          .text("Scan to Verify", width / 2 - 40, qrY + 56, { width: 80, align: "center" });
      } catch (err) {
        console.warn("QR code render error:", err);
      }
    }

    // Secretary Signature (Left Column)
    if (certificate.signatures?.secretary) {
      const secImg = resolveImage(certificate.signatures.secretary.imageUrl);
      if (secImg) {
        try {
          doc.image(secImg, 100, sigImgY, { fit: [150, 36], align: "center", valign: "bottom" });
        } catch (err) {
          console.warn("Secretary signature render error:", err);
        }
      }
      doc.moveTo(90, sigBaselineY).lineTo(250, sigBaselineY).strokeColor("#374151").lineWidth(0.8).stroke();
      const secName = certificate.signatures.secretary.signatoryName || "Authorized Signatory";
      const secLabel = certificate.signatures.secretary.label || "General Secretary";
      doc.fontSize(8.5).fillColor("#111").font("Times-Bold").text(secName, 90, sigBaselineY + 4, { width: 160, align: "center" });
      doc.fontSize(7.5).fillColor("#6B7280").font("Times-Roman").text(secLabel, 90, sigBaselineY + 15, { width: 160, align: "center" });
    }

    // President Signature (Right Column)
    if (certificate.signatures?.president) {
      const presImg = resolveImage(certificate.signatures.president.imageUrl);
      if (presImg) {
        try {
          doc.image(presImg, width - 250, sigImgY, { fit: [150, 36], align: "center", valign: "bottom" });
        } catch (err) {
          console.warn("President signature render error:", err);
        }
      }
      doc.moveTo(width - 250, sigBaselineY).lineTo(width - 90, sigBaselineY).strokeColor("#374151").lineWidth(0.8).stroke();
      const presName = certificate.signatures.president.signatoryName || "Authorized Signatory";
      const presLabel = certificate.signatures.president.label || "President / Trustee";
      doc.fontSize(8.5).fillColor("#111").font("Times-Bold").text(presName, width - 250, sigBaselineY + 4, { width: 160, align: "center" });
      doc.fontSize(7.5).fillColor("#6B7280").font("Times-Roman").text(presLabel, width - 250, sigBaselineY + 15, { width: 160, align: "center" });
    }

    // ── 7. Footer Metadata (Strictly Inside Borders) ──────────────────────────
    const formattedIssueDate = new Date(certificate.issueDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const footerY = height - 58;
    doc
      .fontSize(8)
      .fillColor("#0B2C6B")
      .font("Times-Bold")
      .text(`Certificate No: ${certificate.certificateNo}`, 50, footerY);

    doc
      .fontSize(8)
      .fillColor("#0B2C6B")
      .font("Times-Bold")
      .text(`Issue Date: ${formattedIssueDate}`, width - 210, footerY, {
        width: 160,
        align: "right",
      });

    doc
      .fontSize(7.5)
      .fillColor("#4B5563")
      .font("Times-Roman")
      .text(`Verify online at: ${certificate.verifyUrl}`, 0, footerY, { align: "center" });

    doc
      .fontSize(6.5)
      .fillColor("#9CA3AF")
      .font("Times-Roman")
      .text("This is an official authenticated digital certificate issued by Seva India Foundation.", 0, height - 48, {
        align: "center",
      });

    doc.end();
    stream.on("finish", () => resolve(relativePath));
    stream.on("error", reject);
  });
};