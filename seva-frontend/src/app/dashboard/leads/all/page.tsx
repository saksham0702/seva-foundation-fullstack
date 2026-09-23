"use client";

import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  ChevronRight,
  X,
  Loader2,
  Download,
  Filter,
  Calendar,
  MessageSquare,
  PhoneCall,
  SlidersHorizontal,
  Flame,
  Check,
  Edit2,
  Copy,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Portal } from "@/components/shared/Portal";
import {
  getLeads,
  getLeadStats,
  createLead,
  updateLead,
  deleteLead,
  addFollowUpLog,
  getFollowUpConfigs,
  Lead,
  LeadStats,
  LeadSource,
  LeadStatus,
  FollowUpConfig,
  FollowUpChannel,
} from "@/app/api/leads";
import { getCampaigns, type Campaign } from "@/app/api/campaign";

const DONOR_TABS = [
  { key: "all", label: "All Leads" },
  { key: "unpaid", label: "Unpaid Donors (Pending)" },
  { key: "failed", label: "Payment Failed" },
  { key: "paid", label: "Paid Donors" },
  { key: "subscriber", label: "Subscribers" },
  { key: "inquiry", label: "Inquiries" },
] as const;

const DATE_PRESETS = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last_7_days", label: "Last 7 Days" },
  { key: "this_month", label: "This Month" },
  { key: "custom", label: "Custom Range" },
] as const;

