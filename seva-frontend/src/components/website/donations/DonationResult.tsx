"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Donation } from "@/app/api/donation";
import type { Donor } from "@/app/api/donor";
import type { Campaign } from "@/app/api/campaign";

interface DonationResultProps {
  status: "success" | "failed";
  donor: Donor;
  donation: Donation | null;
  campaign: Campaign;
  /** Sends the flow back to the payment step. Does NOT create a new donor. */
  onRetry: () => void;
}

export default function DonationResult({
  status,
  donor,
  donation,
  campaign,
  onRetry,
}: DonationResultProps) {
  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="text-emerald-500" size={32} />
        </div>
        <h1 className="text-xl font-bold text-[#0f2347] mb-2">
          Thank you, {donor.name || "friend"}!
        </h1>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          Your donation of{" "}
          <strong className="text-[#0f2347]">
            ₹{donation?.amount?.toLocaleString("en-IN")}
          </strong>{" "}
          to <strong className="text-[#0f2347]">{campaign.name}</strong> was
          successful. A confirmation has been sent to {donor.email}.
        </p>
        {donation?.transactionId && (
          <p className="text-[11px] text-gray-400 mb-6">
            Transaction ID: {donation.transactionId}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/campaigns/${campaign.slug}`}
            className="px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:border-[#1a3a6b] hover:text-[#1a3a6b] transition-all"
          >
            Back to campaign
          </Link>
          <Link
            href="/campaigns"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-[#E8542A] hover:bg-[#c9431d] text-white transition-colors shadow-lg shadow-orange-200"
          >
            Explore more campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10 shadow-sm text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
        <XCircle className="text-red-400" size={32} />
      </div>
      <h1 className="text-xl font-bold text-[#0f2347] mb-2">
        Payment couldn&apos;t be completed
      </h1>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        Your details are saved — you can retry the payment without filling
        the form again.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/campaigns/${campaign.slug}`}
          className="px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:border-[#1a3a6b] hover:text-[#1a3a6b] transition-all"
        >
          Cancel
        </Link>
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-xl text-sm font-bold bg-[#E8542A] hover:bg-[#c9431d] text-white transition-colors shadow-lg shadow-orange-200"
        >
          Try payment again
        </button>
      </div>
    </div>
  );
}