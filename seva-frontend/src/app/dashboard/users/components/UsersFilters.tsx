"use client";

import { Search } from "lucide-react";
import { useUsers, ROLES } from "../UsersProvider";

export function UsersFilters() {
  const { search, setSearch, roleFilter, setRoleFilter } = useUsers();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        {(["All", ...ROLES] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`text-xs font-bold px-5 py-2.5 rounded-xl border transition-all shrink-0 ${
              roleFilter === r
                ? "bg-black text-white border-black shadow-lg shadow-black/10"
                : "bg-white text-slate-500 border-slate-200 hover:border-black hover:text-black"
            }`}
          >
            {r === "All" ? "All Roles" : r === "admin" ? "Admins" : "Team Members"}
          </button>
        ))}
      </div>
    </div>
  );
}
