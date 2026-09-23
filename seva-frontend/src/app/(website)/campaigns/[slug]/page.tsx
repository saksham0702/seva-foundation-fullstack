import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getServerCampaignBySlug,
  getServerCampaignDonors,
  getServerProducts,
} from "@/lib/server-api";
import { constructMetadata, getCampaignSchema } from "@/lib/seo";
import { getImageUrl } from "@/lib/image";
import JsonLd from "@/components/common/JsonLd";
import CampaignDetailClient from "@/components/website/campaigns/CampaignDetailClient";

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const slug = resolved?.slug;
  if (!slug) return constructMetadata({ title: "Campaign" });

  const campaign = await getServerCampaignBySlug(slug);
  if (!campaign) {
    return constructMetadata({
      title: "Campaign Not Found",
      description: "The requested donation campaign could not be found.",
      noIndex: true,
    });
  }

  const cleanDescription = (campaign.description || "")
    .replace(/<[^>]*>/g, "")
    .slice(0, 160);

  const images = (campaign.images || []).filter(
    (img): img is string => typeof img === "string" && img.trim().length > 0
  );
  const ogImg = images[0] ? getImageUrl(String(images[0])) : undefined;

  return constructMetadata({
    title: campaign.name,
    description:
      cleanDescription ||
      `Support the ${campaign.name} campaign by Seva India Foundation.`,
    canonicalPath: `/campaigns/${campaign.slug}`,
    ogImage: ogImg,
    keywords: [
      campaign.name,
      "Donate Online",
      "80G Tax Exemption",
      "NGO Campaign",
      "Seva Foundation",
    ],
  });
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  const slug = resolved?.slug;
  if (!slug) notFound();

  const [campaign, products, donorsData] = await Promise.all([
    getServerCampaignBySlug(slug),
    getServerProducts(),
    getServerCampaignDonors(slug, 1, 5),
  ]);

  if (!campaign) {
    notFound();
  }

  const campaignSchema = getCampaignSchema({
    name: campaign.name,
    description: (campaign.description || "").replace(/<[^>]*>/g, "").slice(0, 200),
    slug: campaign.slug,
    goal: campaign.goal,
    raisedAmount: campaign.raisedAmount,
    featuredImage: campaign.images?.[0]
      ? getImageUrl(String(campaign.images[0]))
      : undefined,
    createdAt: campaign.createdAt,
  });

  return (
    <>
      <JsonLd data={campaignSchema} />
      <CampaignDetailClient
        campaign={campaign}
        products={products}
        initialDonors={donorsData.donors}
        initialDonorsTotal={donorsData.total}
        initialDonorsTotalPages={donorsData.totalPages}
      />
    </>
  );
}