"use client";

import { useUsers, ROLE_COLORS, PERMISSION_MODULES } from "../UsersProvider";

function Avatar({ name }: { name: string }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const color = colors[name ? name.charCodeAt(0) % colors.length : 0];
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

export function UsersTable() {
  const { users, search, roleFilter, openEdit, loading } = useUsers();

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="border border-slate-200 rounded-2xl p-16 text-center text-sm text-slate-400">
        Loading users...
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                User
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Role
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                Permissions
              </th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-16 text-center text-sm text-slate-400"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const roleCfg = ROLE_COLORS[user.role] || "bg-slate-100 text-slate-700";
                
                // Map permission keys back to labels
                const permissionLabels = (user.permissions || [])
                  .map((pKey) => PERMISSION_MODULES.find((m) => m.key === pKey)?.label || pKey)
                  .join(", ");

                return (
                  <tr
                    key={user._id}
                    onClick={() => openEdit(user)}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} />
                        <div>
                          <p className="text-sm font-semibold text-black">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${roleCfg}`}
                      >
                        {user.role === "admin" ? "Admin" : "User / Team"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-slate-600 truncate max-w-xs">
                        {permissionLabels || "None"}
                      </p>
                    </td>
                    <td
                      className="px-6 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openEdit(user)}
                        className="text-[11px] font-bold text-slate-400 hover:text-black transition-colors"
                      >
                        Edit →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
