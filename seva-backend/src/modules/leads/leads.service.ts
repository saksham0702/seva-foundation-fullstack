import { LeadModel, ILead, LeadSource, LeadStatus } from "./leads.model";

interface LeadFilters {
  search?: string;
  source?: LeadSource;
  status?: LeadStatus;
  campaign?: string;
  page?: number;
  limit?: number;
}

const createLead = async (payload: Partial<ILead>): Promise<ILead> => {
  return LeadModel.create(payload);
};

const getAllLeads = async (filters: LeadFilters = {}) => {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Number(filters.limit) || 20);
  const skip = (page - 1) * limit;

  const query: any = { isDeleted: false };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.source) {
    query.source = filters.source;
  }

  if (filters.campaign) {
    query.campaign = filters.campaign;
  }

  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const [leads, total] = await Promise.all([
    LeadModel.find(query)
      .populate("campaign", "name slug")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
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
    .populate("assignedTo", "name email");
};

const updateLead = async (
  id: string,
  payload: Partial<ILead>
): Promise<ILead | null> => {
  return LeadModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: payload },
    { new: true, runValidators: true }
  );
};

const deleteLead = async (id: string): Promise<boolean> => {
  const res = await LeadModel.findOneAndUpdate(
    { _id: id },
    { $set: { isDeleted: true } }
  );
  return !!res;
};

const getLeadStats = async () => {
  const [
    total,
    newLeads,
    paymentFailed,
    subscribers,
    converted,
    inProgress,
  ] = await Promise.all([
    LeadModel.countDocuments({ isDeleted: false }),
    LeadModel.countDocuments({ isDeleted: false, status: "NEW" }),
    LeadModel.countDocuments({ isDeleted: false, source: "PAYMENT_FAILED" }),
    LeadModel.countDocuments({ isDeleted: false, source: "SUBSCRIBER" }),
    LeadModel.countDocuments({ isDeleted: false, status: "CONVERTED" }),
    LeadModel.countDocuments({ isDeleted: false, status: "IN_PROGRESS" }),
  ]);

  return {
    total,
    newLeads,
    paymentFailed,
    subscribers,
    converted,
    inProgress,
  };
};

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
    tags: ["NEWSLETTER_SUBSCRIBER"],
    notes: `Subscribed on ${new Date().toLocaleDateString()}`,
  });

  return { lead, isNew: true };
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
  let lead = email
    ? await LeadModel.findOne({ email, isDeleted: false })
    : null;

  if (lead) {
    lead.status = "NEW";
    lead.source = "PAYMENT_FAILED";
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
    campaign: data.campaignId as any,
    amount: data.amount || 0,
    tags: ["PAYMENT_FAILED"],
    notes: `Payment failed during checkout: ${data.reason || "Payment did not complete"}`,
  });
};

const markLeadConverted = async (email?: string, phone?: string) => {
  if (!email && !phone) return;
  const filter: any = { isDeleted: false, status: { $ne: "CONVERTED" } };
  if (email) filter.email = email.trim().toLowerCase();
  else if (phone) filter.phone = phone.trim();

  await LeadModel.updateMany(filter, {
    $set: { status: "CONVERTED" },
    $push: { tags: "SUCCESSFUL_DONOR" },
  });
};

export const LeadService = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadStats,
  subscribeNewsletter,
  captureFailedPaymentLead,
  markLeadConverted,
};
