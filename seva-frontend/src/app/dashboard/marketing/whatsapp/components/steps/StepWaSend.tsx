"use client";

import { useState, useEffect, useRef } from "react";
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
  QrCode,
  RefreshCw,
  X,
  Smartphone,
  AlertTriangle,
} from "lucide-react";
import { useWA } from "../../WaProvider";
import { whatsappAPI, IWhatsAppConfigData } from "@/app/api/whatsapp";
import { useToast } from "@/lib/toast";

export function StepWASend() {
  const router = useRouter();
  const toast = useToast();
  const { draft, updateDraft, setStep, resetDraft } = useWA();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [configData, setConfigData] = useState<IWhatsAppConfigData | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [refreshingQr, setRefreshingQr] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial config
  const fetchConfig = async () => {
    try {
      const data = await whatsappAPI.getConfig();
      setConfigData(data);
      return data;
    } catch (err) {
      console.error("Failed to load WhatsApp config:", err);
      return null;
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Poll for connection while QR modal is open
  useEffect(() => {
    if (showQrModal && draft.provider === "BAILEYS") {
      pollTimerRef.current = setInterval(async () => {
        const latest = await fetchConfig();
        if (latest?.baileysLive?.isConnected) {
          toast.success("WhatsApp connected successfully!");
          setTimeout(() => {
            setShowQrModal(false);
          }, 1500);
        }
      }, 2500);
    } else {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [showQrModal, draft.provider]);

  async function handleRefreshQr() {
    try {
      setRefreshingQr(true);
      await whatsappAPI.reconnectBaileys();
      const updated = await fetchConfig();
      if (updated?.baileysLive?.qrCode) {
        toast.info("Fresh QR code generated. Scan with WhatsApp to link.");
      }
    } catch (err: any) {
      toast.error("Failed to refresh QR: " + err.message);
    } finally {
      setRefreshingQr(false);
    }
  }

  const isBaileys = draft.provider === "BAILEYS";
  const isConnected = isBaileys
    ? !!configData?.baileysLive?.isConnected
    : !!configData?.config?.officialApi?.isConfigured;

  const antiBan = draft.antiBanConfig;
  const totalCount = draft.estimatedRecipientCount || draft.customRecipients.length || 1;
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

      // Connection Guard: Check Baileys connectivity
      if (isBaileys) {
        const latestConfig = await fetchConfig();
        if (!latestConfig?.baileysLive?.isConnected) {
          setShowQrModal(true);
          if (!latestConfig?.baileysLive?.qrCode) {
            handleRefreshQr();
          }
          setSubmitting(false);
          return;
        }
      }

      const payload: any = {
        name: draft.name,
        description: draft.description,
        provider: draft.provider,
        audienceType: draft.audienceType,
        customRecipients:
          draft.audienceType === "CUSTOM_FILE" || (draft.customRecipients && draft.customRecipients.length > 0)
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

      {/* WhatsApp Connection Status Alert */}
      {isBaileys && (
        isConnected ? (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-emerald-900 font-semibold">
              <CheckCircle2 size={18} className="text-[#25D366] shrink-0" />
              <span>
                WhatsApp Web Connected {configData?.baileysLive?.phoneNumber ? `(+${configData.baileysLive.phoneNumber})` : ""}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Session Live & Ready
            </span>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="font-bold text-amber-950 text-sm">WhatsApp is Not Logged In</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Kindly login first before broadcasting your campaign. Click below to scan the QR code with your phone.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowQrModal(true);
                if (!configData?.baileysLive?.qrCode) handleRefreshQr();
              }}
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 self-start sm:self-auto"
            >
              <QrCode size={14} /> Scan QR Code to Login
            </button>
          </div>
        )
      )}

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

      {/* QR Login & Pairing Modal for WhatsApp Web */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                  <QrCode size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Scan QR Code to Login
                </h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-black font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-left flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold">WhatsApp is not logged in!</span>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Kindly scan this QR code with WhatsApp on your phone first. Once linked, you can proceed to launch your broadcast.
                </p>
              </div>
            </div>

            {configData?.baileysLive?.isConnected ? (
              <div className="py-6 space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 size={44} className="text-emerald-600 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-emerald-950">WhatsApp Connected Successfully!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Phone: +{configData.baileysLive.phoneNumber || "Linked"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="mt-2 bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold px-6 py-2 rounded-xl transition-all shadow-md"
                >
                  Proceed to Broadcast
                </button>
              </div>
            ) : configData?.baileysLive?.qrCode ? (
              <div className="space-y-4">
                <div className="p-4 bg-white border-2 border-[#25D366] rounded-2xl shadow-inner inline-block">
                  <img
                    src={configData.baileysLive.qrCode}
                    alt="WhatsApp QR Code"
                    className="w-56 h-56 object-contain mx-auto"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs text-slate-700 space-y-1.5">
                  <p className="font-bold text-black flex items-center gap-1.5">
                    <Smartphone size={14} className="text-[#25D366]" /> How to scan with your phone:
                  </p>
                  <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-0.5 leading-relaxed pl-1">
                    <li>Open WhatsApp on your mobile phone</li>
                    <li>Tap <strong>Settings / Menu (⋮)</strong> &rarr; <strong>Linked Devices</strong></li>
                    <li>Tap <strong>Link a Device</strong> and point your camera here</li>
                  </ol>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <Loader2 size={12} className="animate-spin text-[#25D366]" />
                  <span>Waiting for scan... auto-updates in real time</span>
                </div>
              </div>
            ) : (
              <div className="py-10 space-y-3">
                <Loader2 size={32} className="text-[#25D366] animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  Generating fresh WhatsApp QR code...
                </p>
                <p className="text-[11px] text-slate-400">
                  Connecting to Baileys multi-device socket
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                disabled={refreshingQr}
                onClick={handleRefreshQr}
                className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw size={13} className={refreshingQr ? "animate-spin" : ""} />
                {refreshingQr ? "Refreshing..." : "Refresh QR Code"}
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-xs font-bold bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
