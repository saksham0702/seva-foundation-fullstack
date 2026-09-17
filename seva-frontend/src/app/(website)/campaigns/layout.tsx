import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export const metadata: Metadata = constructMetadata({
  title: "Active Campaigns",
  description:
    "Browse all active donation campaigns by Seva India Foundation. Support education, healthcare, nutrition, and disaster relief across India with 80G tax benefits.",
  keywords: [
    "Donate India",
    "NGO Campaigns",
    "Fundraising India",
    "Social Impact Campaigns",
    "80G Donation",
    "Charity Campaigns",
    "Crowdfunding India",
  ],
  canonicalPath: "/campaigns",
});

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
