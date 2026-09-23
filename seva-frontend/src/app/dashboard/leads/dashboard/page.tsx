"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  PhoneCall,
  Calendar,
  Flame,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Phone,
  Mail,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  getLeadStats,
  getLeads,
  Lead,
  LeadStats,
} from "@/app/api/leads";

export default function LeadsDashboardPage() {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [priorityLeads, setPriorityLeads] = useState<Lead[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsData, dueLeadsRes, recentLeadsRes] = await Promise.all([
        getLeadStats(),
        getLeads({ followUpStatus: "due_today", limit: 6 }),
        getLeads({ limit: 6, sortBy: "createdAt", sortOrder: "desc" }),
      ]);
      setStats(statsData);
      setPriorityLeads(dueLeadsRes.leads);
      setRecentLeads(recentLeadsRes.leads);
    } catch (err) {
      console.error("Failed to load leads dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatCurrency = (amt?: number) =>
    amt ? `₹${amt.toLocaleString("en-IN")}` : "—";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8542A]/10 text-[#E8542A] border border-[#E8542A]/20">
              <Flame size={12} />
              CRM Command Center
            </span>
            <span className="text-xs text-muted">
              Live donor engagement & recovery
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-display">
            Leads & Follow-up Dashboard
          </h1>
          <p className="text-sm text-muted mt-1">
            Track unpaid donors, failed transactions, scheduled callbacks, and conversion pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-panel border border-border text-muted hover:text-text-primary hover:bg-panel/80 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <Link
            href="/dashboard/leads/all"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#E8542A] hover:bg-[#c9431d] text-white shadow-md shadow-orange-500/20 transition-all"
          >
            <Users size={15} />
            <span>Open Lead Pipeline</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <Link
          href="/dashboard/leads/all?tab=all"
          className="bg-panel border border-border rounded-2xl p-5 shadow-sm hover:border-[#E8542A] hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-text-primary transition-colors">
              Total Inquiries & Leads
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">
              {stats?.total ?? 0}
            </span>
            <span className="text-xs text-muted font-medium">all time</span>
          </div>
          <p className="text-[11.5px] text-muted mt-2 flex items-center gap-1">
            <span className="text-sky-500 font-semibold">{stats?.newLeads ?? 0} new</span> awaiting initial contact
          </p>
        </Link>

        {/* Unpaid Donors (Form Filled) */}
        <Link
          href="/dashboard/leads/all?tab=unpaid"
          className="bg-panel border border-amber-500/30 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-500 hover:shadow-md transition-all block"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Unpaid Donors (Pending)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">
              {stats?.unpaidDonors ?? 0}
            </span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
              High intent
            </span>
          </div>
          <p className="text-[11.5px] text-muted mt-2">
            Filled campaign form but exited before completing payment
          </p>
        </Link>

        {/* Payment Failures */}
        <Link
          href="/dashboard/leads/all?tab=failed"
          className="bg-panel border border-rose-500/30 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-rose-500 hover:shadow-md transition-all block"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">
              Payment Failures
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">
              {stats?.paymentFailed ?? 0}
            </span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
              Recoverable
            </span>
          </div>
          <p className="text-[11.5px] text-muted mt-2">
            Checkout failed or gateway dropped during donation
          </p>
        </Link>

        {/* Converted Donors */}
        <Link
          href="/dashboard/leads/all?tab=paid"
          className="bg-panel border border-emerald-500/30 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-emerald-500 hover:shadow-md transition-all block"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
              Converted & Paid
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">
              {stats?.converted ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Success
            </span>
          </div>
          <p className="text-[11.5px] text-muted mt-2">
            Leads successfully turned into contributing donors
          </p>
        </Link>
      </div>

      {/* ── Follow-up Alert Banner ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Due Today */}
        <div className="bg-gradient-to-r from-blue-500/10 via-panel to-panel border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
              <PhoneCall size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                Action Required Today
              </p>
              <h3 className="text-lg font-bold text-text-primary">
                {stats?.followUpsDueToday ?? 0} Follow-ups Due Today
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Scheduled donor callbacks & payment assistance requests
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/leads/followups?tab=due_today"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shrink-0 shadow-sm"
          >
            <span>Call Now</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Overdue */}
        <div className="bg-gradient-to-r from-amber-500/10 via-panel to-panel border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Attention Needed
              </p>
              <h3 className="text-lg font-bold text-text-primary">
                {stats?.followUpsOverdue ?? 0} Overdue Follow-ups
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Callbacks pending past scheduled date & time
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/leads/followups?tab=overdue"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 shadow-sm"
          >
            <span>Review Tasks</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Priority Follow-ups Today ───────────────────────────────── */}
      <div className="bg-panel border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <PhoneCall size={18} className="text-[#E8542A]" />
              Priority Call Queue (Scheduled For Today)
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Contact prospective donors who requested callbacks or need payment help
            </p>
          </div>
          <Link
            href="/dashboard/leads/followups"
            className="text-xs font-bold text-[#E8542A] hover:underline flex items-center gap-1"
          >
            <span>View all follow-up tasks</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {priorityLeads.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-border rounded-xl">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2 opacity-80" />
            <p className="text-sm font-semibold text-text-primary">
              All caught up! No scheduled calls due right now.
            </p>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              Check the All Leads pipeline to review fresh unpaid donors and schedule new follow-ups.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {priorityLeads.map((lead) => (
              <div
                key={lead._id}
                className="p-4 rounded-xl border border-border bg-panel/70 hover:border-[#E8542A]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold text-sm text-text-primary leading-tight">
                        {lead.name}
                      </h4>
                      <p className="text-xs text-muted mt-0.5">{lead.email}</p>
                    </div>
                    {lead.amount ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg shrink-0">
                        ₹{lead.amount.toLocaleString("en-IN")}
                      </span>
                    ) : null}
                  </div>

                  {lead.campaign?.name && (
                    <p className="text-[11px] font-medium text-[#E8542A] truncate mb-2">
                      Campaign: {lead.campaign.name}
                    </p>
                  )}

                  {lead.latestFollowUp && (
                    <div className="text-[11.5px] bg-background/80 p-2.5 rounded-lg border border-border/60 mb-3">
                      <p className="font-semibold text-text-primary">
                        {lead.latestFollowUp.disposition}
                      </p>
                      {lead.latestFollowUp.notes && (
                        <p className="text-muted mt-0.5 line-clamp-2 italic">
                          &ldquo;{lead.latestFollowUp.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                  {lead.phone && (
                    <>
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                      >
                        <Phone size={13} />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Namaste ${lead.name}, this is from Seva Foundation regarding your donation.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </a>
                    </>
                  )}
                  <Link
                    href={`/dashboard/leads/all?id=${lead._id}`}
                    className="p-2 rounded-lg bg-panel border border-border text-muted hover:text-text-primary hover:bg-panel/80 transition-colors"
                    title="View Lead Details"
                  >
                    <ExternalLink size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recent Inquiries & Conversion Pipeline ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries */}
        <div className="lg:col-span-2 bg-panel border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Latest Captured Leads & Donors
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Recent submissions from campaign pages, newsletter, and checkout
              </p>
            </div>
            <Link
              href="/dashboard/leads/all"
              className="text-xs font-bold text-[#E8542A] hover:underline"
            >
              See all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Lead Name</th>
                  <th className="py-2.5 px-3">Source & Stage</th>
                  <th className="py-2.5 px-3">Campaign / Amount</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentLeads.map((l) => (
                  <tr key={l._id} className="hover:bg-panel/50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-text-primary">{l.name}</p>
                      <p className="text-[11px] text-muted">{l.email}</p>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-panel border border-border text-text-primary">
                          {l.source === "DONOR_DROP"
                            ? "Unpaid Donor"
                            : l.source === "PAYMENT_FAILED"
                            ? "Failed Payment"
                            : l.source === "SUBSCRIBER"
                            ? "Subscriber"
                            : l.source}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-md ${
                            l.paymentStatus === "PAID" || l.status === "CONVERTED"
                              ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                              : l.paymentStatus === "FAILED"
                              ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                              : "text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                          }`}
                        >
                          {l.paymentStatus || l.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-text-primary truncate max-w-[140px]">
                        {l.campaign?.name || "General"}
                      </p>
                      <p className="text-[11px] font-bold text-emerald-600">
                        {formatCurrency(l.amount)}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-muted">
                      {new Date(l.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/dashboard/leads/all?id=${l._id}`}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-panel border border-border text-text-primary hover:border-[#E8542A] transition-colors"
                      >
                        Follow up
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Nav / Funnel Health */}
        <div className="space-y-4">
          <div className="bg-panel border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-1">
              Donor Recovery Workflow
            </h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Standard operating procedure for prospective donors who filled the campaign checkout:
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/60">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <p className="font-semibold text-text-primary">15-Min WhatsApp Prompt</p>
                  <p className="text-muted text-[11px] mt-0.5">
                    Send friendly payment link reminder if form was abandoned.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/60">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <p className="font-semibold text-text-primary">Direct Assistance Call</p>
                  <p className="text-muted text-[11px] mt-0.5">
                    For high amounts (&gt;₹2,000), call to assist with NetBanking/UPI.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/60">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <p className="font-semibold text-text-primary">Record Disposition</p>
                  <p className="text-muted text-[11px] mt-0.5">
                    Select follow-up config & add custom notes to track history.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border/60">
              <Link
                href="/dashboard/leads/configs"
                className="flex items-center justify-between text-xs font-bold text-[#E8542A] hover:underline"
              >
                <span>Customize Follow-up Dispositions</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
