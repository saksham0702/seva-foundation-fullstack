import React, { Suspense } from "react";
import { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { constructMetadata, SITE_URL, SITE_NAME } from "@/lib/seo";
import DonateFlowClient from "@/components/website/donations/DonateFlowClient";
import SeoHead from "@/components/common/SeoHead";
import { getServerCampaigns } from "@/lib/server-api";

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

export const dynamic = "force-dynamic";

import { DonationsPageSkeleton } from "@/components/website/skeletons/WebsiteSkeletons";

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

  const donateSchema = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: "Donate Online to Seva India Foundation",
    description: "Make a secure online donation to Seva India Foundation with instant 50% tax exemption under Section 80G.",
    url: `${SITE_URL}/donations`,
    recipient: {
      "@type": "NGO",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <>
      <SeoHead
        title="Donate Online - 80G Tax Exemption"
        description="Make a secure online donation to Seva India Foundation. 100% transparent giving with instant 50% tax exemption certificate under Section 80G."
        canonicalPath="/donations"
        jsonLd={donateSchema}
      />
      <Suspense fallback={<DonationsPageSkeleton />}>
        <div className="scroll-reveal">
          <DonateFlowClient
            initialCampaigns={campaigns}
            initialCampaign={initialCampaign}
          />
        </div>
      </Suspense>
    </>
  );
}