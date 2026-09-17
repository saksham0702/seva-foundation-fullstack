import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { getCampaignBySlug } from "@/app/api/campaign";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const campaign = await getCampaignBySlug(slug);
    if (campaign) {
      const description =
        campaign.description ||
        `Support "${campaign.name}" — a campaign by Seva India Foundation to create positive social change. Donate now with 80G tax benefits.`;

      // Use first image from images array if available
      const firstImage = campaign.images?.[0];
      const image =
        typeof firstImage === "string" && firstImage
          ? firstImage.startsWith("http")
            ? firstImage
            : `${SITE_URL}${firstImage}`
          : undefined;

      return constructMetadata({
        title: campaign.name,
        description: String(description).slice(0, 200),
        keywords: [
          campaign.name,
          "Donate Online",
          "NGO Campaign",
          "Social Cause India",
          "80G Charity",
          "Fundraiser",
        ],
        canonicalPath: `/campaigns/${slug}`,
        ogImage: image,
        ogType: "website",
      });
    }
  } catch (e) {
    // fallback
  }

  return constructMetadata({
    title: "Campaign",
    description: "Support humanitarian campaigns by Seva India Foundation.",
    canonicalPath: `/campaigns/${slug}`,
  });
}

export default function CampaignSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
