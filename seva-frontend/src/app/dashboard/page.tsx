"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Download, 
  Droplets, 
  School, 
  Heart, 
  Home, 
  Leaf, 
  Wallet, 
  Megaphone, 
  Users, 
  TrendingUp,
  BrainCircuit,
  AlertTriangle,
  FileText,
  Radio,
  ShieldAlert,
  Plus,
  MapPin,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

// ── Stats Data (from client screenshot) ──
const STATS = [
  { label: "Total Donations", value: "₹0", delta: "+12%", period: "vs last month", icon: Wallet, chip: "bg-emerald-dark/20 text-emerald-accent", trend: "up" },
  { label: "Open Campaigns", value: "0", delta: "+1", period: "this week", icon: Megaphone, chip: "bg-emerald-dark/20 text-emerald-accent", trend: "up" },
  { label: "Pending Tasks", value: "0", delta: "-2", period: "vs yesterday", icon: ClipboardList, chip: "bg-emerald-dark/20 text-emerald-accent", trend: "down" },
  { label: "Beneficiaries Served", value: "0", delta: "+8%", period: "this month", icon: Heart, chip: "bg-emerald-dark/20 text-emerald-accent", trend: "up" },
  { label: "Active Volunteers", value: "0", delta: "+15%", period: "this week", icon: Users, chip: "bg-emerald-dark/20 text-emerald-accent", trend: "up" },
  { label: "Pending Approvals", value: "14", delta: "Urgent", period: "requires action", icon: ShieldAlert, chip: "bg-red-500/10 text-red-400", trend: "urgent" },
];

// ── Campaigns Data ──
const CAMPAIGNS = [
  { name: "Clean Water Drive", amount: "₹82,000", pct: 82, icon: Droplets, chip: "bg-blue-light/10", color: "text-blue-accent", bar: "bg-blue-dark" },
  { name: "Education for All", amount: "₹1,34,000", pct: 67, icon: School, chip: "bg-emerald-dark/10", color: "text-emerald-accent", bar: "bg-emerald-dark" },
  { name: "Health & Wellness", amount: "₹54,000", pct: 54, icon: Heart, chip: "bg-purple-dark/10", color: "text-purple-accent", bar: "bg-purple-dark" },
  { name: "Shelter & Housing", amount: "₹39,500", pct: 39, icon: Home, chip: "bg-orange-dark/10", color: "text-orange-accent", bar: "bg-orange-dark" },
  { name: "Green India", amount: "₹91,200", pct: 91, icon: Leaf, chip: "bg-coral-dark/10", color: "text-coral-accent", bar: "bg-coral-dark" },
];

