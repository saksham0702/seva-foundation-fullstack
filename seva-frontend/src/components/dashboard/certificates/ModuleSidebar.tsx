"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  LayoutTemplate,
  Award,
  ScanSearch,
  Layers,
  History,
  PenLine,
  Mail,
  PieChart,
  Settings,
} from "lucide-react";

const items = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/certificates/dashboard" },
  { icon: FileText, label: "Manage Certificates", href: "/dashboard/certificates/manage" },
  { icon: FilePlus2, label: "Generate Certificate", href: "/dashboard/certificates/generate" },
  { icon: LayoutTemplate, label: "Certificate Builder", href: "/dashboard/certificates/builder" },
  { icon: Award, label: "Certificate Templates", href: "/dashboard/certificates/templates" },
  { icon: ScanSearch, label: "Verification Registry", href: "/dashboard/certificates/verification-registry" },
  { icon: Layers, label: "Bulk Generator", href: "/dashboard/certificates/bulk-generator" },
  { icon: History, label: "Certificate Requests", href: "/dashboard/certificates/requests" },
  { icon: PenLine, label: "Digital Signatures", href: "/dashboard/certificates/digital-signatures" },
  { icon: Mail, label: "Email & WhatsApp", href: "/dashboard/certificates/email-whatsapp" },
  { icon: PieChart, label: "Reports & Analytics", href: "/dashboard/certificates/reports-analytics" },
  { icon: Settings, label: "Certificate Settings", href: "/dashboard/certificates/settings" },
];

export default function ModuleSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] shrink-0 h-screen bg-panel/40 border-r border-border py-6 px-4 overflow-y-auto scrollbar-thin">
      <div className="mb-5 px-2">
        <p className="font-display text-xl font-bold leading-tight">
          Certificates
          <br />
          ECMS
        </p>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                active
                  ? "bg-blueaccent text-white shadow-md shadow-blueaccent/20"
                  : "text-muted hover:bg-panel hover:text-text-primary"
              }`}
            >
              <item.icon size={16} strokeWidth={2} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
