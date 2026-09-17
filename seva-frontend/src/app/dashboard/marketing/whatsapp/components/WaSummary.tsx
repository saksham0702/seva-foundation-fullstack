"use client";

import { useWA } from "../WaProvider";
import { Users, Clock, FileText, Image } from "lucide-react";

export function WASummary() {
  const { draft, step } = useWA();

  return (
    <div className="flex flex-col gap-4">
      {/* Phone preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-4">
          Preview
        </p>

        {/* Phone shell */}
        <div className="mx-auto w-[200px] bg-[#ECE5DD] rounded-2xl overflow-hidden border border-slate-300 shadow-md">
          {/* WA top bar */}
          <div className="bg-[#075E54] px-3 py-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20" />
            <div>
              <p className="text-[10px] font-bold text-white leading-tight">
                Your Organisation
              </p>
              <p className="text-[9px] text-white/60">via WhatsApp Business</p>
            </div>
          </div>

          {/* Bubble */}
          <div className="p-3">
            <div className="bg-white rounded-xl rounded-tl-none px-3 py-2.5 shadow-sm max-w-full">
              {draft.mediaType === "image" && (
                <div className="w-full h-20 bg-slate-200 rounded-lg mb-2 flex items-center justify-center">
                  <Image size={16} className="text-slate-400" />
                </div>
              )}
              {draft.mediaType === "document" && (
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2 py-1.5 mb-2">
                  <FileText size={12} className="text-slate-500" />
                  <span className="text-[10px] text-slate-500 truncate">
                    {draft.mediaFileName || "document.pdf"}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
                {draft.messageBody || (
                  <span className="text-slate-300 italic">
                    Your message will appear here…
                  </span>
                )}
              </p>
              <p className="text-[9px] text-slate-400 text-right mt-1">
                9:41 AM ✓✓
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary rows */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-4">
          Campaign Summary
        </p>
        <div className="flex flex-col gap-4">
          {[
            {
              icon: Users,
              label: "Audience",
              value: draft.importedNumbers.length
                ? `${draft.importedNumbers.length} numbers`
                : draft.listName || "—",
            },
            {
              icon: FileText,
              label: "Template",
              value: draft.templateName || "—",
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
          ].map((r) => (
            <div key={r.label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
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
          <button className="mt-6 w-full bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/20">
            Send on WhatsApp
          </button>
        )}
      </div>
    </div>
  );
}
