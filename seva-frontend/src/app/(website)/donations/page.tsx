import React, { Suspense } from "react";
import { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import DonateFlowClient from "@/components/website/donations/DonateFlowClient";

export const metadata: Metadata = constructMetadata({
  title: "Donate Online - 80G Tax Exemption",
  description:
    "Make a secure online donation to Seva India Foundation. 100% transparent giving with instant 50% tax exemption certificate under Section 80G.",
  canonicalPath: "/donations",
  keywords: [
    "Donate Online India",
    "80G Tax Exemption Donation",
    "Charity Donation India",
    "Donate to NGO",
    "Seva Foundation Donation",
  ],
});

import { getServerCampaigns } from "@/lib/server-api";

interface DonationsPageProps {
  searchParams?: Promise<{
    campaign?: string;
    amount?: string;
  }>;
}

export default async function DonationsPage({ searchParams }: DonationsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const campaignSlug = resolvedParams?.campaign || "";

  const campaigns = await getServerCampaigns();
  const initialCampaign = campaignSlug
    ? campaigns.find((c) => c.slug === campaignSlug) || null
    : null;

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={28} />
          <p className="text-sm font-medium">Preparing donation portal…</p>
        </div>
      }
    >
      <DonateFlowClient
        initialCampaigns={campaigns}
        initialCampaign={initialCampaign}
      />
    </Suspense>
  );
}