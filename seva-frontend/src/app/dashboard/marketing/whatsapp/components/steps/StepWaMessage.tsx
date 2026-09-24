"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Image as ImageIcon,
  FileText,
  X,
  Sparkles,
  Bold,
  Italic,
  Strikethrough,
  Code,
  QrCode,
  Cloud,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useWA } from "../../WaProvider";
import {
  whatsappAPI,
  IWhatsAppTemplate,
  IWhatsAppConfigData,
} from "@/app/api/whatsapp";
import { uploadCmsImageFile } from "@/app/api/cms";
import { useToast } from "@/lib/toast";

export function StepWAMessage() {
  const { draft, updateDraft, setStep } = useWA();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"templates" | "custom">("templates");
  const [templates, setTemplates] = useState<IWhatsAppTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [configData, setConfigData] = useState<IWhatsAppConfigData | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingTemplates(true);
        const [tplsRes, confRes] = await Promise.allSettled([
          whatsappAPI.getTemplates(),
          whatsappAPI.getConfig(),
        ]);
        if (tplsRes.status === "fulfilled") setTemplates(tplsRes.value);
        if (confRes.status === "fulfilled") setConfigData(confRes.value);
      } catch (err) {
        console.error("Failed to load message step data:", err);
      } finally {
        setLoadingTemplates(false);
      }
    }
    loadData();
  }, []);

  function selectTemplate(tpl: IWhatsAppTemplate) {
    updateDraft({
      templateId: tpl._id || null,
      templateName: tpl.name,
      messageBody: tpl.body,
    });
  }

  function insertVariable(tag: string) {
    const updated = (draft.messageBody || "") + ` {{${tag}}} `;
    updateDraft({ messageBody: updated });
  }

  function applyFormatting(wrapper: string) {
    const updated = (draft.messageBody || "") + `${wrapper}text${wrapper}`;
    updateDraft({ messageBody: updated });
  }

  async function handleMediaUpload(file: File) {
    try {
      setUploadingMedia(true);
      const url = await uploadCmsImageFile(file);
      updateDraft({
        mediaUrl: url,
        mediaFileName: file.name,
      });
      toast.success("Media file uploaded successfully");
    } catch (err: any) {
      toast.error("Failed to upload media. Please try again.");
    } finally {
      setUploadingMedia(false);
    }
  }

  async function handleReconnectBaileys() {
    try {
      await whatsappAPI.reconnectBaileys();
      const updated = await whatsappAPI.getConfig();
      setConfigData(updated);
      setShowQrModal(true);
      toast.info("WhatsApp QR code generated. Scan with WhatsApp to link.");
    } catch (err: any) {
      toast.error("Failed to generate QR: " + err.message);
    }
  }

  const baileysConnected = configData?.baileysLive?.isConnected;
  const canProceed = draft.messageBody.trim().length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Channel / Provider Selection */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Select WhatsApp Channel Provider
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => updateDraft({ provider: "BAILEYS" })}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              draft.provider === "BAILEYS"
                ? "border-[#25D366] bg-white shadow-sm ring-1 ring-[#25D366]/20"
                : "border-slate-200 bg-white/60 hover:bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    draft.provider === "BAILEYS"
                      ? "bg-[#25D366] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <QrCode size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-black flex items-center gap-1.5">
                    WhatsApp Web (Baileys)
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                      QR Multi-Device
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    No Meta template approval needed. Uses smart anti-ban queue with randomized 3-20s delays.
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center mt-1 ${
                  draft.provider === "BAILEYS"
                    ? "border-[#25D366] bg-[#25D366]"
                    : "border-slate-300"
                }`}
              >
                {draft.provider === "BAILEYS" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Connection Guard Alert */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    baileysConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                <span className="font-semibold text-slate-700">
                  {baileysConnected
                    ? `Active (+${configData?.baileysLive?.phoneNumber})`
                    : "Not Connected"}
                </span>
              </div>
              {!baileysConnected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (configData?.baileysLive?.qrCode) {
                      setShowQrModal(true);
                    } else {
                      handleReconnectBaileys();
                    }
                  }}
                  className="text-xs font-bold text-[#25D366] hover:underline"
                >
                  Scan QR Code &rarr;
                </button>
              )}
            </div>
          </div>

          <div
            onClick={() => updateDraft({ provider: "OFFICIAL_API" })}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              draft.provider === "OFFICIAL_API"
                ? "border-blue-600 bg-white shadow-sm ring-1 ring-blue-600/20"
                : "border-slate-200 bg-white/60 hover:bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    draft.provider === "OFFICIAL_API"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Cloud size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-black flex items-center gap-1.5">
                    Meta WhatsApp Cloud API
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.2 rounded-full font-bold">
                      Official API
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Official high-throughput Meta Graph API for registered business phone number.
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center mt-1 ${
                  draft.provider === "OFFICIAL_API"
                    ? "border-blue-600 bg-blue-600"
                    : "border-slate-300"
                }`}
              >
                {draft.provider === "OFFICIAL_API" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
              {configData?.config?.officialApi?.isConfigured
                ? "✓ Meta Cloud API Configured"
                : "Setup in Settings tab if unconfigured"}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Message Composition Mode Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-black">
              Message Content & Templates
            </h2>
            <p className="text-xs text-slate-500">
              Select a pre-built template or compose custom formatted WhatsApp text.
            </p>
          </div>
          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-all ${
                activeTab === "templates"
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-500 hover:text-black"
              }`}
            >
              Pre-built Templates ({templates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-all ${
                activeTab === "custom"
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-500 hover:text-black"
              }`}
            >
              Custom Editor
            </button>
          </div>
        </div>

        {activeTab === "templates" && (
          <div className="flex flex-col gap-2.5">
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-xs">
                <Loader2 size={16} className="animate-spin text-[#25D366]" />
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-xl text-slate-400 text-xs">
                No templates found. Switch to custom editor or seed default templates.
              </div>
            ) : (
              templates.map((tpl) => {
                const selected = draft.templateId === tpl._id;
                return (
                  <button
                    type="button"
                    key={tpl._id}
                    onClick={() => selectTemplate(tpl)}
                    className={`flex items-start gap-4 px-5 py-4 rounded-xl border text-left transition-all ${
                      selected
                        ? "border-[#25D366] bg-[#25D366]/[0.04] shadow-sm ring-1 ring-[#25D366]/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-black">{tpl.name}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {tpl.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 whitespace-pre-wrap leading-relaxed font-sans">
                        {tpl.body}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        selected
                          ? "border-[#25D366] bg-[#25D366]"
                          : "border-slate-300"
                      }`}
                    >
                      {selected && (
                        <Check size={10} className="text-white" strokeWidth={3} />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Custom Message Editor */}
        <div className={`flex flex-col gap-3 ${activeTab === "templates" ? "mt-4 pt-4 border-t border-slate-200" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-3 py-2 rounded-t-xl border border-slate-200 border-b-0">
            <span className="text-[11px] font-bold text-slate-600">
              Message Body Editor
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyFormatting("*")}
                title="Bold (*text*)"
                className="p-1.5 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("_")}
                title="Italic (_text_)"
                className="p-1.5 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("~")}
                title="Strikethrough (~text~)"
                className="p-1.5 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold"
              >
                <Strikethrough size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("```")}
                title="Monospace (```text```)"
                className="p-1.5 hover:bg-slate-200 rounded text-slate-700 text-xs font-bold"
              >
                <Code size={13} />
              </button>
            </div>
          </div>

          <textarea
            value={draft.messageBody}
            onChange={(e) => updateDraft({ messageBody: e.target.value })}
            rows={7}
            placeholder="Write message text here... Click tags below to insert recipient variables."
            className="w-full border border-slate-200 rounded-b-xl px-4 py-3 text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366] transition-all resize-none leading-relaxed font-sans"
          />

          {/* Variable Insertion Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">
              Insert Variable:
            </span>
            {["name", "phone", "amount", "campaign", "date"].map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => insertVariable(v)}
                className="text-[11px] font-mono font-bold bg-[#25D366]/10 text-emerald-800 hover:bg-[#25D366]/20 px-2.5 py-1 rounded-lg border border-[#25D366]/30 transition-all cursor-pointer"
              >
                +{`{{${v}}}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Media Attachment */}
      <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Attach Image or Document Media (Optional)
        </p>

        <div className="flex flex-wrap gap-2">
          {(["none", "image", "document"] as const).map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => {
                updateDraft({
                  mediaType: type,
                  mediaUrl: type === "none" ? "" : draft.mediaUrl,
                  mediaFileName: type === "none" ? null : draft.mediaFileName,
                });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all capitalize ${
                draft.mediaType === type
                  ? "border-black bg-black text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {type === "image" && <ImageIcon size={14} />}
              {type === "document" && <FileText size={14} />}
              {type === "none" ? "No Attachment" : type}
            </button>
          ))}
        </div>

        {draft.mediaType !== "none" && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            {uploadingMedia ? (
              <div className="flex items-center gap-2 text-xs font-bold text-[#25D366]">
                <Loader2 size={16} className="animate-spin" />
                Uploading media file...
              </div>
            ) : draft.mediaFileName ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    {draft.mediaType === "image" ? (
                      <ImageIcon size={16} />
                    ) : (
                      <FileText size={16} />
                    )}
                  </div>
                  <p className="text-xs font-bold text-black truncate">
                    {draft.mediaFileName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft({ mediaUrl: "", mediaFileName: null })
                  }
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#25D366] transition-all">
                <span className="text-xs font-bold text-[#25D366]">
                  + Click to choose {draft.mediaType} file
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {draft.mediaType === "image"
                    ? "PNG, JPG, WEBP up to 5MB"
                    : "PDF, DOC, DOCX up to 10MB"}
                </span>
                <input
                  type="file"
                  accept={
                    draft.mediaType === "image"
                      ? "image/*"
                      : ".pdf,.doc,.docx"
                  }
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMediaUpload(file);
                  }}
                />
              </label>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-sm font-bold text-slate-500 hover:text-black transition-colors px-4 py-2.5"
        >
          ← Back to Audience
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={() => setStep(3)}
          className="bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-black/10 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
        >
          Review & Anti-Ban Settings →
        </button>
      </div>

      {/* QR Popup Modal for fast pairing */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <QrCode size={18} className="text-[#25D366]" /> Pair WhatsApp
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            {configData?.baileysLive?.qrCode ? (
              <div className="space-y-3">
                <div className="p-3 bg-white border-2 border-[#25D366] rounded-2xl shadow-inner inline-block">
                  <img
                    src={configData.baileysLive.qrCode}
                    alt="WhatsApp QR Code"
                    className="w-56 h-56 object-contain mx-auto"
                  />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-black">
                    Open WhatsApp &rarr; Linked Devices &rarr; Link a Device
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 space-y-2">
                <Loader2 size={28} className="text-[#25D366] animate-spin mx-auto" />
                <p className="text-xs font-bold text-black">
                  Generating QR Code...
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleReconnectBaileys}
                className="flex items-center gap-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl"
              >
                <RefreshCw size={12} /> Refresh QR
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-xs font-bold bg-black text-white px-5 py-2 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
