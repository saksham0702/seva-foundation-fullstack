import { ICertificate, CertificateModel, RecipientType, CertificateType } from "./certificates.model";
import { DonorModel } from "../donors/donors.model";
import { SignatureService } from "../signatures/signatures.service";
import { generateCertificateNumber, buildVerifyUrl, generateQrCodeDataUrl } from "./certificates.utils";
import { generateCertificatePdf } from "./certificates.pdf";

interface CreateCertificateInput {
  recipientType: RecipientType;
  recipientModel?: "Donor" | "User" | "Beneficiary";
  recipientRef?: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  campaign?: string;
  donor?: string;
  certificateType?: CertificateType;
  designTheme?: string;
  programName: string;
  projectName?: string;
  duration?: string;
  issueDate?: Date;
  body: string;
  createdBy?: string;
  updatedBy?: string;
}

const buildCertificatePayload = async (input: CreateCertificateInput) => {
  const certificateNo = await generateCertificateNumber();
  const verifyUrl = buildVerifyUrl(certificateNo);
  const qrCodeImage = await generateQrCodeDataUrl(verifyUrl);
  const activeSignatures = await SignatureService.getActiveSignatures();

  return {
    ...input,
    certificateNo,
    verifyUrl,
    qrCodeImage,
    issueDate: input.issueDate || new Date(),
    certificateType: input.certificateType || "APPRECIATION",
    designTheme: input.designTheme || "Premium Blue",
    status: "ACTIVE" as const,
    signatures: {
      president: activeSignatures.president
        ? {
            label: activeSignatures.president.label,
            signatoryName: activeSignatures.president.signatoryName,
            imageUrl: activeSignatures.president.imageUrl,
          }
        : undefined,
      secretary: activeSignatures.secretary
        ? {
            label: activeSignatures.secretary.label,
            signatoryName: activeSignatures.secretary.signatoryName,
            imageUrl: activeSignatures.secretary.imageUrl,
          }
        : undefined,
      seal: activeSignatures.seal ? { imageUrl: activeSignatures.seal.imageUrl } : undefined,
    },
  };
};

const createCertificate = async (input: CreateCertificateInput): Promise<ICertificate> => {
  const payload = await buildCertificatePayload(input);
  const cert = await CertificateModel.create(payload);
  try {
    const pdfUrl = await generateCertificatePdf(cert);
    cert.pdfUrl = pdfUrl;
    await cert.save();
  } catch (err) {
    console.error("Auto PDF generation error:", err);
  }
  return cert;
};

const getAllCertificates = async (query: {
  recipientType?: RecipientType;
  status?: string;
  campaign?: string;
  search?: string;
}): Promise<ICertificate[]> => {
  const filter: any = { isDeleted: false };
  if (query.recipientType) filter.recipientType = query.recipientType;
  if (query.status) filter.status = query.status;
  if (query.campaign) filter.campaign = query.campaign;
  if (query.search) {
    filter.$or = [
      { recipientName: { $regex: query.search, $options: "i" } },
      { certificateNo: { $regex: query.search, $options: "i" } },
    ];
  }

  return CertificateModel.find(filter)
    .populate("campaign", "name")
    .populate("donor", "name email")
    .sort({ createdAt: -1 });
};

const getCertificateById = async (id: string): Promise<ICertificate | null> => {
  return CertificateModel.findOne({ _id: id, isDeleted: false })
    .populate("campaign", "name")
    .populate("donor", "name email");
};

const getCertificateByCertificateNo = async (certificateNo: string): Promise<ICertificate | null> => {
  return CertificateModel.findOne({ certificateNo, isDeleted: false }).populate("campaign", "name");
};
const getCertificateByDonor = async (donorId: string): Promise<ICertificate | null> => {
  return CertificateModel.findOne({ donor: donorId, isDeleted: false })
    .populate("campaign", "name");
};
const verifyCertificate = async (certificateNo: string) => {
  const certificate = await getCertificateByCertificateNo(certificateNo);
  if (!certificate) return { valid: false, certificate: null };
  return { valid: certificate.status === "ACTIVE", certificate };
};

