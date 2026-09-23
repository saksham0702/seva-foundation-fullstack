import { DonorModel } from "../donors/donors.model";
import { CampaignModel } from "../campaigns/campaigns.model";
import { DonationModel, IDonation, IDonationItem } from "./payments.model";
import { RazorpayService } from "./razorpay.service";
import { CampaignService } from "../campaigns/campaigns.service";
import { CertificateService } from "../certificates/certificates.service";
import { LeadService } from "../leads/leads.service";
import { MailerService } from "../mail/mailer.service";

export interface InitiatePaymentInput {
  campaignId?: string;
  initiative?: string;
  targetType?: "CAMPAIGN" | "INITIATIVE" | "GENERAL";
  frequency?: "ONE_TIME" | "MONTHLY";
  tribute?: string;
  message?: string;
  amount: number;
  donationType?: "MONEY" | "PRODUCT";
  campaignProduct?: string;
  quantity?: number;
  items?: IDonationItem[];
  donorInfo: {
    name?: string;
    email?: string;
    phone?: string;
    pan?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    isAnonymous?: boolean;
    donorId?: string;
  };
  remarks?: string;
  createdBy?: string;
}

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  donorId: string;
  campaignId?: string;
  initiative?: string;
  targetType?: "CAMPAIGN" | "INITIATIVE" | "GENERAL";
  frequency?: "ONE_TIME" | "MONTHLY";
  tribute?: string;
  message?: string;
  amount: number;
  donationType?: "MONEY" | "PRODUCT";
  campaignProduct?: string;
  quantity?: number;
  items?: IDonationItem[];
  remarks?: string;
  createdBy?: string;
}

const initiatePaymentOrder = async (input: InitiatePaymentInput) => {
  const {
    campaignId,
    initiative,
    targetType = initiative ? "INITIATIVE" : "CAMPAIGN",
    frequency = "ONE_TIME",
    tribute = "No Tribute",
    message = "",
    amount,
    donorInfo,
    donationType = "MONEY",
    campaignProduct,
    quantity,
    items,
    remarks,
    createdBy,
  } = input;

  let campaign = null;
  if (campaignId) {
    campaign = await CampaignModel.findOne({ _id: campaignId, isDeleted: false });
    if (!campaign && !initiative) {
      throw new Error("Campaign not found");
    }
  }

  let donor;
  if (donorInfo.donorId) {
    donor = await DonorModel.findById(donorInfo.donorId);
  }

  if (!donor) {
    // Create new donor lead
    donor = await DonorModel.create({
      campaign: campaign?._id || undefined,
      targetType,
      initiative,
      frequency,
      tribute,
      message,
      name: donorInfo.name || "Anonymous Donor",
      email: donorInfo.email,
      phone: donorInfo.phone,
      pan: donorInfo.pan,
      address: donorInfo.address,
      city: donorInfo.city,
      state: donorInfo.state,
      pincode: donorInfo.pincode,
      isAnonymous: donorInfo.isAnonymous || false,
      status: "FILLED_NOT_PAID",
      createdBy,
    });
  } else {
    // Update existing donor info
    donor = await DonorModel.findByIdAndUpdate(
      donor._id,
      {
        $set: {
          campaign: campaign?._id || donor.campaign,
          targetType: targetType || donor.targetType,
          initiative: initiative || donor.initiative,
          frequency: frequency || donor.frequency,
          tribute: tribute || donor.tribute,
          message: message || donor.message,
          name: donorInfo.name || donor.name,
          email: donorInfo.email || donor.email,
          phone: donorInfo.phone || donor.phone,
          pan: donorInfo.pan || donor.pan,
          address: donorInfo.address || donor.address,
          city: donorInfo.city || donor.city,
          state: donorInfo.state || donor.state,
          pincode: donorInfo.pincode || donor.pincode,
          isAnonymous: donorInfo.isAnonymous ?? donor.isAnonymous,
          status: "FILLED_NOT_PAID",
        },
      },
      { new: true }
    );
  }

  // Create Razorpay order
  const order = await RazorpayService.createOrder({
    amount,
    currency: "INR",
    receipt: `rcpt_${Date.now().toString().slice(-8)}`,
    notes: {
      campaignId: campaign ? String(campaign._id) : "",
      campaignName: campaign ? campaign.name : "",
      initiative: initiative || "",
      targetType,
      frequency,
      donorId: String(donor!._id),
      donorName: donor?.name || "",
      donationType,
    },
  });

  return {
    order,
    donorId: donor!._id,
    campaignId: campaign?._id,
    initiative,
    frequency,
    amount,
    keyId: order.keyId,
  };
};

