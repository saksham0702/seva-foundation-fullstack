import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export type DonationType = "MONEY" | "PRODUCT";
export type PaymentMethod = "ONLINE" | "OFFLINE";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface DonationItem {
  product?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Donation {
  _id: string;
  donor: string | {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    pan?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    status?: string;
  };
  campaign: string | {
    _id: string;
    name?: string;
    slug?: string;
    goal?: number;
    raisedAmount?: number;
  };
  amount: number;
  quantity: number;
  campaignProduct?: string | {
    _id: string;
    name?: string;
    price?: number;
  };
  items?: DonationItem[];
  donationType: DonationType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  receiptNumber?: string;
  remarks?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface InitiateOrderPayload {
  campaignId: string;
  amount: number;
  donationType: DonationType;
  campaignProduct?: string;
  quantity?: number;
  items?: DonationItem[];
  donorInfo: {
    name?: string;
    email?: string;
    phone?: string;
    pan?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    isAnonymous?: boolean;
    donorId?: string;
  };
  remarks?: string;
}

export interface InitiateOrderResponse {
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    status: string;
    keyId: string;
    isMock?: boolean;
  };
  donorId: string;
  campaignId: string;
  amount: number;
  keyId: string;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  donorId: string;
  campaignId: string;
  amount: number;
  donationType: DonationType;
  campaignProduct?: string;
  quantity?: number;
  items?: DonationItem[];
  remarks?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  donation: Donation;
  certificate?: {
    _id: string;
    certificateNo: string;
    pdfUrl?: string;
    verifyUrl?: string;
  };
  receiptNumber?: string;
}

export interface CreateDonationPayload {
  donor: string;
  campaign: string;
  amount: number;
  quantity?: number;
  campaignProduct?: string;
  items?: DonationItem[];
  donationType: DonationType;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
  remarks?: string;
}

export const initiatePaymentOrder = async (
  payload: InitiateOrderPayload
): Promise<InitiateOrderResponse> => {
  const response = await axiosInstance.post(
    endpoint.donations.createOrder,
    payload
  );
  return response.data?.data || response.data;
};

export const verifyPayment = async (
  payload: VerifyPaymentPayload
): Promise<VerifyPaymentResponse> => {
  const response = await axiosInstance.post(
    endpoint.donations.verify,
    payload
  );
  return response.data?.data || response.data;
};

export const recordPaymentFailed = async (payload: {
  donorId: string;
  campaignId?: string;
  reason?: string;
}): Promise<void> => {
  await axiosInstance.post(endpoint.donations.failed, payload);
};

export const getDonations = async (params?: {
  campaign?: string;
  status?: string;
  search?: string;
}): Promise<Donation[]> => {
  const response = await axiosInstance.get(endpoint.donations.getAll, {
    params,
  });
  return response.data?.data || response.data || [];
};

export const getDonationById = async (id: string): Promise<Donation> => {
  const response = await axiosInstance.get(endpoint.donations.getById + id);
  return response.data?.data || response.data;
};

export const createDonation = async (
  payload: CreateDonationPayload
): Promise<Donation> => {
  const response = await axiosInstance.post(
    endpoint.donations.create,
    payload
  );
  return response.data?.data || response.data;
};

export const deleteDonation = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoint.donations.delete + id);
};