import {
  LeadModel,
  ILead,
  LeadSource,
  LeadStatus,
  PaymentStatus,
  FollowUpChannel,
} from "./leads.model";
import {
  FollowUpConfigModel,
  IFollowUpConfig,
  DEFAULT_FOLLOW_UP_CONFIGS,
} from "./leads-config.model";
import "../campaigns/campaigns.model";
import "../auth/auth.model";
import "../donors/donors.model";

interface LeadFilters {
  search?: string;
  source?: LeadSource;
  status?: LeadStatus;
  paymentStatus?: PaymentStatus;
  donorType?: "all" | "unpaid" | "paid" | "failed" | "subscriber" | "inquiry";
  campaign?: string;
  startDate?: string;
  endDate?: string;
  followUpStatus?: "all" | "due_today" | "overdue" | "upcoming" | "none";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const createLead = async (payload: Partial<ILead>): Promise<ILead> => {
  return LeadModel.create(payload);
};

const getAllLeads = async (filters: LeadFilters = {}) => {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Number(filters.limit) || 20);
  const skip = (page - 1) * limit;

  const query: any = { isDeleted: false };

  if (filters.status && filters.status !== ("ALL" as any)) {
    query.status = filters.status;
  }

  if (filters.source && filters.source !== ("ALL" as any)) {
    query.source = filters.source;
  }

  if (filters.paymentStatus && filters.paymentStatus !== ("ALL" as any)) {
    query.paymentStatus = filters.paymentStatus;
  }

  // Donor Type filter
  if (filters.donorType && filters.donorType !== "all") {
    if (filters.donorType === "unpaid") {
      query.$or = [
        { paymentStatus: "PENDING" },
        { source: "DONOR_DROP", status: { $ne: "CONVERTED" } },
      ];
    } else if (filters.donorType === "failed") {
      query.$or = [{ paymentStatus: "FAILED" }, { source: "PAYMENT_FAILED" }];
    } else if (filters.donorType === "paid") {
      query.$or = [{ paymentStatus: "PAID" }, { status: "CONVERTED" }];
    } else if (filters.donorType === "subscriber") {
      query.source = "SUBSCRIBER";
    } else if (filters.donorType === "inquiry") {
      query.source = { $in: ["CONTACT_FORM", "MANUAL", "VOLUNTEER"] };
    }
  }

  if (filters.campaign && filters.campaign !== "ALL") {
    query.campaign = filters.campaign;
  }

  // Date Range filter on createdAt
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      query.createdAt.$gte = start;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  // Follow-up status filter on nextFollowUpDate
  if (filters.followUpStatus && filters.followUpStatus !== "all") {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (filters.followUpStatus === "due_today") {
      query.nextFollowUpDate = { $gte: startOfToday, $lte: endOfToday };
    } else if (filters.followUpStatus === "overdue") {
      query.nextFollowUpDate = { $lt: startOfToday };
    } else if (filters.followUpStatus === "upcoming") {
      query.nextFollowUpDate = { $gt: endOfToday };
    } else if (filters.followUpStatus === "none") {
      query.nextFollowUpDate = { $exists: false };
    }
  }

