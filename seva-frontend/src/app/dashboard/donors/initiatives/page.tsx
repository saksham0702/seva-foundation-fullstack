"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
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
  ShieldCheck,
  Building2,
  Sparkles,
  User,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { getDonations, Donation } from "@/app/api/donation";
import { Portal } from "@/components/shared/Portal";

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
      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

const INITIATIVE_COLORS: Record<string, string> = {
  vidhya: "bg-blue-50 text-blue-700 border-blue-200",
  arogya: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sammaan: "bg-amber-50 text-amber-700 border-amber-200",
  shakti: "bg-purple-50 text-purple-700 border-purple-200",
  annapurna: "bg-orange-50 text-orange-700 border-orange-200",
  gramodaya: "bg-teal-50 text-teal-700 border-teal-200",
  rakshak: "bg-rose-50 text-rose-700 border-rose-200",
  general: "bg-slate-100 text-slate-700 border-slate-200",
};

function getInitiativeBadge(name?: string) {
  if (!name) return "bg-slate-100 text-slate-700 border-slate-200";
  const key = Object.keys(INITIATIVE_COLORS).find((k) =>
    name.toLowerCase().includes(k)
  );
  return key ? INITIATIVE_COLORS[key] : "bg-slate-100 text-slate-700 border-slate-200";
}

// ─── Main Component ────────────────────────────────────────────────────────
interface GroupedInitiativeDonor {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorPan?: string;
  donorAddress?: string;
  primaryInitiative: string;
  totalAmount: number;
  donationCount: number;
  frequency: string;
  paymentStatus: string;
  latestDate: string;
  tribute?: string;
  message?: string;
  receiptNumber?: string;
  donations: Donation[];
}

