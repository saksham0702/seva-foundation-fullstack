import React from "react";
import { Metadata } from "next";
import { getServerCampaigns, getServerCategories } from "@/lib/server-api";
import { CampaignsListingClient } from "@/components/website/campaigns/CampaignsListingClient";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Active Campaigns",
  description:
    "Explore active grassroots donation campaigns by Seva India Foundation. Support education, nutrition, healthcare, and emergency disaster relief with instant 80G tax benefit certificates.",
  canonicalPath: "/campaigns",
  keywords: [
    "Donate Online",
    "NGO Campaigns",
    "Charity India",
    "80G Tax Exemption",
    "Fundraising Campaigns",
    "Grassroots Development",
  ],
});

export default async function CampaignsPage() {
  const [campaigns, categories] = await Promise.all([
    getServerCampaigns(),
    getServerCategories(),
  ]);

  return (
    <section className="bg-white min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0f2347] mb-2 font-display">
              Active Campaigns
            </h1>
            <p className="text-gray-500 text-sm">
              Explore active donation drives. Every contribution transforms lives with instant 80G tax benefits.
            </p>
          </div>
        </div>

        <CampaignsListingClient initialCampaigns={campaigns} initialCategories={categories} />
      </div>
    </section>
  );
}