// ── Sparkline SVG component (mini chart) ──
function Sparkline({ trend }: { trend: string }) {
  const paths = {
    up: "M2 14 L6 10 L10 12 L14 6 L18 8 L22 2",
    down: "M2 6 L6 10 L10 8 L14 14 L18 12 L22 18",
    urgent: "M2 10 L6 14 L10 8 L14 12 L18 6 L22 10",
  };
  const colors = {
    up: "stroke-emerald-accent",
    down: "stroke-red-400",
    urgent: "stroke-red-400",
  };
  
  return (
    <svg className="w-16 h-8" viewBox="0 0 24 20" fill="none">
      <path d={paths[trend as keyof typeof paths] || paths.up} className={cn("stroke-2", colors[trend as keyof typeof colors])} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── AI Priority Item ──
function PriorityItem({ color, text }: { color: string; text: string }) {
  const colors: Record<string, string> = {
    red: "bg-red-400",
    green: "bg-emerald-accent",
    yellow: "bg-gold",
    purple: "bg-purple-accent",
  };
  
  return (
    <div className="flex items-start gap-2">
      <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", colors[color] || colors.green)} />
      <p className="text-xs text-white/70 leading-relaxed">{text}</p>
    </div>
  );
}

// ── Map Pin Component ──
function MapLocation({ name, color, top, left }: { name: string; color: string; top: string; left: string }) {
  return (
    <div className="absolute" style={{ top, left }}>
      <div className="relative group cursor-pointer">
        <div className={cn("w-3 h-3 rounded-full animate-pulse", color)} />
        <div className={cn("absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-30", color)} />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-navy border border-white/10 rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <span className="text-[10px] text-white/80">{name}</span>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

export default function CommandCenter() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [liveUsers] = useState(87);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"],
        datasets: [{
          label: "Donations (₹)",
          data: [28000, 34000, 31000, 52000, 44000, 67000, 55000, 82000, 71000, 88000],
          backgroundColor: (ctx) =>
            ctx.dataIndex === 9 ? "#D4A843" : "rgba(255,255,255,0.08)",
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0d1424",
            borderColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,
            padding: 10,
            titleColor: "#fff",
            bodyColor: "#D4A843",
            callbacks: {
              label: (ctx) => " ₹" + (ctx.parsed.y ?? 0).toLocaleString("en-IN"),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "rgba(255,255,255,0.35)", font: { size: 11 } },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.06)" },
            ticks: {
              color: "rgba(255,255,255,0.35)",
              font: { size: 11 },
              callback: (v) => "₹" + Number(v) / 1000 + "k",
            },
          },
        },
      },
    });
    return () => chartInstance.current?.destroy();
  }, []);

  return (
    <div className="space-y-6">

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION — Nexus Command Center (from client design)
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-3xl px-8 py-8">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-4">
            {/* Status badges */}
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-dark/20 text-emerald-accent text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent animate-pulse" />
                OPERATIONAL
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/50">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-accent" />
                AI COPILOT ACTIVE
              </span>
              <span className="text-[11px] text-white/50">
                LIVE USERS: <span className="text-white font-bold">{liveUsers}</span>
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="font-serif text-5xl font-bold tracking-tight">
                <span className="text-white">NEXUS </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-accent via-purple-accent to-gold">
                  COMMAND CENTER
                </span>
              </h1>
              <p className="text-xs text-white/40 mt-3 max-w-lg leading-relaxed uppercase tracking-wider">
                Enterprise NGO Operations & AI Decision Engine. Everything happening across your organization in real-time.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 bg-blue-dark hover:bg-blue-light text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-dark/20">
                <BrainCircuit className="w-4 h-4" />
                LAUNCH AI COPILOT
              </button>
              <button className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
                <AlertTriangle className="w-4 h-4" />
                EMERGENCY MODE
              </button>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-xs font-medium transition-all">
                EXEC REPORT
              </button>
              <button className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-xs font-medium transition-all">
                BROADCAST
              </button>
              <button className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-xs font-medium transition-all">
                CRISIS CENTER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STATS ROW (from client design — 6 cards with sparklines)
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.05] transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{s.label}</p>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", s.chip)}>
                  {s.delta}
                </span>
              </div>
              <p className="text-2xl font-bold text-white leading-none">{s.value}</p>
              <div className="mt-3 flex items-end justify-between">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mr-3">
                  <div 
                    className={cn("h-full rounded-full transition-all", 
                      s.trend === "urgent" ? "bg-red-400" : "bg-blue-accent"
                    )} 
                    style={{ width: s.trend === "urgent" ? "70%" : "60%" }} 
                  />
                </div>
                <Sparkline trend={s.trend} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT GRID — AI Brief + Operations Map
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── AI Executive Brief (left, 2 cols) ── */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BrainCircuit className="w-5 h-5 text-purple-accent" />
            <h2 className="font-serif text-lg font-bold text-white">AI EXECUTIVE BRIEF</h2>
          </div>

          {/* Priority Analysis */}
          <div className="bg-purple-dark/10 border border-purple-accent/20 rounded-2xl p-4 mb-4">
            <p className="text-[11px] font-bold text-purple-accent uppercase tracking-wider mb-3">Priority Analysis</p>
            <div className="space-y-2.5">
              <PriorityItem color="red" text="Donation velocity dropped by 8% today." />
              <PriorityItem color="green" text="Volunteer registrations increased 16%." />
              <PriorityItem color="yellow" text="2 compliance documents expire in 9 days." />
              <PriorityItem color="purple" text="Medical inventory (Antibiotics) critical in 3 days." />
            </div>
          </div>

          {/* Recommended Actions */}
          <div>
            <p className="text-[11px] font-bold text-blue-accent uppercase tracking-wider mb-3">Recommended Actions</p>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-gold" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-white">Start emergency medicine fundraiser</p>
                    <p className="text-[10px] text-white/40">Critical priority • 3 days remaining</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* ── National Operations Map (right, 3 cols) ── */}
        <div className="lg:col-span-3 bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-accent" />
              <div>
                <h2 className="font-serif text-lg font-bold text-white">NATIONAL OPERATIONS</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Live Deployment Map</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-white/[0.06] text-white/60 text-[11px] font-medium">PROJECTS</span>
              <span className="px-3 py-1 rounded-full bg-blue-dark/20 text-blue-accent text-[11px] font-medium">MEDICAL CAMPS</span>
            </div>
          </div>

          {/* Map Visualization */}
          <div className="relative h-64 bg-navy-100 rounded-2xl border border-white/5 overflow-hidden">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-20" 
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* India outline approximation (simplified) */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 400">
              <path 
                d="M180 80 L200 70 L220 75 L240 90 L250 110 L245 130 L255 150 L260 170 L250 190 L240 210 L235 230 L240 250 L230 270 L220 290 L210 310 L200 320 L190 310 L180 290 L170 270 L160 250 L155 230 L150 210 L145 190 L140 170 L145 150 L150 130 L155 110 L160 90 L170 85 Z" 
                fill="rgba(255,255,255,0.05)" 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth="1"
              />
            </svg>

            {/* Location pins */}
            <MapLocation name="Dehradun" color="bg-blue-accent" top="25%" left="35%" />
            <MapLocation name="DELHI HQ" color="bg-red-400" top="30%" left="42%" />
            <MapLocation name="Odisha Relief" color="bg-emerald-accent" top="65%" left="75%" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM ROW — Donation Trends + Campaign Performance
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donation Trends */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-sm font-semibold text-white">Donation Trends</p>
              <p className="text-[11px] text-white/40 mt-0.5">Monthly collection (₹)</p>
            </div>
            <span className="text-xs font-medium bg-gold/10 text-gold px-3 py-1 rounded-full">2026</span>
          </div>
          <div className="relative h-48">
            <canvas ref={chartRef} aria-label="Bar chart of monthly donation trends" />
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-sm font-semibold text-white">Campaign Performance</p>
              <p className="text-[11px] text-white/40 mt-0.5">Top active campaigns</p>
            </div>
            <span className="text-xs font-medium bg-emerald-dark/20 text-emerald-accent px-3 py-1 rounded-full">Live</span>
          </div>
          <div className="space-y-4">
            {CAMPAIGNS.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.name} className="flex items-center gap-3 group">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", c.chip, c.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{c.name}</p>
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", c.bar)}
                        style={{ width: `${c.pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-white">{c.amount}</p>
                    <p className="text-[10px] text-white/30">{c.pct}% of goal</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-dark hover:bg-blue-light text-white flex items-center justify-center shadow-lg shadow-blue-dark/30 hover:scale-110 transition-all duration-300 z-50">
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}