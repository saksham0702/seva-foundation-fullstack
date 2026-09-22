import { DonorModel, IDonor } from "./donors.model";
import { MailerService } from "../mail/mailer.service";

const createDonor = async (payload: Partial<IDonor>) => {
  const donor = await DonorModel.create({
    campaign: payload.campaign,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    pan: payload.pan,
    address: payload.address,
    city: payload.city,
    state: payload.state,
    pincode: payload.pincode,
    isAnonymous: payload.isAnonymous || false,
    status: payload.status || "FILLED_NOT_PAID",
    createdBy: payload.createdBy,
    updatedBy: payload.updatedBy,
  });

  return donor;
};

const getAllDonors = async (query: {
  campaign?: string;
  initiative?: string;
  targetType?: string;
  frequency?: string;
  status?: string;
  search?: string;
}) => {
  const filter: any = {
    isDeleted: false,
  };

  if (query.campaign && query.campaign !== "all") {
    filter.campaign = query.campaign;
  }

  if (query.targetType && query.targetType !== "all") {
    filter.targetType = query.targetType;
  }

  if (query.initiative && query.initiative !== "all") {
    filter.initiative = query.initiative;
  }

  if (query.frequency && query.frequency !== "all") {
    filter.frequency = query.frequency;
  }

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
      { phone: { $regex: query.search, $options: "i" } },
      { initiative: { $regex: query.search, $options: "i" } },
    ];
  }

  return await DonorModel.find(filter)
    .populate("campaign")
    .sort({ createdAt: -1 });
};

const getDonorById = async (id: string) => {
  return await DonorModel.findOne({
    _id: id,
    isDeleted: false,
  }).populate("campaign");
};

const updateDonor = async (
  id: string,
  payload: Partial<IDonor>
) => {
  const donor = await DonorModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  ).populate("campaign");

  // Send receipt when status is explicitly set to PAID
  if (payload.status === "PAID" && donor && donor.email) {
    const campaignName = (donor.campaign as any)?.name || "Seva Foundation";
    MailerService.sendTemplatedMail({
      to: donor.email,
      templateKey: "CAMPAIGN_DONATION_RECEIPT",
      variables: {
        name: donor.name || "Donor",
        amount: "—", // amount is tracked in the payments module, not on donor doc
        campaignName,
        donatedOn: new Date().toLocaleDateString("en-IN"),
      },
      relatedToModel: "Donor",
      relatedToId: String(donor._id),
    });
  }

  return donor;
};

const deleteDonor = async (id: string) => {
  return await DonorModel.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  );
};

export const DonorService = {
  createDonor,
  getAllDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
};