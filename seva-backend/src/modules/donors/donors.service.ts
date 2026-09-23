import { DonorModel, IDonor } from "./donors.model";
import { MailerService } from "../mail/mailer.service";
import { DonationModel } from "../payments/payments.model";
import { LeadService } from "../leads/leads.service";

const createDonor = async (payload: Partial<IDonor> & { amount?: number }) => {
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

  // Automatically capture prospective donor as an unpaid lead in CRM
  try {
    await LeadService.captureLeadFromDonorForm({
      donorId: donor._id,
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      campaignId: donor.campaign,
      amount: payload.amount,
    });
  } catch (err) {
    console.error("Failed to capture lead on donor creation:", err);
  }

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
    const campaignName = (donor.campaign as any)?.title || (donor.campaign as any)?.name || "Seva Foundation Initiative";
    let amountStr = "—";
    try {
      const latestDonation = await DonationModel.findOne({ donor: donor._id, paymentStatus: "SUCCESS" }).sort({ createdAt: -1 });
      if (latestDonation?.amount) {
        amountStr = String(latestDonation.amount);
      }
    } catch (e) {
      console.error("Error finding latest donation for donor receipt:", e);
    }

    MailerService.sendTemplatedMail({
      to: donor.email,
      templateKey: "CAMPAIGN_DONATION_RECEIPT",
      variables: {
        name: donor.name || "Generous Supporter",
        amount: amountStr,
        campaignName,
        donatedOn: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      },
      relatedToModel: "Donor",
      relatedToId: String(donor._id),
    }).catch((mailErr) => {
      console.error("Failed to send donation receipt email from updateDonor:", mailErr);
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