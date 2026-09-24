"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  X,
  FileSpreadsheet,
  Download,
  Users,
  Heart,
  Repeat,
  AlertTriangle,
  UserCheck,
  Compass,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useWA, WAAudienceType } from "../../WaProvider";
import { whatsappAPI, IAudienceCounts } from "@/app/api/whatsapp";
import { useToast } from "@/lib/toast";

export function StepWAAudience() {
  const { draft, updateDraft, setStep } = useWA();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [parsingFile, setParsingFile] = useState(false);
  const [counts, setCounts] = useState<IAudienceCounts>({
    ALL_DONORS: 0,
    PAID_DONORS: 0,
    RECURRING_DONORS: 0,
    FAILED_PAYMENT_DONORS: 0,
    VOLUNTEERS: 0,
    LEADS: 0,
  });

  useEffect(() => {
    async function loadCounts() {
      try {
        setLoadingCounts(true);
        const data = await whatsappAPI.getAudienceCounts();
        setCounts(data);

        // Update estimated count for initial draft
        if (draft.audienceType !== "CUSTOM_FILE") {
          updateDraft({
            estimatedRecipientCount: (data as any)[draft.audienceType] || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load audience counts:", err);
      } finally {
        setLoadingCounts(false);
      }
    }
    loadCounts();
  }, []);

  async function handleFile(file: File) {
    try {
      setParsingFile(true);
      const res = await whatsappAPI.uploadExcelFile(file);
      updateDraft({
        audienceType: "CUSTOM_FILE",
        importFileName: file.name,
        customRecipients: res.validRecipients,
        estimatedRecipientCount: res.validRecipients.length,
      });
      toast.success(`Successfully loaded ${res.validRecipients.length} recipients from ${file.name}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to parse file");
    } finally {
      setParsingFile(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const audienceCards: Array<{
    type: WAAudienceType;
    title: string;
    description: string;
    icon: any;
    countKey: keyof IAudienceCounts;
    badgeColor: string;
  }> = [
    {
      type: "ALL_DONORS",
      title: "All Donors",
      description: "Every registered donor in the database with a phone number",
      icon: Users,
      countKey: "ALL_DONORS",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      type: "PAID_DONORS",
      title: "Successful Paid Donors",
      description: "Donors who have completed at least one verified payment",
      icon: Heart,
      countKey: "PAID_DONORS",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      type: "RECURRING_DONORS",
      title: "Monthly Recurring Donors",
      description: "Subscribed monthly contributors supporting ongoing initiatives",
      icon: Repeat,
      countKey: "RECURRING_DONORS",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      type: "FAILED_PAYMENT_DONORS",
      title: "Incomplete / Failed Donors",
      description: "Donors whose transaction was interrupted or failed (recovery appeal)",
      icon: AlertTriangle,
      countKey: "FAILED_PAYMENT_DONORS",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      type: "VOLUNTEERS",
      title: "Volunteers & Applicants",
      description: "Active community volunteers and registered applicants",
      icon: UserCheck,
      countKey: "VOLUNTEERS",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    },
    {
      type: "LEADS",
      title: "Inquiries & Newsletter Leads",
      description: "Website subscribers, contact form leads, and prospective supporters",
      icon: Compass,
      countKey: "LEADS",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
  ];

  const isCustom = draft.audienceType === "CUSTOM_FILE";
  const canProceed =
    draft.name.trim().length > 0 &&
    (isCustom
      ? draft.customRecipients.length > 0
      : (counts[draft.audienceType as keyof IAudienceCounts] || 0) > 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Campaign Basic Info */}
      <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Broadcast Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => updateDraft({ name: e.target.value })}
            placeholder="e.g. Kerala Flood Relief Urgent Appeal"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Internal Note / Description (Optional)
          </label>
          <input
            type="text"
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
            placeholder="e.g. Target paid donors from last 6 months"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
          />
        </div>
      </div>

      {/* Choose Audience Mode */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-black tracking-tight">
              Select Target Audience Segment
            </h2>
            <p className="text-xs text-slate-500">
              Pick a dynamic database segment or upload an Excel / CSV contact sheet.
            </p>
          </div>
          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                updateDraft({
                  audienceType: "ALL_DONORS",
                  estimatedRecipientCount: counts.ALL_DONORS,
                });
              }}
              className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-all ${
                !isCustom
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-500 hover:text-black"
              }`}
            >
              Database Segments
            </button>
            <button
              onClick={() => {
                updateDraft({
                  audienceType: "CUSTOM_FILE",
                  estimatedRecipientCount: draft.customRecipients.length,
                });
              }}
              className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-all ${
                isCustom
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-500 hover:text-black"
              }`}
            >
              Upload Excel / CSV
            </button>
          </div>
        </div>

        {/* Database Segment Grid */}
        {!isCustom ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {audienceCards.map((card) => {
              const isSelected = draft.audienceType === card.type;
              const count = counts[card.countKey] || 0;
              const Icon = card.icon;

              return (
                <div
                  key={card.type}
                  onClick={() =>
                    updateDraft({
                      audienceType: card.type,
                      estimatedRecipientCount: count,
                    })
                  }
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-[#25D366] bg-[#25D366]/[0.03] shadow-sm ring-1 ring-[#25D366]/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? "bg-[#25D366] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-black leading-tight">
                          {card.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {card.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-[#25D366] bg-[#25D366]"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Total Active Numbers
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}
                    >
                      {loadingCounts ? (
                        <Loader2 size={12} className="animate-spin inline" />
                      ) : (
                        `${count.toLocaleString()} recipients`
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Custom Excel / CSV Upload Area */
          <div className="flex flex-col gap-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragOver
                  ? "border-[#25D366] bg-green-50/50"
                  : "border-slate-300 hover:border-[#25D366] hover:bg-slate-50/50"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />

              {parsingFile ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Loader2 size={28} className="text-[#25D366] animate-spin" />
                  <p className="text-xs font-bold text-black">
                    Validating phone numbers and parsing spreadsheet...
                  </p>
                </div>
              ) : draft.importFileName ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <FileSpreadsheet size={24} className="text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-black">
                      {draft.importFileName}
                    </p>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                      ✓ {draft.customRecipients.length.toLocaleString()} valid contacts ready
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-500 hover:text-black">
                      Click to upload a different file
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft({
                          importFileName: null,
                          customRecipients: [],
                          estimatedRecipientCount: 0,
                        });
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-700"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center py-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">
                      Drag & Drop your Excel (.xlsx, .xls) or CSV file
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      File must contain column with Phone / Mobile and optional Name column
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-[#25D366] text-white px-4 py-2 rounded-xl shadow-sm">
                    Browse Computer
                  </span>
                </div>
              )}
            </div>

            {/* Download Sample Template & Instructions */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Need the Excel Format? (Name & Mobile Number only)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Spreadsheet only requires <strong className="text-slate-700">Name</strong> and <strong className="text-slate-700">Mobile Number</strong>. Country code (<strong className="text-slate-700">+91</strong>) is automatically formatted if you enter 10 digits or with +91.
                </p>
              </div>
              <a
                href={whatsappAPI.getSampleExcelUrl()}
                download="sample_broadcast_contacts.xlsx"
                className="flex items-center gap-2 bg-white hover:bg-slate-100 text-black border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shrink-0 shadow-sm"
              >
                <Download size={14} />
                Download Sample Excel
              </a>
            </div>

            {/* Contact Preview Table (first 5) */}
            {draft.customRecipients.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-black">
                    Parsed Contacts Preview ({draft.customRecipients.length})
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Ready to Send
                  </span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Phone Number</th>
                      <th className="px-4 py-2">Variables</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {draft.customRecipients.slice(0, 5).map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2 text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 font-semibold text-black">
                          {r.name}
                        </td>
                        <td className="px-4 py-2 font-mono text-slate-700">
                          +{r.phone}
                        </td>
                        <td className="px-4 py-2 text-slate-500 font-mono text-[10px]">
                          {Object.keys(r.variables || {}).length > 0
                            ? JSON.stringify(r.variables)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div>
          {draft.name && (
            <p className="text-xs font-semibold text-slate-500">
              Selected:{" "}
              <strong className="text-black">
                {draft.estimatedRecipientCount.toLocaleString()}
              </strong>{" "}
              recipients
            </p>
          )}
        </div>
        <button
          disabled={!canProceed}
          onClick={() => setStep(2)}
          className="bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-black/10 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
        >
          Continue to Message Composer →
        </button>
      </div>
    </div>
  );
}
