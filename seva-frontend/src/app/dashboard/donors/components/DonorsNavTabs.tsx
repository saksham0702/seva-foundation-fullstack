"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Target, Heart, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    label: "Campaign Donors",
    href: "/dashboard/donors",
    icon: Target,
    exact: true,
  },
  {
    label: "Initiative Donors",
    href: "/dashboard/donors/initiatives",
    icon: Heart,
    exact: false,
  },
  {
    label: "Payment Transactions",
    href: "/dashboard/donors/payments",
    icon: Receipt,
    exact: false,
  },
];

export function DonorsNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(tab.href + "/");
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold tracking-tight transition-all whitespace-nowrap",
              isActive
                ? "border-black text-black font-bold"
                : "border-transparent text-slate-500 hover:text-black hover:border-slate-300"
            )}
          >
            <Icon size={15} className={isActive ? "text-black" : "text-slate-400"} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
