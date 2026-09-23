import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { CertificateService } from "./certificates.service";
import { RecipientType } from "./certificates.model";

const createCertificate = asyncHandler(async (req: Request, res: Response) => {
  const result = await CertificateService.createCertificate(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Certificate generated successfully", data: result });
});

const getAllCertificates = asyncHandler(async (req: Request, res: Response) => {
  const result = await CertificateService.getAllCertificates({
    recipientType: req.query.recipientType as RecipientType | undefined,
    status: req.query.status as string | undefined,
    campaign: req.query.campaign as string | undefined,
    search: req.query.search as string | undefined,
  });
  sendResponse(res, { statusCode: 200, success: true, message: "Certificates fetched successfully", data: result });
});

const getCertificateStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await CertificateService.getCertificateStats();
  sendResponse(res, { statusCode: 200, success: true, message: "Certificate stats fetched successfully", data: result });
});

const getCertificateById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CertificateService.getCertificateById(id);
  if (!result) return sendResponse(res, { statusCode: 404, success: false, message: "Certificate not found" });
  sendResponse(res, { statusCode: 200, success: true, message: "Certificate fetched successfully", data: result });
});

const verifyCertificate = asyncHandler(async (req: Request, res: Response) => {
  const { certificateNo } = req.params as { certificateNo: string };
  const result = await CertificateService.verifyCertificate(certificateNo);
  if (!result.certificate) {
    return sendResponse(res, { statusCode: 404, success: false, message: "No certificate found with this code", data: { valid: false } });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.valid ? "Certificate is valid" : "Certificate has been revoked",
    data: result,
  });
});

const updateCertificate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CertificateService.updateCertificate(id, req.body);
  if (!result) return sendResponse(res, { statusCode: 404, success: false, message: "Certificate not found" });
  sendResponse(res, { statusCode: 200, success: true, message: "Certificate updated successfully", data: result });
});



const revokeCertificate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { reason } = req.body as { reason: string };
  const updatedBy = (req as any).user?._id || req.body?.updatedBy;
  const result = await CertificateService.revokeCertificate(id, reason, updatedBy);
  if (!result) return sendResponse(res, { statusCode: 404, success: false, message: "Certificate not found" });
  sendResponse(res, { statusCode: 200, success: true, message: "Certificate revoked successfully", data: result });
});

const reactivateCertificate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const updatedBy = (req as any).user?._id || req.body?.updatedBy;
  const result = await CertificateService.reactivateCertificate(id, updatedBy);
  if (!result) return sendResponse(res, { statusCode: 404, success: false, message: "Certificate not found" });
  sendResponse(res, { statusCode: 200, success: true, message: "Certificate reactivated successfully", data: result });
});

const deleteCertificate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await CertificateService.deleteCertificate(id);
  sendResponse(res, { statusCode: 200, success: true, message: "Certificate deleted successfully", data: null });
});

const generateCertificateForDonor = asyncHandler(async (req: Request, res: Response) => {
  const { donorId } = req.params as { donorId: string };
  try {
    const result = await CertificateService.generateCertificateForDonor(donorId, req.body);
    sendResponse(res, { statusCode: 201, success: true, message: "Certificate generated successfully", data: result });
  } catch (err: any) {
    sendResponse(res, { statusCode: 400, success: false, message: err.message || "Unable to generate certificate" });
  }
});

const generatePdf = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CertificateService.regenerateCertificatePdf(id);
  if (!result) return sendResponse(res, { statusCode: 404, success: false, message: "Certificate not found" });
  sendResponse(res, { statusCode: 200, success: true, message: "Certificate PDF generated successfully", data: result });
});

const getCertificateByDonor = asyncHandler(async (req: Request, res: Response) => {
  const { donorId } = req.params as { donorId: string };
  const result = await CertificateService.getCertificateByDonor(donorId);
  if (!result) return sendResponse(res, { statusCode: 404, success: false, message: "No certificate found for this donor yet" });
  sendResponse(res, { statusCode: 200, success: true, message: "Certificate fetched successfully", data: result });
});

export const CertificateController = {
  createCertificate,
  getAllCertificates,
  getCertificateStats,
  getCertificateById,
  verifyCertificate,
  updateCertificate,
  revokeCertificate,
  reactivateCertificate,
  deleteCertificate,
  generateCertificateForDonor,
  getCertificateByDonor,
  generatePdf,
};