const updateCertificate = async (id: string, payload: Partial<ICertificate>): Promise<ICertificate | null> => {
  return CertificateModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: payload }, { new: true, runValidators: true });
};

const revokeCertificate = async (id: string, reason: string, updatedBy?: string): Promise<ICertificate | null> => {
  const updateObj: Record<string, any> = { status: "REVOKED", revokedReason: reason };
  if (updatedBy) updateObj.updatedBy = updatedBy;
  return CertificateModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: updateObj },
    { new: true }
  );
};

const reactivateCertificate = async (id: string, updatedBy?: string): Promise<ICertificate | null> => {
  const updateObj: Record<string, any> = { status: "ACTIVE" };
  if (updatedBy) updateObj.updatedBy = updatedBy;
  return CertificateModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      $set: updateObj,
      $unset: { revokedReason: 1 },
    },
    { new: true }
  );
};

const deleteCertificate = async (id: string): Promise<ICertificate | null> => {
  return CertificateModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

const generateCertificateForDonor = async (
  donorId: string,
  extra: Partial<CreateCertificateInput> = {}
): Promise<ICertificate> => {
  const donor = await DonorModel.findOne({ _id: donorId, isDeleted: false }).populate("campaign");
  if (!donor) throw new Error("Donor not found");
  if (donor.status !== "PAID") throw new Error("Certificate can only be generated after successful payment");

  const existing = await CertificateModel.findOne({ donor: donor._id, isDeleted: false });
  if (existing) {
    if (!existing.pdfUrl) {
      try {
        existing.pdfUrl = await generateCertificatePdf(existing);
        await existing.save();
      } catch (err) {}
    }
    return existing;
  }

  const campaignName = (donor.campaign as any)?.name || "General Donation";

  const input: CreateCertificateInput = {
    recipientType: "DONOR",
    recipientModel: "Donor",
    recipientRef: String(donor._id),
    recipientName: donor.name || "Valued Donor",
    recipientEmail: donor.email,
    recipientPhone: donor.phone,
    campaign: donor.campaign ? String((donor.campaign as any)._id || donor.campaign) : undefined,
    donor: String(donor._id),
    certificateType: "DONATION_ACKNOWLEDGEMENT",
    programName: campaignName,
    body:
      extra.body ||
      `In recognition of your generous contribution towards "${campaignName}". Your support has significantly contributed to creating positive social impact and strengthening our mission of serving communities with dignity, compassion and excellence.`,
    ...extra,
  };

  return createCertificate(input);
};

const getCertificateStats = async () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, active, revoked, generatedToday, generatedThisMonth] = await Promise.all([
    CertificateModel.countDocuments({ isDeleted: false }),
    CertificateModel.countDocuments({ isDeleted: false, status: "ACTIVE" }),
    CertificateModel.countDocuments({ isDeleted: false, status: "REVOKED" }),
    CertificateModel.countDocuments({ isDeleted: false, createdAt: { $gte: startOfToday } }),
    CertificateModel.countDocuments({ isDeleted: false, createdAt: { $gte: startOfMonth } }),
  ]);

  return { totalCertificates: total, activeCertificates: active, revokedCertificates: revoked, generatedToday, generatedThisMonth };
};

const regenerateCertificatePdf = async (id: string): Promise<ICertificate | null> => {
  const certificate = await CertificateModel.findOne({ _id: id, isDeleted: false });
  if (!certificate) return null;
  certificate.pdfUrl = await generateCertificatePdf(certificate);
  await certificate.save();
  return certificate;
};

export const CertificateService = {
  createCertificate,
  getAllCertificates,
  getCertificateById,
  getCertificateByCertificateNo,
  verifyCertificate,
  updateCertificate,
  revokeCertificate,
  reactivateCertificate,
  deleteCertificate,
  generateCertificateForDonor,
  getCertificateStats,
  getCertificateByDonor,
  regenerateCertificatePdf,
};