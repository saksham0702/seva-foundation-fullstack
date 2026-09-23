"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  PhoneCall,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Phone,
  Search,
  ExternalLink,
  ChevronRight,
  Loader2,
  CalendarDays,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  getLeads,
  getLeadStats,
  addFollowUpLog,
  getFollowUpConfigs,
  Lead,
  LeadStats,
  FollowUpConfig,
  FollowUpChannel,
} from "@/app/api/leads";
import { Portal } from "@/components/shared/Portal";

const FOLLOWUP_TABS = [
  { key: "due_today", label: "Due Today", icon: PhoneCall },
  { key: "overdue", label: "Overdue", icon: AlertCircle },
  { key: "upcoming", label: "Upcoming", icon: CalendarDays },
  { key: "all", label: "All Scheduled", icon: Clock },
] as const;

function FollowupTasksInner() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "due_today";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [configs, setConfigs] = useState<FollowUpConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Quick follow-up modal
  const [activeLeadForLog, setActiveLeadForLog] = useState<Lead | null>(null);
  const [channel, setChannel] = useState<FollowUpChannel>("CALL");
  const [disposition, setDisposition] = useState("");
  const [notes, setNotes] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const confs = await getFollowUpConfigs();
        setConfigs(confs);
        if (confs.length > 0) setDisposition(confs[0].name);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getLeadStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const query: any = { limit: 100 };
      if (search.trim()) query.search = search.trim();
      if (activeTab !== "all") query.followUpStatus = activeTab;
      else query.followUpStatus = "upcoming"; // or query all with follow-up scheduled

      const res = await getLeads(query);
      setLeads(res.leads);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchLeads();
    }, 200);
    return () => clearTimeout(t);
  }, [fetchLeads]);

  const handleOpenLogModal = (lead: Lead) => {
    setActiveLeadForLog(lead);
    setNotes("");
    setNextDate("");
    if (configs.length > 0) setDisposition(configs[0].name);
  };

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLeadForLog) return;
    setSaving(true);
    try {
      await addFollowUpLog(activeLeadForLog._id, {
        channel,
        disposition,
        notes: notes.trim(),
        nextFollowUpDate: nextDate || undefined,
      });
      setActiveLeadForLog(null);
      fetchLeads();
      fetchStats();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to log follow-up");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
              Task Execution
            </span>
            <span className="text-xs text-muted">
              Scheduled calls & donor follow-ups
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-display">
            Follow-up Pipeline & Tasks
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage your daily calling roster, contact unpaid donors, and record communication outcomes.
          </p>
        </div>

        <Link
          href="/dashboard/leads/all"
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-panel border border-border text-text-primary hover:border-[#E8542A] transition-colors self-start sm:self-auto shadow-sm"
        >
          <span>View All Leads Pipeline</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── Tabs (Due Today, Overdue, Upcoming, All) ────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FOLLOWUP_TABS.map((tab) => {
          const active = activeTab === tab.key;
          let count = 0;
          if (stats) {
            if (tab.key === "due_today") count = stats.followUpsDueToday;
            if (tab.key === "overdue") count = stats.followUpsOverdue;
          }

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                active
                  ? "bg-panel border-[#E8542A] shadow-md shadow-orange-500/10"
                  : "bg-panel/70 border-border hover:border-border/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <tab.icon
                  size={18}
                  className={active ? "text-[#E8542A]" : "text-muted"}
                />
                {count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tab.key === "overdue"
                        ? "bg-rose-500/10 text-rose-600"
                        : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-text-primary">{tab.label}</p>
              <p className="text-[11px] text-muted mt-0.5">
                {tab.key === "due_today"
                  ? "Scheduled for today"
                  : tab.key === "overdue"
                  ? "Past scheduled date"
                  : tab.key === "upcoming"
                  ? "Future appointments"
                  : "All scheduled tasks"}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Search Bar ──────────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter follow-up tasks by name or phone…"
          className="w-full pl-9 pr-3 py-2 bg-panel border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
        />
      </div>

      {/* ── Follow-up Tasks Grid / Cards ────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
          <Loader2 className="animate-spin text-[#E8542A]" size={28} />
          <p className="text-xs">Loading follow-up tasks…</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 px-4 bg-panel border border-border rounded-2xl">
          <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
          <h3 className="text-sm font-bold text-text-primary">
            No pending tasks in this view
          </h3>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            You have no pending follow-up calls or reminders under this tab. Great job staying on top of your donors!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => {
            const phoneDigits = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "";
            const isOverdue =
              lead.nextFollowUpDate &&
              new Date(lead.nextFollowUpDate) < new Date();

            return (
              <div
                key={lead._id}
                className="bg-panel border border-border rounded-2xl p-5 shadow-sm hover:border-[#E8542A]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOverdue
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}
                    >
                      {lead.nextFollowUpDate
                        ? new Date(lead.nextFollowUpDate).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unscheduled"}
                    </span>

                    {lead.amount ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                        ₹{lead.amount.toLocaleString("en-IN")}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="font-bold text-sm text-text-primary">
                    {lead.name}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">{lead.email}</p>
                  {lead.phone && (
                    <p className="text-xs font-mono text-text-primary mt-1">
                      {lead.phone}
                    </p>
                  )}

                  {lead.campaign?.name && (
                    <p className="text-[11px] font-medium text-[#E8542A] truncate mt-2">
                      Campaign: {lead.campaign.name}
                    </p>
                  )}

                  {/* Latest Activity Notes */}
                  {lead.latestFollowUp && (
                    <div className="mt-3 p-2.5 rounded-xl bg-background/80 border border-border text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="font-bold text-text-primary">
                          {lead.latestFollowUp.disposition}
                        </span>
                        <span className="text-muted">
                          {lead.latestFollowUp.channel}
                        </span>
                      </div>
                      {lead.latestFollowUp.notes && (
                        <p className="text-muted text-[11px] italic line-clamp-2">
                          &ldquo;{lead.latestFollowUp.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                  {lead.phone && (
                    <>
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <Phone size={13} />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                          `Namaste ${lead.name}, this is from Seva Foundation regarding your donation.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </a>
                    </>
                  )}
                  <button
                    onClick={() => handleOpenLogModal(lead)}
                    className="px-3 py-2 rounded-xl bg-panel border border-border text-text-primary hover:border-[#E8542A] text-xs font-bold transition-colors"
                  >
                    Log Result
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Log Result Modal ────────────────────────────────────────── */}
      {activeLeadForLog && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setActiveLeadForLog(null)}
            />
            <div className="relative w-full max-w-md bg-background border border-border rounded-2xl p-6 shadow-2xl z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    Record Call Outcome
                  </h3>
                  <p className="text-xs text-muted">
                    {activeLeadForLog.name} ({activeLeadForLog.phone || activeLeadForLog.email})
                  </p>
                </div>
                <button
                  onClick={() => setActiveLeadForLog(null)}
                  className="p-1 rounded-lg text-muted hover:text-text-primary"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitLog} className="space-y-3.5">
                {/* Channel */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Channel
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["CALL", "WHATSAPP", "EMAIL", "NOTE"] as FollowUpChannel[]).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setChannel(ch)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          channel === ch
                            ? "bg-[#E8542A] text-white"
                            : "bg-panel border border-border text-muted"
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Disposition */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Outcome / Disposition <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={disposition}
                    onChange={(e) => setDisposition(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-panel border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                  >
                    {configs.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Notes */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Discussion Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Donor confirmed will donate ₹1,000 this weekend. Re-sent payment link."
                    rows={2}
                    className="w-full p-2.5 bg-panel border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 resize-none"
                  />
                </div>

                {/* Next Date */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Reschedule Next Call Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full px-3 py-2 bg-panel border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveLeadForLog(null)}
                    className="px-4 py-2 text-xs font-semibold text-muted hover:bg-panel rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#E8542A] hover:bg-[#c9431d] text-white shadow-md shadow-orange-500/20"
                  >
                    {saving ? "Saving…" : "Save Follow-up"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

export default function FollowupTasksPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted">
          <div className="w-8 h-8 border-2 border-[#E8542A] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading follow-up tasks…</span>
        </div>
      </div>
    }>
      <FollowupTasksInner />
    </Suspense>
  );
}
