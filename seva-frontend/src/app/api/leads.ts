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

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "NOT_APPLICABLE";

export type FollowUpChannel = "CALL" | "WHATSAPP" | "EMAIL" | "MEETING" | "NOTE";

export interface FollowUp {
  _id?: string;
  channel: FollowUpChannel;
  disposition: string;
  notes: string;
  nextFollowUpDate?: string;
  loggedBy?: string;
  loggedByName?: string;
  createdAt: string;
}

export type FollowUpCategory = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "CALLBACK";

export interface FollowUpConfig {
  _id: string;
  name: string;
  category: FollowUpCategory;
  color: string;
  defaultNotes?: string;
  requiresNextAction: boolean;
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  paymentStatus?: PaymentStatus;
  campaign?: { _id: string; name: string; slug?: string };
  donor?: { _id: string; name?: string; email?: string; phone?: string; status?: string };
  amount?: number;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  assignedTo?: { _id: string; name: string; email: string };
  followUps?: FollowUp[];
  latestFollowUp?: {
    channel: FollowUpChannel;
    disposition: string;
    notes: string;
    nextFollowUpDate?: string;
    loggedByName?: string;
    createdAt: string;
  };
  nextFollowUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadStats {
  total: number;
  newLeads: number;
  paymentFailed: number;
  unpaidDonors: number;
  subscribers: number;
  converted: number;
  inProgress: number;
  followUpsDueToday: number;
  followUpsOverdue: number;
}

export interface GetLeadsQuery {
  page?: number;
  limit?: number;
  search?: string;
  source?: string;
  status?: string;
  paymentStatus?: string;
  donorType?: "all" | "unpaid" | "paid" | "failed" | "subscriber" | "inquiry";
  campaign?: string;
  startDate?: string;
  endDate?: string;
  followUpStatus?: "all" | "due_today" | "overdue" | "upcoming" | "none";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
      unpaidDonors: 0,
      subscribers: 0,
      converted: 0,
      inProgress: 0,
      followUpsDueToday: 0,
      followUpsOverdue: 0,
    }
  );
};

export const getLeadById = async (id: string): Promise<Lead> => {
  const { data } = await axiosInstance.get(endpoint.leads.getById + id);
  return data?.data;
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

export const addFollowUpLog = async (
  leadId: string,
  payload: {
    channel: FollowUpChannel;
    disposition: string;
    notes: string;
    nextFollowUpDate?: string;
    loggedByName?: string;
  }
): Promise<Lead> => {
  const { data } = await axiosInstance.post(endpoint.leads.addFollowUp(leadId), payload);
  return data?.data;
};

// ── Follow-up Configurations CRUD ─────────────────────────────────────────────
export const getFollowUpConfigs = async (): Promise<FollowUpConfig[]> => {
  const { data } = await axiosInstance.get(endpoint.leads.getConfigs);
  return data?.data || [];
};

export const createFollowUpConfig = async (
  payload: Partial<FollowUpConfig>
): Promise<FollowUpConfig> => {
  const { data } = await axiosInstance.post(endpoint.leads.createConfig, payload);
  return data?.data;
};

export const updateFollowUpConfig = async (
  id: string,
  payload: Partial<FollowUpConfig>
): Promise<FollowUpConfig> => {
  const { data } = await axiosInstance.patch(endpoint.leads.updateConfig(id), payload);
  return data?.data;
};

export const deleteFollowUpConfig = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoint.leads.deleteConfig(id));
};

// ── Newsletter & Public Capture ───────────────────────────────────────────────
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
