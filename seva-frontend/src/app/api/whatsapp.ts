import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export interface IAudienceCounts {
  ALL_DONORS: number;
  PAID_DONORS: number;
  RECURRING_DONORS: number;
  FAILED_PAYMENT_DONORS: number;
  VOLUNTEERS: number;
  LEADS: number;
}

export interface IWhatsAppStats {
  totalCampaigns: number;
  completedCampaigns: number;
  totalMessagesSent: number;
  totalMessagesFailed: number;
  successRate: number;
}

export interface IWhatsAppTemplate {
  _id?: string;
  name: string;
  category: "DONATION" | "VOLUNTEER" | "CAMPAIGN" | "NEWSLETTER" | "GENERAL";
  body: string;
  headerType: "NONE" | "TEXT" | "IMAGE" | "DOCUMENT";
  headerMediaUrl?: string;
  footerText?: string;
  sampleVariables?: Record<string, string>;
  isSystem?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface IRecipient {
  _id?: string;
  recipientId?: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  status: "PENDING" | "SENT" | "FAILED" | "SKIPPED";
  variables?: Record<string, any>;
  sentAt?: string;
  errorReason?: string;
  messageId?: string;
}

export interface IWhatsAppCampaign {
  _id: string;
  name: string;
  description?: string;
  provider: "BAILEYS" | "OFFICIAL_API";
  audienceType:
    | "ALL_DONORS"
    | "PAID_DONORS"
    | "RECURRING_DONORS"
    | "FAILED_PAYMENT_DONORS"
    | "VOLUNTEERS"
    | "LEADS"
    | "CUSTOM_FILE";
  audienceFilter?: any;
  messageType: "TEXT" | "IMAGE" | "DOCUMENT" | "TEMPLATE";
  templateId?: string;
  messageBody: string;
  mediaUrl?: string;
  caption?: string;
  status:
    | "DRAFT"
    | "QUEUED"
    | "IN_PROGRESS"
    | "PAUSED"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";
  antiBanConfig: {
    minDelaySeconds: number;
    maxDelaySeconds: number;
    maxMessagesIn20Seconds: number;
    batchSize: number;
    batchPauseSeconds: number;
  };
  stats: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  recipients?: IRecipient[];
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface IWhatsAppConfigData {
  config: {
    _id?: string;
    activeProvider: "BAILEYS" | "OFFICIAL_API";
    baileys: {
      sessionName: string;
      status: "DISCONNECTED" | "SCAN_QR" | "CONNECTING" | "CONNECTED";
      phoneNumber?: string;
      userName?: string;
      platform?: string;
      lastConnectedAt?: string;
      qrCode?: string;
      disconnectReason?: string;
    };
    officialApi: {
      phoneNumberId?: string;
      businessAccountId?: string;
      accessToken?: string;
      apiVersion?: string;
      webhookVerifyToken?: string;
      senderPhoneNumber?: string;
      isConfigured: boolean;
    };
    antiBanDefaults: {
      minDelaySeconds: number;
      maxDelaySeconds: number;
      maxMessagesIn20Seconds: number;
      batchSize: number;
      batchPauseSeconds: number;
    };
  };
  baileysLive: {
    status: "DISCONNECTED" | "SCAN_QR" | "CONNECTING" | "CONNECTED";
    qrCode: string;
    phoneNumber: string;
    userName: string;
    lastConnectedAt?: string;
    disconnectReason?: string;
    isConnected: boolean;
  };
}

export const whatsappAPI = {
  getStats: async (): Promise<IWhatsAppStats> => {
    const res = await axiosInstance.get(endpoint.whatsapp.stats);
    return res.data?.data || res.data;
  },

  getAudienceCounts: async (): Promise<IAudienceCounts> => {
    const res = await axiosInstance.get(endpoint.whatsapp.audienceCounts);
    return res.data?.data || res.data;
  },

  previewRecipients: async (
    audienceType: string,
    filter?: any
  ): Promise<{ recipients: IRecipient[]; count: number }> => {
    const res = await axiosInstance.get(endpoint.whatsapp.previewRecipients, {
      params: { audienceType, ...filter },
    });
    return res.data?.data || res.data || { recipients: [], count: 0 };
  },

  getCampaigns: async (params?: {
    status?: string;
    provider?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ campaigns: IWhatsAppCampaign[]; total: number; page: number; totalPages: number }> => {
    const res = await axiosInstance.get(endpoint.whatsapp.getCampaigns, { params });
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      return { campaigns: data, total: data.length, page: 1, totalPages: 1 };
    }
    return {
      campaigns: data?.campaigns || [],
      total: data?.total || 0,
      page: data?.page || 1,
      totalPages: data?.totalPages || 1,
    };
  },

  getCampaignById: async (id: string): Promise<IWhatsAppCampaign> => {
    const res = await axiosInstance.get(endpoint.whatsapp.getCampaignById(id));
    return res.data?.data || res.data;
  },

  createCampaign: async (payload: any): Promise<IWhatsAppCampaign> => {
    const res = await axiosInstance.post(endpoint.whatsapp.createCampaign, payload);
    return res.data?.data || res.data;
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoint.whatsapp.deleteCampaign(id));
  },