  if (filters.search) {
    const regex = new RegExp(filters.search.trim(), "i");
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const sort: any = {};
  if (filters.sortBy) {
    sort[filters.sortBy] = filters.sortOrder === "asc" ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }

  const [leads, total] = await Promise.all([
    LeadModel.find(query)
      .populate("campaign", "name slug")
      .populate("assignedTo", "name email")
      .populate("donor", "name email phone status")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    LeadModel.countDocuments(query),
  ]);

  return {
    leads,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const getLeadById = async (id: string): Promise<ILead | null> => {
  return LeadModel.findOne({ _id: id, isDeleted: false })
    .populate("campaign", "name slug")
    .populate("assignedTo", "name email")
    .populate("donor", "name email phone status");
};

const updateLead = async (
  id: string,
  payload: Partial<ILead>
): Promise<ILead | null> => {
  return LeadModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: payload },
    { new: true, runValidators: true }
  )
    .populate("campaign", "name slug")
    .populate("assignedTo", "name email");
};

const deleteLead = async (id: string): Promise<boolean> => {
  const res = await LeadModel.findOneAndUpdate(
    { _id: id },
    { $set: { isDeleted: true } }
  );
  return !!res;
};

// ── Follow-up activity logging ────────────────────────────────────────────────
const addFollowUp = async (
  leadId: string,
  payload: {
    channel: FollowUpChannel;
    disposition: string;
    notes: string;
    nextFollowUpDate?: string | Date;
    loggedBy?: string;
    loggedByName?: string;
  }
) => {
  const lead = await LeadModel.findOne({ _id: leadId, isDeleted: false });
  if (!lead) return null;

  const nextDate = payload.nextFollowUpDate
    ? new Date(payload.nextFollowUpDate)
    : undefined;

  const followUpItem = {
    channel: payload.channel || "CALL",
    disposition: payload.disposition,
    notes: payload.notes || "",
    nextFollowUpDate: nextDate,
    loggedBy: payload.loggedBy as any,
    loggedByName: payload.loggedByName || "Admin Staff",
    createdAt: new Date(),
  };

  lead.followUps = lead.followUps || [];
  lead.followUps.unshift(followUpItem as any);

  lead.latestFollowUp = {
    channel: followUpItem.channel,
    disposition: followUpItem.disposition,
    notes: followUpItem.notes,
    nextFollowUpDate: nextDate,
    loggedByName: followUpItem.loggedByName,
    createdAt: followUpItem.createdAt,
  };

  if (nextDate) {
    lead.nextFollowUpDate = nextDate;
  }

  // Adjust lead status based on disposition
  const dispLower = payload.disposition.toLowerCase();
  if (dispLower.includes("not interested") || dispLower.includes("wrong number")) {
    lead.status = "LOST";
  } else if (dispLower.includes("donat") || dispLower.includes("converted") || dispLower.includes("paid")) {
    lead.status = "CONVERTED";
  } else if (lead.status === "NEW") {
    lead.status = "CONTACTED";
  }

  // Append to notes string for quick reference
  const timestamp = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  lead.notes = `[${timestamp} | ${payload.channel} - ${payload.disposition}]: ${
    payload.notes || "No extra notes"
  }\n${lead.notes || ""}`.trim();

  await lead.save();
  return lead;
};

// ── Lead Stats ────────────────────────────────────────────────────────────────
const getLeadStats = async () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [
    total,
    newLeads,
    paymentFailed,
    unpaidDonors,
    subscribers,
    converted,
    inProgress,
    followUpsDueToday,
    followUpsOverdue,
  ] = await Promise.all([
    LeadModel.countDocuments({ isDeleted: false }),
    LeadModel.countDocuments({ isDeleted: false, status: "NEW" }),
    LeadModel.countDocuments({
      isDeleted: false,
      $or: [{ source: "PAYMENT_FAILED" }, { paymentStatus: "FAILED" }],
    }),
    LeadModel.countDocuments({
      isDeleted: false,
      $or: [
        { paymentStatus: "PENDING" },
        { source: "DONOR_DROP", status: { $ne: "CONVERTED" } },
      ],
    }),
    LeadModel.countDocuments({ isDeleted: false, source: "SUBSCRIBER" }),
    LeadModel.countDocuments({
      isDeleted: false,
      $or: [{ status: "CONVERTED" }, { paymentStatus: "PAID" }],
    }),
    LeadModel.countDocuments({ isDeleted: false, status: "IN_PROGRESS" }),
    LeadModel.countDocuments({
      isDeleted: false,
      nextFollowUpDate: { $gte: startOfToday, $lte: endOfToday },
    }),
    LeadModel.countDocuments({
      isDeleted: false,
      nextFollowUpDate: { $lt: startOfToday },
    }),
  ]);

