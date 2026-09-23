"use client";

import { ShieldOff } from "lucide-react";
import { useAuth, PermissionModule } from "@/context/AuthContext";

// ── Human-readable names for each module ─────────────────────────────────────
const MODULE_LABELS: Record<PermissionModule, string> = {
  campaigns: "Campaigns",
  donations: "Donors & Donations",
  marketing: "Marketing",
  cms: "CMS & Blogs",
  users: "User Management",
  certificates: "Certificates",
  departments: "Departments",
  crm: "CRM & Lead Management",
  signatures: "Signatures",
  volunteers: "Volunteers Management",
  "volunteer-applications": "Volunteer Applications",
  "volunteer-categories": "Volunteer Categories",
  gallery: "Media & Gallery Vault",
};

interface PermissionGuardProps {
  module: PermissionModule;
  children: React.ReactNode;
}

/**
 * PermissionGuard
 *
 * Usage:
 *   <PermissionGuard module="campaigns">
 *     <CampaignsPageContent />
 *   </PermissionGuard>
 *
 * Renders children if the user has the required permission.
 * Otherwise shows a styled "Access Denied" panel.
 */
export function PermissionGuard({ module, children }: PermissionGuardProps) {
  const { hasPermission, isLoading } = useAuth();

  // While session is loading, render nothing (AuthGuard handles spinner above)
  if (isLoading) return null;

  if (!hasPermission(module)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
          <ShieldOff className="w-9 h-9 text-gold/60" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
          Access Restricted
        </h2>

        {/* Message */}
        <p className="text-white/50 text-sm max-w-md leading-relaxed mb-2">
          You don&apos;t have permission to access{" "}
          <span className="text-gold font-semibold">
            {MODULE_LABELS[module]}
          </span>
          .
        </p>
        <p className="text-white/30 text-xs max-w-sm leading-relaxed">
          Please contact your administrator to request access to this module.
        </p>

        {/* Permission badge */}
        <div className="mt-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/40">
          Required permission:{" "}
          <span className="text-gold/70">{module}</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
