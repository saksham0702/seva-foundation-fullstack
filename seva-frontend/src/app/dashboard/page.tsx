"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  Megaphone,
  Users,
  Heart,
  Calendar,
  ChevronRight,
  Plus,
  ArrowUpRight,
  FileText,
  Globe,
  ShieldCheck,
  TrendingUp,
  Layers,
  Award,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { cn } from "@/lib/utils";
import { getCampaigns, Campaign } from "@/app/api/campaign";
import { getDonations, Donation } from "@/app/api/donation";
import { getDonors, Donor } from "@/app/api/donor";
import { getVolunteerApplications } from "@/app/api/volunteer";
import { authAPI } from "@/app/api/auth";
import { getCmsPageBySlug } from "@/app/api/cms";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function SevaCommandCenter() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // ── Real Dynamic Backend States ──
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [volunteersCount, setVolunteersCount] = useState<number>(0);
  const [initiativesCount, setInitiativesCount] = useState<number>(7);

  // Fetch all live backend data concurrently
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);

        const [
          campaignsRes,
          donationsRes,
          donorsRes,
          volunteersRes,
          usersRes,
          cmsRes,
        ] = await Promise.allSettled([
          getCampaigns(),
          getDonations(),
          getDonors(),
          getVolunteerApplications(),
          authAPI.getUsers(),
          getCmsPageBySlug("our-work"),
        ]);

        if (!active) return;

        if (
          campaignsRes.status === "fulfilled" &&
          Array.isArray(campaignsRes.value)
        ) {
          setCampaigns(campaignsRes.value);
        }

        if (
          donationsRes.status === "fulfilled" &&
          Array.isArray(donationsRes.value)
        ) {
          setDonations(donationsRes.value);
        }

        if (
          donorsRes.status === "fulfilled" &&
          Array.isArray(donorsRes.value)
        ) {
          setDonors(donorsRes.value);
        }

        if (
          volunteersRes.status === "fulfilled" &&
          Array.isArray(volunteersRes.value)
        ) {
          setVolunteersCount(volunteersRes.value.length);
        }

        if (usersRes.status === "fulfilled") {
          const uData = usersRes.value?.data || usersRes.value;
          if (Array.isArray(uData)) setUsersCount(uData.length);
          else if (uData?.users && Array.isArray(uData.users))
            setUsersCount(uData.users.length);
        }

        if (cmsRes.status === "fulfilled" && cmsRes.value?.sections) {
          setInitiativesCount(cmsRes.value.sections.length);
        }
      } catch (err) {
        console.error("Dashboard backend load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // ── Derived Dynamic Metrics ──
  const statsSummary = useMemo(() => {
    const paidDonations = donations.filter(
      (d) => d.paymentStatus === "SUCCESS"
    );
    const totalDonationsAmount = paidDonations.reduce(
      (sum, d) => sum + (d.amount || 0),
      0
    );

    const activeCampaigns = campaigns.filter(
      (c) => (c as any).status === "ACTIVE" || !(c as any).isDeleted
    );

    const monthlyPledges = donations.filter(
      (d) => d.frequency === "MONTHLY"
    ).length;

    const initiativeDonations = donations.filter(
      (d) => d.initiative || d.targetType === "INITIATIVE"
    );
    const initiativeRaised = initiativeDonations
      .filter((d) => d.paymentStatus === "SUCCESS")
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const campaignDonations = donations.filter(
      (d) => !d.initiative && d.targetType !== "INITIATIVE"
    );
    const campaignRaised = campaignDonations
      .filter((d) => d.paymentStatus === "SUCCESS")
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    return {
      totalDonationsAmount,
      totalDonationsCount: paidDonations.length,
      activeCampaignsCount: activeCampaigns.length,
      totalCampaignsCount: campaigns.length,
      totalDonorsCount: donors.length,
      monthlyPledges,
      initiativeDonationsCount: initiativeDonations.length,
      initiativeRaised,
      campaignRaised,
    };
  }, [donations, campaigns, donors]);

  // ── Dynamic Monthly Aggregation for Chart ──
  const monthlyChartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthlyTotals = new Array(12).fill(0);

    donations.forEach((d) => {
      if (d.paymentStatus === "SUCCESS" && d.createdAt) {
        const dDate = new Date(d.createdAt);
        if (dDate.getFullYear() === currentYear) {
          const mIndex = dDate.getMonth();
          monthlyTotals[mIndex] += d.amount || 0;
        }
      }
    });

    return monthlyTotals;
  }, [donations]);

  // ── Build / Update Chart.js Instance ──
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const currentMonthIndex = new Date().getMonth();

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: MONTH_NAMES,
        datasets: [
          {
            label: "Donations (₹)",
            data: monthlyChartData,
            backgroundColor: (ctx) =>
              ctx.dataIndex === currentMonthIndex
                ? "#D4A843"
                : "rgba(255,255,255,0.08)",
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0d1424",
            borderColor: "rgba(255,255,255,0.12)",
            borderWidth: 1,
            padding: 10,
            titleColor: "#fff",
            bodyColor: "#D4A843",
            callbacks: {
              label: (ctx) =>
                " ₹" + (ctx.parsed.y ?? 0).toLocaleString("en-IN"),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "rgba(255,255,255,0.45)", font: { size: 11 } },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.06)" },
            ticks: {
              color: "rgba(255,255,255,0.45)",
              font: { size: 11 },
              callback: (v) => "₹" + Number(v).toLocaleString("en-IN"),
            },
          },
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [monthlyChartData]);

  // Quick navigation items
  const QUICK_LINKS = [
    {
      title: "New Campaign",
      description: "Launch fundraiser with goal & products",
      href: "/dashboard/campaigns/create-campaign",
      icon: Plus,
      color: "bg-[#2F54EB]/10 text-blue-accent border-blue-500/20",
    },
    {
      title: "Donor Vault",
      description: "Manage donor records & history",
      href: "/dashboard/donors",
      icon: Wallet,
      color: "bg-gold/10 text-gold border-gold/20",
    },
    {
      title: "Initiative Donations",
      description: "Track direct grassroots donations",
      href: "/dashboard/donors/initiatives",
      icon: Heart,
      color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
    {
      title: "Website CMS",
      description: "Update our work, story & media",
      href: "/dashboard/cms",
      icon: Globe,
      color: "bg-purple-dark/20 text-purple-accent border-purple-500/20",
    },
    {
      title: "Volunteer Team",
      description: "Review volunteer applications",
      href: "/dashboard/volunteers",
      icon: Users,
      color: "bg-emerald-dark/20 text-emerald-accent border-emerald-500/20",
    },
    {
      title: "Tax Exemption (80G)",
      description: "80G receipts and certificates",
      href: "/dashboard/tax",
      icon: ShieldCheck,
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      title: "Media & Blogs",
      description: "Publish news, events & stories",
      href: "/dashboard/blogs",
      icon: FileText,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      title: "Team & Roles",
      description: "Manage admin users & permissions",
      href: "/dashboard/users",
      icon: Layers,
      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
  ];

  // Top metric cards
  const STATS_CARDS = [
    {
      label: "Total Donations",
      value: `₹${statsSummary.totalDonationsAmount.toLocaleString("en-IN")}`,
      caption: `${statsSummary.totalDonationsCount} contributions received`,
      icon: Wallet,
      color: "text-emerald-accent",
      chip: "bg-emerald-dark/20 text-emerald-accent border-emerald-500/20",
    },
    {
      label: "Running Campaigns",
      value: String(statsSummary.activeCampaignsCount),
      caption: `${statsSummary.totalCampaignsCount} total campaigns`,
      icon: Megaphone,
      color: "text-blue-accent",
      chip: "bg-blue-dark/20 text-blue-accent border-blue-500/20",
    },
    {
      label: "Total Donors",
      value: String(statsSummary.totalDonorsCount || donors.length),
      caption: `${statsSummary.monthlyPledges} monthly recurring supporters`,
      icon: Users,
      color: "text-gold",
      chip: "bg-gold/20 text-gold border-gold/30",
    },
    {
      label: "Initiative Vault",
      value: `₹${statsSummary.initiativeRaised.toLocaleString("en-IN")}`,
      caption: `${statsSummary.initiativeDonationsCount} initiative contributions`,
      icon: Heart,
      color: "text-rose-400",
      chip: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
    {
      label: "Volunteers & Team",
      value: String(volunteersCount + usersCount),
      caption: `${volunteersCount} volunteers • ${usersCount} staff`,
      icon: Award,
      color: "text-purple-accent",
      chip: "bg-purple-dark/20 text-purple-accent border-purple-500/20",
    },
    {
      label: "Core Initiatives",
      value: String(initiativesCount),
      caption: "Grassroots sectors live on website",
      icon: Globe,
      color: "text-cyan-400",
      chip: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
  ];

  // Recent 5 donations
  const recentDonations = useMemo(() => {
    return donations.slice(0, 5);
  }, [donations]);

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════
          HERO BANNER — SEVA INDIA FOUNDATION
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-3xl px-8 py-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-dark/20 text-emerald-accent text-[11px] font-semibold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent animate-pulse" />
                LIVE DATABASE CONNECTED
              </span>
              <span className="text-[11px] text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                FY {new Date().getFullYear()} Active Records
              </span>
            </div>

            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                <span className="text-white">SEVA INDIA FOUNDATION </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-accent via-purple-accent to-gold">
                  COMMAND CENTER
                </span>
              </h1>
              <p className="text-xs text-white/50 mt-2 max-w-2xl leading-relaxed">
                Complete overview of funds received, running campaigns, verified donors, and grassroots initiatives.
              </p>
            </div>
          </div>

          {/* Executive Header CTA Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
            <Link
              href="/dashboard/campaigns/create-campaign"
              className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-blue-500/25 border border-blue-400/20"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>Launch Campaign</span>
            </Link>

            <Link
              href="/dashboard/donors"
              className="inline-flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Donor Records</span>
            </Link>

            <Link
              href="/dashboard/donors/initiatives"
              className="inline-flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Initiative Logs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          FINANCIAL & OPERATIONAL SUMMARY (HOW MUCH WE GOT)
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STATS_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.06] transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={cn("p-1.5 rounded-lg border", card.chip)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {card.value}
                </p>
                <p className="text-[11px] text-white/40 mt-1 leading-snug truncate">
                  {card.caption}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          VISUAL DATA SECTION — Monthly Trends Graph + Campaigns Showcase
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Donation Trends Chart */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold" />
                <p className="text-base font-semibold text-white">Donation Trends</p>
              </div>
              <p className="text-xs text-white/40 mt-1">
                Monthly collection breakdown from backend payment records (₹)
              </p>
            </div>
            <span className="text-xs font-semibold bg-gold/10 text-gold px-3 py-1 rounded-full border border-gold/20">
              {new Date().getFullYear()} Collections
            </span>
          </div>

          <div className="relative h-64">
            <canvas ref={chartRef} aria-label="Monthly donation trends bar chart" />
          </div>
        </div>

        {/* Dynamic Running Campaigns Showcase */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-accent" />
                  <p className="text-base font-semibold text-white">Running Campaigns</p>
                </div>
                <p className="text-xs text-white/40 mt-1">
                  Active fundraising campaigns with real-time target progress
                </p>
              </div>
              <Link
                href="/dashboard/campaigns"
                className="text-xs font-semibold text-blue-accent hover:underline inline-flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-xs">
                  No campaigns created yet.{" "}
                  <Link
                    href="/dashboard/campaigns/create-campaign"
                    className="text-blue-accent hover:underline font-bold"
                  >
                    Create a campaign now
                  </Link>
                </div>
              ) : (
                campaigns.slice(0, 4).map((c) => {
                  const goal = c.goal || 100000;
                  const raised = c.raisedAmount || 0;
                  const pct = Math.min(100, Math.round((raised / goal) * 100));

                  return (
                    <div
                      key={c._id}
                      className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 hover:bg-white/[0.05] transition-all group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-blue-accent transition-colors">
                          {c.name}
                        </p>
                        <span className="text-[11px] font-bold text-white/80 whitespace-nowrap">
                          ₹{raised.toLocaleString("en-IN")}{" "}
                          <span className="text-white/40 font-normal">
                            / ₹{goal.toLocaleString("en-IN")}
                          </span>
                        </span>
                      </div>

                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-blue-accent to-purple-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center mt-2 text-[10px] text-white/40">
                        <span>{pct}% funded</span>
                        <span className="text-emerald-accent font-medium">Active</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
            <span>Total Raised from Campaigns:</span>
            <strong className="text-white font-bold">
              ₹{statsSummary.campaignRaised.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          RECENT COLLECTIONS TABLE (SHOW HOW MUCH WE GOT)
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-accent" />
              <p className="text-base font-semibold text-white">Recent Collections Received</p>
            </div>
            <p className="text-xs text-white/40 mt-1">
              Live contributions recorded in database across campaigns and core initiatives
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/dashboard/donors"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 transition-all inline-flex items-center gap-1.5"
            >
              <span>Donor Vault</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard/donors/initiatives"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 transition-all inline-flex items-center gap-1.5"
            >
              <span>Initiatives Log</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {recentDonations.length === 0 ? (
          <div className="py-12 text-center text-white/40 text-xs">
            No donations recorded yet in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-[11px] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Donor</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Target / Purpose</th>
                  <th className="pb-3 font-semibold">Frequency</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentDonations.map((d) => {
                  const donorName =
                    typeof d.donor === "object" && d.donor
                      ? (d.donor as any).name
                      : (d as any).donorName || "Supporter";
                  const purpose =
                    d.initiative ||
                    (typeof d.campaign === "object" && d.campaign
                      ? (d.campaign as any).name
                      : "Direct Contribution");

                  return (
                    <tr key={d._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-medium text-white">
                        {donorName}
                      </td>
                      <td className="py-3 font-bold text-emerald-accent">
                        ₹{(d.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 text-white/70 max-w-[200px] truncate">
                        {purpose}
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                            d.frequency === "MONTHLY"
                              ? "bg-purple-dark/30 text-purple-accent border border-purple-500/20"
                              : "bg-white/5 text-white/60 border border-white/10"
                          )}
                        >
                          {d.frequency || "ONE TIME"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-accent bg-emerald-dark/20 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          SUCCESS
                        </span>
                      </td>
                      <td className="py-3 text-right text-white/40 text-[11px]">
                        {d.createdAt
                          ? new Date(d.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Recently"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ESSENTIAL QUICK LINKS (DIRECT PORTALS)
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gold" />
            <p className="text-base font-semibold text-white">Quick Portals & Navigation</p>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Fast access to key operational sections of Seva India Foundation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                href={link.href}
                className="bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] rounded-2xl p-4 transition-all duration-200 group flex items-start justify-between"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border",
                      link.color
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-gold transition-colors">
                      {link.title}
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5 leading-snug">
                      {link.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}