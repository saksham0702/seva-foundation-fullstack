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

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-8">
          <span className="px-4 py-2.5 border-b-2 border-black text-black text-sm font-bold tracking-tight cursor-default">
            Campaign Donors
          </span>
          <a
            href="/dashboard/donors/initiatives"
            className="px-4 py-2.5 border-b-2 border-transparent text-slate-500 hover:text-black hover:border-slate-300 text-sm font-semibold tracking-tight transition-all"
          >
            Initiative Donations
          </a>
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