function InitiativeDonationsInner() {
  const [groupedDonors, setGroupedDonors] = useState<GroupedInitiativeDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [search, setSearch] = useState("");
  const [selectedInitiative, setSelectedInitiative] = useState("all");
  const [selectedFrequency, setSelectedFrequency] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Selected for drawer
  const [activeDonor, setActiveDonor] = useState<GroupedInitiativeDonor | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDonations();
      // Filter initiative donations or those without a campaign
      const initDonations = res.filter(
        (d) =>
          d.initiative ||
          d.targetType === "INITIATIVE" ||
          (!d.campaign && d.initiative)
      );

      // Group donations by email or phone
      const map = new Map<string, GroupedInitiativeDonor>();

      for (const d of initDonations) {
        const donorObj = typeof d.donor === "object" ? d.donor : null;
        const name = donorObj?.name || "Anonymous Donor";
        const email = donorObj?.email ? donorObj.email.toLowerCase().trim() : "";
        const phone = donorObj?.phone ? donorObj.phone.replace(/\D/g, "").trim() : "";
        const groupKey = email || (phone ? `phone_${phone}` : d._id);

        if (!map.has(groupKey)) {
          map.set(groupKey, {
            id: d._id,
            donorName: name,
            donorEmail: email,
            donorPhone: donorObj?.phone || "",
            donorPan: donorObj?.pan,
            donorAddress: donorObj?.address,
            primaryInitiative: d.initiative || "General Support",
            totalAmount: d.paymentStatus === "SUCCESS" ? (d.amount || 0) : 0,
            donationCount: d.paymentStatus === "SUCCESS" ? 1 : 0,
            frequency: d.frequency || "ONE_TIME",
            paymentStatus: d.paymentStatus,
            latestDate: d.createdAt || new Date().toISOString(),
            tribute: d.tribute,
            message: d.message,
            receiptNumber: d.receiptNumber,
            donations: [d],
          });
        } else {
          const existing = map.get(groupKey)!;
          const mergedDonations = [...existing.donations, d];
          const successful = mergedDonations.filter((item) => item.paymentStatus === "SUCCESS");
          const totalPaid = successful.reduce((sum, item) => sum + (item.amount || 0), 0);

          let finalStatus = existing.paymentStatus;
          if (d.paymentStatus === "SUCCESS" || existing.paymentStatus === "SUCCESS") {
            finalStatus = "SUCCESS";
          } else if (d.paymentStatus === "PENDING" || existing.paymentStatus === "PENDING") {
            finalStatus = "PENDING";
          }

          map.set(groupKey, {
            ...existing,
            donorName: existing.donorName !== "Anonymous Donor" ? existing.donorName : name,
            donorEmail: existing.donorEmail || email,
            donorPhone: existing.donorPhone || donorObj?.phone || "",
            donorPan: existing.donorPan || donorObj?.pan,
            donorAddress: existing.donorAddress || donorObj?.address,
            totalAmount: totalPaid,
            donationCount: successful.length,
            paymentStatus: finalStatus,
            donations: mergedDonations,
            latestDate:
              new Date(existing.latestDate) > new Date(d.createdAt || 0)
                ? existing.latestDate
                : d.createdAt || existing.latestDate,
          });
        }
      }

      setGroupedDonors(Array.from(map.values()));
    } catch (err: any) {
      console.error("Error fetching initiative donations:", err);
      setError("Failed to load initiative donations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Filtered donors
  const filtered = useMemo(() => {
    return groupedDonors.filter((item) => {
      // Initiative filter
      if (selectedInitiative !== "all") {
        const hasMatch = item.donations.some((d) =>
          d.initiative?.toLowerCase().includes(selectedInitiative.toLowerCase())
        );
        if (!hasMatch) return false;
      }

      // Frequency filter
      if (selectedFrequency !== "all") {
        const hasMatch = item.donations.some((d) => d.frequency === selectedFrequency);
        if (!hasMatch) return false;
      }

      // Status filter
      if (selectedStatus !== "all") {
        if (item.paymentStatus !== selectedStatus) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = item.donorName.toLowerCase().includes(q);
        const matchesEmail = item.donorEmail.toLowerCase().includes(q);
        const matchesPhone = item.donorPhone.includes(q);
        const matchesInit = item.primaryInitiative.toLowerCase().includes(q);
        const matchesReceipt = item.donations.some(
          (d) => d.receiptNumber && d.receiptNumber.toLowerCase().includes(q)
        );

        if (
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesInit &&
          !matchesReceipt
        ) {
          return false;
        }
      }

      return true;
    });
  }, [groupedDonors, selectedInitiative, selectedFrequency, selectedStatus, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Stats calculations
  const stats = useMemo(() => {
    let totalCount = 0;
    let totalRaised = 0;
    let monthlyCount = 0;
    let oneTimeCount = 0;

    groupedDonors.forEach((g) => {
      totalCount += g.donations.length;
      totalRaised += g.totalAmount;
      g.donations.forEach((d) => {
        if (d.frequency === "MONTHLY") monthlyCount++;
        else oneTimeCount++;
      });
    });

    return {
      totalDonors: groupedDonors.length,
      totalCount,
      totalRaised,
      monthlyCount,
      oneTimeCount,
    };
  }, [groupedDonors]);

  // Unique initiatives extracted dynamically from loaded donations
  const uniqueInitiatives = useMemo(() => {
    const set = new Set<string>();
    groupedDonors.forEach((g) => {
      g.donations.forEach((d) => {
        if (d.initiative) set.add(d.initiative);
      });
    });
    return Array.from(set);
  }, [groupedDonors]);

  // Export CSV
  const handleExportCSV = () => {
    if (groupedDonors.length === 0) return;
    const headers = [
      "Donor Name",
      "Email",
      "Phone",
      "PAN",
      "Total Amount Paid",
      "Donation Count",
      "Primary Initiative",
      "Status",
      "Latest Date",
    ];
    const rows = filtered.map((d) => [
      `"${d.donorName}"`,
      `"${d.donorEmail}"`,
      `"${d.donorPhone}"`,
      `"${d.donorPan || ""}"`,
      d.totalAmount,
      d.donationCount,
      `"${d.primaryInitiative}"`,
      `"${d.paymentStatus}"`,
      `"${new Date(d.latestDate).toLocaleDateString()}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `initiative_donors_grouped_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-8 max-w-7xl mx-auto space-y-8">
        
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-black tracking-tight">
              Initiative Donations
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Direct donations received across Seva Foundation&apos;s grassroots initiatives.
            </p>
          </div>
        </div>

        {/* ── View Switcher Tabs ── */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <Link
            href="/dashboard/donors"
            className="px-4 py-2.5 border-b-2 border-transparent text-slate-500 hover:text-black hover:border-slate-300 text-sm font-semibold tracking-tight transition-all"
          >
            Campaign Donors
          </Link>
          <span className="px-4 py-2.5 border-b-2 border-black text-black text-sm font-bold tracking-tight cursor-default">
            Initiative Donations
          </span>
        </div>

        {/* ── Stats Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Raised for Initiatives
            </span>
            <div className="text-2xl font-bold text-black tracking-tight">
              ₹{stats.totalRaised.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-500">From successful transactions</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Contributions
            </span>
            <div className="text-2xl font-bold text-black tracking-tight">
              {stats.totalCount}
            </div>
            <p className="text-[11px] text-slate-500">Initiative donor records</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Monthly Supporters
            </span>
            <div className="text-2xl font-bold text-emerald-700 tracking-tight">
              {stats.monthlyCount}
            </div>
            <p className="text-[11px] text-slate-500">Recurring pledge contributors</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              One-Time Donors
            </span>
            <div className="text-2xl font-bold text-blue-700 tracking-tight">
              {stats.oneTimeCount}
            </div>
            <p className="text-[11px] text-slate-500">Immediate impact donations</p>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search donor, initiative, phone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Initiative Filter */}
            <select
              value={selectedInitiative}
              onChange={(e) => {
                setSelectedInitiative(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Initiatives</option>
              {uniqueInitiatives.map((init) => (
                <option key={init} value={init}>
                  {init}
                </option>
              ))}
            </select>

            {/* Frequency Filter */}
            <select
              value={selectedFrequency}
              onChange={(e) => {
                setSelectedFrequency(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Frequencies</option>
              <option value="ONE_TIME">One-Time</option>
              <option value="MONTHLY">Monthly</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Statuses</option>
              <option value="SUCCESS">Paid</option>
              <option value="PENDING">Not Paid / Pending</option>
              <option value="FAILED">Payment Failed</option>
            </select>
          </div>
        </div>

        {/* ── Donations Table ── */}
        <div className="border-y border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="animate-spin text-[#F5A623]" size={30} />
              <p className="text-xs font-medium">Loading initiative donations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-700">No initiative donations found.</p>
              <p className="text-xs text-slate-400">Try adjusting your search terms or filter selection.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <th className="py-3.5 px-4">Donor</th>
                    <th className="py-3.5 px-4">Total Paid</th>
                    <th className="py-3.5 px-4">Primary Initiative</th>
                    <th className="py-3.5 px-4">Frequency</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Latest Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((item) => {
                    const badgeClass = getInitiativeBadge(item.primaryInitiative);
                    const formattedDate = new Date(item.latestDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => setActiveDonor(item)}
                      >
                        {/* Donor */}
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item.donorName}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {item.donorPhone || item.donorEmail || "—"}
                            </p>
                          </div>
                        </td>

                        {/* Total Amount Paid */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              ₹{item.totalAmount.toLocaleString("en-IN")}
                            </span>
                            {item.donationCount > 1 ? (
                              <span className="text-[11px] text-slate-500 font-medium">
                                ({item.donationCount} donations)
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Primary Initiative */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[11px] font-bold px-3 py-1 rounded-lg border ${badgeClass}`}
                          >
                            {item.primaryInitiative}
                          </span>
                        </td>

                        {/* Frequency */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                              item.frequency === "MONTHLY"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {item.frequency === "MONTHLY" ? "Monthly" : "One-Time"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                              item.paymentStatus === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.paymentStatus === "FAILED"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {item.paymentStatus === "SUCCESS"
                              ? "Paid"
                              : item.paymentStatus === "FAILED"
                              ? "Failed"
                              : "Pending"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {formattedDate}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveDonor(item)}
                            className="text-xs font-bold text-black hover:text-[#2F54EB] transition-colors"
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} donors
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-bold text-slate-800">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Details Drawer with Recursive Donation History ── */}
        {activeDonor && (
          <Portal>
            <div
              className="fixed inset-0 bg-black/75 z-[99998] backdrop-blur-sm"
              onClick={() => setActiveDonor(null)}
            />
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[99999] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar name={activeDonor.donorName} />
                  <div>
                    <h3 className="text-sm font-bold text-black">
                      {activeDonor.donorName}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {activeDonor.donorPhone || activeDonor.donorEmail || "Initiative Supporter"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDonor(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-black transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs">
                {/* Amount & Status Hero Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Donated
                    </span>
                    <span className="text-2xl font-serif font-bold text-black">
                      ₹{activeDonor.totalAmount.toLocaleString("en-IN")}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {activeDonor.donationCount} successful contribution(s)
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
                      activeDonor.paymentStatus === "SUCCESS"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : activeDonor.paymentStatus === "FAILED"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {activeDonor.paymentStatus === "SUCCESS" ? "PAID" : activeDonor.paymentStatus}
                  </span>
                </div>

                {/* Donor Contact & PAN Details */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    Donor Profile & Tax
                  </span>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl divide-y divide-slate-100">
                    <div className="flex justify-between p-3">
                      <span className="text-slate-500 font-medium">Email:</span>
                      <span className="font-medium text-slate-900">
                        {activeDonor.donorEmail || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-slate-500 font-medium">Phone:</span>
                      <span className="font-medium text-slate-900 font-mono">
                        {activeDonor.donorPhone || "—"}
                      </span>
                    </div>
                    {activeDonor.donorPan && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-500 font-medium">PAN Card:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {activeDonor.donorPan}
                        </span>
                      </div>
                    )}
                    {activeDonor.donorAddress && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-500 font-medium">Address:</span>
                        <span className="text-slate-900 text-right max-w-[200px]">
                          {activeDonor.donorAddress}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recursive Donation History */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      All Contributions ({activeDonor.donations.length})
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {activeDonor.donations.map((d, dIdx) => (
                      <div
                        key={d._id || dIdx}
                        className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">
                            ₹{(d.amount || 0).toLocaleString("en-IN")}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              d.paymentStatus === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : d.paymentStatus === "FAILED"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {d.paymentStatus}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 flex justify-between">
                          <span className="font-semibold text-[#0A1A2F]">
                            {d.initiative || "General Support"}
                          </span>
                          <span className="text-slate-400">
                            {d.frequency === "MONTHLY" ? "Monthly" : "One-Time"}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex justify-between">
                          <span>Date:</span>
                          <span>
                            {d.createdAt
                              ? new Date(d.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </div>

                        {d.receiptNumber && (
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">
                              Receipt: <strong className="text-slate-800 font-mono">{d.receiptNumber}</strong>
                            </span>
                            <a
                              href={`/verify/${d.receiptNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#4C6FFF] hover:underline font-bold"
                            >
                              Certificate →
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tribute & Message */}
                {(activeDonor.tribute || activeDonor.message) && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                      Tribute & Message
                    </span>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                      {activeDonor.tribute && activeDonor.tribute !== "No Tribute" && (
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase">
                            Dedication:
                          </span>
                          <p className="font-bold text-slate-900">{activeDonor.tribute}</p>
                        </div>
                      )}
                      {activeDonor.message && (
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase">
                            Message:
                          </span>
                          <p className="text-slate-700 italic mt-0.5">
                            &quot;{activeDonor.message}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Portal>
        )}
      </div>
    </div>
  );
}

export default function InitiativeDonationsPage() {
  return (
    <PermissionGuard module="donations">
      <InitiativeDonationsInner />
    </PermissionGuard>
  );
}
