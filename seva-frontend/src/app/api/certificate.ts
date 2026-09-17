import axiosInstance from "./index";
import { endpoint } from "./endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RecipientType =
  | "DONOR"
  | "VOLUNTEER"
  | "BENEFICIARY"
  | "INTERN"
  | "STAFF"
  | "OTHER";

export type CertificateType =
  | "APPRECIATION"
  | "COMPLETION"
  | "PARTICIPATION"
  | "DONATION_ACKNOWLEDGEMENT"
  | "TRAINING"
  | "OTHER";

export type CertificateStatus = "ACTIVE" | "REVOKED";

export interface Certificate {
  _id: string;
  certificateNo: string;
  recipientType: RecipientType;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  campaign?: { _id: string; name: string };
  donor?: { _id: string; name?: string; email?: string };
  certificateType: CertificateType;
  designTheme: string;
  programName: string;
  projectName?: string;
  duration?: string;
  issueDate: string;
  body: string;
  verifyUrl: string;
  qrCodeImage?: string;
  pdfUrl?: string;
  signatures?: {
    president?: { label: string; signatoryName?: string; imageUrl: string };
    secretary?: { label: string; signatoryName?: string; imageUrl: string };
    seal?: { imageUrl: string };
  };
  status: CertificateStatus;
  revokedReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCertificatePayload {
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
  issueDate?: string;
  body: string;
}

export interface CertificateStats {
  totalCertificates: number;
  activeCertificates: number;
  revokedCertificates: number;
  generatedToday: number;
  generatedThisMonth: number;
}

export interface GetCertificatesParams {
  recipientType?: RecipientType;
  status?: CertificateStatus;
  campaign?: string;
  search?: string;
}

// ─── API functions ─────────────────────────────────────────────────────────────

export const getCertificates = async (
  params?: GetCertificatesParams
): Promise<Certificate[]> => {
  const { data } = await axiosInstance.get(endpoint.certificates.getAll, {
    params,
  });
  return data?.data || data || [];
};

export const getCertificateStats = async (): Promise<CertificateStats> => {
  const { data } = await axiosInstance.get(endpoint.certificates.getStats);
  return data?.data || data;
};

export const getCertificateById = async (
  id: string
): Promise<Certificate> => {
  const { data } = await axiosInstance.get(
    endpoint.certificates.getById + id
  );
  return data?.data || data;
};


export const createCertificate = async (
  payload: CreateCertificatePayload
): Promise<Certificate> => {
  const { data } = await axiosInstance.post(
    endpoint.certificates.create,
    payload
  );
  return data?.data || data;
};

export const generateCertificateForDonor = async (
  donorId: string,
  extra?: Partial<CreateCertificatePayload>
): Promise<Certificate> => {
  const { data } = await axiosInstance.post(
    endpoint.certificates.fromDonor(donorId),
    extra || {}
  );
  return data?.data || data;
};

export const generatePdf = async (id: string): Promise<Certificate> => {
  const { data } = await axiosInstance.post(
    endpoint.certificates.generatePdf(id)
  );
  return data?.data || data;
};

export const revokeCertificate = async (
  id: string,
  reason: string
): Promise<Certificate> => {
  const { data } = await axiosInstance.patch(
    endpoint.certificates.revoke(id),
    { reason }
  );
  return data?.data || data;
};

export const reactivateCertificate = async (
  id: string
): Promise<Certificate> => {
  const { data } = await axiosInstance.patch(
    endpoint.certificates.reactivate(id)
  );
  return data?.data || data;
};

export const updateCertificate = async (
  id: string,
  payload: Partial<CreateCertificatePayload>
): Promise<Certificate> => {
  const { data } = await axiosInstance.patch(
    endpoint.certificates.update + id,
    payload
  );
  return data?.data || data;
};

export const deleteCertificate = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoint.certificates.delete + id);
};


export const getCertificateByDonor = async (
  donorId: string
): Promise<Certificate | null> => {
  try {
    const { data } = await axiosInstance.get(
      endpoint.certificates.byDonor(donorId)
    );
    return data?.data || data;
  } catch {
    return null; // not generated yet — not an error state for the UI
  }
};

export const verifyCertificate = async (
  certificateNo: string
): Promise<{ valid: boolean; certificate: Certificate | null; message?: string }> => {
  try {
    const { data } = await axiosInstance.get(
      endpoint.certificates.verify(certificateNo)
    );
    return data?.data || { valid: false, certificate: null };
  } catch (error: any) {
    return {
      valid: false,
      certificate: null,
      message: error?.response?.data?.message || "Certificate not found or invalid",
    };
  }
};