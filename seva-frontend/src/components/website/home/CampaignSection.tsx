"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { CampaignCard } from "@/components/shared/CampaignCard";
import { getCampaigns, type Campaign } from "@/app/api/campaign";
import { getDonations, type Donation } from "@/app/api/donation";
import { toCampaignCardData } from "@/lib/campaign-stats";

const FEATURED_COUNT = 3;

export default function CampaignsSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [campaignsResult, donationsResult] = await Promise.allSettled([
          getCampaigns(),
          getDonations(),
        ]);

        if (!cancelled) {
          if (
            campaignsResult.status === "fulfilled" &&
            Array.isArray(campaignsResult.value)
          ) {
            // Filter: only active campaigns that are not completed and not deleted, sorted by newest
            const activeCampaigns = campaignsResult.value
              .filter(
                (c) =>
                  !c.isDeleted &&
                  c.status !== "completed" &&
                  (c.status === "active" || !c.status)
              )
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              })
              .slice(0, FEATURED_COUNT);

            setCampaigns(activeCampaigns);
          } else if (campaignsResult.status === "rejected") {
            setError("Couldn't load campaigns right now.");
          }

          if (
            donationsResult.status === "fulfilled" &&
            Array.isArray(donationsResult.value)
          ) {
            setDonations(donationsResult.value);
          } else {
            setDonations([]);
          }
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
    <section className="bg-white py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8542A] mb-3">
              <span className="w-6 h-px bg-[#E8542A]" />
              Active Campaigns
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#0f2347] leading-tight">
              Every cause needs a champion.
              <br className="hidden sm:block" />
              <span className="text-[#E8542A]"> Be one today.</span>
            </h2>
            <p className="mt-3 text-gray-500 text-sm max-w-xl leading-relaxed">
              Thousands of lives are waiting for a small act of generosity.
              Browse campaigns and choose a cause that moves you.
            </p>
          </div>
          <Link
            href="/campaigns"
            className="flex-shrink-0 flex items-center gap-2 text-sm font-semibold text-[#1a3a6b] border-2 border-[#1a3a6b]/30 hover:border-[#1a3a6b] hover:bg-[#1a3a6b] hover:text-white px-5 py-2.5 rounded-xl transition-all duration-200"
          >
            View all campaigns
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading && (
          <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm">Loading campaigns…</p>
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-center text-[#E8542A] font-medium py-10">
            {error}
          </p>
        )}

        {!loading && !error && campaigns.length === 0 && (
          <p className="text-sm text-center text-gray-400 py-10">
            No campaigns live right now — check back soon.
          </p>
        )}

        {!loading && !error && campaigns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaign={toCampaignCardData(campaign, donations)}
                variant="website"
              />
            ))}
          </div>
        )}

        <div className="mt-14 rounded-2xl bg-gradient-to-br from-[#0f2347] to-[#1a3a6b] px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-900/20">
          <div>
            <p className="text-white font-bold text-xl">
              Can&apos;t find a cause you care about?
            </p>
            <p className="text-blue-200/80 text-sm mt-1">
              Start your own campaign and rally support from across India.
            </p>
          </div>
          <Link
            href="/campaigns/start"
            className="flex-shrink-0 bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-colors duration-200 shadow-lg shadow-orange-900/30 whitespace-nowrap"
          >
            Start a Campaign →
          </Link>
        </div>
      </div>
    </section>
  );
}