import React, { Suspense } from "react";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import Navbar from "@/components/dashboard/layout/Navbar";
import { AuthGuard } from "@/components/dashboard/AuthGuard";
import DashboardTopLoader from "@/components/dashboard/layout/DashboardTopLoader";
import DashboardMain from "@/components/dashboard/layout/DashboardMain";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <DashboardTopLoader />
      </Suspense>
      <div className="flex h-screen overflow-hidden font-sans bg-navy">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <DashboardMain>{children}</DashboardMain>
        </div>
      </div>
    </AuthGuard>
  );
}