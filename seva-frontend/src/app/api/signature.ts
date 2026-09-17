import axiosInstance from "./index";
import { endpoint } from "./endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignatureType = "PRESIDENT" | "SECRETARY" | "SEAL";

export interface Signature {
  _id: string;
  type: SignatureType;
  label: string;
  signatoryName?: string;
  imageUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveSignatures {
  president: Signature | null;
  secretary: Signature | null;
  seal: Signature | null;
}

// ─── API functions ─────────────────────────────────────────────────────────────

export const getActiveSignatures = async (): Promise<ActiveSignatures> => {
  const { data } = await axiosInstance.get(endpoint.signatures.getActive);
  return data?.data || data;
};

export const getAllSignatures = async (
  type?: SignatureType
): Promise<Signature[]> => {
  const { data } = await axiosInstance.get(endpoint.signatures.getAll, {
    params: type ? { type } : undefined,
  });
  return data?.data || data || [];
};

export const uploadSignature = async (
  type: SignatureType,
  label: string,
  imageFile: File,
  signatoryName?: string
): Promise<Signature> => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("type", type);
  formData.append("label", label);
  if (signatoryName) formData.append("signatoryName", signatoryName);

  const { data } = await axiosInstance.post(
    endpoint.signatures.create,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data?.data || data;
};

export const deleteSignature = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoint.signatures.delete + id);
};