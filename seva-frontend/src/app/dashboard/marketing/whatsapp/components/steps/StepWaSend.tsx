"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Zap,
  ShieldCheck,
  Sliders,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useWA } from "../../WaProvider";
import { whatsappAPI } from "@/app/api/whatsapp";

export function StepWASend() {
  const router = useRouter();
  const { draft, updateDraft, setStep, resetDraft } = useWA();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const antiBan = draft.antiBanConfig;
  const totalCount = draft.estimatedRecipientCount || 1;
  const avgDelaySec = (antiBan.minDelaySeconds + antiBan.maxDelaySeconds) / 2;
  const batchPauseTotal =
    Math.floor(totalCount / antiBan.batchSize) * antiBan.batchPauseSeconds;
  const estimatedSeconds = Math.round(totalCount * avgDelaySec + batchPauseTotal);
  const estimatedMinutes = Math.max(1, Math.round(estimatedSeconds / 60));

  const canSend =
    !submitting &&
    (draft.scheduleType === "now" ||
      (draft.scheduleType === "later" && !!draft.scheduledAt));

  async function handleLaunch() {
    try {
      setSubmitting(true);
      setErrorMsg("");

      const payload: any = {
        name: draft.name,
        description: draft.description,
        provider: draft.provider,
        audienceType: draft.audienceType,
        customRecipients:
          draft.audienceType === "CUSTOM_FILE"
            ? draft.customRecipients
            : undefined,
        messageType: draft.mediaUrl
          ? draft.mediaType === "document"
            ? "DOCUMENT"
            : "IMAGE"
          : "TEXT",
        templateId: draft.templateId || undefined,
        messageBody: draft.messageBody,
        mediaUrl: draft.mediaUrl || undefined,
        antiBanConfig: draft.antiBanConfig,
        scheduleType: draft.scheduleType,
        scheduledAt: draft.scheduledAt || undefined,
      };

      const result = await whatsappAPI.createCampaign(payload);
      resetDraft();
      router.push(`/dashboard/marketing/whatsapp/${result._id}`);
    } catch (err: any) {
      console.error("Failed to launch campaign:", err);
      setErrorMsg(
        err?.response?.data?.message ||
          err.message ||
          "Failed to launch campaign. Please check settings."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-base font-bold text-black tracking-tight mb-1">
          Review & Anti-Ban Protection Settings
        </h2>
        <p className="text-xs text-slate-500">
          Configure randomized delivery queue, anti-ban cooldown intervals, and launch your broadcast.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Anti-Ban Jitter & Queue Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black">
                Anti-Ban Smart Delay & Rate Limiting
              </h3>
              <p className="text-[11px] text-slate-500">
                Randomized message interval ensures normal human behavior to protect your number.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
            Active Protection
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Min & Max Delay */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Random Interval Gap</span>
              <span className="font-mono font-bold text-[#25D366]">
                {antiBan.minDelaySeconds}s — {antiBan.maxDelaySeconds}s
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={2}
                max={15}
                value={antiBan.minDelaySeconds}
                onChange={(e) =>
                  updateDraft({
                    antiBanConfig: {
                      ...antiBan,
                      minDelaySeconds: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-[#25D366]"
              />
              <input
                type="range"
                min={10}
                max={40}
                value={antiBan.maxDelaySeconds}
                onChange={(e) =>
                  updateDraft({
                    antiBanConfig: {
                      ...antiBan,
                      maxDelaySeconds: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-[#25D366]"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Each message sleeps randomly between {antiBan.minDelaySeconds} and {antiBan.maxDelaySeconds} seconds.
            </p>
          </div>

          {/* Batch Pause Breakdown */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Batch Cooling Break</span>
              <span className="font-mono font-bold text-blue-600">
                Pause {antiBan.batchPauseSeconds}s every {antiBan.batchSize} msgs
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={20}
                max={100}
                step={10}
                value={antiBan.batchSize}
                onChange={(e) =>
                  updateDraft({
                    antiBanConfig: {
                      ...antiBan,
                      batchSize: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-blue-600"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              After sending {antiBan.batchSize} messages, the system pauses for {antiBan.batchPauseSeconds}s before continuing.
            </p>
          </div>
        </div>

        {/* Estimated Duration Banner */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-emerald-700" />
            <span className="text-emerald-900 font-semibold">
              Estimated Total Broadcast Time for {totalCount.toLocaleString()} recipients:
            </span>
          </div>
          <strong className="text-emerald-950 font-mono text-sm">
            ~{estimatedMinutes} {estimatedMinutes === 1 ? "minute" : "minutes"}
          </strong>
        </div>
      </div>

      {/* 2. Schedule Timing */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Broadcast Timing
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateDraft({ scheduleType: "now" })}
            className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
              draft.scheduleType === "now"
                ? "border-[#25D366] bg-[#25D366]/[0.04] shadow-sm"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-black">Send Immediately</p>
              <p className="text-[11px] text-slate-500">
                Queue and begin background dispatch right away
              </p>
            </div>
            <div
              className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                draft.scheduleType === "now"
                  ? "border-[#25D366] bg-[#25D366]"
                  : "border-slate-300"
              }`}
            >
              {draft.scheduleType === "now" && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateDraft({ scheduleType: "later" })}
            className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
              draft.scheduleType === "later"
                ? "border-[#25D366] bg-[#25D366]/[0.04] shadow-sm"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-black">Schedule for Later</p>
              <p className="text-[11px] text-slate-500">
                Pick a specific future date and time
              </p>
            </div>
            <div
              className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                draft.scheduleType === "later"
                  ? "border-[#25D366] bg-[#25D366]"
                  : "border-slate-300"
              }`}
            >
              {draft.scheduleType === "later" && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
          </button>
        </div>

        {draft.scheduleType === "later" && (
          <div className="pt-2">
            <input
              type="datetime-local"
              value={draft.scheduledAt}
              onChange={(e) => updateDraft({ scheduledAt: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
            />
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="text-sm font-bold text-slate-500 hover:text-black transition-colors px-4 py-2.5"
        >
          ← Back to Message
        </button>
        <button
          type="button"
          disabled={!canSend}
          onClick={handleLaunch}
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Initializing Broadcast...
            </>
          ) : (
            <>
              <Send size={16} />
              {draft.scheduleType === "later"
                ? "Schedule Broadcast"
                : "Launch Broadcast Now"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
