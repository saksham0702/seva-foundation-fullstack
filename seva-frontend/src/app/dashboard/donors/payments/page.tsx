"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  X,
  CreditCard,
  Building2,
  Sparkles,
  User,
  Phone,
  Mail,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Printer,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { getDonations, Donation } from "@/app/api/donation";
import { Portal } from "@/components/shared/Portal";
import { DonorsNavTabs } from "../components/DonorsNavTabs";

// ─── Color & Avatar Helpers ────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const color = colors[(name || "?").charCodeAt(0) % colors.length];
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  SUCCESS: {
    label: "Success",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  FAILED: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700 border border-rose-200",
  },
};

// ─── Payment Details Drawer ────────────────────────────────────────────────
function PaymentDrawer({
  donation,
  onClose,
}: {
  donation: Donation;
  onClose: () => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const donorObj = typeof donation.donor === "object" ? donation.donor : null;
  const donorName = donorObj?.name || "Anonymous Donor";
  const donorEmail = donorObj?.email || "—";
  const donorPhone = donorObj?.phone || "—";
  const donorPan = donorObj?.pan || "—";
  const donorAddress = donorObj?.address || "—";

  const campaignObj = typeof donation.campaign === "object" ? donation.campaign : null;
  const campaignName = campaignObj?.name || (typeof donation.campaign === "string" ? donation.campaign : null);
  const targetLabel = campaignName || donation.initiative || "General Support";
  const isInitiative = Boolean(donation.initiative || donation.targetType === "INITIATIVE");

  const statusCfg = STATUS_BADGES[donation.paymentStatus] || STATUS_BADGES.PENDING;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[99999] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 print:relative print:w-full print:max-w-none print:shadow-none">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-3">
            <Avatar name={donorName} />
            <div>
              <p className="text-sm font-bold text-black">{donorName}</p>
              <p className="text-[11px] text-slate-400">{donorEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Receipt Summary"
              className="p-2 text-slate-500 hover:text-black hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-black transition-colors text-lg font-light w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
          {/* Hero Amount & Status Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Transaction Amount
              </span>
              <span className="text-3xl font-serif font-bold text-black">
                ₹{(donation.amount || 0).toLocaleString("en-IN")}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Method:{" "}
                <span className="font-semibold text-slate-800">
                  {donation.paymentMethod || "ONLINE"}
                </span>{" "}
                • Frequency:{" "}
                <span className="font-semibold text-slate-800">
                  {donation.frequency === "MONTHLY" ? "Monthly" : "One-Time"}
                </span>
              </p>
            </div>
            <span
              className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>
          </div>

          {/* Allocation & Purpose */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contribution Allocation
            </h3>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isInitiative ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {isInitiative ? <Sparkles size={18} /> : <Building2 size={18} />}
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">
                    {isInitiative ? "Grassroots Initiative" : "Urgent Campaign"}
                  </p>
                  <p className="text-sm font-bold text-slate-900">{targetLabel}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isInitiative
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {donation.targetType || (isInitiative ? "INITIATIVE" : "CAMPAIGN")}
              </span>
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Donor Profile & Tax ID
            </h3>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-400">Full Name</span>
                <span className="font-semibold text-slate-800">{donorName}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-400">Email Address</span>
                <span className="font-semibold text-slate-800">{donorEmail}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-semibold text-slate-800">{donorPhone}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-400">PAN (for 80G Rebate)</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {donorPan}
                </span>
              </div>
              {donorAddress !== "—" && (
                <div className="flex items-start justify-between px-4 py-2.5">
                  <span className="text-slate-400">Billing Address</span>
                  <span className="font-medium text-slate-700 text-right max-w-[240px]">
                    {donorAddress}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Gateway & Technical Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Transaction Identifiers & Audit
            </h3>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs font-mono">
              {donation.receiptNumber && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-slate-400 font-sans">Receipt Number</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>{donation.receiptNumber}</span>
                    <button
                      onClick={() => copyToClipboard(donation.receiptNumber!, "receipt")}
                      className="text-slate-400 hover:text-black p-0.5"
                    >
                      {copiedKey === "receipt" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              )}
              {donation.transactionId && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-slate-400 font-sans">Payment ID</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="truncate max-w-[190px]">{donation.transactionId}</span>
                    <button
                      onClick={() => copyToClipboard(donation.transactionId!, "tx")}
                      className="text-slate-400 hover:text-black p-0.5"
                    >
                      {copiedKey === "tx" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              )}
              {donation.razorpayOrderId && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-slate-400 font-sans">Razorpay Order ID</span>
                  <span className="text-slate-700 truncate max-w-[200px]">{donation.razorpayOrderId}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-400 font-sans">Recorded At</span>
                <span className="text-slate-700 font-sans">
                  {donation.createdAt ? new Date(donation.createdAt).toLocaleString("en-IN") : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Tribute & Notes */}
          {(donation.tribute && donation.tribute !== "No Tribute" || donation.message) && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tribute & Dedication
              </h3>
              <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-4 text-xs space-y-1">
                {donation.tribute && donation.tribute !== "No Tribute" && (
                  <p className="font-bold text-amber-900">Tribute: {donation.tribute}</p>
                )}
                {donation.message && (
                  <p className="text-amber-800 italic">&ldquo;{donation.message}&rdquo;</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer size={13} />
            Print Receipt
          </button>
        </div>
      </div>
    </Portal>
  );
}

// ─── Main Payment Ledger Component ─────────────────────────────────────────
export default function PaymentTransactionsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("all"); // all | CAMPAIGN | INITIATIVE
  const [statusFilter, setStatusFilter] = useState("all"); // all | SUCCESS | PENDING | FAILED
  const [methodFilter, setMethodFilter] = useState("all"); // all | ONLINE | OFFLINE

  // Drawer
  const [activeDonation, setActiveDonation] = useState<Donation | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDonations();
      setDonations(res || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load payment transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filtered donations
  const filtered = useMemo(() => {
    return donations.filter((d) => {
      // 1. Search filter
      const q = search.toLowerCase().trim();
      const donorObj = typeof d.donor === "object" ? d.donor : null;
      const donorName = (donorObj?.name || "").toLowerCase();
      const donorEmail = (donorObj?.email || "").toLowerCase();
      const donorPhone = (donorObj?.phone || "").toLowerCase();
      const receiptNo = (d.receiptNumber || "").toLowerCase();
      const txId = (d.transactionId || "").toLowerCase();

      const matchesSearch =
        !q ||
        donorName.includes(q) ||
        donorEmail.includes(q) ||
        donorPhone.includes(q) ||
        receiptNo.includes(q) ||
        txId.includes(q);

      // 2. Target type filter
      let matchesTarget = true;
      if (targetFilter === "CAMPAIGN") {
        matchesTarget = Boolean(d.campaign) && d.targetType !== "INITIATIVE" && !d.initiative;
      } else if (targetFilter === "INITIATIVE") {
        matchesTarget = Boolean(d.initiative || d.targetType === "INITIATIVE");
      }

      // 3. Status filter
      const matchesStatus = statusFilter === "all" || d.paymentStatus === statusFilter;

      // 4. Method filter
      const matchesMethod = methodFilter === "all" || d.paymentMethod === methodFilter;

      return matchesSearch && matchesTarget && matchesStatus && matchesMethod;
    });
  }, [donations, search, targetFilter, statusFilter, methodFilter]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Overall statistics
  const stats = useMemo(() => {
    const successList = donations.filter((d) => d.paymentStatus === "SUCCESS");
    const totalVolume = successList.reduce((sum, d) => sum + (d.amount || 0), 0);
    const onlineVolume = successList
      .filter((d) => d.paymentMethod === "ONLINE" || !d.paymentMethod)
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    const offlineVolume = successList
      .filter((d) => d.paymentMethod === "OFFLINE")
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    const pendingCount = donations.filter((d) => d.paymentStatus === "PENDING" || d.paymentStatus === "FAILED").length;
    const avgDonation = successList.length > 0 ? Math.round(totalVolume / successList.length) : 0;

    return {
      totalVolume,
      successCount: successList.length,
      onlineVolume,
      offlineVolume,
      pendingCount,
      avgDonation,
    };
  }, [donations]);

  // CSV Export
  const handleExportCSV = () => {
    if (donations.length === 0) return;
    const headers = [
      "Receipt Number",
      "Transaction ID",
      "Donor Name",
      "Email",
      "Phone",
      "PAN",
      "Cause / Purpose",
      "Target Type",
      "Amount (INR)",
      "Payment Method",
      "Payment Status",
      "Date",
    ];

    const rows = filtered.map((d) => {
      const donor = typeof d.donor === "object" ? d.donor : null;
      const campaignObj = typeof d.campaign === "object" ? d.campaign : null;
      const campaignName = campaignObj?.name || (typeof d.campaign === "string" ? d.campaign : null);
      const cause = campaignName || d.initiative || "General Support";

      return [
        `"${d.receiptNumber || ""}"`,
        `"${d.transactionId || ""}"`,
        `"${donor?.name || "Anonymous"}"`,
        `"${donor?.email || ""}"`,
        `"${donor?.phone || ""}"`,
        `"${donor?.pan || ""}"`,
        `"${cause}"`,
        `"${d.targetType || "CAMPAIGN"}"`,
        d.amount,
        `"${d.paymentMethod || "ONLINE"}"`,
        `"${d.paymentStatus}"`,
        `"${d.createdAt ? new Date(d.createdAt).toISOString() : ""}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payment_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PermissionGuard module="donations">
      <div className="min-h-screen bg-white">
        <div className="w-full px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-black tracking-tight">
                Payment Transactions
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Real-time ledger of contributions across all campaigns and grassroots initiatives.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
              >
                <Download size={14} />
                Export Ledger CSV
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <DonorsNavTabs />

          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Volume Collected
              </span>
              <div className="text-2xl font-bold text-black tracking-tight">
                ₹{stats.totalVolume.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-500">
                From {stats.successCount} verified payments
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Online Payments (Razorpay)
              </span>
              <div className="text-2xl font-bold text-emerald-700 tracking-tight">
                ₹{stats.onlineVolume.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-500">Digital gateway volume</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Offline / Bank Transfers
              </span>
              <div className="text-2xl font-bold text-blue-700 tracking-tight">
                ₹{stats.offlineVolume.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-500">Direct manual recordings</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Average Donation
              </span>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                ₹{stats.avgDonation.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-500">Per successful transaction</p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search donor, email, phone, receipt or transaction ID…"
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns & Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Target Type Filter */}
              <select
                value={targetFilter}
                onChange={(e) => {
                  setTargetFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 bg-white hover:border-black focus:outline-none transition-colors"
              >
                <option value="all">All Causes</option>
                <option value="CAMPAIGN">Campaigns Only</option>
                <option value="INITIATIVE">Initiatives Only</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 bg-white hover:border-black focus:outline-none transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="SUCCESS">Success Only</option>
                <option value="PENDING">Pending Only</option>
                <option value="FAILED">Failed Only</option>
              </select>

              {/* Method Filter */}
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 bg-white hover:border-black focus:outline-none transition-colors"
              >
                <option value="all">All Methods</option>
                <option value="ONLINE">Online (Gateway)</option>
                <option value="OFFLINE">Offline (Direct)</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    <th className="px-6 py-3.5">Donor</th>
                    <th className="px-6 py-3.5">Allocated Cause</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5 hidden md:table-cell">Mode</th>
                    <th className="px-6 py-3.5 hidden lg:table-cell">Receipt #</th>
                    <th className="px-6 py-3.5 hidden sm:table-cell">Date</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                          <span className="text-xs">Loading payment transactions…</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400">
                        No transactions match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((d) => {
                      const donor = typeof d.donor === "object" ? d.donor : null;
                      const donorName = donor?.name || "Anonymous Donor";
                      const donorEmail = donor?.email || donor?.phone || "—";

                      const campaignObj = typeof d.campaign === "object" ? d.campaign : null;
                      const campaignName = campaignObj?.name || (typeof d.campaign === "string" ? d.campaign : null);
                      const isInit = Boolean(d.initiative || d.targetType === "INITIATIVE");
                      const causeLabel = campaignName || d.initiative || "General Support";

                      const statusCfg = STATUS_BADGES[d.paymentStatus] || STATUS_BADGES.PENDING;

                      return (
                        <tr
                          key={d._id}
                          onClick={() => setActiveDonation(d)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          {/* Donor */}
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={donorName} />
                              <div>
                                <p className="font-bold text-slate-900">{donorName}</p>
                                <p className="text-[10.5px] text-slate-400 mt-0.5">{donorEmail}</p>
                              </div>
                            </div>
                          </td>

                          {/* Cause */}
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border max-w-[200px] truncate ${
                                  isInit
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {causeLabel}
                              </span>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-3.5">
                            <span className="font-bold text-slate-900 text-sm">
                              ₹{(d.amount || 0).toLocaleString("en-IN")}
                            </span>
                          </td>

                          {/* Mode */}
                          <td className="px-6 py-3.5 hidden md:table-cell">
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              {d.paymentMethod === "OFFLINE" ? "Offline" : "Online (Razorpay)"}
                            </span>
                          </td>

                          {/* Receipt */}
                          <td className="px-6 py-3.5 hidden lg:table-cell">
                            <span className="font-mono text-[11px] text-slate-600">
                              {d.receiptNumber || "—"}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-3.5 hidden sm:table-cell">
                            <span className="text-slate-500 text-[11px]">
                              {d.createdAt
                                ? new Date(d.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-3.5">
                            <span
                              className={`text-[9.5px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${statusCfg.className}`}
                            >
                              {statusCfg.label}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setActiveDonation(d)}
                              className="text-[11px] font-bold text-slate-400 hover:text-black transition-colors"
                            >
                              Details →
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-bold text-slate-700 px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slide-over details drawer */}
        {activeDonation && (
          <PaymentDrawer
            donation={activeDonation}
            onClose={() => setActiveDonation(null)}
          />
        )}
      </div>
    </PermissionGuard>
  );
}
