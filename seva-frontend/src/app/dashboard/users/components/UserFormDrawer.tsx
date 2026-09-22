"use client";

import { useState, useEffect } from "react";
import {
  useUsers,
  ROLES,
  PERMISSION_MODULES,
  ROLE_DEFAULT_PERMISSIONS,
  User,
  UserRole,
  PermissionModule,
} from "../UsersProvider";
import { authAPI } from "@/app/api/auth";
import { getDepartments, Department } from "@/app/api/department";
import { Shield, Sparkles } from "lucide-react";
import { Portal } from "@/components/shared/Portal";

type FormState = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: string;
  permissions: PermissionModule[];
};

function emptyForm(): FormState {
  return {
    name: "",
    email: "",
    password: "",
    role: "user",
    department: "",
    permissions: ROLE_DEFAULT_PERMISSIONS["user"],
  };
}

export function UserFormDrawer() {
  const { drawerMode, drawerUser, closeDrawer, refreshUsers } = useUsers();

  if (!drawerMode) return null;

  return (
    <UserFormDrawerContent
      key={`${drawerMode}-${drawerUser?._id || "new"}`}
      drawerMode={drawerMode}
      drawerUser={drawerUser}
      closeDrawer={closeDrawer}
      refreshUsers={refreshUsers}
    />
  );
}

