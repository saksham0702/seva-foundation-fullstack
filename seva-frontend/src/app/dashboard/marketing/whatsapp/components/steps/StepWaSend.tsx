"use client";

import { useWA } from "../../WaProvider";
import { Clock, Zap } from "lucide-react";

export function StepWASend() {
  const { draft, updateDraft, setStep } = useWA();
  const canSend =
    draft.scheduleType === "now" ||
    (draft.scheduleType === "later" && draft.scheduledAt);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-black mb-1">
          Schedule your broadcast
        </h2>
        <p className="text-xs text-slate-500">
          Choose when to send. All messages are sent as a WhatsApp Broadcast.
        </p>
      </div>

      {/* Schedule options */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
          When to Send
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => updateDraft({ scheduleType: "now" })}
            className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
              draft.scheduleType === "now"
                ? "border-[#25D366] bg-[#25D366]/[0.04]"
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
              className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 ${draft.scheduleType === "now" ? "border-[#25D366] bg-[#25D366]" : "border-slate-300"}`}
            />
          </button>

          <button
            onClick={() => updateDraft({ scheduleType: "later" })}
            className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
              draft.scheduleType === "later"
                ? "border-[#25D366] bg-[#25D366]/[0.04]"
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
              className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 ${draft.scheduleType === "later" ? "border-[#25D366] bg-[#25D366]" : "border-slate-300"}`}
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

      {/* Info note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <p className="text-[11px] font-bold text-amber-700 mb-1">
          Before you send
        </p>
        <ul className="text-[11px] text-amber-600 flex flex-col gap-1 list-disc list-inside">
          <li>Contacts must have opted-in to receive WhatsApp messages</li>
          <li>
            Bulk messages require a verified WhatsApp Business API account
          </li>
          <li>Replies will arrive in your WhatsApp Business inbox</li>
        </ul>
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={() => setStep(2)}
          className="text-sm font-bold text-slate-500 hover:text-black transition-colors px-4 py-3"
        >
          ← Back
        </button>
        <button
          disabled={!canSend}
          className="bg-[#25D366] hover:bg-[#1ebe57] disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:shadow-none"
        >
          {draft.scheduleType === "later"
            ? "Schedule Broadcast"
            : "Send Broadcast"}
        </button>
      </div>
    </div>
  );
}
