"use client";

import { useEmailMarketing } from "../../EmailMarketingProvider";
import { Clock, Zap } from "lucide-react";

export function StepSend() {
  const { draft, updateDraft, setStep } = useEmailMarketing();

  const canSend = draft.senderName && draft.senderEmail;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-black mb-1">
          Review & schedule
        </h2>
        <p className="text-xs text-slate-500">
          Set sender details and choose when to send.
        </p>
      </div>

      {/* Sender info */}
      <div className="flex flex-col gap-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
          Sender Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Sender Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={draft.senderName}
              onChange={(e) => updateDraft({ senderName: e.target.value })}
              placeholder="e.g. Giving India"
              className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Sender Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={draft.senderEmail}
              onChange={(e) => updateDraft({ senderEmail: e.target.value })}
              placeholder="e.g. hello@givingindia.org"
              className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
          When to Send
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => updateDraft({ scheduleType: "now" })}
            className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
              draft.scheduleType === "now"
                ? "border-black bg-black/[0.03]"
                : "border-slate-200 hover:border-slate-400"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Zap size={16} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-black">Send now</p>
              <p className="text-[11px] text-slate-400">Deliver immediately</p>
            </div>
            <div
              className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 ${
                draft.scheduleType === "now"
                  ? "border-black bg-black"
                  : "border-slate-300"
              }`}
            />
          </button>

          <button
            onClick={() => updateDraft({ scheduleType: "later" })}
            className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
              draft.scheduleType === "later"
                ? "border-black bg-black/[0.03]"
                : "border-slate-200 hover:border-slate-400"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-black">Schedule</p>
              <p className="text-[11px] text-slate-400">Pick a date & time</p>
            </div>
            <div
              className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 ${
                draft.scheduleType === "later"
                  ? "border-black bg-black"
                  : "border-slate-300"
              }`}
            />
          </button>
        </div>

        {draft.scheduleType === "later" && (
          <input
            type="datetime-local"
            value={draft.scheduledAt}
            onChange={(e) => updateDraft({ scheduledAt: e.target.value })}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black transition-colors mt-1"
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={() => setStep(2)}
          className="text-sm font-bold text-slate-500 hover:text-black transition-colors px-4 py-3"
        >
          ← Back
        </button>
        <button
          disabled={!canSend}
          className="bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-black/10 disabled:shadow-none"
        >
          {draft.scheduleType === "later"
            ? "Schedule Campaign"
            : "Send Campaign"}
        </button>
      </div>
    </div>
  );
}
