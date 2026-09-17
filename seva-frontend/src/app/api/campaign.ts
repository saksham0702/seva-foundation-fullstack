import axiosInstance from "./index";
import { endpoint } from "./endpoints";
import type { Category } from "./category";

export type CampaignStatus = "draft" | "active" | "completed" | "paused";

export interface Campaign {
  _id: string;
  name: string;
  slug: string;
  images: (string | File)[];
  description: string;
  content: string; // JSON string or text
  location?: string;
  category?: string | Category;
  status: CampaignStatus;
  goal: number;
  raisedAmount: number;
  donorCount: number;
  startDate?: string | Date;
  endDate?: string | Date;
  urgent?: boolean;
  featured?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface CampaignOption {
  _id: string;
  name: string;
  slug?: string;
  goal?: number;
  raisedAmount?: number;
}

export const getCampaigns = async (params?: {
  status?: string;
  category?: string;
  search?: string;
}): Promise<Campaign[]> => {
  const response = await axiosInstance.get(endpoint.campaigns.getAll, { params });
  return response.data?.data || response.data || [];
};

export const getCampaignOptions = async (): Promise<CampaignOption[]> => {
  const response = await axiosInstance.get(endpoint.campaigns.getOptions);
  return response.data?.data || response.data || [];
};

export const getCampaignById = async (id: string): Promise<Campaign> => {
  const response = await axiosInstance.get(endpoint.campaigns.getById + id);
  return response.data?.data || response.data;
};

export const getCampaignBySlug = async (slug: string): Promise<Campaign> => {
  const response = await axiosInstance.get(endpoint.campaigns.getBySlug(slug));
  return response.data?.data || response.data;
};

export const createCampaign = async (payload: FormData): Promise<Campaign> => {
  const response = await axiosInstance.post(endpoint.campaigns.create, payload);
  return response.data?.data || response.data;
};

export const updateCampaign = async (
  id: string,
  payload: Partial<Campaign> | FormData
): Promise<Campaign> => {
  const response = await axiosInstance.patch(
    endpoint.campaigns.update + id,
    payload
  );
  return response.data?.data || response.data;
};

export const toggleCampaignStatus = async (
  id: string,
  status: CampaignStatus
): Promise<Campaign> => {
  const response = await axiosInstance.patch(
    endpoint.campaigns.toggleStatus(id),
    { status }
  );
  return response.data?.data || response.data;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoint.campaigns.delete + id);
};

export interface PublicDonor {
  _id: string;
  name: string;
  amount: number;
  createdAt: string;
}

export interface CampaignDonorsResponse {
  donors: PublicDonor[];
  total: number;
  page: number;
  totalPages: number;
  campaign: {
    _id: string;
    name: string;
    raisedAmount: number;
    donorCount: number;
    goal: number;
    status: string;
  };
}

export const getCampaignDonors = async (
  slug: string,
  page = 1,
  limit = 5
): Promise<CampaignDonorsResponse> => {
  const response = await axiosInstance.get(endpoint.campaigns.getDonors(slug), {
    params: { page, limit },
  });
  return response.data?.data || response.data;
};