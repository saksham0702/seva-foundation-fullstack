"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { Portal } from "@/components/shared/Portal";
import { useDepartments, Department } from "../DepartmentsProvider";

// ─── Drawer ───────────────────────────────────────────────────────────────────

function DeptFormDrawer() {
  const { drawerOpen, drawerDept, closeDrawer, setDepartments } =
    useDepartments();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (drawerDept) {
      //   setName(drawerDept.name);
      //   setDescription(drawerDept.description);
    } else {
      //   setName("");
      //   setDescription("");
    }
  }, [drawerDept, drawerOpen]);

  if (!drawerOpen) return null;

  const isCreate = !drawerDept;

  function handleSave() {
    if (!name.trim()) return;
    if (isCreate) {
      const newDept: Department = {
        id: `dept${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        memberCount: 0,
        createdAt: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
      setDepartments((prev) => [...prev, newDept]);
    } else {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === drawerDept!.id
            ? { ...d, name: name.trim(), description: description.trim() }
            : d,
        ),
      );
    }
    closeDrawer();
  }

  function handleDelete() {
    if (drawerDept) {
      setDepartments((prev) => prev.filter((d) => d.id !== drawerDept.id));
      closeDrawer();
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]" onClick={closeDrawer} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[99999] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-base font-bold text-black">
              {isCreate ? "New Department" : "Edit Department"}
            </p>
            {!isCreate && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {drawerDept?.memberCount} members
              </p>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="text-slate-400 hover:text-black transition-colors text-lg font-light"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Department Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Operations"
              className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does this department do?"
              className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
          {!isCreate ? (
            <button
              onClick={handleDelete}
              className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-4 py-2.5 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200"
            >
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={closeDrawer}
              className="text-sm font-bold text-slate-500 hover:text-black transition-colors px-4 py-2.5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-black/10 disabled:shadow-none"
            >
              {isCreate ? "Create" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function DepartmentsTable() {
  const { departments, openEdit } = useDepartments();

  return (
    <>
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Department
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                Description
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Members
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                Created
              </th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-sm text-slate-400"
                >
                  No departments yet. Create one to get started.
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr
                  key={dept.id}
                  onClick={() => openEdit(dept)}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Users size={14} className="text-slate-500" />
                      </div>
                      <p className="text-sm font-semibold text-black">
                        {dept.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {dept.description || "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-black">
                      {dept.memberCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-xs text-slate-500 font-medium">
                      {dept.createdAt}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEdit(dept)}
                      className="text-[11px] font-bold text-slate-400 hover:text-black transition-colors"
                    >
                      Edit →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeptFormDrawer />
    </>
  );
}
