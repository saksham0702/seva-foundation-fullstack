"use client";

import { Download, Plus } from "lucide-react";
import { DonorsProvider, useDonors } from "./DonorsProvider";
import { DonorsStats } from "./components/DonorsStats";
import { DonorsFilters } from "./components/DonorsFilters";
import { DonorsTable } from "./components/DonorsTable";
import { CreateDonorModal } from "./components/CreateDonorModal";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";

function DonorsPageInner() {
  const { openCreateModal } = useDonors();

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-semibold text-black tracking-tight">
            Donors
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-black text-white text-sm font-bold px-5 py-3 rounded-xl transition-all hover:bg-slate-800 shadow-sm"
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Donor
            </button>
            <button className="flex items-center gap-2 border border-slate-200 hover:border-black text-black text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-sm">
              <Download size={15} strokeWidth={2.5} />
              Export
            </button>
          </div>
        </div>

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