  startCampaign: async (id: string): Promise<IWhatsAppCampaign> => {
    const res = await axiosInstance.post(endpoint.whatsapp.startCampaign(id));
    return res.data?.data || res.data;
  },

  pauseCampaign: async (id: string): Promise<IWhatsAppCampaign> => {
    const res = await axiosInstance.post(endpoint.whatsapp.pauseCampaign(id));
    return res.data?.data || res.data;
  },

  resumeCampaign: async (id: string): Promise<IWhatsAppCampaign> => {
    const res = await axiosInstance.post(endpoint.whatsapp.resumeCampaign(id));
    return res.data?.data || res.data;
  },

  retryFailed: async (id: string): Promise<IWhatsAppCampaign> => {
    const res = await axiosInstance.post(endpoint.whatsapp.retryFailed(id));
    return res.data?.data || res.data;
  },

  getTemplates: async (): Promise<IWhatsAppTemplate[]> => {
    const res = await axiosInstance.get(endpoint.whatsapp.getTemplates);
    return res.data?.data || res.data || [];
  },

  createTemplate: async (payload: Partial<IWhatsAppTemplate>): Promise<IWhatsAppTemplate> => {
    const res = await axiosInstance.post(endpoint.whatsapp.createTemplate, payload);
    return res.data?.data || res.data;
  },

  updateTemplate: async (
    id: string,
    payload: Partial<IWhatsAppTemplate>
  ): Promise<IWhatsAppTemplate> => {
    const res = await axiosInstance.patch(endpoint.whatsapp.updateTemplate(id), payload);
    return res.data?.data || res.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoint.whatsapp.deleteTemplate(id));
  },

  seedTemplates: async (): Promise<IWhatsAppTemplate[]> => {
    const res = await axiosInstance.post(endpoint.whatsapp.seedTemplates);
    return res.data?.data || res.data;
  },

  getConfig: async (): Promise<IWhatsAppConfigData> => {
    const res = await axiosInstance.get(endpoint.whatsapp.getConfig);
    return res.data?.data || res.data;
  },

  updateConfig: async (payload: any): Promise<any> => {
    const res = await axiosInstance.post(endpoint.whatsapp.updateConfig, payload);
    return res.data?.data || res.data;
  },

  getBaileysStatus: async (): Promise<any> => {
    const res = await axiosInstance.get(endpoint.whatsapp.getBaileysStatus);
    return res.data?.data || res.data;
  },

  reconnectBaileys: async (): Promise<any> => {
    const res = await axiosInstance.post(endpoint.whatsapp.reconnectBaileys);
    return res.data?.data || res.data;
  },

  disconnectBaileys: async (): Promise<any> => {
    const res = await axiosInstance.post(endpoint.whatsapp.disconnectBaileys);
    return res.data?.data || res.data;
  },

  testOfficialApi: async (creds?: any): Promise<any> => {
    const res = await axiosInstance.post(endpoint.whatsapp.testOfficialApi, creds || {});
    return res.data?.data || res.data;
  },

  sendTestMessage: async (payload: {
    provider: "BAILEYS" | "OFFICIAL_API";
    phone: string;
    message: string;
    mediaUrl?: string;
    mediaType?: "IMAGE" | "DOCUMENT";
  }): Promise<any> => {
    const res = await axiosInstance.post(endpoint.whatsapp.sendTest, payload);
    return res.data?.data || res.data;
  },

  uploadExcelFile: async (
    file: File
  ): Promise<{
    validRecipients: Array<{ name: string; phone: string; variables: any }>;
    totalRows: number;
    invalidCount: number;
  }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post(endpoint.whatsapp.uploadExcel, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data || res.data;
  },

  getSampleExcelUrl: (): string => {
    return "/sample_broadcast_contacts.xlsx";
  },

  getLogs: async (params?: {
    campaignId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: any[]; total: number; page: number; totalPages: number }> => {
    const res = await axiosInstance.get(endpoint.whatsapp.getLogs, { params });
    return res.data?.data || res.data;
  },
};