  return {
    total,
    newLeads,
    paymentFailed,
    unpaidDonors,
    subscribers,
    converted,
    inProgress,
    followUpsDueToday,
    followUpsOverdue,
  };
};

// ── Follow-up Configurations CRUD ─────────────────────────────────────────────
const getFollowUpConfigs = async () => {
  let configs = await FollowUpConfigModel.find().sort({ sortOrder: 1, name: 1 });

  // If empty, auto-seed defaults
  if (!configs || configs.length === 0) {
    try {
      await FollowUpConfigModel.insertMany(DEFAULT_FOLLOW_UP_CONFIGS);
      configs = await FollowUpConfigModel.find().sort({ sortOrder: 1, name: 1 });
    } catch (e) {
      console.error("Failed to seed default follow up configs:", e);
    }
  }

  return configs;
};

const createFollowUpConfig = async (payload: Partial<IFollowUpConfig>) => {
  if (!payload.name?.trim()) throw new Error("Disposition name is required");
  const trimmedName = payload.name.trim();

  // If already exists (case-insensitive), update and reactivate it cleanly
  const existing = await FollowUpConfigModel.findOne({
    name: new RegExp(`^${trimmedName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i"),
  });

  if (existing) {
    if (payload.category) existing.category = payload.category;
    if (payload.color) existing.color = payload.color;
    if (payload.defaultNotes !== undefined) existing.defaultNotes = payload.defaultNotes;
    if (payload.requiresNextAction !== undefined) existing.requiresNextAction = payload.requiresNextAction;
    existing.isActive = true;
    if (payload.sortOrder !== undefined) existing.sortOrder = payload.sortOrder;
    await existing.save();
    return existing;
  }

  return FollowUpConfigModel.create({
    ...payload,
    name: trimmedName,
  });
};

const updateFollowUpConfig = async (
  id: string,
  payload: Partial<IFollowUpConfig>
) => {
  return FollowUpConfigModel.findByIdAndUpdate(id, { $set: payload }, { new: true });
};

const deleteFollowUpConfig = async (id: string) => {
  const config = await FollowUpConfigModel.findById(id);
  if (!config) return false;
  if (config.isSystem) {
    // If system config, don't hard delete, toggle inactive
    config.isActive = false;
    await config.save();
    return true;
  }
  await FollowUpConfigModel.findByIdAndDelete(id);
  return true;
};

// ── Public Lead Ingestion & Subscriptions ─────────────────────────────────────
const subscribeNewsletter = async (email: string, name?: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  let lead = await LeadModel.findOne({
    email: normalizedEmail,
    isDeleted: false,
  });

  if (lead) {
    if (!lead.tags?.includes("NEWSLETTER_SUBSCRIBER")) {
      lead.tags = [...(lead.tags || []), "NEWSLETTER_SUBSCRIBER"];
      await lead.save();
    }
    return { lead, isNew: false };
  }

  lead = await LeadModel.create({
    name: name?.trim() || "Newsletter Subscriber",
    email: normalizedEmail,
    source: "SUBSCRIBER",
    status: "NEW",
    paymentStatus: "NOT_APPLICABLE",
    tags: ["NEWSLETTER_SUBSCRIBER"],
    notes: `Subscribed on ${new Date().toLocaleDateString()}`,
  });

  return { lead, isNew: true };
};

// Automatically captures prospective donor when form is filled on campaign/donation page
const captureLeadFromDonorForm = async (data: {
  donorId?: any;
  name?: string;
  email?: string;
  phone?: string;
  campaignId?: any;
  amount?: number;
}) => {
  if (!data.email && !data.phone) return null;

  const email = data.email?.trim().toLowerCase() || "";
  const phone = data.phone?.trim() || "";

  let lead = email
    ? await LeadModel.findOne({ email, isDeleted: false })
    : null;

  if (!lead && phone) {
    lead = await LeadModel.findOne({ phone, isDeleted: false });
  }

  if (lead) {
    if (lead.status !== "CONVERTED") {
      lead.source = "DONOR_DROP";
      lead.paymentStatus = "PENDING";
    }
    if (data.amount) lead.amount = data.amount;
    if (data.campaignId) lead.campaign = data.campaignId;
    if (data.donorId) lead.donor = data.donorId;
    if (data.phone) lead.phone = data.phone;
    if (data.name && data.name !== "Prospective Donor") lead.name = data.name;

    const timestamp = new Date().toISOString();
    lead.notes = `${lead.notes || ""}\n[${timestamp}] Donor filled campaign form, awaiting payment.`;
    lead.tags = Array.from(new Set([...(lead.tags || []), "UNPAID_DONOR", "CHECKOUT_INITIATED"]));
    await lead.save();
    return lead;
  }

  return LeadModel.create({
    name: data.name || "Prospective Donor",
    email: email || `unpaid_${Date.now()}@lead.local`,
    phone: data.phone,
    source: "DONOR_DROP",
    status: "NEW",
    paymentStatus: "PENDING",
    campaign: data.campaignId,
    donor: data.donorId,
    amount: data.amount || 0,
    tags: ["UNPAID_DONOR", "CHECKOUT_INITIATED"],
    notes: `Donor details entered on campaign checkout at ${new Date().toLocaleString("en-IN")}. Pending payment.`,
  });
};

const captureFailedPaymentLead = async (data: {
  name?: string;
  email?: string;
  phone?: string;
  campaignId?: string;
  amount?: number;
  reason?: string;
}) => {
  if (!data.email && !data.phone) return null;

  const email = data.email?.trim().toLowerCase() || "";
  const phone = data.phone?.trim() || "";

  let lead = email
    ? await LeadModel.findOne({ email, isDeleted: false })
    : null;

  if (!lead && phone) {
    lead = await LeadModel.findOne({ phone, isDeleted: false });
  }

  if (lead) {
    lead.source = "PAYMENT_FAILED";
    lead.paymentStatus = "FAILED";
    if (data.amount) lead.amount = data.amount;
    if (data.campaignId) lead.campaign = data.campaignId as any;
    lead.notes = `${lead.notes || ""}\n[${new Date().toISOString()}] Payment failed: ${
      data.reason || "Abandoned or failed transaction"
    }`;
    lead.tags = Array.from(new Set([...(lead.tags || []), "PAYMENT_FAILED"]));
    await lead.save();
    return lead;
  }

  return LeadModel.create({
    name: data.name || "Prospective Donor",
    email: email || `anonymous_${Date.now()}@lead.local`,
    phone: data.phone,
    source: "PAYMENT_FAILED",
    status: "NEW",
    paymentStatus: "FAILED",
    campaign: data.campaignId as any,
    amount: data.amount || 0,
    tags: ["PAYMENT_FAILED"],
    notes: `Payment failed during checkout: ${data.reason || "Payment did not complete"}`,
  });
};

const markLeadConverted = async (email?: string, phone?: string, amount?: number) => {
  if (!email && !phone) return;
  const filter: any = { isDeleted: false };
  if (email) filter.email = email.trim().toLowerCase();
  else if (phone) filter.phone = phone.trim();

  await LeadModel.updateMany(filter, {
    $set: {
      status: "CONVERTED",
      paymentStatus: "PAID",
      ...(amount ? { amount } : {}),
    },
    $push: { tags: "SUCCESSFUL_DONOR" },
  });
};

export const LeadService = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addFollowUp,
  getLeadStats,
  getFollowUpConfigs,
  createFollowUpConfig,
  updateFollowUpConfig,
  deleteFollowUpConfig,
  subscribeNewsletter,
  captureLeadFromDonorForm,
  captureFailedPaymentLead,
  markLeadConverted,
};
