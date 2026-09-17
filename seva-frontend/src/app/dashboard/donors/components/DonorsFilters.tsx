"use client";

import { Search } from "lucide-react";
import { useDonors } from "../DonorsProvider";

const STATUS_FILTERS = [
  { label: "All", value: "All" },
  { label: "Paid", value: "PAID" },
  { label: "Not Paid", value: "FILLED_NOT_PAID" },
  { label: "Failed", value: "PAYMENT_FAILED" },
];

export function DonorsFilters() {
  const { search, setSearch, statusFilter, setStatusFilter } = useDonors();

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
          placeholder="Search name, email or phone…"
          className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`text-xs font-bold px-5 py-2.5 rounded-xl border transition-all shrink-0 ${
              statusFilter === f.value
                ? "bg-black text-white border-black shadow-lg shadow-black/10"
                : "bg-white text-slate-500 border-slate-200 hover:border-black hover:text-black"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
