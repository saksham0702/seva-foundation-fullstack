"use client";

import {
  LayoutGrid,
  MessageSquare,
  CheckSquare,
  Calendar,
  User,
  Box,
  Heart,
  Repeat,
  Building2,
  Landmark,
  Award,
  ShieldCheck,
} from "lucide-react";

const coreOps = [
  { icon: LayoutGrid, label: "Command Center" },
  { icon: MessageSquare, label: "Enterprise CRM" },
  { icon: CheckSquare, label: "Operations & Task Management" },
  { icon: Calendar, label: "Workforce Management" },
  { icon: User, label: "Beneficiaries" },
  { icon: Box, label: "Inventory & Warehouse Management" },
];

const donationsFinance = [
  { icon: Heart, label: "Donor Vault" },
  { icon: Repeat, label: "Procurement & Ledger ERP" },
  { icon: Building2, label: "Vendor Relationship Management" },
  { icon: Landmark, label: "Tax & Compliance Center" },
  { icon: Repeat, label: "NGO Finance ERP" },
  { icon: Award, label: "Certificates & CRM", active: true },
  { icon: ShieldCheck, label: "Financial Audit & Compliance Center" },
];

export default function OuterSidebar() {
  return (
    <aside className="w-[240px] shrink-0 h-screen bg-bg border-r border-border flex flex-col py-6 px-4 overflow-y-auto scrollbar-thin">
      <div className="mb-8 px-2">
        <h1 className="font-display text-lg font-bold tracking-wide">SEVA CONSOLE</h1>
        <p className="label-eyebrow text-gold mt-0.5">System Node v2.0.5</p>
      </div>

      <p className="label-eyebrow px-2 mb-2">Core Operations</p>
      <nav className="flex flex-col gap-0.5 mb-6">
        {coreOps.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>

      <p className="label-eyebrow px-2 mb-2">Donations & Finance</p>
      <nav className="flex flex-col gap-0.5">
        {donationsFinance.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>
    </aside>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
        active
          ? "bg-gold text-bg font-semibold"
          : "text-muted hover:bg-panel hover:text-text-primary"
      }`}
    >
      <Icon size={16} strokeWidth={2} className="shrink-0" />
      <span className="leading-tight">{label}</span>
      {active && <span className="ml-auto">›</span>}
    </button>
  );
}
