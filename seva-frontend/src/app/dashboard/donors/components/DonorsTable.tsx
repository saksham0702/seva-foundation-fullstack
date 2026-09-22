"use client";

import { ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Portal } from "@/components/shared/Portal";
import {
  useDonors,
  STATUS_CONFIG,
  Donor,
  DonorSortKey,
} from "../DonorsProvider";

// ─── Avatar ───────────────────────────────────────────────────────────────────

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
  const color = colors[(name || "?").charCodeAt(0) % colors.length];
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

// ─── Campaign badge ───────────────────────────────────────────────────────────

function CampaignBadge({ campaign }: { campaign: Donor["campaign"] }) {
  if (!campaign) return <span className="text-slate-300 text-xs">—</span>;

  const name =
    typeof campaign === "string"
      ? campaign
      : (campaign as any).name || (campaign as any).title || "Campaign";

  return (
    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 truncate max-w-[160px] inline-block">
      {name}
    </span>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function DonorDrawer({
  donor,
  onClose,
}: {
  donor: Donor;
  onClose: () => void;
}) {
  const cfg = STATUS_CONFIG[donor.status];
  const campaignName =
    typeof donor.campaign === "string"
      ? donor.campaign
      : (donor.campaign as any)?.name ||
        (donor.campaign as any)?.title ||
        "—";

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[99999] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Avatar name={donor.name || "?"} />
            <div>
              <p className="text-sm font-bold text-black">
                {donor.name || "Unnamed Donor"}
              </p>
              <p className="text-[11px] text-slate-400">{donor.email || "—"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-black transition-colors text-lg font-light"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full ${cfg.className}`}
            >
              {cfg.label}
            </span>
          </div>

          {/* Contact details */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Contact Details
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl divide-y divide-slate-100">
              {[
                { label: "Phone", value: donor.phone || "—" },
                { label: "Email", value: donor.email || "—" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {row.label}
                  </span>
                  <span className="text-sm font-medium text-black">
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${cfg.className}`}
                >
                  {cfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Campaign */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Campaign
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
              <p className="text-sm font-medium text-black">{campaignName}</p>
            </div>
          </div>

          {/* Timestamps */}
          {donor.createdAt && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Record Info
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl divide-y divide-slate-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Created
                  </span>
                  <span className="text-sm font-medium text-black">
                    {new Date(donor.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

// ─── Sort header helper ───────────────────────────────────────────────────────

function SortTh({
  label,
  sortKey,
  className = "",
}: {
  label: string;
  sortKey: DonorSortKey;
  className?: string;
}) {
  const { sortKey: active, sortDir, toggleSort } = useDonors();
  return (
    <th
      onClick={() => toggleSort(sortKey)}
      className={`text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 cursor-pointer select-none ${className}`}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          size={11}
          className={active === sortKey ? "text-black" : "text-slate-300"}
        />
      </span>
    </th>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

export function DonorsTable() {
  const {
    paginated,
    filtered,
    page,
    setPage,
    totalPages,
    PAGE_SIZE,
    selectedDonor,
    setSelectedDonor,
    loading,
    error,
    refetch,
  } = useDonors();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 size={24} className="animate-spin" />
        <p className="text-sm font-medium">Loading donors…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-rose-500 font-medium">{error}</p>
        <button
          onClick={refetch}
          className="text-xs font-bold border border-slate-200 px-4 py-2 rounded-xl hover:border-black transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <SortTh label="Donor" sortKey="name" />
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                  Contact
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                  Campaign
                </th>
                <SortTh label="Date" sortKey="createdAt" className="hidden sm:table-cell" />
                <SortTh label="Status" sortKey="status" />
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-sm text-slate-400"
                  >
                    No donors match your search.
                  </td>
                </tr>
              ) : (
                paginated.map((donor) => {
                  const cfg = STATUS_CONFIG[donor.status];
                  return (
                    <tr
                      key={donor._id}
                      onClick={() => setSelectedDonor(donor)}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={donor.name || "?"} />
                          <div>
                            <p className="text-sm font-semibold text-black">
                              {donor.name || "Unnamed"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {donor.phone || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm text-black">{donor.email || "—"}</p>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <CampaignBadge campaign={donor.campaign} />
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-xs text-slate-500 font-medium">
                          {donor.createdAt
                            ? new Date(donor.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full ${cfg.className}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedDonor(donor)}
                          className="text-[11px] font-bold text-slate-400 hover:text-black transition-colors"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-[11px] font-semibold text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
              donors
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                    page === p
                      ? "bg-black text-white border-black"
                      : "border-slate-200 text-slate-500 hover:border-black hover:text-black"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedDonor && (
        <DonorDrawer
          donor={selectedDonor}
          onClose={() => setSelectedDonor(null)}
        />
      )}
    </>
  );
}
