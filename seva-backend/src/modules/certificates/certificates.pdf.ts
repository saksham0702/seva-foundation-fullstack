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

    doc.lineWidth(3).strokeColor("#0B2C6B").rect(30, 30, width - 60, height - 60).stroke();
    doc.lineWidth(1).strokeColor("#D4A843").rect(45, 45, width - 90, height - 90).stroke();

    doc.fillColor("#0B2C6B").fontSize(30).font("Times-Bold").text("SEVA INDIA FOUNDATION", 0, 90, { align: "center" });

    doc
      .fillColor("#555")
      .fontSize(10)
      .font("Times-Roman")
      .text("Registered Section 8 Company | Education | Healthcare | Disaster Relief", 0, 130, { align: "center" })
      .text("CARE - COMPASSION - CHANGE", 0, 145, { align: "center" });

    doc.moveTo(150, 170).lineTo(width - 150, 170).strokeColor("#D4A843").lineWidth(1.5).stroke();

    doc
      .fillColor("#0B2C6B")
      .fontSize(22)
      .font("Times-Bold")
      .text(certificateTypeLabel(certificate.certificateType), 0, 195, { align: "center" });

    doc
      .fillColor("#333")
      .fontSize(12)
      .font("Times-Italic")
      .text("This certificate is proudly presented to", 0, 235, { align: "center" });

    doc.fillColor("#111").fontSize(30).font("Times-Bold").text(certificate.recipientName, 0, 260, { align: "center" });

    doc
      .fillColor("#444")
      .fontSize(11)
      .font("Times-Roman")
      .text(certificate.body, 120, 310, { width: width - 240, align: "center", lineGap: 4 });

    doc
      .fillColor("#111")
      .fontSize(11)
      .font("Times-Bold")
      .text(
        `Program/Project: ${certificate.programName}${certificate.projectName ? " — " + certificate.projectName : ""}`,
        0,
        400,
        { align: "center" }
      );

    // Helper to resolve an image path or data URI to a Buffer or local file path
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

        // Try inside uploads folder
        const uploadPath = path.join(process.cwd(), "uploads", path.basename(imgSrc));
        if (fs.existsSync(uploadPath)) return uploadPath;
      } catch (err) {
        console.warn("Failed to resolve image for certificate:", imgSrc, err);
      }
      return null;
    };

    if (certificate.qrCodeImage) {
      try {
        const base64 = certificate.qrCodeImage.split(",")[1];
        const qrBuffer = Buffer.from(base64, "base64");
        doc.image(qrBuffer, width / 2 - 40, 420, { width: 75, height: 75 });
        doc.fontSize(7).fillColor("#555").font("Times-Roman").text("Scan to Verify", width / 2 - 40, 498, { width: 75, align: "center" });
      } catch (err) {
        console.warn("QR code render error:", err);
      }
    }

    // Seal / Stamp (if configured)
    if (certificate.signatures?.seal?.imageUrl) {
      const sealPath = resolveImage(certificate.signatures.seal.imageUrl);
      if (sealPath) {
        try {
          doc.image(sealPath, width / 2 - 130, 425, { fit: [65, 65], align: "center" });
        } catch (err) {
          console.warn("Seal image render error:", err);
        }
      }
    }

    const sigY = 495;

    // Secretary Signature
    if (certificate.signatures?.secretary) {
      const secImg = resolveImage(certificate.signatures.secretary.imageUrl);
      if (secImg) {
        try {
          doc.image(secImg, 130, sigY - 55, { fit: [140, 50], align: "center", valign: "bottom" });
        } catch (err) {
          console.warn("Secretary signature render error:", err);
        }
      }
      doc.moveTo(120, sigY).lineTo(280, sigY).strokeColor("#333").lineWidth(1).stroke();
      const secName = certificate.signatures.secretary.signatoryName || "Authorized Signatory";
      const secLabel = certificate.signatures.secretary.label || "Secretary";
      doc.fontSize(9).fillColor("#111").font("Times-Bold").text(secName, 120, sigY + 5, { width: 160, align: "center" });
      doc.fontSize(8).fillColor("#666").font("Times-Roman").text(secLabel, 120, sigY + 16, { width: 160, align: "center" });
    }

    // President Signature
    if (certificate.signatures?.president) {
      const presImg = resolveImage(certificate.signatures.president.imageUrl);
      if (presImg) {
        try {
          doc.image(presImg, width - 270, sigY - 55, { fit: [140, 50], align: "center", valign: "bottom" });
        } catch (err) {
          console.warn("President signature render error:", err);
        }
      }
      doc.moveTo(width - 280, sigY).lineTo(width - 120, sigY).strokeColor("#333").lineWidth(1).stroke();
      const presName = certificate.signatures.president.signatoryName || "Authorized Signatory";
      const presLabel = certificate.signatures.president.label || "President / Trustee";
      doc.fontSize(9).fillColor("#111").font("Times-Bold").text(presName, width - 280, sigY + 5, { width: 160, align: "center" });
      doc.fontSize(8).fillColor("#666").font("Times-Roman").text(presLabel, width - 280, sigY + 16, { width: 160, align: "center" });
    }

    doc.fontSize(8).fillColor("#0B2C6B").font("Times-Bold").text(`Certificate No: ${certificate.certificateNo}`, 60, height - 70);
    doc
      .fontSize(8)
      .fillColor("#0B2C6B")
      .font("Times-Bold")
      .text(`Issue Date: ${new Date(certificate.issueDate).toISOString().slice(0, 10)}`, width - 220, height - 70, {
        width: 160,
        align: "right",
      });

    doc
      .fontSize(7)
      .fillColor("#777")
      .font("Times-Roman")
      .text("This certificate has been digitally generated by SEVA INDIA FOUNDATION. No physical signature is required.", 0, height - 55, {
        align: "center",
      })
      .text(`Verify online at: ${certificate.verifyUrl}`, 0, height - 43, { align: "center" });

    doc.end();
    stream.on("finish", () => resolve(relativePath));
    stream.on("error", reject);
  });
};