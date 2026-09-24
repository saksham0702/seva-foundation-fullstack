"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  QrCode,
  Cloud,
  Search,
  MessageCircle,
  RefreshCw,
  Loader2,
  ShieldCheck,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  whatsappAPI,
  IWhatsAppCampaign,
  IRecipient,
} from "@/app/api/whatsapp";
import { useToast } from "@/lib/toast";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const toast = useToast();
  const [campaign, setCampaign] = useState<IWhatsAppCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(false);

  async function loadCampaign() {
    try {
      const data = await whatsappAPI.getCampaignById(resolvedParams.id);
      setCampaign(data);
    } catch (err) {
      console.error("Failed to load campaign:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaign();

    // Auto refresh while campaign is in progress
    const interval = setInterval(() => {
      if (campaign?.status === "IN_PROGRESS" || campaign?.status === "QUEUED") {
        loadCampaign();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [resolvedParams.id, campaign?.status]);

  async function handleStart() {
    try {
      setActionLoading(true);
      await whatsappAPI.startCampaign(resolvedParams.id);
      toast.success("Broadcast started successfully!");
      await loadCampaign();
    } catch (err: any) {
      toast.error(err.message || "Failed to start campaign");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePause() {
    try {
      setActionLoading(true);
      await whatsappAPI.pauseCampaign(resolvedParams.id);
      toast.info("Broadcast paused");
      await loadCampaign();
    } catch (err: any) {
      toast.error(err.message || "Failed to pause campaign");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleResume() {
    try {
      setActionLoading(true);
      await whatsappAPI.resumeCampaign(resolvedParams.id);
      toast.success("Broadcast resumed");
      await loadCampaign();
    } catch (err: any) {
      toast.error(err.message || "Failed to resume campaign");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRetryFailed() {
    try {
      setActionLoading(true);
      await whatsappAPI.retryFailed(resolvedParams.id);
      await loadCampaign();
      toast.success("Re-queued failed recipients for retry!");
    } catch (err: any) {
      toast.error(err.message || "Failed to retry");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this broadcast campaign?"))
      return;
    try {
      await whatsappAPI.deleteCampaign(resolvedParams.id);
      toast.success("Campaign deleted");
      router.push("/dashboard/marketing/whatsapp");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
        <Loader2 size={24} className="animate-spin text-[#25D366]" />
        Loading campaign details...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-md mx-auto text-center space-y-4 pt-20">
          <AlertCircle size={36} className="text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-black">Campaign Not Found</h2>
          <p className="text-xs text-slate-500">
            This campaign may have been deleted or does not exist.
          </p>
          <Link
            href="/dashboard/marketing/whatsapp"
            className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
          >
            ← Back to WhatsApp Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const total = campaign.stats?.total || campaign.recipients?.length || 1;
  const sent = campaign.stats?.sent || 0;
  const failed = campaign.stats?.failed || 0;
  const pending = Math.max(0, total - (sent + failed));
  const progress = Math.min(100, Math.round(((sent + failed) / total) * 100));

  const [recipientPage, setRecipientPage] = useState(1);
  const recipientLimit = 15;

  const filteredRecipients = (campaign.recipients || []).filter((r) => {
    const matchesSearch =
      r.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.phone?.includes(searchFilter);
    const matchesStatus =
      statusFilter === "ALL" ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRecipientPages = Math.ceil(filteredRecipients.length / recipientLimit) || 1;
  const paginatedRecipients = filteredRecipients.slice(
    (recipientPage - 1) * recipientLimit,
    recipientPage * recipientLimit
  );

  return (
    <div className="min-h-screen bg-white rounded-2xl border border-slate-200 pb-16">
      <div className="w-full px-6 py-8 max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/dashboard/marketing/whatsapp"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-black text-xs font-bold transition-colors"
          >
            <ArrowLeft size={14} /> Back to WhatsApp Marketing
          </Link>
        </div>

        {/* Campaign Header Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-black tracking-tight">
                {campaign.name}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  campaign.status === "COMPLETED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : campaign.status === "IN_PROGRESS"
                    ? "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse"
                    : campaign.status === "PAUSED"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : campaign.status === "FAILED"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {campaign.status}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-black">
                {campaign.provider === "BAILEYS" ? (
                  <>
                    <QrCode size={13} className="text-[#25D366]" /> Baileys Web QR
                  </>
                ) : (
                  <>
                    <Cloud size={13} className="text-blue-600" /> Meta Official API
                  </>
                )}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {campaign.audienceType.replace(/_/g, " ")}
              </span>
              <span>•</span>
              <span>
                Created on{" "}
                {new Date(campaign.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={async () => {
                setRefreshing(true);
                await loadCampaign();
                setRefreshing(false);
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>

            {campaign.status === "PAUSED" && (
              <button
                disabled={actionLoading}
                onClick={handleResume}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <Play size={13} /> Resume Campaign
              </button>
            )}

            {campaign.status === "IN_PROGRESS" && (
              <button
                disabled={actionLoading}
                onClick={handlePause}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <Pause size={13} /> Pause Campaign
              </button>
            )}

            {campaign.status === "QUEUED" && (
              <button
                disabled={actionLoading}
                onClick={handleStart}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <Play size={13} /> Start Queue Now
              </button>
            )}

            {failed > 0 && (
              <button
                disabled={actionLoading}
                onClick={handleRetryFailed}
                className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <RotateCcw size={13} /> Retry Failed ({failed})
              </button>
            )}

            <button
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Delete Campaign"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Live Delivery Progress Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-black">
                Delivery Execution Progress
              </h3>
              <p className="text-xs text-slate-500">
                Processed {sent + failed} of {total} recipients ({progress}%)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-bold">
              <span className="text-emerald-600">✓ {sent} Sent</span>
              <span className="text-red-500">✕ {failed} Failed</span>
              <span className="text-slate-500">⏳ {pending} Pending</span>
            </div>
          </div>

          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#25D366] transition-all"
              style={{ width: `${(sent / total) * 100}%` }}
            />
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${(failed / total) * 100}%` }}
            />
          </div>

          {/* Anti-Ban & Cooldown Status */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#25D366]" />
              <span>
                Anti-Ban Engine: Random interval ({campaign.antiBanConfig?.minDelaySeconds || 3}s – {campaign.antiBanConfig?.maxDelaySeconds || 20}s) with batch pauses every {campaign.antiBanConfig?.batchSize || 50} messages
              </span>
            </div>
            {campaign.status === "IN_PROGRESS" && (
              <span className="text-blue-600 font-bold flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Dispatching in background...
              </span>
            )}
          </div>
        </div>

        {/* Two-Column Grid: Message Content & Recipient Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Message Bubble Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 lg:col-span-1">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Broadcast Message
            </h3>
            <div className="bg-[#ECE5DD] p-4 rounded-xl border border-slate-300">
              <div className="bg-white p-3.5 rounded-xl rounded-tl-none shadow-sm space-y-2">
                {campaign.mediaUrl && (
                  <div className="w-full rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={campaign.mediaUrl}
                      alt="Campaign attachment"
                      className="w-full max-h-48 object-cover"
                    />
                  </div>
                )}
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {campaign.messageBody}
                </p>
                <div className="text-right text-[9px] text-slate-400">
                  Broadcast ✓✓
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {["ALL", "SENT", "FAILED", "PENDING"].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setRecipientPage(1);
                    }}
                    className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all ${
                      statusFilter === st
                        ? "bg-black text-white border-black"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-56">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search recipient phone / name..."
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value);
                    setRecipientPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-[#25D366]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Recipient</th>
                    <th className="px-5 py-3">Phone Number</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Delivery Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRecipients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No recipients match this filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecipients.map((r: IRecipient, idx: number) => {
                      const absoluteIndex =
                        (recipientPage - 1) * recipientLimit + idx + 1;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">
                            {absoluteIndex}
                          </td>
                          <td className="px-5 py-3 font-bold text-black">
                            {r.name || "Supporter"}
                          </td>
                          <td className="px-5 py-3 font-mono text-slate-700">
                            +{r.phone}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                r.status === "SENT"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : r.status === "FAILED"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {r.status === "SENT" && <CheckCheck size={11} />}
                              {r.status === "FAILED" && <AlertCircle size={11} />}
                              {r.status === "PENDING" && <Clock size={11} />}
                              {r.status}
                            </span>
                            {r.errorReason && (
                              <p className="text-[10px] text-red-500 mt-0.5 max-w-xs truncate">
                                {r.errorReason}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-3 text-slate-400 text-[11px]">
                            {r.sentAt
                              ? new Date(r.sentAt).toLocaleTimeString("en-IN")
                              : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Recipient Logs Pagination Footer */}
            {filteredRecipients.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <p>
                  Showing {(recipientPage - 1) * recipientLimit + 1} to{" "}
                  {Math.min(
                    recipientPage * recipientLimit,
                    filteredRecipients.length
                  )}{" "}
                  of <strong>{filteredRecipients.length}</strong> recipients
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={recipientPage <= 1}
                    onClick={() => setRecipientPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="font-bold text-black px-2">
                    Page {recipientPage} of {totalRecipientPages}
                  </span>
                  <button
                    disabled={recipientPage >= totalRecipientPages}
                    onClick={() =>
                      setRecipientPage((p) =>
                        Math.min(totalRecipientPages, p + 1)
                      )
                    }
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

