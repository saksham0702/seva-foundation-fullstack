"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building,
  Plus,
  Shield,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Users,
  Lock,
} from "lucide-react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
  PERMISSION_OPTIONS,
} from "@/app/api/department";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { Portal } from "@/components/shared/Portal";

export default function DepartmentsDashboardPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all departments
  const {
    data: departments = [],
    isLoading,
    isError,
  } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const openCreateModal = () => {
    setEditingDept(null);
    setName("");
    setDescription("");
    setSelectedPermissions([]);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || "");
    setSelectedPermissions(dept.permissions || []);
    setFormError(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Department name is required");
      if (editingDept) {
        return updateDepartment(editingDept._id, {
          name: name.trim(),
          description: description.trim(),
          permissions: selectedPermissions,
        });
      } else {
        return createDepartment({
          name: name.trim(),
          description: description.trim(),
          permissions: selectedPermissions,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setModalOpen(false);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err.message || "Failed to save department");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const togglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey)
        ? prev.filter((k) => k !== permKey)
        : [...prev, permKey]
    );
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(PERMISSION_OPTIONS.map((p) => p.key));
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  return (
    <PermissionGuard module="departments">
      <div className="min-h-screen bg-[#f8fafc] dark:bg-bg p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0f2347] dark:text-text-primary tracking-tight">
              Departments & Role Permissions
            </h1>
            <p className="text-xs text-gray-500 dark:text-muted mt-1">
              Configure departments with default permissions. Users assigned to a department inherit all its access rights automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-[#E8542A] hover:bg-[#c9431d] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-orange-500/20 self-start sm:self-auto"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Department
          </button>
        </div>

        {/* Loading / Error / Empty States */}
        {isLoading ? (
          <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-16 text-center text-gray-400">
            <Loader2 size={36} className="animate-spin mx-auto mb-3 text-[#E8542A]" />
            <p className="text-xs font-medium">Loading departments...</p>
          </div>
        ) : isError ? (
          <div className="bg-white dark:bg-panel rounded-2xl border border-red-100 p-8 text-center text-red-500">
            <AlertCircle size={36} className="mx-auto mb-2" />
            <p className="text-sm font-semibold">Failed to load departments</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="bg-white dark:bg-panel rounded-2xl border border-dashed border-gray-200 dark:border-border p-16 text-center">
            <Building size={40} className="mx-auto mb-3 text-gray-300" />
            <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary mb-1">
              No Departments Created Yet
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              Create your first department (e.g. &quot;Campaigns & Fundraising&quot;, &quot;Volunteer Operations&quot;) to organize staff permissions.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-[#0f2347] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1a3a6b]"
            >
              <Plus size={14} />
              Create First Department
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept._id}
                className="bg-white dark:bg-panel border border-gray-100 dark:border-border rounded-2xl p-6 shadow-sm hover:border-[#1a3a6b]/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-3 bg-[#0f2347]/5 dark:bg-white/5 rounded-xl text-[#0f2347] dark:text-text-primary">
                      <Building size={20} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(dept)}
                        className="p-2 text-gray-400 hover:text-[#1a3a6b] rounded-lg hover:bg-gray-50 dark:hover:bg-bg transition-colors"
                        title="Edit Department"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${dept.name}"?`)) {
                            deleteMutation.mutate(dept._id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#0f2347] dark:text-text-primary mb-1">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-muted line-clamp-2 leading-relaxed mb-4">
                    {dept.description || "No description provided."}
                  </p>

                  {/* Inherited Permissions Badges */}
                  <div className="pt-3 border-t border-gray-100 dark:border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                      <Shield size={11} className="text-[#E8542A]" />
                      Inherited Permissions ({dept.permissions?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.permissions?.length > 0 ? (
                        dept.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="px-2.5 py-1 bg-gray-100 dark:bg-bg text-gray-700 dark:text-text-primary rounded-lg text-[11px] font-semibold"
                          >
                            {perm}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          No permissions assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-border flex items-center justify-between text-[11px] text-gray-400">
                  <span>Slug: {dept.slug}</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Department Modal */}
        {modalOpen && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
            <div className="bg-white dark:bg-panel rounded-3xl border border-gray-100 dark:border-border shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-border mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#E8542A]/10 text-[#E8542A] rounded-2xl">
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0f2347] dark:text-text-primary">
                      {editingDept ? "Edit Department" : "Create New Department"}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Users placed in this department inherit all selected permissions
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-bg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle size={15} />
                  {formError}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate();
                }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Campaigns & Fundraising"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief summary of department responsibilities..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                  />
                </div>

                {/* Permissions Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0f2347] dark:text-text-primary flex items-center gap-1.5">
                      <Lock size={13} className="text-[#E8542A]" />
                      Assign Department Permissions
                    </label>
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={selectAllPermissions}
                        className="text-[#1a3a6b] font-semibold hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={clearAllPermissions}
                        className="text-gray-400 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {PERMISSION_OPTIONS.map((perm) => {
                      const checked = selectedPermissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => togglePermission(perm.key)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                            checked
                              ? "bg-[#0f2347]/5 border-[#0f2347] dark:border-white/30"
                              : "bg-white dark:bg-bg border-gray-200 dark:border-border hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {}} // handled by parent div
                            className="mt-0.5 w-4 h-4 text-[#0f2347] rounded focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#0f2347] dark:text-text-primary">
                              {perm.label}
                            </p>
                            <p className="text-[11px] text-gray-400 line-clamp-1">
                              {perm.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-border">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-border text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E8542A] hover:bg-[#c9431d] disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
                  >
                    {saveMutation.isPending && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    {saveMutation.isPending ? "Saving..." : editingDept ? "Update Department" : "Create Department"}
                  </button>
                </div>
              </form>
            </div>
            </div>
          </Portal>
        )}
      </div>
    </PermissionGuard>
  );
}
