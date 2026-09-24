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

          {/* Chat Canvas */}
          <div className="p-3 min-h-[220px] max-h-[340px] overflow-y-auto flex flex-col justify-end">
            <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm border border-slate-200/60 max-w-[92%] self-start space-y-2">
              {draft.mediaType === "image" && (
                <div className="w-full h-28 bg-slate-100 rounded-xl flex flex-col items-center justify-center border border-slate-200 overflow-hidden">
                  {draft.mediaUrl ? (
                    <img
                      src={draft.mediaUrl}
                      alt="Media attachment"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <ImageIcon size={20} />
                      <span className="text-[10px] mt-1">Image Attachment</span>
                    </div>
                  )}
                </div>
              )}

              {draft.mediaType === "document" && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2">
                  <FileText size={16} className="text-red-500 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-700 truncate">
                    {draft.mediaFileName || "Attachment.pdf"}
                  </span>
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
