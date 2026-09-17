"use client";

import React from "react";
import ModuleSidebar from "@/components/dashboard/certificates/ModuleSidebar";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";

export default function CertificatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard module="certificates">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ModuleSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto px-8 py-8">
          {children}
        </main>
      </div>
    </PermissionGuard>
  );
}
