"use client";

import { Plus } from "lucide-react";
import { UsersProvider, useUsers } from "./UsersProvider";
import { UsersStats } from "./components/UsersStats";
import { UsersFilters } from "./components/UsersFilters";
import { UsersTable } from "./components/UsersTable";
import { UserFormDrawer } from "./components/UserFormDrawer";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";

export default function UsersPage() {
  return (
    <PermissionGuard module="users">
      <UsersProvider>
        <UsersPageContent />
      </UsersProvider>
    </PermissionGuard>
  );
}

function UsersPageContent() {
  const { openCreate } = useUsers();

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-semibold text-black tracking-tight">
            User Management
          </h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-black/10"
          >
            <Plus size={18} strokeWidth={3} />
            Add User
          </button>
        </div>

        {/* Stats */}
        <div className="mb-10">
          <UsersStats />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <UsersFilters />
        </div>

        {/* Table */}
        <UsersTable />

        {/* Create / Edit drawer */}
        <UserFormDrawer />
      </div>
    </div>
  );
}
