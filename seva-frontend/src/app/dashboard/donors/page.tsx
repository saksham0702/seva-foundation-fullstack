"use client";

import { Download, Plus } from "lucide-react";
import { DonorsProvider, useDonors } from "./DonorsProvider";
import { DonorsStats } from "./components/DonorsStats";
import { DonorsFilters } from "./components/DonorsFilters";
import { DonorsTable } from "./components/DonorsTable";
import { CreateDonorModal } from "./components/CreateDonorModal";
import { DonorsNavTabs } from "./components/DonorsNavTabs";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";

function DonorsPageInner() {
  const { openCreateModal } = useDonors();

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-black tracking-tight">
              Donor Vault
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage campaign donations, track leads, and view donor contributions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:bg-slate-800 shadow-sm"
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Donor
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <DonorsNavTabs />

        {/* Stats */}
        <div className="mb-10">   
          <DonorsStats />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <DonorsFilters />
        </div>

        {/* Table + drawer */}
        <DonorsTable />

        {/* Create Donor Modal */}
        <CreateDonorModal />
      </div>
    </div>
  );
}

export default function DonorsPage() {
  return (
    <PermissionGuard module="donations">
      <DonorsProvider>
        <DonorsPageInner />
      </DonorsProvider>
    </PermissionGuard>
  );
}
