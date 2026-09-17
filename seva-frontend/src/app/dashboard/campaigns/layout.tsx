"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ClipboardList, PlusCircle, FolderTree } from "lucide-react";

const menuItems = [
  {
    label: "Campaign List",
    href: "/dashboard/campaigns",
    icon: ClipboardList,
  },
  {
    label: "Create Campaign",
    href: "/dashboard/campaigns/create-campaign",
    icon: PlusCircle,
  },
  {
    label: "Categories & Products",
    href: "/dashboard/campaigns/category",
    icon: FolderTree,
  },
];

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6">
      {/* Nested sidebar — flush, full height, no gap, no card wrapper */}
      <aside className="w-60 shrink-0 h-full bg-panel/40 border-r border-border py-6 px-4 overflow-y-auto">
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-3 mb-3">
          Campaign Console
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blueaccent text-white shadow-md shadow-blueaccent/20 font-bold"
                    : "text-muted hover:bg-panel hover:text-text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content sits flush against sidebar, scrolls independently */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}