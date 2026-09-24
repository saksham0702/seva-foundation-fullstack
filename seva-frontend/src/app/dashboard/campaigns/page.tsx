"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Users,
  Clock,
  TrendingUp,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  CheckCircle,
  Eye,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCampaigns, deleteCampaign, toggleCampaignStatus, Campaign, CampaignStatus } from "@/app/api/campaign";
import type { Category } from "@/app/api/category";
import { PageProvider } from "./provider";
import withHOC from "@/lib/withHOC";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { getImageUrl } from "@/lib/image";
import { useToast } from "@/lib/toast";
import { extractErrorMessage } from "@/lib/api-error";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  },
  completed: {
    label: "Completed",
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

const AllCampaignsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: campaigns = [],
    isLoading,
    isError,
  } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: () => getCampaigns(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setDeletingId(null);
      toast.success("Campaign deleted successfully.");
    },
    onError: (err) => {
      setDeletingId(null);
      toast.error(extractErrorMessage(err, "Failed to delete campaign."));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CampaignStatus }) =>
      toggleCampaignStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign status updated successfully.");
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, "Failed to update campaign status."));
    },
  });

  const filteredCampaigns = campaigns.filter((c) => {
    if (selectedFilter === "All") return true;
    return (c.status || "active").toLowerCase() === selectedFilter.toLowerCase();
  });

  const totalRaised = campaigns.reduce((s, c) => s + (c.raisedAmount || 0), 0);
  const totalGoal = campaigns.reduce((s, c) => {
    let goal = c.goal || 0;
    if (!goal && c.content) {
      try {
        const content = JSON.parse(c.content);
        goal = Number(content.goal) || 0;
      } catch {}
    }
    return s + goal;
  }, 0);

  const activeCampaigns = campaigns.filter(
    (c) => (c.status || "active") === "active"
  ).length;

  const overallPct =
    totalGoal > 0 ? Math.min(100, Math.round((totalRaised / totalGoal) * 100)) : 0;

  const totalViews = campaigns.reduce((s, c) => s + (c.viewsCount || 0), 0);

  const stats = [
    { label: "Total Campaigns", value: campaigns.length, icon: TrendingUp },
    { label: "Active Campaigns", value: activeCampaigns, icon: Clock },
    {
      label: "Total Raised",
      value: `₹${(totalRaised / 100000).toFixed(1)}L`,
      icon: TrendingUp,
    },
    { label: "Total Views", value: totalViews.toLocaleString("en-IN"), icon: Eye },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-blueaccent" />
          <p className="text-sm font-medium text-muted">
            Loading campaigns...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle size={40} className="text-red-500" />
          <h2 className="text-xl font-semibold text-text-primary">
            Failed to load campaigns
          </h2>
          <p className="text-sm text-muted">
            Please check your backend connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-blueaccent text-white px-6 py-2 rounded-xl font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard module="campaigns">
      <div className="min-h-screen bg-bg">
        <div className="w-full px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                Campaigns
              </h1>
              <p className="text-xs text-muted mt-1">
                Manage fundraising campaigns, publish drafts, and track progress
              </p>
            </div>
            <Link
              href="/dashboard/campaigns/create-campaign"
              className="flex items-center gap-2 bg-[#E8542A] hover:bg-[#c9431d] text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20"
            >
              <Plus size={18} strokeWidth={3} />
              New Campaign
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-panel border border-border rounded-2xl px-6 py-5 hover:border-blueaccent/40 transition-all"
              >
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted mb-2">
                  {s.label}
                </p>
                <p className="text-3xl font-bold text-text-primary">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {["All", "Active", "Completed", "Draft"].map((f) => {
              const active = selectedFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`text-xs font-bold px-5 py-2.5 rounded-xl border transition-all shrink-0 ${
                    active
                      ? "bg-[#0f2347] text-white border-[#0f2347] shadow-sm"
                      : "bg-panel text-muted border-border hover:border-blueaccent/60 hover:text-text-primary"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          {filteredCampaigns.length === 0 ? (
            <div className="py-20 text-center bg-panel border border-dashed border-border rounded-3xl">
              <p className="text-muted text-sm">
                No campaigns found under &quot;{selectedFilter}&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
              {filteredCampaigns.map((c) => {
                let parsedContent: Record<string, unknown> = {};
                try {
                  parsedContent = JSON.parse(c.content || "{}");
                } catch {}
                const goal = c.goal > 0 ? c.goal : Number(parsedContent.goal) || 0;
                const raised = c.raisedAmount || 0;
                const pct =
                  goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
                const donors = c.donorCount || 0;
                const cStatus = c.status || "active";
                const cfg = statusConfig[cStatus] || statusConfig.active;
                const categoryName =
                  typeof c.category === "object"
                    ? (c.category as Category).name
                    : "General";

                return (
                  <div
                    key={c._id}
                    className="bg-panel border border-border rounded-2xl overflow-hidden hover:border-blueaccent/40 hover:shadow-lg transition-all group flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden bg-panel">
                      <Image
                        src={getImageUrl(typeof c.images?.[0] === "string" ? c.images[0] : null)}
                        alt={c.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-10" />
                      <span
                        className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md z-10 ${cfg.className}`}
                      >
                        {cfg.label}
                      </span>
                      <span className="absolute bottom-4 left-4 text-[10px] font-semibold uppercase tracking-widest text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full z-10">
                        {categoryName}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex grow flex-col">
                      <Link
                        href={`/dashboard/campaigns/${c._id}/overview`}
                        className="text-base font-bold text-text-primary leading-snug line-clamp-2 mb-4 hover:text-blueaccent transition-colors"
                      >
                        {c.name}
                      </Link>

                      {/* Progress Metrics */}
                      <div className="mt-auto">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                              Raised
                            </span>
                            <span className="text-sm font-bold text-text-primary">
                              ₹{raised.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-[#E8542A]">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-bg rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              pct >= 100 ? "bg-emerald-500" : "bg-[#E8542A]"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-semibold text-muted uppercase tracking-wider">
                          <span>Goal: ₹{goal > 0 ? goal.toLocaleString("en-IN") : "0"}</span>
                          <div className="flex items-center gap-1.5">
                            <span>{donors} Donors</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-0.5 text-blueaccent font-bold lowercase">
                              <Eye size={11} /> {(c.viewsCount || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status switch + Action buttons */}
                      <div className="flex flex-wrap items-center justify-between pt-4 mt-4 border-t border-border gap-2">
                        <select
                          value={cStatus}
                          onChange={(e) =>
                            statusMutation.mutate({
                              id: c._id,
                              status: e.target.value as CampaignStatus,
                            })
                          }
                          className="text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-border bg-panel text-text-primary focus:outline-none shrink-0"
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="completed">Completed</option>
                          <option value="paused">Paused</option>
                        </select>

                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                          <Link
                            href={`/dashboard/campaigns/${c._id}/overview`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blueaccent hover:bg-blueaccent/10 rounded-lg border border-blueaccent/30 transition-all shrink-0"
                            title="View Campaign Overview"
                          >
                            <Eye size={13} />
                            <span>Overview</span>
                          </Link>
                          <Link
                            href={`/dashboard/campaigns/${c._id}`}
                            className="p-1.5 text-muted hover:text-blueaccent hover:bg-blueaccent/10 rounded-lg border border-border hover:border-blueaccent transition-all shrink-0"
                            title="Edit Campaign"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${c.name}"?`)) {
                                deleteMutation.mutate(c._id);
                              }
                            }}
                            className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-border hover:border-red-400 transition-all shrink-0"
                            title="Delete Campaign"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
};

export default withHOC(PageProvider, AllCampaignsPage);
