"use client";

import React from "react";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";

export default function LeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard module="crm">
      <div className="w-full">
        {children}
      </div>
    </PermissionGuard>
  );
}
