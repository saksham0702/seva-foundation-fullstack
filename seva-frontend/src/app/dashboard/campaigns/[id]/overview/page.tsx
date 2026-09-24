"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  TrendingUp,
  Target,
  Clock,
  Calendar,
  MapPin,
  ExternalLink,
  Edit,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  Award,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { getCampaignById, getCampaignDonors, Campaign } from "@/app/api/campaign";
import { getImageUrl } from "@/lib/image";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active Drive",
    className: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  },
  completed: {
    label: "Completed Goal",
    className: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  },
  draft: {
    label: "Draft",
    className: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  },
  paused: {
    label: "Paused",
    className: "bg-gray-500/10 text-gray-600 border border-gray-500/20",
  },
};

export default function CampaignOverviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [donorPage, setDonorPage] = useState(1);

  const {
    data: campaign,
    isLoading: isCampaignLoading,
    isError: isCampaignError,
  } = useQuery<Campaign>({
    queryKey: ["campaign", id],
    queryFn: () => getCampaignById(id!),
    enabled: Boolean(id),
  });

  const slugOrId = campaign?.slug || id || "";
  const { data: donorsData, isLoading: isDonorsLoading } = useQuery({
    queryKey: ["campaign-donors", slugOrId, donorPage],
    queryFn: () => getCampaignDonors(slugOrId, donorPage, 10),
    enabled: Boolean(slugOrId),
  });

  if (isCampaignLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blueaccent" />
          <p className="text-xs font-semibold text-muted">Loading campaign overview...</p>
        </div>
      </div>
    );
  }

  if (isCampaignError || !campaign) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-md bg-panel border border-border p-8 rounded-2xl shadow-sm">
          <AlertCircle size={36} className="text-red-500" />
          <h2 className="text-base font-bold text-text-primary">Campaign Not Found</h2>
          <p className="text-xs text-muted">
            The campaign you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/dashboard/campaigns"
            className="bg-blueaccent text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-dark transition-all"
          >
            ← Back to All Campaigns
          </Link>
        </div>
      </div>
    );
  }

  const raised = campaign.raisedAmount || 0;
  const goal = campaign.goal || 1;
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  const donorsCount = campaign.donorCount || donorsData?.total || 0;
  const cfg = statusConfig[campaign.status] || statusConfig.active;

  const categoryName =
    typeof campaign.category === "object" && campaign.category
      ? (campaign.category as any).name
      : typeof campaign.category === "string"
      ? campaign.category
      : "Grassroots Initiative";

  // Parse products from content if stored as JSON
  let productsList: any[] = [];
  if (campaign.content) {
    try {
      const parsed = JSON.parse(campaign.content);
      if (Array.isArray(parsed.products)) {
        productsList = parsed.products;
      }
    } catch {}
  }

  const heroImg = campaign.images?.[0]
    ? getImageUrl(String(campaign.images[0]))
    : "";

  return (
    <PermissionGuard module="campaigns">
      <div className="min-h-screen bg-bg p-6 space-y-6">
        {/* Top Breadcrumb & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/campaigns"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-text-primary transition-colors mb-2"
            >
              <ArrowLeft size={13} /> All Campaigns
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {campaign.name}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${cfg.className}`}
              >
                {cfg.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/dashboard/campaigns/${campaign._id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blueaccent hover:bg-blue-dark text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Edit size={13} />
              <span>Edit Details</span>
            </Link>

            {campaign.slug && (
              <Link
                href={`/campaigns/${campaign.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-panel border border-border hover:border-blueaccent/40 text-text-primary text-xs font-bold rounded-xl transition-all"
              >
                <ExternalLink size={13} className="text-blueaccent" />
                <span>Live Website Page</span>
              </Link>
            )}
          </div>
        </div>

        {/* Hero Banner & KPI Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card with Image & Progress */}
          <div className="lg:col-span-2 bg-panel border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row gap-5">
              {heroImg && (
                <div className="relative w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-bg shrink-0 border border-border shadow-xs">
                  <Image
                    src={heroImg}
                    alt={campaign.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 200px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blueaccent/10 text-blueaccent">
                    {categoryName}
                  </span>
                  {campaign.location && (
                    <span className="text-xs text-muted flex items-center gap-1">
                      <MapPin size={12} /> {campaign.location}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-text-primary leading-snug">
                  {campaign.name}
                </h2>
                <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                  {campaign.description || "No public summary provided for this campaign."}
                </p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="bg-bg/60 border border-border/80 rounded-xl p-4.5 space-y-2.5">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-0.5">
                    Funding Progress
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-text-primary">
                      ₹{raised.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted font-medium">
                      raised of ₹{goal.toLocaleString("en-IN")} goal
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-blueaccent">
                    {pct}%
                  </span>
                  <span className="text-[10px] text-muted block font-semibold">
                    Completed
                  </span>
                </div>
              </div>

              <div className="w-full h-3 bg-panel rounded-full overflow-hidden p-0.5 border border-border">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    pct >= 100 ? "bg-emerald-500" : "bg-blueaccent"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-muted pt-1">
                <span>
                  Remaining:{" "}
                  <strong className="text-text-primary font-semibold">
                    ₹{Math.max(0, goal - raised).toLocaleString("en-IN")}
                  </strong>
                </span>
                <span>
                  {pct >= 100 ? (
                    <span className="text-emerald-600 font-bold">Goal Achieved 🎉</span>
                  ) : (
                    <span>{(100 - pct).toFixed(0)}% to target</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="space-y-4">
            <div className="bg-panel border border-border rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blueaccent/10 text-blueaccent flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                  Donors & Supporters
                </span>
                <p className="text-2xl font-bold text-text-primary mt-0.5">
                  {donorsCount.toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  People contributed
                </span>
              </div>
            </div>

            <div className="bg-panel border border-border rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                  Average Contribution
                </span>
                <p className="text-2xl font-bold text-text-primary mt-0.5">
                  ₹{donorsCount > 0 ? Math.round(raised / donorsCount).toLocaleString("en-IN") : "0"}
                </p>
                <span className="text-[10px] text-muted">Per supporter</span>
              </div>
            </div>

            <div className="bg-panel border border-border rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                  Campaign Timeline
                </span>
                <p className="text-sm font-bold text-text-primary mt-0.5">
                  {campaign.startDate
                    ? new Date(campaign.startDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Immediate"}
                </p>
                <span className="text-[10px] text-muted">
                  {campaign.endDate
                    ? `Until ${new Date(campaign.endDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}`
                    : "Ongoing Initiative"}
                </span>
              </div>
            </div>

            <div className="bg-panel border border-border rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Eye size={24} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                  Engagement &amp; Views
                </span>
                <p className="text-2xl font-bold text-text-primary mt-0.5">
                  {(campaign.viewsCount || 0).toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-muted">Unique page views (3-hr window)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Donors Contribution History */}
        <div className="bg-panel border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Users size={18} className="text-blueaccent" />
                Donors &amp; Contribution Breakdown
              </h3>
              <p className="text-xs text-muted mt-0.5">
                People who donated towards this specific campaign
              </p>
            </div>
            <span className="text-xs font-bold text-muted bg-bg px-3 py-1.5 rounded-lg border border-border">
              {donorsData?.total || 0} Total Donors
            </span>
          </div>

          {isDonorsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted">
              <Loader2 size={24} className="animate-spin text-blueaccent" />
              <span className="text-xs">Loading donors list...</span>
            </div>
          ) : !donorsData?.donors || donorsData.donors.length === 0 ? (
            <div className="py-12 text-center bg-bg/50 border border-border/60 rounded-xl">
              <p className="text-xs text-muted font-medium">
                No individual donations recorded yet for this campaign.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted uppercase text-[10px] tracking-wider bg-bg/40">
                    <th className="py-3 px-4 font-bold">Donor Name</th>
                    <th className="py-3 px-4 font-bold">Amount</th>
                    <th className="py-3 px-4 font-bold">Date</th>
                    <th className="py-3 px-4 font-bold">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {donorsData.donors.map((donor, idx) => (
                    <tr key={donor._id || idx} className="hover:bg-bg/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-text-primary">
                        {donor.name || "Anonymous Donor"}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600 font-mono">
                        ₹{(donor.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {donor.createdAt
                          ? new Date(donor.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 size={11} /> 80G Certified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Product Items Breakdown if present */}
        {productsList.length > 0 && (
          <div className="bg-panel border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Package size={18} className="text-[#E8542A]" />
              Campaign Donation Items &amp; Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {productsList.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-bg/60 border border-border rounded-xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-text-primary truncate">
                      {item.product || item.title || "Donation Item"}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Target: {item.requiredUnit || 1} units
                    </p>
                  </div>
                  <span className="font-mono font-bold text-xs text-blueaccent shrink-0">
                    ₹{Number(item.totalPrice || item.unitPrice || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
