"use client";

import { useWA } from "../WaProvider";
import { Users, Clock, FileText, Image as ImageIcon, ShieldCheck, QrCode, Cloud } from "lucide-react";

export function WASummary() {
  const { draft } = useWA();

  // Interpolate sample variables for realistic preview
  const renderPreviewText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\{\{\s*name\s*\}\}/gi, "Rajesh Sharma")
      .replace(/\{\{\s*phone\s*\}\}/gi, "+91 98765 43210")
      .replace(/\{\{\s*amount\s*\}\}/gi, "₹2,500")
      .replace(/\{\{\s*campaign\s*\}\}/gi, "Clean Drinking Water")
      .replace(/\{\{\s*date\s*\}\}/gi, "24 Sep 2026");
  };

  const previewText = renderPreviewText(draft.messageBody);

  return (
    <div className="flex flex-col gap-4">
      {/* Smartphone Chat Bubble Mockup */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Live Chat Preview
          </p>
          <span className="text-[10px] font-bold text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded-full">
            WhatsApp
          </span>
        </div>

        {/* Smartphone Shell */}
        <div className="w-full bg-[#E5DDD5] rounded-2xl overflow-hidden border border-slate-300 shadow-inner flex flex-col">
          {/* WhatsApp Header Bar */}
          <div className="bg-[#075E54] px-3 py-2.5 flex items-center gap-2.5 text-white">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
              S
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate leading-tight">
                Seva Foundation
              </p>
              <p className="text-[9px] text-white/70">
                {draft.provider === "BAILEYS" ? "WhatsApp Web Session" : "Official WhatsApp API"}
              </p>
            </div>
          </div>

          {/* Chat Canvas (Scrollable) */}
          <div className="p-3 h-[320px] max-h-[420px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm border border-slate-200/60 max-w-[94%] self-start space-y-2">
              {/* Media Preview: Image */}
              {((draft.mediaType === "image" && draft.mediaUrl) ||
                (draft.mediaUrl && !draft.mediaUrl.match(/\.(pdf|docx?|xlsx?|csv)$/i) && draft.mediaType !== "document")) && (
                <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm relative group">
                  <img
                    src={draft.mediaUrl}
                    alt={draft.mediaFileName || "Attached Media"}
                    className="w-full max-h-44 object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                    IMAGE
                  </div>
                </div>
              )}

              {/* Media Placeholder if image mode selected but no file yet */}
              {draft.mediaType === "image" && !draft.mediaUrl && (
                <div className="w-full h-28 bg-slate-100 rounded-xl flex flex-col items-center justify-center border border-dashed border-slate-300 text-slate-400">
                  <ImageIcon size={22} className="text-slate-400" />
                  <span className="text-[10px] font-bold mt-1 text-slate-500">Image will appear here</span>
                </div>
              )}

              {/* Media Preview: Document */}
              {(draft.mediaType === "document" ||
                (draft.mediaUrl && draft.mediaUrl.match(/\.(pdf|docx?|xlsx?|csv)$/i))) && (
                <div className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 transition-all shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {draft.mediaFileName || (draft.mediaUrl ? draft.mediaUrl.split("/").pop() : "Attached Document.pdf")}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Document • Attached
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-800 leading-relaxed break-words whitespace-pre-wrap font-sans">
                {previewText || (
                  <span className="text-slate-400 italic">
                    Type a message or choose a template to preview...
                  </span>
                )}
              </p>

              <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-1">
                <span>12:45 PM</span>
                <span className="text-[#34B7F1] font-bold">✓✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
          Campaign Summary
        </p>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Channel</span>
            <span className="font-bold text-black flex items-center gap-1">
              {draft.provider === "BAILEYS" ? (
                <>
                  <QrCode size={13} className="text-[#25D366]" /> Baileys Web QR
                </>
              ) : (
                <>
                  <Cloud size={13} className="text-blue-600" /> Meta Official API
                </>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Target Segment</span>
            <span className="font-bold text-black truncate max-w-[150px]">
              {draft.audienceType === "CUSTOM_FILE"
                ? draft.importFileName || "Custom File"
                : draft.audienceType.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Total Recipients</span>
            <span className="font-bold font-mono text-[#25D366] text-sm">
              {draft.estimatedRecipientCount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Anti-Ban Queue</span>
            <span className="font-bold text-slate-700">
              {draft.antiBanConfig.minDelaySeconds}s – {draft.antiBanConfig.maxDelaySeconds}s delay
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Schedule</span>
            <span className="font-bold text-slate-700">
              {draft.scheduleType === "now" ? "Instant Dispatch" : draft.scheduledAt || "Scheduled"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
