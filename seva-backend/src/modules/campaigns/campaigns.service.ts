import { ICampaign, CampaignModel } from "./campaigns.model";
import { DonationModel } from "../payments/payments.model";

interface CampaignFilters {
  status?: string;
  category?: string;
  search?: string;
}

const createCampaign = async (
  payload: Partial<ICampaign>
): Promise<ICampaign> => {
  if (payload.name) {
    const trimmedName = payload.name.trim();
    const existingName = await CampaignModel.findOne({
      name: { $regex: `^${trimmedName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, $options: "i" },
      isDeleted: false,
    });
    if (existingName) {
      const error: any = new Error(
        `A campaign with the name "${trimmedName}" already exists. Please choose a different title.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  if (payload.slug) {
    // Release any old deleted campaigns holding this slug
    await CampaignModel.updateMany(
      { slug: payload.slug, isDeleted: true },
      { $set: { slug: `${payload.slug}-deleted-${Date.now()}` } }
    );

    // Check if an active campaign has this slug
    const existing = await CampaignModel.findOne({
      slug: payload.slug,
      isDeleted: false,
    });
    if (existing) {
      const error: any = new Error(
        `A campaign with the slug "${payload.slug}" already exists. Please choose a different title or slug.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  // Parse goal/dates from content if present
  if (payload.content) {
    try {
      const parsed = JSON.parse(payload.content);
      if (parsed.goal !== undefined && parsed.goal !== "")
        payload.goal = Number(parsed.goal) || 0;
      if (parsed.startDate)
        payload.startDate = new Date(parsed.startDate);
      if (parsed.endDate)
        payload.endDate = new Date(parsed.endDate);
    } catch {}
  }

  const result = await CampaignModel.create(payload);
  return result;
};

const getAllCampaigns = async (
  filters?: CampaignFilters
): Promise<ICampaign[]> => {
  const query: Record<string, unknown> = { isDeleted: false };

  if (filters?.status && filters.status !== "all") {
    query.status = filters.status;
  }

  if (filters?.category && filters.category !== "all") {
    query.category = filters.category;
  }

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  const result = await CampaignModel.find(query)
    .populate("category")
    .sort({ createdAt: -1 });
  return result;
};

const getCampaignById = async (id: string): Promise<ICampaign | null> => {
  const result = await CampaignModel.findOne({
    _id: id,
    isDeleted: false,
  }).populate("category");
  return result;
};

const getCampaignBySlug = async (slug: string): Promise<ICampaign | null> => {
  const result = await CampaignModel.findOne({
    slug,
    isDeleted: false,
  }).populate("category");
  return result;
};

const updateCampaign = async (
  id: string,
  payload: Partial<ICampaign>
): Promise<ICampaign | null> => {
  if (payload.name) {
    const trimmedName = payload.name.trim();
    const existingName = await CampaignModel.findOne({
      name: { $regex: `^${trimmedName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, $options: "i" },
      isDeleted: false,
      _id: { $ne: id },
    });
    if (existingName) {
      const error: any = new Error(
        `A campaign with the name "${trimmedName}" already exists. Please choose a different title.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  if (payload.slug) {
    // Release any old deleted campaigns holding this slug
    await CampaignModel.updateMany(
      { slug: payload.slug, isDeleted: true, _id: { $ne: id } },
      { $set: { slug: `${payload.slug}-deleted-${Date.now()}` } }
    );

    // Check if another active campaign has this slug
    const existing = await CampaignModel.findOne({
      slug: payload.slug,
      isDeleted: false,
      _id: { $ne: id },
    });
    if (existing) {
      const error: any = new Error(
        `A campaign with the slug "${payload.slug}" already exists. Please choose a different title or slug.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  if (payload.content) {
    try {
      const parsed = JSON.parse(payload.content);
      if (parsed.goal !== undefined && parsed.goal !== "")
        payload.goal = Number(parsed.goal) || 0;
      if (parsed.startDate)
        payload.startDate = new Date(parsed.startDate);
      if (parsed.endDate)
        payload.endDate = new Date(parsed.endDate);
    } catch {}
  }

  const result = await CampaignModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  ).populate("category");
  return result;
};

const toggleCampaignStatus = async (
  id: string,
  status: "active" | "draft" | "completed" | "paused"
): Promise<ICampaign | null> => {
  const result = await CampaignModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { status },
    { new: true }
  ).populate("category");
  return result;
};

const incrementCampaignRaised = async (
  id: string,
  amount: number
): Promise<ICampaign | null> => {
  const campaign = await CampaignModel.findById(id);
  if (!campaign) return null;

  const newRaised = (campaign.raisedAmount || 0) + amount;
  const newDonorCount = (campaign.donorCount || 0) + 1;
  const updateData: Record<string, unknown> = {
    raisedAmount: newRaised,
    donorCount: newDonorCount,
  };

  // Auto-complete campaign when goal is fully reached
  const goal = campaign.goal || 0;
  if (goal > 0 && newRaised >= goal && campaign.status === "active") {
    updateData.status = "completed";
  }

  return await CampaignModel.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteCampaign = async (id: string): Promise<ICampaign | null> => {
  const campaign = await CampaignModel.findById(id);
  if (!campaign) return null;

  campaign.isDeleted = true;
  campaign.slug = `${campaign.slug}-deleted-${Date.now()}`;
  await campaign.save();
  return campaign;
};

const getCampaignOptions = async () => {
  const result = await CampaignModel.find(
    { isDeleted: false },
    { name: 1, _id: 1, slug: 1, goal: 1, raisedAmount: 1 }
  );
  return result;
};

interface PublicDonor {
  _id: string;
  name: string;
  amount: number;
  createdAt: Date;
}

interface GetCampaignDonorsResult {
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

const getCampaignDonorsBySlug = async (
  slug: string,
  page = 1,
  limit = 5
): Promise<GetCampaignDonorsResult | null> => {
  const campaign = await CampaignModel.findOne({ slug, isDeleted: false });
  if (!campaign) return null;

  const skip = (page - 1) * limit;
 const filter = {
  campaign: campaign._id,
  paymentStatus: "SUCCESS" as const,
  isDeleted: false,
};

  const [rawDonations, total] = await Promise.all([
    DonationModel.find(filter)
      .populate({ path: "donor", select: "name isAnonymous" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    DonationModel.countDocuments(filter),
  ]);

  const donors: PublicDonor[] = rawDonations.map((d: any) => {
    const donorDoc = d.donor as any;
    const isAnon = donorDoc?.isAnonymous === true;
    const rawName: string = donorDoc?.name || "";
    const name = isAnon || !rawName ? "Anonymous Donor" : rawName;
    return {
      _id: String(d._id),
      name,
      amount: d.amount,
      createdAt: d.createdAt,
    };
  });

  return {
    donors,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    campaign: {
      _id: String(campaign._id),
      name: campaign.name,
      raisedAmount: campaign.raisedAmount,
      donorCount: campaign.donorCount,
      goal: campaign.goal,
      status: campaign.status,
    },
  };
};

export const CampaignService = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getCampaignBySlug,
  updateCampaign,
  toggleCampaignStatus,
  incrementCampaignRaised,
  deleteCampaign,
  getCampaignOptions,
  getCampaignDonorsBySlug,
};