function UserFormDrawerContent({
  drawerMode,
  drawerUser,
  closeDrawer,
  refreshUsers,
}: {
  drawerMode: "create" | "edit";
  drawerUser: User | null;
  closeDrawer: () => void;
  refreshUsers: () => Promise<void>;
}) {
  const isCreate = drawerMode === "create";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptInfo, setSelectedDeptInfo] = useState<Department | null>(null);

  const [form, setForm] = useState<FormState>(() => {
    if (drawerMode === "edit" && drawerUser) {
      const deptId =
        typeof drawerUser.department === "object"
          ? drawerUser.department?._id
          : drawerUser.department || "";
      return {
        name: drawerUser.name || "",
        email: drawerUser.email || "",
        role: drawerUser.role || "user",
        department: deptId,
        permissions: drawerUser.permissions || [],
        password: "",
      };
    }
    return emptyForm();
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const depts = await getDepartments();
        setDepartments(depts);
        if (form.department) {
          const matched = depts.find((d) => d._id === form.department);
          if (matched) setSelectedDeptInfo(matched);
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    })();
  }, []);

  // When role changes, reset permissions to role defaults
  function handleRoleChange(role: UserRole) {
    setForm((f) => ({
      ...f,
      role,
      permissions: ROLE_DEFAULT_PERMISSIONS[role],
    }));
  }

  // When department changes, automatically inherit its permissions
  function handleDepartmentChange(deptId: string) {
    const dept = departments.find((d) => d._id === deptId);
    setSelectedDeptInfo(dept || null);

    if (dept && dept.permissions?.length > 0) {
      const inherited = Array.from(
        new Set([...(form.permissions || []), ...(dept.permissions as PermissionModule[])])
      );
      setForm((f) => ({
        ...f,
        department: deptId,
        permissions: inherited,
      }));
    } else {
      setForm((f) => ({
        ...f,
        department: deptId,
      }));
    }
  }

  // Toggle a single permission module
  function togglePermission(module: PermissionModule) {
    setForm((f) => {
      const current = f.permissions || [];
      const updated = current.includes(module)
        ? current.filter((m) => m !== module)
        : [...current, module];
      return { ...f, permissions: updated };
    });
  }

  // Select / deselect all
  function toggleAll() {
    const allKeys = PERMISSION_MODULES.map((m) => m.key);
    const allSelected = allKeys.every((k) => form.permissions.includes(k));
    setForm((f) => ({
      ...f,
      permissions: allSelected ? [] : allKeys,
    }));
  }

  async function handleSave() {
    if (!form.name || !form.email) {
      setErrorMsg("Full Name and Email are required");
      return;
    }
    if (isCreate && !form.password) {
      setErrorMsg("Password is required for new users");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department || undefined,
        permissions: form.permissions,
        ...(isCreate ? { password: form.password } : {}),
      };

      if (isCreate) {
        await authAPI.createUser(payload);
      } else if (drawerUser) {
        await authAPI.updateUser(drawerUser._id, payload);
      }

      await refreshUsers();
      closeDrawer();
    } catch (e: unknown) {
      console.error(e);
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(err?.response?.data?.message || err?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!drawerUser) return;
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      setSaving(true);
      setErrorMsg("");
      await authAPI.deleteUser(drawerUser._id);
      await refreshUsers();
      closeDrawer();
    } catch (e: unknown) {
      console.error(e);
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(err?.response?.data?.message || err?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  const allKeys = PERMISSION_MODULES.map((m) => m.key);
  const allSelected = allKeys.every((k) => form.permissions.includes(k));
  const selectedCount = form.permissions.length;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]" onClick={closeDrawer} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-panel z-[99999] shadow-2xl flex flex-col border-l border-gray-100 dark:border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-border shrink-0">
          <div>
            <p className="text-base font-bold text-[#0f2347] dark:text-text-primary">
              {isCreate ? "Add User / Staff Member" : "Edit User Details"}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isCreate ? "Create account and assign department permissions" : drawerUser?.email}
            </p>
          </div>
          <button
            onClick={closeDrawer}
            disabled={saving}
            className="text-gray-400 hover:text-black dark:hover:text-white transition-colors text-lg font-light disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {errorMsg && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {errorMsg}
            </p>
          )}

          {/* Basic info */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Basic Info & Department
            </p>

            <div className="flex flex-col gap-4">
              <Field
                label="Full Name *"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. Priya Sharma"
                disabled={saving}
              />
              <Field
                label="Email Address *"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                placeholder="priya@org.in"
                disabled={saving}
              />

              {isCreate && (
                <Field
                  label="Password *"
                  type="password"
                  value={form.password || ""}
                  onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                  placeholder="••••••••"
                  disabled={saving}
                />
              )}

              {/* Department Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Department
                </label>
                <select
                  value={form.department || ""}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  disabled={saving}
                  className="border border-gray-200 dark:border-border rounded-xl px-4 py-3 text-sm text-[#0f2347] dark:text-text-primary focus:outline-none focus:border-[#1a3a6b] transition-colors bg-white dark:bg-bg disabled:opacity-50"
                >
                  <option value="">-- No Department (Custom Permissions) --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.permissions?.length || 0} permissions)
                    </option>
                  ))}
                </select>
                {selectedDeptInfo && (
                  <p className="text-[11px] text-emerald-600 font-semibold px-1 flex items-center gap-1">
                    <Sparkles size={12} />
                    Inheriting permissions from {selectedDeptInfo.name}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  disabled={saving}
                  className="border border-gray-200 dark:border-border rounded-xl px-4 py-3 text-sm text-[#0f2347] dark:text-text-primary focus:outline-none focus:border-[#1a3a6b] transition-colors bg-white dark:bg-bg disabled:opacity-50"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r === "admin" ? "Admin — Full Superuser Access" : "User / Team Member"}
                    </option>
                  ))}
                </select>
                {form.role === "admin" && (
                  <p className="text-[11px] text-slate-400 px-1">
                    ⚡ Admins automatically have full bypass access to all modules.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Permissions — only relevant for non-admin users */}
          {form.role !== "admin" && (
            <div className="flex flex-col gap-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Effective Module Permissions
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {selectedCount} of {PERMISSION_MODULES.length} modules enabled
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleAll}
                  disabled={saving}
                  className="text-[11px] font-semibold text-slate-500 hover:text-black dark:hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-bg border border-gray-200 dark:border-border disabled:opacity-50"
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="border border-gray-200 dark:border-border rounded-xl overflow-hidden">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_80px] bg-gray-50 dark:bg-bg border-b border-gray-200 dark:border-border px-4 py-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Module
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
                    Access
                  </span>
                </div>

                {PERMISSION_MODULES.map((mod, i) => {
                  const isChecked = (form.permissions || []).includes(mod.key);
                  return (
                    <div
                      key={mod.key}
                      className={`grid grid-cols-[1fr_80px] gap-0 px-4 py-3.5 items-center ${
                        i % 2 === 0 ? "bg-white dark:bg-panel" : "bg-gray-50/50 dark:bg-bg/50"
                      }`}
                    >
                      <div>
                        <span className="text-sm font-semibold text-[#0f2347] dark:text-text-primary block">
                          {mod.label}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {mod.description}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(mod.key)}
                          disabled={saving}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-[#0f2347] border-[#0f2347] text-white"
                              : "bg-white border-slate-300 hover:border-slate-500 text-transparent"
                          }`}
                        >
                          {isChecked && (
                            <span className="text-[10px] font-bold">✓</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-border flex items-center justify-between shrink-0 bg-white dark:bg-panel">
          {!isCreate ? (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-4 py-2.5 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 disabled:opacity-50"
            >
              Delete User
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={closeDrawer}
              disabled={saving}
              className="text-sm font-bold text-slate-500 hover:text-black dark:hover:text-white transition-colors px-4 py-2.5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.email || (isCreate && !form.password)}
              className="bg-[#E8542A] hover:bg-[#c9431d] disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/20"
            >
              {saving ? "Saving..." : isCreate ? "Add User" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

// ─── Reusable input field ─────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="border border-gray-200 dark:border-border rounded-xl px-4 py-3 text-sm text-[#0f2347] dark:text-text-primary placeholder:text-slate-300 focus:outline-none focus:border-[#1a3a6b] transition-colors disabled:bg-slate-50 disabled:opacity-60 bg-white dark:bg-bg"
      />
    </div>
  );
}
