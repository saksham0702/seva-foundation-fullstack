"use client";

import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Inbox } from "lucide-react";

import { getCampaigns, type Campaign } from "@/app/api/campaign";
import { toCampaignCardData } from "@/lib/campaign-stats";
import { CampaignCard } from "@/components/shared/CampaignCard";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // Stats (raisedAmount, donorCount) come from DB fields on the Campaign
        // model — updated on each successful payment. No need to fetch donations.
        const campaignsData = await getCampaigns();
        if (!cancelled) {
          setCampaigns(campaignsData);
        }
      } catch (err) {
        if (!cancelled) setError("Couldn't load campaigns right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white ">
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f2347] mb-2">
            Active Campaigns
          </h1>
          <p className="text-gray-500">
            Join us in making a difference. Every contribution counts.
          </p>
        </div>
      </div>

      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={26} />
          <p className="text-sm">Loading campaigns…</p>
        </div>
      )}

      {!loading && error && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="text-[#E8542A]" size={28} />
          <p className="text-[#0f2347] font-semibold text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && campaigns.length === 0 && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-center">
          <Inbox className="text-gray-300" size={32} />
          <p className="text-gray-500 text-sm">No campaigns yet. Check back soon.</p>
        </div>
      )}

      {!loading && !error && campaigns?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign._id}
              campaign={toCampaignCardData(campaign)}
            />
          ))}
        </div>
      )}
    </div>
    </section>
  );
}