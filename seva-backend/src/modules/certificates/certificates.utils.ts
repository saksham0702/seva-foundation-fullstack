import QRCode from "qrcode";
import { CertificateModel } from "./certificates.model";

const ORG_CODE = process.env.CERT_ORG_CODE || "SIF";

export const generateCertificateNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  let certificateNo = "";
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    const random = Math.floor(100000 + Math.random() * 900000);
    certificateNo = `${ORG_CODE}-CER-${year}-${random}`;
    exists = !!(await CertificateModel.findOne({ certificateNo }));
    attempts++;
  }

  if (exists) {
    throw new Error("Unable to generate a unique certificate number, please try again.");
  }

  return certificateNo;
};

export const buildVerifyUrl = (certificateNo: string): string => {
  const base = process.env.VERIFY_BASE_URL || "https://sevaindiafoundation.org/verify";
  return `${base}/${certificateNo}`;
};

export const generateQrCodeDataUrl = async (data: string): Promise<string> => {
  return QRCode.toDataURL(data, {
    margin: 1,
    width: 300,
    color: { dark: "#0B0F1F", light: "#FFFFFF" },
  });
};