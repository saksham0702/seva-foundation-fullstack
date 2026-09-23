import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export type DonorStatus =
  | "FILLED_NOT_PAID"
  | "PAYMENT_FAILED"
  | "PAID";

export interface Donor {
  _id: string;
  campaign?: string | {
    _id: string;
    name: string;
    slug?: string;
  };
  targetType?: "CAMPAIGN" | "INITIATIVE" | "GENERAL";
  initiative?: string;
  frequency?: "ONE_TIME" | "MONTHLY";
  tribute?: string;
  message?: string;
  name?: string;
  email?: string;
  phone?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isAnonymous?: boolean;
  status: DonorStatus;
  totalPaid?: number;
  donationCount?: number;
  donations?: Array<{
    _id: string;
    amount: number;
    campaign?: any;
    initiative?: string;
    targetType?: string;
    frequency?: string;
    paymentStatus: string;
    receiptNumber?: string;
    createdAt?: string;
  }>;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface CreateDonorPayload {
  campaign?: string;
  targetType?: "CAMPAIGN" | "INITIATIVE" | "GENERAL";
  initiative?: string;
  frequency?: "ONE_TIME" | "MONTHLY";
  tribute?: string;
  message?: string;
  name?: string;
  email?: string;
  phone?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isAnonymous?: boolean;
  amount?: number;
}

export interface UpdateDonorPayload {
  campaign?: string;
  targetType?: "CAMPAIGN" | "INITIATIVE" | "GENERAL";
  initiative?: string;
  frequency?: "ONE_TIME" | "MONTHLY";
  tribute?: string;
  message?: string;
  name?: string;
  email?: string;
  phone?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isAnonymous?: boolean;
  status?: DonorStatus;
}

export interface GetDonorsParams {
  campaign?: string;
  initiative?: string;
  targetType?: string;
  frequency?: string;
  status?: DonorStatus;
  search?: string;
}

export const getDonors = async (
  params?: GetDonorsParams
): Promise<Donor[]> => {
  const response = await axiosInstance.get(
    endpoint.donors.getAll,
    {
      params,
    }
  );
  return response.data?.data || response.data || [];
};

export const getDonorById = async (
  id: string
): Promise<Donor> => {
  const response = await axiosInstance.get(
    endpoint.donors.getById + id
  );
  return response.data?.data || response.data;
};

export const createDonor = async (
  payload: CreateDonorPayload
): Promise<Donor> => {
  const response = await axiosInstance.post(
    endpoint.donors.create,
    payload
  );
  return response.data?.data || response.data;
};

export const updateDonor = async (
  id: string,
  payload: UpdateDonorPayload
): Promise<Donor> => {
  const response = await axiosInstance.patch(
    endpoint.donors.update + id,
    payload
  );
  return response.data?.data || response.data;
};

export const deleteDonor = async (
  id: string
): Promise<void> => {
  await axiosInstance.delete(
    endpoint.donors.delete + id
  );
};