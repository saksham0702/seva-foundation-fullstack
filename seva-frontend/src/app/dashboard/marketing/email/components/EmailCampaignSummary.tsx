"use client";

import { useEmailMarketing } from "../EmailMarketingProvider";
import { Users, Layout, Clock, Mail } from "lucide-react";

export function EmailCampaignSummary() {
  const { draft, step } = useEmailMarketing();

  const rows = [
    {
      icon: Users,
      label: "Audience",
      value: draft.importedEmails.length
        ? `${draft.importedEmails.length} contacts`
        : draft.listName || "—",
    },
    {
      icon: Layout,
      label: "Template",
      value: draft.templateName || "—",
    },
    {
      icon: Mail,
      label: "Subject",
      value: draft.subject || "—",
    },
    {
      icon: Clock,
      label: "Schedule",
      value:
        draft.scheduleType === "later" && draft.scheduledAt
          ? draft.scheduledAt
          : draft.scheduleType === "now"
            ? "Send immediately"
            : "—",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-5">
        Campaign Summary
      </p>
      <div className="flex flex-col gap-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
              <r.icon size={13} className="text-slate-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {r.label}
              </p>
              <p className="text-sm font-semibold text-black mt-0.5 break-all">
                {r.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {step === 3 && (
        <button className="mt-8 w-full bg-black hover:bg-slate-800 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-black/10">
          Send Campaign
        </button>
      )}
    </div>
  );
}