const verifyPayment = async (input: VerifyPaymentInput) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    donorId,
    campaignId,
    initiative,
    targetType = initiative ? "INITIATIVE" : "CAMPAIGN",
    frequency = "ONE_TIME",
    tribute = "No Tribute",
    message = "",
    amount,
    donationType,
    campaignProduct,
    quantity = 1,
    items,
    remarks = "",
    createdBy,
  } = input;

  const isValid = RazorpayService.verifySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValid) {
    // Mark donor as failed
    await DonorModel.findByIdAndUpdate(donorId, {
      status: "PAYMENT_FAILED",
    });

    // Record failed donation record for audit
    await DonationModel.create({
      donor: donorId,
      campaign: campaignId || undefined,
      targetType,
      initiative,
      frequency,
      tribute,
      message,
      campaignProduct,
      items,
      quantity,
      amount,
      donationType: donationType || "MONEY",
      paymentMethod: "ONLINE",
      paymentStatus: "FAILED",
      transactionId: razorpayPaymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      remarks: remarks ? `${remarks} (Signature verification failed)` : "Signature verification failed",
      createdBy,
    });

    throw new Error("Invalid payment signature");
  }

  // 1. Mark donor as PAID
  await DonorModel.findByIdAndUpdate(
    donorId,
    {
      status: "PAID",
      ...(initiative ? { initiative } : {}),
      ...(frequency ? { frequency } : {}),
    },
    { new: true }
  );

  // 2. Generate receipt number
  const receiptNumber = `REC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 3. Create successful donation record
  const donation = await DonationModel.create({
    donor: donorId,
    campaign: campaignId || undefined,
    targetType,
    initiative,
    frequency,
    tribute,
    message,
    campaignProduct,
    items,
    quantity,
    amount,
    donationType: donationType || "MONEY",
    paymentMethod: "ONLINE",
    paymentStatus: "SUCCESS",
    transactionId: razorpayPaymentId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    receiptNumber,
    remarks,
    createdBy,
  });

  // 4. Update campaign raised amount and donor count if campaign
  if (campaignId) {
    try {
      await CampaignService.incrementCampaignRaised(campaignId, amount);
    } catch (err) {
      console.error("Failed to increment campaign raised amount:", err);
    }
  }

  // 5. Generate 80G Certificate automatically
  let certificate = null;
  try {
    certificate = await CertificateService.generateCertificateForDonor(donorId);
    if (certificate?._id) {
      await CertificateService.regenerateCertificatePdf(String(certificate._id));
    }
  } catch (err) {
    console.error(`Certificate generation error for donor ${donorId}:`, err);
  }

  // Mark lead as converted if exists
  try {
    const donor = await DonorModel.findById(donorId);
    if (donor?.email || donor?.phone) {
      await LeadService.markLeadConverted(donor.email, donor.phone, amount);
    }
  } catch (err) {
    console.error("Failed to mark lead converted:", err);
  }

  // 6. Send Thank You / Donation Receipt email
  try {
    const donor = await DonorModel.findById(donorId);
    if (donor?.email) {
      let resolvedCampaignName = "Seva Foundation Initiative";
      if (campaignId) {
        const camp = await CampaignModel.findById(campaignId);
        if (camp?.name) resolvedCampaignName = camp.name;
      } else if (initiative) {
        resolvedCampaignName = initiative;
      }

      MailerService.sendTemplatedMail({
        to: donor.email,
        templateKey: "CAMPAIGN_DONATION_RECEIPT",
        variables: {
          name: donor.name || "Generous Supporter",
          amount: String(amount),
          campaignName: resolvedCampaignName,
          donatedOn: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        },
        relatedToModel: "Donor",
        relatedToId: String(donor._id),
      }).catch((mailErr) => {
        console.error("Failed to send donation receipt email:", mailErr);
      });
    }
  } catch (err) {
    console.error("Error triggering donation receipt email in verifyPayment:", err);
  }

  const populatedDonation = await DonationModel.findById(donation._id)
    .populate("donor")
    .populate("campaign")
    .populate("campaignProduct");

  return {
    success: true,
    donation: populatedDonation,
    certificate,
    receiptNumber,
  };
};

const recordFailedPayment = async (payload: { donorId: string; campaignId?: string; reason?: string }) => {
  if (payload.donorId) {
    const donor = await DonorModel.findByIdAndUpdate(
      payload.donorId,
      { status: "PAYMENT_FAILED" },
      { new: true }
    );
    if (donor) {
      try {
   await LeadService.captureFailedPaymentLead({
  name: donor.name,
  email: donor.email,
  phone: donor.phone,
  campaignId: payload.campaignId || (donor.campaign ? String(donor.campaign) : undefined),
  reason: payload.reason || "Payment abandoned or failed during checkout",
});
      } catch (err) {
        console.error("Failed to capture lead on payment failure:", err);
      }
    }
  }
  return { success: true };
};

const createDonation = async (payload: Partial<IDonation>) => {
  const donor = await DonorModel.findOne({
    _id: payload.donor,
    isDeleted: false,
  });

  if (!donor) {
    return null;
  }

  if (
    payload.campaign &&
    donor.campaign &&
    donor.campaign.toString() !== payload.campaign.toString()
  ) {
    return null;
  }

  const donation = await DonationModel.create({
    donor: donor._id,
    campaign: payload.campaign,
    campaignProduct: payload.campaignProduct,
    items: payload.items,
    quantity: payload.quantity || 1,
    amount: payload.amount,
    donationType: payload.donationType || "MONEY",
    paymentMethod: payload.paymentMethod || "ONLINE",
    paymentStatus: payload.paymentStatus || "PENDING",
    transactionId: payload.transactionId,
    razorpayOrderId: payload.razorpayOrderId,
    razorpayPaymentId: payload.razorpayPaymentId,
    remarks: payload.remarks || "",
    createdBy: payload.createdBy,
    updatedBy: payload.updatedBy,
  });

  if (donation.paymentStatus === "SUCCESS") {
    await DonorModel.findByIdAndUpdate(donor._id, {
      status: "PAID",
    });

    if (payload.campaign && payload.amount) {
      try {
        await CampaignService.incrementCampaignRaised(String(payload.campaign), payload.amount);
      } catch (err) {
        console.error("Failed to increment campaign raised:", err);
      }
    }

    try {
      const certificate = await CertificateService.generateCertificateForDonor(
        String(donor._id)
      );
      await CertificateService.regenerateCertificatePdf(String(certificate._id));
    } catch (err) {
      console.error(
        `Certificate generation failed for donor ${donor._id}:`,
        err
      );
    }

    // Send Thank You / Donation Receipt email
    if (donor.email) {
      try {
        let resolvedCampaignName = "Seva Foundation Initiative";
        if (payload.campaign) {
          const camp = await CampaignModel.findById(payload.campaign);
          if (camp?.name) resolvedCampaignName = camp.name;
        }

        MailerService.sendTemplatedMail({
          to: donor.email,
          templateKey: "CAMPAIGN_DONATION_RECEIPT",
          variables: {
            name: donor.name || "Generous Supporter",
            amount: String(donation.amount || 0),
            campaignName: resolvedCampaignName,
            donatedOn: new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          },
          relatedToModel: "Donor",
          relatedToId: String(donor._id),
        }).catch((mailErr) => {
          console.error("Failed to send donation receipt email:", mailErr);
        });
      } catch (err) {
        console.error("Error triggering donation email in createDonation:", err);
      }
    }
  } else if (donation.paymentStatus === "FAILED") {
    await DonorModel.findByIdAndUpdate(donor._id, {
      status: "PAYMENT_FAILED",
    });
  } else if (donation.paymentStatus === "PENDING") {
    await DonorModel.findByIdAndUpdate(donor._id, {
      status: "FILLED_NOT_PAID",
    });
  }

  return await DonationModel.findById(donation._id)
    .populate("donor")
    .populate("campaign")
    .populate("campaignProduct");
};

const getAllDonations = async (query?: {
  campaign?: string;
  initiative?: string;
  targetType?: string;
  frequency?: string;
  status?: string;
  search?: string;
}) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query?.campaign && query.campaign !== "all") {
    filter.campaign = query.campaign;
  }

  if (query?.targetType && query.targetType !== "all") {
    filter.targetType = query.targetType;
  }

  if (query?.initiative && query.initiative !== "all") {
    filter.initiative = query.initiative;
  }

  if (query?.frequency && query.frequency !== "all") {
    filter.frequency = query.frequency;
  }

  if (query?.status && query.status !== "all") {
    filter.paymentStatus = query.status;
  }

  return await DonationModel.find(filter)
    .populate("donor")
    .populate("campaign")
    .populate("campaignProduct")
    .sort({ createdAt: -1 });
};

const getDonationById = async (id: string) => {
  return await DonationModel.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("donor")
    .populate("campaign")
    .populate("campaignProduct");
};

const deleteDonation = async (id: string) => {
  return await DonationModel.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  );
};

export const DonationService = {
  initiatePaymentOrder,
  verifyPayment,
  recordFailedPayment,
  createDonation,
  getAllDonations,
  getDonationById,
  deleteDonation,
};