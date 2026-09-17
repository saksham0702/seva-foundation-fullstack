import React from "react";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import Navbar from "@/components/dashboard/layout/Navbar";
import { AuthGuard } from "@/components/dashboard/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden font-sans bg-navy">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-auto py-6 px-6 pb-8 bg-navy relative">
            {/* Subtle top glow effect */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}