"use client";

import { Info } from "lucide-react";
import { useCampaign } from "../provider";
import { getImageUrl } from "@/lib/image";

export function CampaignSummary() {
  const { form } = useCampaign();
  const imagePreview =
    form.image instanceof File
      ? URL.createObjectURL(form.image)
      : typeof form.image === "string" && form.image
        ? getImageUrl(form.image)
        : null;

  const durationDays =
    form.startDate && form.endDate
      ? Math.max(
          0,
          Math.round(
            (new Date(form.endDate).getTime() -
              new Date(form.startDate).getTime()) /
              86400000,
          ),
        )
      : null;

  const rows = [
    { label: "Title", value: form.title || "—" },
    { label: "Category", value: form.category || "—" },
    {
      label: "Goal",
      value: form.goal ? `₹${Number(form.goal).toLocaleString("en-IN")}` : "—",
    },
    {
      label: "Duration",
      value: durationDays != null ? `${durationDays} days` : "—",
    },
    {
      label: "Min. Donation",
      value: form.minDonation ? `₹${form.minDonation}` : "—",
    },
    {
      label: "Products",
      value: form.products.length > 0 ? `${form.products.length} added` : "—",
    },
    {
      label: "FAQs",
      value: form.faqs.length > 0 ? `${form.faqs.length} added` : "—",
    },
  ];

  return (
    <div className="bg-panel border border-border rounded-2xl p-6">
      <p className="text-[11px] uppercase tracking-wider font-bold text-muted mb-4">
        Summary
      </p>
      {imagePreview && (
        <div className="mb-4 h-28 rounded-lg overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Campaign"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
          >
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              {label}
            </span>
            <span
              className={`text-right text-xs font-bold ${value === "—" ? "text-faint" : "text-text-primary"}`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 bg-orange-accent/10 border border-orange-accent/30 rounded-lg p-3 flex gap-2.5">
        <Info size={14} className="text-orange-accent shrink-0 mt-0.5" />
        <p className="text-[11px] text-orange-accent/80 leading-relaxed">
          Once published, this campaign will be live. Include 80G tax benefit
          details in the description.
        </p>
      </div>
    </div>
  );
}
