"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Clock } from "lucide-react";
import { getImageUrl } from "@/lib/image";

export interface CampaignCardData {
  _id: string;
  slug: string;
  name: string;
  image: string;
  category: string;
  goal: number; // in rupees
  raised: number; // in rupees
  donors: number;
  daysLeft: number;
  status: "active" | "completed" | "draft" | "paused";
  urgent?: boolean;
  productsCount?: number;
}

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  completed: {
    label: "Completed",
    className: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  draft: {
    label: "Draft",
    className: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  paused: {
    label: "Paused",
    className: "bg-gray-100 text-gray-500 border border-gray-200",
  },
};

/** variant="website" → white card, navy/coral brand colours
 *  variant="dashboard" → existing admin style (slate borders, blue progress)
 */

export function CampaignCard({
  campaign,
  variant = "website",
}: {
  campaign: CampaignCardData;
  variant?: "website" | "dashboard";
}) {
  const pct =
    campaign.goal > 0
      ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100))
      : 0;

  const fmt = (n: number) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : `₹${n.toLocaleString("en-IN")}`;

  const cfg = statusConfig[campaign.status] ?? statusConfig.active;

  if (variant === "dashboard") {
    return (
      <Link
        href={`/dashboard/campaigns/${campaign._id}`}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all group flex flex-col"
      >
        <div className="relative h-56 overflow-hidden bg-slate-100">
          <Image
            src={getImageUrl(campaign.image)}
            alt={campaign.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <span
            className={`absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg z-10 ${cfg.className}`}
          >
            {cfg.label}
          </span>
          <span className="absolute bottom-4 left-4 text-[10px] font-semibold uppercase tracking-widest text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full z-10">
            {campaign.category}
          </span>
        </div>
        <div className="p-6 flex grow flex-col">
          <h3 className="text-base font-semibold text-black leading-tight line-clamp-2 mb-4 group-hover:text-blue-600 transition-colors">
            {campaign.name}
          </h3>
          <div className="mt-auto">
            <div className="flex justify-between items-end mb-2.5">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Raised
                </span>
                <span className="text-sm font-semibold text-black">
                  {fmt(campaign.raised)}
                </span>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {pct}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${pct >= 100 ? "bg-emerald-500" : "bg-blue-600"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Goal: {fmt(campaign.goal)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100">
            <span className="flex items-center gap-2 text-[11px] text-slate-600 font-bold">
              <Users size={14} className="text-slate-400" />
              {campaign.donors.toLocaleString()} Donors
            </span>
            <span className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <Clock size={14} className="text-slate-400" />
              <span className="uppercase tracking-wider">
                {campaign.daysLeft}d left
              </span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Website card ── */
  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <Image
          src={getImageUrl(campaign.image)}
          alt={campaign.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent z-10" />

        {campaign.urgent && (
          <span className="absolute top-3 left-3 bg-[#E8542A] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-10">
            Urgent
          </span>
        )}

        {Boolean(campaign.productsCount && campaign.productsCount > 0) && (
          <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[#0f2347] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm z-10">
            📦 {campaign.productsCount} Items
          </span>
        )}

        <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-widest text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
          {campaign.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex grow flex-col">
        <h3 className="text-[15px] font-semibold text-[#0f2347] leading-snug line-clamp-2 mb-3 group-hover:text-[#E8542A] transition-colors duration-200">
          {campaign.name}
        </h3>

        {/* Progress */}
        <div className="mt-auto pt-2">
          <div className="flex justify-between items-baseline mb-1.5 text-xs">
            <span className="font-bold text-[#0f2347]">
              {fmt(campaign.raised)} raised
            </span>
            <span className="font-semibold text-[#E8542A]">{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                campaign.status === "completed" || pct >= 100
                  ? "bg-gradient-to-r from-emerald-400 to-green-500"
                  : "bg-gradient-to-r from-[#E8542A] to-[#f07848]"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
            of {fmt(campaign.goal)} goal
          </p>
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
            <Users size={13} className="text-gray-400" />
            {campaign.donors.toLocaleString()} donors
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
            <Clock size={13} className="text-gray-400" />
            {campaign.daysLeft > 0
              ? `${campaign.daysLeft} days left`
              : "Completed"}
          </span>
        </div>

        <span
          className={`mt-4 block text-center text-xs font-bold rounded-lg py-2 transition-all duration-200 ${
            campaign.status === "completed" || pct >= 100
              ? "text-emerald-700 border border-emerald-200 bg-emerald-50 group-hover:bg-emerald-100"
              : "text-[#1a3a6b] border border-[#1a3a6b]/30 group-hover:bg-[#1a3a6b] group-hover:text-white group-hover:border-[#1a3a6b]"
          }`}
        >
          {campaign.status === "completed" || pct >= 100 ? "✓ Goal Achieved" : "Donate Now"}
        </span>
      </div>
    </Link>
  );
}
