import { DonorModel, IDonor } from "./donors.model";
import { MailerService } from "../mail/mailer.service";
import { DonationModel } from "../payments/payments.model";
import { CertificateModel } from "../certificates/certificates.model";
import { LeadService } from "../leads/leads.service";

const createDonor = async (payload: Partial<IDonor> & { amount?: number }) => {
  const donor = await DonorModel.create({
    campaign: payload.campaign,
    targetType: payload.targetType || (payload.campaign ? "CAMPAIGN" : (payload.initiative ? "INITIATIVE" : "GENERAL")),
    initiative: payload.initiative,
    frequency: payload.frequency || "ONE_TIME",
    tribute: payload.tribute || "No Tribute",
    message: payload.message || "",
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

  // If created as PAID with an amount, record donation entry
  if (payload.amount && payload.amount > 0 && payload.status === "PAID") {
    try {
      const receiptNumber = `REC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await DonationModel.create({
        donor: donor._id,
        campaign: donor.campaign,
        targetType: donor.targetType || (donor.campaign ? "CAMPAIGN" : (donor.initiative ? "INITIATIVE" : "GENERAL")),
        initiative: donor.initiative,
        frequency: donor.frequency || "ONE_TIME",
        tribute: donor.tribute || "No Tribute",
        message: donor.message || "",
        amount: payload.amount,
        donationType: "MONEY",
        paymentMethod: "OFFLINE",
        paymentStatus: "SUCCESS",
        receiptNumber,
        remarks: "Manually recorded donation",
        createdBy: payload.createdBy,
      });
    } catch (dErr) {
      console.error("Failed to create initial donation record for donor:", dErr);
    }
  }

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

  const donors = await DonorModel.find(filter)
    .populate("campaign")
    .sort({ createdAt: -1 })
    .lean();

  if (donors.length === 0) return [];

  const donorIds = donors.map((d: any) => d._id);
  const [donations, certificates] = await Promise.all([
    DonationModel.find({
      donor: { $in: donorIds },
      isDeleted: false,
    })
      .populate("campaign")
      .sort({ createdAt: -1 })
      .lean(),
    CertificateModel.find({
      donor: { $in: donorIds },
      isDeleted: false,
    })
      .select("certificateNo donor status certificateType issueDate pdfUrl")
      .lean(),
  ]);

  const donationsByDonorId = new Map<string, any[]>();
  for (const d of donations) {
    const dId = String(d.donor);
    if (!donationsByDonorId.has(dId)) {
      donationsByDonorId.set(dId, []);
    }
    donationsByDonorId.get(dId)!.push(d);
  }

  const certificatesByDonorId = new Map<string, any>();
  for (const c of certificates) {
    if (c.donor) {
      certificatesByDonorId.set(String(c.donor), c);
    }
  }

  return donors.map((donor: any) => {
    const donorDonations = donationsByDonorId.get(String(donor._id)) || [];
    const cert = certificatesByDonorId.get(String(donor._id)) || null;
    const successful = donorDonations.filter((d: any) => d.paymentStatus === "SUCCESS");
    const totalPaid = successful.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

    const enrichedDonations = donorDonations.map((d: any) => ({
      ...d,
      certificateNo: cert?.certificateNo || null,
      certificateUrl: cert?.certificateNo ? `/verify/${cert.certificateNo}` : null,
    }));

    return {
      ...donor,
      totalPaid,
      donationCount: successful.length,
      certificateNo: cert?.certificateNo || null,
      certificateId: cert?._id || null,
      certificateUrl: cert?.certificateNo ? `/verify/${cert.certificateNo}` : null,
      certificate: cert,
      donations: enrichedDonations,
    };
  });
};

const getDonorById = async (id: string) => {
  const donor = await DonorModel.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("campaign")
    .lean();

  if (!donor) return null;

  const [donations, cert] = await Promise.all([
    DonationModel.find({
      donor: donor._id,
      isDeleted: false,
    })
      .populate("campaign")
      .sort({ createdAt: -1 })
      .lean(),
    CertificateModel.findOne({
      donor: donor._id,
      isDeleted: false,
    }).lean(),
  ]);

  const successful = donations.filter((d: any) => d.paymentStatus === "SUCCESS");
  const totalPaid = successful.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

  const enrichedDonations = donations.map((d: any) => ({
    ...d,
    certificateNo: cert?.certificateNo || null,
    certificateUrl: cert?.certificateNo ? `/verify/${cert.certificateNo}` : null,
  }));

  return {
    ...donor,
    totalPaid,
    donationCount: successful.length,
    certificateNo: cert?.certificateNo || null,
    certificateId: cert?._id || null,
    certificateUrl: cert?.certificateNo ? `/verify/${cert.certificateNo}` : null,
    certificate: cert,
    donations: enrichedDonations,
  };
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