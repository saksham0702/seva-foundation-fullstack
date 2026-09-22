"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  UserCheck,
  Search,
  Plus,
  Mail,
  Phone,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  ChevronRight,
  X,
  Loader2,
  Download,
  Filter,
} from "lucide-react";
import { Portal } from "@/components/shared/Portal";
import {
  getLeads,
  getLeadStats,
  createLead,
  updateLead,
  deleteLead,
  Lead,
  LeadStats,
  LeadSource,
  LeadStatus,
} from "@/app/api/leads";

const SOURCE_CONFIG: Record<
  LeadSource,
  { label: string; bg: string; text: string; border: string }
> = {
  SUBSCRIBER: {
    label: "Newsletter Subscriber",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  PAYMENT_FAILED: {
    label: "Payment Failed",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  DONOR_DROP: {
    label: "Donor Drop-off",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  CONTACT_FORM: {
    label: "Contact Inquiry",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  VOLUNTEER: {
    label: "Volunteer Lead",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  MANUAL: {
    label: "Manual Entry",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  },
};

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  NEW: {
    label: "New",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  CONTACTED: {
    label: "Contacted",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  CONVERTED: {
    label: "Converted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  LOST: {
    label: "Lost / Closed",
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
  },
};

export default function LeadsDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New lead form state
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadSource, setNewLeadSource] = useState<LeadSource>("MANUAL");
  const [newLeadNotes, setNewLeadNotes] = useState("");
  const [creating, setCreating] = useState(false);

  // Detail drawer state
  const [drawerNotes, setDrawerNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

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
      const query: any = { limit: 50 };
      if (search.trim()) query.search = search.trim();
      if (sourceFilter !== "ALL") query.source = sourceFilter;
      if (statusFilter !== "ALL") query.status = statusFilter;

      const res = await getLeads(query);
      setLeads(res.leads);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, sourceFilter, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timeout);
  }, [fetchLeads]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateLead(leadId, { status: newStatus });
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
      );
      if (selectedLead?._id === leadId) {
        setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadEmail.trim() && !newLeadPhone.trim()) {
      alert("Please provide at least an email or phone number.");
      return;
    }
    setCreating(true);
    try {
      await createLead({
        name: newLeadName.trim() || "Prospective Donor",
        email: newLeadEmail.trim().toLowerCase(),
        phone: newLeadPhone.trim(),
        source: newLeadSource,
        notes: newLeadNotes.trim(),
        status: "NEW",
      });
      setShowAddModal(false);
      setNewLeadName("");
      setNewLeadEmail("");
      setNewLeadPhone("");
      setNewLeadNotes("");
      fetchLeads();
      fetchStats();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to create lead");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setSavingNotes(true);
    try {
      const updated = await updateLead(selectedLead._id, { notes: drawerNotes });
      setSelectedLead(updated);
      setLeads((prev) =>
        prev.map((l) => (l._id === selectedLead._id ? { ...l, notes: drawerNotes } : l))
      );
    } catch (e) {
      console.error(e);
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
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Source", "Status", "Amount", "Campaign", "Date"];
    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone || ""}"`,
      `"${l.source}"`,
      `"${l.status}"`,
      l.amount || 0,
      `"${l.campaign?.name || ""}"`,
      new Date(l.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `seva_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <UserCheck className="text-black" size={26} />
              <span>Leads Management & CRM</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Capture, track, and convert prospective donors, subscribers, and checkout drop-offs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Plus size={15} />
              <span>Add Lead</span>
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 border border-slate-200 hover:border-black text-black text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Leads</span>
              <Users size={16} />
            </div>
            <p className="text-2xl font-black text-gray-900">{stats?.total || 0}</p>
          </div>

          <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4">
            <div className="flex items-center justify-between text-sky-600 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">New Inquiries</span>
              <Clock size={16} />
            </div>
            <p className="text-2xl font-black text-sky-900">{stats?.newLeads || 0}</p>
          </div>

          <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4">
            <div className="flex items-center justify-between text-rose-600 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Failed Payments</span>
              <AlertTriangle size={16} />
            </div>
            <p className="text-2xl font-black text-rose-900">{stats?.paymentFailed || 0}</p>
            <span className="text-[10px] text-rose-600 font-medium">Ready for recovery</span>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Subscribers</span>
              <Mail size={16} />
            </div>
            <p className="text-2xl font-black text-blue-900">{stats?.subscribers || 0}</p>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Converted Donors</span>
              <CheckCircle2 size={16} />
            </div>
            <p className="text-2xl font-black text-emerald-900">{stats?.converted || 0}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          {/* Source Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "ALL", label: "All Sources" },
              { id: "PAYMENT_FAILED", label: "Failed Payments" },
              { id: "SUBSCRIBER", label: "Subscribers" },
              { id: "CONTACT_FORM", label: "Contact Inquiries" },
              { id: "MANUAL", label: "Manual" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSourceFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  sourceFilter === tab.id
                    ? "bg-black text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-black"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-black"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-gray-400">
              <Loader2 size={24} className="animate-spin mb-2 text-black" />
              <span className="text-xs font-medium">Loading leads...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <UserCheck size={36} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">No leads found</p>
              <p className="text-xs text-gray-400 mt-0.5">
                New newsletter subscribers and payment drop-offs will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="py-3 px-4">Lead Contact</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Campaign / Value</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {leads.map((lead) => {
                    const src = SOURCE_CONFIG[lead.source] || SOURCE_CONFIG.MANUAL;
                    const st = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;

                    return (
                      <tr
                        key={lead._id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedLead(lead);
                          setDrawerNotes(lead.notes || "");
                        }}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">{lead.name}</div>
                          <div className="text-gray-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                            <Mail size={12} className="text-gray-400" />
                            <span>{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="text-gray-400 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                              <Phone size={11} />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${src.bg} ${src.text} ${src.border}`}
                          >
                            {src.label}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {lead.amount ? (
                            <div className="font-bold text-gray-900">
                              ₹{lead.amount.toLocaleString("en-IN")}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                          {lead.campaign?.name && (
                            <div className="text-[11px] text-gray-500 line-clamp-1">
                              {lead.campaign.name}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleStatusChange(lead._id, e.target.value as LeadStatus)
                            }
                            className={`text-[11px] font-bold border rounded-lg px-2.5 py-1 focus:outline-none ${st.bg} ${st.text} ${st.border}`}
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="CONVERTED">Converted</option>
                            <option value="LOST">Lost</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-gray-400 text-[11px]">
                          {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedLead(lead);
                                setDrawerNotes(lead.notes || "");
                              }}
                              className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors"
                              title="View & Edit Notes"
                            >
                              <ChevronRight size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead._id)}
                              className="p-1.5 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 size={14} />
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

        {/* Lead Details & Notes Drawer */}
        {selectedLead && (
          <Portal>
            <div
              className="fixed inset-0 bg-black/60 z-[99998] backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedLead(null)}
            />
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 z-[99999] flex flex-col shadow-2xl">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{selectedLead.name}</h3>
                  <p className="text-xs text-gray-400 font-mono">{selectedLead.email}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Meta details */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Source</span>
                    <span className="font-semibold text-gray-800 uppercase">{selectedLead.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="font-semibold text-gray-800 uppercase">{selectedLead.status}</span>
                  </div>
                  {selectedLead.campaign?.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Campaign</span>
                      <span className="font-semibold text-gray-800">{selectedLead.campaign.name}</span>
                    </div>
                  )}
                  {selectedLead.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Intended Value</span>
                      <span className="font-bold text-emerald-600">
                        ₹{selectedLead.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">First Captured</span>
                    <span className="text-gray-600">
                      {new Date(selectedLead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Status Toggle Actions */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Update Pipeline Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        "NEW",
                        "CONTACTED",
                        "IN_PROGRESS",
                        "CONVERTED",
                        "LOST",
                      ] as LeadStatus[]
                    ).map((st) => {
                      const cfg = STATUS_CONFIG[st];
                      const isCurrent = selectedLead.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(selectedLead._id, st)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isCurrent
                              ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-black/10`
                              : "bg-white text-gray-600 border-gray-200 hover:bg-slate-50"
                          }`}
                        >
                          {isCurrent && <CheckCircle2 size={12} />}
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Follow up Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Admin Follow-up Notes
                  </label>
                  <textarea
                    rows={5}
                    value={drawerNotes}
                    onChange={(e) => setDrawerNotes(e.target.value)}
                    placeholder="Log conversations, call notes, or follow up reminders here..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black font-sans leading-relaxed"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="mt-2 w-full py-2 bg-black hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {savingNotes && <Loader2 size={13} className="animate-spin" />}
                    <span>Save Notes</span>
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}

        {/* Add Lead Modal */}
        {showAddModal && (
          <Portal>
            <div
              className="fixed inset-0 bg-black/75 z-[99998] backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative my-auto">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add Prospective Lead</h3>

                <form onSubmit={handleCreateLead} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newLeadName}
                      onChange={(e) => setNewLeadName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newLeadEmail}
                      onChange={(e) => setNewLeadEmail(e.target.value)}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newLeadPhone}
                      onChange={(e) => setNewLeadPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Lead Source
                    </label>
                    <select
                      value={newLeadSource}
                      onChange={(e) => setNewLeadSource(e.target.value as LeadSource)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black bg-white"
                    >
                      <option value="MANUAL">Manual Offline Entry</option>
                      <option value="SUBSCRIBER">Newsletter Subscriber</option>
                      <option value="PAYMENT_FAILED">Payment Failed Follow-up</option>
                      <option value="CONTACT_FORM">Contact Inquiry</option>
                      <option value="VOLUNTEER">Volunteer Prospect</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Initial Notes
                    </label>
                    <textarea
                      value={newLeadNotes}
                      onChange={(e) => setNewLeadNotes(e.target.value)}
                      rows={3}
                      placeholder="Background, campaign interest, callback time..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-200 text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-5 py-2 bg-black hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                    >
                      {creating && <Loader2 size={13} className="animate-spin" />}
                      <span>Create Lead</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </div>
  );
}
