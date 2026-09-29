"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function DashboardMain({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCms = pathname === "/dashboard/cms" || pathname?.startsWith("/dashboard/cms");

  return (
    <main
      className={`flex-1 overflow-auto bg-navy relative ${
        isCms ? "p-0" : "py-6 px-6 pb-8"
      }`}
    >
      {/* Subtle top glow effect */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </main>
  );
}
