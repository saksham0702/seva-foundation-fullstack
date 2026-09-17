import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export type LeadSource =
  | "SUBSCRIBER"
  | "PAYMENT_FAILED"
  | "DONOR_DROP"
  | "CONTACT_FORM"
  | "VOLUNTEER"
  | "MANUAL";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "CONVERTED"
  | "LOST";

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  campaign?: { _id: string; name: string; slug?: string };
  amount?: number;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  assignedTo?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface LeadStats {
  total: number;
  newLeads: number;
  paymentFailed: number;
  subscribers: number;
  converted: number;
  inProgress: number;
}

export interface GetLeadsQuery {
  page?: number;
  limit?: number;
  search?: string;
  source?: string;
  status?: string;
  campaign?: string;
}

export interface GetLeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

export const getLeads = async (params: GetLeadsQuery = {}): Promise<GetLeadsResponse> => {
  const { data } = await axiosInstance.get(endpoint.leads.getAll, { params });
  return data?.data || { leads: [], total: 0, page: 1, totalPages: 1 };
};

export const getLeadStats = async (): Promise<LeadStats> => {
  const { data } = await axiosInstance.get(endpoint.leads.getStats);
  return (
    data?.data || {
      total: 0,
      newLeads: 0,
      paymentFailed: 0,
      subscribers: 0,
      converted: 0,
      inProgress: 0,
    }
  );
};

export const createLead = async (payload: Partial<Lead>): Promise<Lead> => {
  const { data } = await axiosInstance.post(endpoint.leads.create, payload);
  return data?.data;
};

export const updateLead = async (id: string, payload: Partial<Lead>): Promise<Lead> => {
  const { data } = await axiosInstance.patch(endpoint.leads.update + id, payload);
  return data?.data;
};

export const deleteLead = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoint.leads.delete + id);
};

export const subscribeNewsletter = async (
  email: string,
  name?: string
): Promise<{ success: boolean; message: string; lead?: Lead }> => {
  const { data } = await axiosInstance.post(endpoint.leads.subscribe, {
    email,
    name,
  });
  return data;
};

export const captureLead = async (payload: {
  name?: string;
  email?: string;
  phone?: string;
  campaignId?: string;
  amount?: number;
  reason?: string;
  source?: LeadSource;
}): Promise<Lead> => {
  const { data } = await axiosInstance.post(endpoint.leads.capture, payload);
  return data?.data;
};