function AllLeadsInner() {
  const searchParams = useSearchParams();
  const initialLeadId = searchParams.get("id");
  const tabFromQuery = searchParams.get("tab") || "all";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [configs, setConfigs] = useState<FollowUpConfig[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);

  // Filters state
  const [activeDonorTab, setActiveDonorTab] = useState<string>(tabFromQuery);
  const [datePreset, setDatePreset] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [campaignFilter, setCampaignFilter] = useState<string>("ALL");
  const [followUpFilter, setFollowUpFilter] = useState<string>("all");

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selection / Modal state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Follow-up logging state inside drawer
  const [followUpChannel, setFollowUpChannel] = useState<FollowUpChannel>("CALL");
  const [followUpDisposition, setFollowUpDisposition] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpNextDate, setFollowUpNextDate] = useState("");
  const [loggingFollowUp, setLoggingFollowUp] = useState(false);

  // Quick edit notes state
  const [directNotes, setDirectNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // New Lead modal state
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadSource, setNewLeadSource] = useState<LeadSource>("MANUAL");
  const [newLeadAmount, setNewLeadAmount] = useState<number | "">("");
  const [newLeadCampaign, setNewLeadCampaign] = useState("");
  const [newLeadNotes, setNewLeadNotes] = useState("");
  const [creating, setCreating] = useState(false);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync tab query if URL changes
  useEffect(() => {
    if (tabFromQuery) {
      setActiveDonorTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  // Load configs and campaigns once
  useEffect(() => {
    (async () => {
      try {
        const [confList, campList] = await Promise.all([
          getFollowUpConfigs(),
          getCampaigns(),
        ]);
        setConfigs(confList);
        setCampaigns(campList);
        if (confList.length > 0) {
          setFollowUpDisposition(confList[0].name);
        }
      } catch (e) {
        console.error("Failed to load initial configs/campaigns:", e);
      }
    })();
  }, []);

  // Compute date range based on preset
  const computedDateRange = useMemo(() => {
    if (datePreset === "all") return {};
    const now = new Date();

    if (datePreset === "today") {
      const d = now.toISOString().split("T")[0];
      return { startDate: d, endDate: d };
    }

    if (datePreset === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const d = y.toISOString().split("T")[0];
      return { startDate: d, endDate: d };
    }

    if (datePreset === "last_7_days") {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      return {
        startDate: past.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
      };
    }

    if (datePreset === "this_month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      return {
        startDate: firstDay,
        endDate: now.toISOString().split("T")[0],
      };
    }

    if (datePreset === "custom") {
      return {
        startDate: customStartDate || undefined,
        endDate: customEndDate || undefined,
      };
    }

    return {};
  }, [datePreset, customStartDate, customEndDate]);

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
      if (activeDonorTab !== "all") query.donorType = activeDonorTab;
      if (statusFilter !== "ALL") query.status = statusFilter;
      if (campaignFilter !== "ALL") query.campaign = campaignFilter;
      if (followUpFilter !== "all") query.followUpStatus = followUpFilter;

      if (computedDateRange.startDate) query.startDate = computedDateRange.startDate;
      if (computedDateRange.endDate) query.endDate = computedDateRange.endDate;

      const res = await getLeads(query);
      setLeads(res.leads);
      setTotalLeads(res.total);

      if (initialLeadId) {
        const found = res.leads.find((l) => l._id === initialLeadId);
        if (found) {
          setSelectedLead(found);
          setDirectNotes(found.notes || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    activeDonorTab,
    statusFilter,
    campaignFilter,
    followUpFilter,
    computedDateRange,
    initialLeadId,
  ]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLeads();
    }, 200);
    return () => clearTimeout(timeout);
  }, [fetchLeads]);

  useEffect(() => {
    if (selectedLead) {
      setDirectNotes(selectedLead.notes || "");
      if (configs.length > 0 && !followUpDisposition) {
        setFollowUpDisposition(configs[0].name);
      }
    }
  }, [selectedLead, configs, followUpDisposition]);

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDirectNotes(lead.notes || "");
    setFollowUpNotes("");
    setFollowUpNextDate("");
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetFilters = () => {
    setActiveDonorTab("all");
    setDatePreset("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setSearch("");
    setStatusFilter("ALL");
    setCampaignFilter("ALL");
    setFollowUpFilter("all");
  };

  const hasActiveFilters =
    activeDonorTab !== "all" ||
    datePreset !== "all" ||
    search !== "" ||
    statusFilter !== "ALL" ||
    campaignFilter !== "ALL" ||
    followUpFilter !== "all";

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const updated = await updateLead(leadId, { status: newStatus });
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
      );
      if (selectedLead?._id === leadId) {
        setSelectedLead(updated);
      }
      showNotification(`Lead moved to ${newStatus}`);
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    if (!followUpDisposition) {
      showNotification("Please select a follow-up disposition.", "error");
      return;
    }

    setLoggingFollowUp(true);
    try {
      const updated = await addFollowUpLog(selectedLead._id, {
        channel: followUpChannel,
        disposition: followUpDisposition,
        notes: followUpNotes.trim(),
        nextFollowUpDate: followUpNextDate || undefined,
      });

      setSelectedLead(updated);
      setDirectNotes(updated.notes || "");
      setLeads((prev) =>
        prev.map((l) => (l._id === updated._id ? updated : l))
      );
      setFollowUpNotes("");
      setFollowUpNextDate("");
      showNotification("Follow-up logged successfully!");
      fetchStats();
    } catch (err: any) {
      showNotification(err?.response?.data?.message || "Failed to log follow-up", "error");
    } finally {
      setLoggingFollowUp(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setSavingNotes(true);
    try {
      const updated = await updateLead(selectedLead._id, { notes: directNotes });
      setSelectedLead(updated);
      setLeads((prev) =>
        prev.map((l) => (l._id === selectedLead._id ? updated : l))
      );
      showNotification("Notes saved successfully!");
    } catch (e) {
      showNotification("Failed to save notes", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to remove this lead?")) return;
    try {
      await deleteLead(leadId);
      setLeads((prev) => prev.filter((l) => l._id !== leadId));
      if (selectedLead?._id === leadId) setSelectedLead(null);
      showNotification("Lead removed from system.");
      fetchStats();
    } catch (e) {
      showNotification("Failed to delete lead", "error");
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadEmail.trim() && !newLeadPhone.trim()) {
      showNotification("Please provide at least an email or phone number.", "error");
      return;
    }
    setCreating(true);
    try {
      await createLead({
        name: newLeadName.trim() || "Prospective Donor",
        email: newLeadEmail.trim().toLowerCase(),
        phone: newLeadPhone.trim(),
        source: newLeadSource,
        amount: newLeadAmount === "" ? 0 : Number(newLeadAmount),
        campaign: newLeadCampaign ? (newLeadCampaign as any) : undefined,
        notes: newLeadNotes.trim(),
        status: "NEW",
        paymentStatus:
          newLeadSource === "DONOR_DROP"
            ? "PENDING"
            : newLeadSource === "PAYMENT_FAILED"
            ? "FAILED"
            : "NOT_APPLICABLE",
      });
      setShowAddModal(false);
      setNewLeadName("");
      setNewLeadEmail("");
      setNewLeadPhone("");
      setNewLeadAmount("");
      setNewLeadCampaign("");
      setNewLeadNotes("");
      showNotification("New lead added successfully!");
      fetchLeads();
      fetchStats();
    } catch (e: any) {
      showNotification(e?.response?.data?.message || "Failed to create lead", "error");
    } finally {
      setCreating(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Source",
      "Payment Status",
      "Status",
      "Amount",
      "Campaign",
      "Latest Disposition",
      "Next Follow-up",
      "Created Date",
    ];
    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone || ""}"`,
      `"${l.source}"`,
      `"${l.paymentStatus || ""}"`,
      `"${l.status}"`,
      `"${l.amount || 0}"`,
      `"${l.campaign?.name ? l.campaign.name.replace(/"/g, '""') : ""}"`,
      `"${l.latestFollowUp?.disposition || ""}"`,
      `"${l.nextFollowUpDate ? new Date(l.nextFollowUpDate).toLocaleDateString() : ""}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Seva_Leads_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── Toast Notification ──────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20"
              : "bg-rose-600 text-white border-rose-700 shadow-rose-500/20"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8542A]/10 text-[#E8542A]">
              Donor & Lead Pipeline
            </span>
            <span className="text-xs text-muted">
              {totalLeads} total records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-display">
            All Leads & Follow-ups
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Filter by donor status (Paid, Unpaid Pending, Failed), log custom notes, and manage calls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-panel border border-border text-muted hover:text-text-primary hover:bg-panel/80 transition-colors shadow-sm"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#E8542A] hover:bg-[#c9431d] text-white shadow-md shadow-orange-500/20 transition-all"
          >
            <Plus size={15} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* ── Donor Status Tabs ───────────────────────────────────────── */}
      <div className="flex border-b border-border gap-1 overflow-x-auto scrollbar-none pb-1">
        {DONOR_TABS.map((tab) => {
          const active = activeDonorTab === tab.key;
          let countBadge = null;
          if (stats) {
            if (tab.key === "unpaid") countBadge = stats.unpaidDonors;
            else if (tab.key === "failed") countBadge = stats.paymentFailed;
            else if (tab.key === "paid") countBadge = stats.converted;
            else if (tab.key === "subscriber") countBadge = stats.subscribers;
            else if (tab.key === "all") countBadge = stats.total;
          }

          return (
            <button
              key={tab.key}
              onClick={() => setActiveDonorTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? "bg-[#E8542A] text-white shadow-sm"
                  : "text-muted hover:text-text-primary hover:bg-panel"
              }`}
            >
              <span>{tab.label}</span>
              {countBadge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-panel border border-border text-muted"
                  }`}
                >
                  {countBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Filter Controls (Date Preset, Campaign, Status, Search) ──── */}
      <div className="bg-panel border border-border rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone…"
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 focus:border-[#E8542A]"
            />
          </div>

          {/* Date Filter Preset */}
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-muted shrink-0 ml-1" />
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
            >
              {DATE_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>
                  Date: {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Filter */}
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
          >
            <option value="ALL">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Follow-up State Filter */}
          <select
            value={followUpFilter}
            onChange={(e) => setFollowUpFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
          >
            <option value="all">Follow-up: All</option>
            <option value="due_today">Follow-up Due Today</option>
            <option value="overdue">Overdue Follow-up</option>
            <option value="upcoming">Upcoming Follow-up</option>
            <option value="none">No Follow-up Scheduled</option>
          </select>
        </div>

        {/* Custom Date Range Row */}
        {datePreset === "custom" && (
          <div className="flex items-center gap-3 pt-2 border-t border-border/60 text-xs">
            <span className="text-muted font-medium">Select Range:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-text-primary"
            />
            <span className="text-muted">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs text-text-primary"
            />
            {(customStartDate || customEndDate) && (
              <button
                onClick={() => {
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                className="text-[11px] text-muted hover:text-[#E8542A] underline"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Reset Filter Button if active */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
            <span className="text-muted text-[11px]">
              Active filters applied. Showing {leads.length} matches.
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[11px] font-bold text-[#E8542A] hover:underline"
            >
              <RotateCcw size={12} />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Leads Table ─────────────────────────────────────────────── */}
      <div className="bg-panel border border-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
            <Loader2 className="animate-spin text-[#E8542A]" size={28} />
            <p className="text-xs">Loading leads & pipeline…</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20 px-4">
            <Users size={38} className="mx-auto text-muted/60 mb-2" />
            <h3 className="text-sm font-bold text-text-primary">No leads found</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              No records match your selected filters. Try choosing a different date range or category tab.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-3 px-3 py-1.5 rounded-xl bg-panel border border-border text-xs font-semibold text-[#E8542A] hover:bg-panel/80"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-panel/80 text-muted uppercase text-[10.5px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Lead / Donor</th>
                  <th className="py-3 px-3">Contact Details</th>
                  <th className="py-3 px-3">Source & Category</th>
                  <th className="py-3 px-3">Payment State</th>
                  <th className="py-3 px-3">Campaign / Intended</th>
                  <th className="py-3 px-3">Latest Follow-up</th>
                  <th className="py-3 px-3">Next Call</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {leads.map((lead) => {
                  const isSelected = selectedLead?._id === lead._id;
                  const phoneDigits = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "";

                  return (
                    <tr
                      key={lead._id}
                      onClick={() => handleOpenLead(lead)}
                      className={`hover:bg-panel/70 cursor-pointer transition-colors ${
                        isSelected ? "bg-orange-500/5 border-l-2 border-l-[#E8542A]" : ""
                      }`}
                    >
                      {/* Name & Initials */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-xs font-bold text-text-primary shrink-0 uppercase">
                            {lead.name.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-text-primary truncate max-w-[130px]">
                              {lead.name}
                            </p>
                            <span className="text-[10px] text-muted">
                              {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact & 1-click WhatsApp / Call */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 group/item">
                            <span className="truncate max-w-[140px] text-text-primary font-medium">
                              {lead.email}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(lead.email, `mail-${lead._id}`);
                              }}
                              className="text-muted hover:text-text-primary opacity-0 group-hover/item:opacity-100 transition-opacity"
                              title="Copy email"
                            >
                              {copiedId === `mail-${lead._id}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                            </button>
                          </div>

                          {lead.phone ? (
                            <div className="flex items-center gap-1.5 mt-0.5" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[11px] text-muted font-mono">{lead.phone}</span>
                              <a
                                href={`tel:${lead.phone}`}
                                title="Call now"
                                className="p-1 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                              >
                                <Phone size={11} />
                              </a>
                              <a
                                href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                                  `Namaste ${lead.name}, thank you for your support with Seva Foundation.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Chat on WhatsApp"
                                className="p-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                              >
                                <MessageSquare size={11} />
                              </a>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted italic">No phone</span>
                          )}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3">
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-panel border border-border text-text-primary">
                          {lead.source === "DONOR_DROP"
                            ? "Campaign Drop-off"
                            : lead.source === "PAYMENT_FAILED"
                            ? "Failed Checkout"
                            : lead.source === "SUBSCRIBER"
                            ? "Newsletter"
                            : lead.source}
                        </span>
                      </td>

                      {/* Payment State */}
                      <td className="py-3 px-3">
                        {lead.paymentStatus === "PAID" || lead.status === "CONVERTED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} />
                            Paid Donor
                          </span>
                        ) : lead.paymentStatus === "FAILED" || lead.source === "PAYMENT_FAILED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={12} />
                            Payment Failed
                          </span>
                        ) : lead.paymentStatus === "PENDING" || lead.source === "DONOR_DROP" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                            <Clock size={12} />
                            Unpaid Pending
                          </span>
                        ) : (
                          <span className="text-[10.5px] text-muted">
                            {lead.status}
                          </span>
                        )}
                      </td>

                      {/* Campaign & Amount */}
                      <td className="py-3 px-3">
                        <p className="font-semibold text-text-primary truncate max-w-[130px]">
                          {lead.campaign?.name || "General Cause"}
                        </p>
                        {lead.amount ? (
                          <p className="text-[11px] font-bold text-emerald-600">
                            ₹{lead.amount.toLocaleString("en-IN")}
                          </p>
                        ) : (
                          <span className="text-[10px] text-muted">—</span>
                        )}
                      </td>

                      {/* Latest Follow-up */}
                      <td className="py-3 px-3">
                        {lead.latestFollowUp ? (
                          <div className="max-w-[130px]">
                            <span className="text-[10.5px] font-bold text-text-primary block truncate">
                              {lead.latestFollowUp.disposition}
                            </span>
                            <span className="text-[10px] text-muted">
                              {lead.latestFollowUp.channel} ·{" "}
                              {new Date(lead.latestFollowUp.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted italic">No calls yet</span>
                        )}
                      </td>

                      {/* Next Call Date */}
                      <td className="py-3 px-3">
                        {lead.nextFollowUpDate ? (
                          <span className="text-[10.5px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md whitespace-nowrap">
                            {new Date(lead.nextFollowUpDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenLead(lead)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-panel border border-border text-text-primary hover:border-[#E8542A] transition-colors"
                          >
                            Follow up
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            className="p-1 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Slide-Over Detail & Follow-up Drawer ─────────────────────── */}
      {selectedLead && (
        <Portal>
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedLead(null)}
            />

            <div className="relative w-full max-w-xl bg-background border-l border-border h-full overflow-y-auto shadow-2xl z-10 flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-6 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#E8542A]/10 text-[#E8542A]">
                        {selectedLead.source === "DONOR_DROP"
                          ? "Unpaid Donor"
                          : selectedLead.source}
                      </span>
                      {selectedLead.paymentStatus && (
                        <span
                          className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                            selectedLead.paymentStatus === "PAID"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : selectedLead.paymentStatus === "FAILED"
                              ? "bg-rose-500/10 text-rose-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {selectedLead.paymentStatus}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">
                      {selectedLead.name}
                    </h2>
                    <p className="text-xs text-muted mt-0.5">
                      Captured on {new Date(selectedLead.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-2 rounded-xl text-muted hover:text-text-primary hover:bg-panel transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Direct Action Call / WhatsApp Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  {selectedLead.phone && (
                    <>
                      <a
                        href={`tel:${selectedLead.phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <Phone size={14} />
                        <span>Direct Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Namaste ${selectedLead.name}, this is from Seva Foundation regarding your interest in ${selectedLead.campaign?.name || "our work"}. How may we assist you with completing your donation?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <MessageSquare size={14} />
                        <span>WhatsApp</span>
                      </a>
                    </>
                  )}
                  {selectedLead.email && (
                    <a
                      href={`mailto:${selectedLead.email}?subject=${encodeURIComponent("Thank you for your support - Seva Foundation")}`}
                      className="p-2.5 rounded-xl bg-panel border border-border text-muted hover:text-text-primary hover:bg-panel/80 transition-colors"
                      title="Send Email"
                    >
                      <Mail size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 flex-1">
                {/* Donor & Campaign Overview */}
                <div className="bg-panel border border-border rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted block text-[11px]">Email</span>
                    <span className="font-semibold text-text-primary select-all">
                      {selectedLead.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Phone</span>
                    <span className="font-semibold text-text-primary select-all">
                      {selectedLead.phone || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Campaign</span>
                    <span className="font-semibold text-text-primary">
                      {selectedLead.campaign?.name || "General Support"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Intended Amount</span>
                    <span className="font-bold text-emerald-600">
                      {selectedLead.amount ? `₹${selectedLead.amount.toLocaleString("en-IN")}` : "Not specified"}
                    </span>
                  </div>
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">
                    Lead Pipeline Stage
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(["NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "LOST"] as LeadStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusChange(selectedLead._id, st)}
                          className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                            selectedLead.status === st
                              ? "bg-[#E8542A] text-white border-[#E8542A]"
                              : "bg-panel border-border text-muted hover:text-text-primary"
                          }`}
                        >
                          {st === "IN_PROGRESS" ? "Progress" : st}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* ── Add Follow-up Activity Form ─────────────────────── */}
                <form
                  onSubmit={handleLogFollowUp}
                  className="bg-panel border border-border rounded-2xl p-5 shadow-sm space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                      <PhoneCall size={14} className="text-[#E8542A]" />
                      Log Follow-up Activity
                    </h3>
                    <Link
                      href="/dashboard/leads/configs"
                      className="text-[11px] font-semibold text-[#E8542A] hover:underline"
                    >
                      Manage dispositions
                    </Link>
                  </div>

                  {/* Channel selector */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["CALL", "WHATSAPP", "EMAIL", "NOTE"] as FollowUpChannel[]).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setFollowUpChannel(ch)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          followUpChannel === ch
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "bg-background border border-border text-muted hover:text-text-primary"
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>

                  {/* Follow-up disposition from dynamic configs */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Follow-up Disposition / Outcome <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={followUpDisposition}
                      onChange={(e) => setFollowUpDisposition(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
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
                      Custom Follow-up Notes
                    </label>
                    <textarea
                      value={followUpNotes}
                      onChange={(e) => setFollowUpNotes(e.target.value)}
                      placeholder="e.g. Donor is willing to donate ₹2,000 on Friday after salary. Shared QR code on WhatsApp."
                      rows={2}
                      className="w-full p-3 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 resize-none"
                    />
                  </div>

                  {/* Schedule Next Date */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Schedule Next Call Date & Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={followUpNextDate}
                      onChange={(e) => setFollowUpNextDate(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loggingFollowUp}
                    className="w-full py-2.5 rounded-xl bg-[#E8542A] hover:bg-[#c9431d] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
                  >
                    {loggingFollowUp && <Loader2 size={14} className="animate-spin" />}
                    <span>Record Follow-up & Update Pipeline</span>
                  </button>
                </form>

                {/* ── Follow-up History Timeline ──────────────────────── */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                    Activity & Call History ({selectedLead.followUps?.length || 0})
                  </h3>

                  {!selectedLead.followUps || selectedLead.followUps.length === 0 ? (
                    <p className="text-xs text-muted italic bg-panel p-4 rounded-xl border border-border text-center">
                      No follow-up activities recorded yet. Use the form above to log the first call or note.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedLead.followUps.map((fu, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-border bg-panel text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-text-primary flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#E8542A]" />
                              {fu.disposition}
                            </span>
                            <span className="text-[10px] text-muted">
                              {new Date(fu.createdAt).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <p className="text-muted leading-relaxed whitespace-pre-line text-[11.5px]">
                            {fu.notes || "No extra comment"}
                          </p>

                          <div className="flex items-center justify-between pt-1 text-[10.5px] text-muted border-t border-border/40">
                            <span>Channel: <strong>{fu.channel}</strong></span>
                            {fu.nextFollowUpDate && (
                              <span className="text-blue-600 font-medium">
                                Scheduled: {new Date(fu.nextFollowUpDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Raw Notes Section ───────────────────────────────── */}
                <div className="bg-panel border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-primary">
                      All Lead Notes & System Logs
                    </span>
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="text-xs font-bold text-[#E8542A] hover:underline"
                    >
                      {savingNotes ? "Saving…" : "Save Notes"}
                    </button>
                  </div>
                  <textarea
                    value={directNotes}
                    onChange={(e) => setDirectNotes(e.target.value)}
                    rows={4}
                    placeholder="Custom notes regarding this donor..."
                    className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-[#E8542A]"
                  />
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Add New Lead Modal ──────────────────────────────────────── */}
      {showAddModal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <div className="relative w-full max-w-md bg-background border border-border rounded-2xl p-6 shadow-2xl z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-text-primary">
                  Add New Lead
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-muted hover:text-text-primary"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    placeholder="donor@example.com"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Mobile Phone Number (10 digits)
                  </label>
                  <input
                    type="tel"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Lead Type / Source
                    </label>
                    <select
                      value={newLeadSource}
                      onChange={(e) => setNewLeadSource(e.target.value as any)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                    >
                      <option value="MANUAL">Manual Entry</option>
                      <option value="DONOR_DROP">Unpaid Donor (Drop-off)</option>
                      <option value="PAYMENT_FAILED">Payment Failed</option>
                      <option value="CONTACT_FORM">Contact Inquiry</option>
                      <option value="SUBSCRIBER">Newsletter Subscriber</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Donation Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={newLeadAmount}
                      onChange={(e) => setNewLeadAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 2000"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Related Campaign
                  </label>
                  <select
                    value={newLeadCampaign}
                    onChange={(e) => setNewLeadCampaign(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                  >
                    <option value="">General Support (No Campaign)</option>
                    {campaigns.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Initial Custom Notes
                  </label>
                  <textarea
                    value={newLeadNotes}
                    onChange={(e) => setNewLeadNotes(e.target.value)}
                    placeholder="Enter any initial discussion notes..."
                    rows={2}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-panel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-xl bg-[#E8542A] hover:bg-[#c9431d] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
                  >
                    {creating ? "Adding…" : "Save Lead"}
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

export default function AllLeadsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted">
          <div className="w-8 h-8 border-2 border-[#E8542A] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading lead pipeline…</span>
        </div>
      </div>
    }>
      <AllLeadsInner />
    </Suspense>
  );
}
