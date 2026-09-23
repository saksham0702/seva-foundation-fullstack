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

  const donationsList = donor.donations || [];

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[99999] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
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
            className="text-slate-400 hover:text-black transition-colors text-lg font-light w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Total Paid Hero Metric */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Contribution
              </span>
              <span className="text-2xl font-serif font-bold text-black">
                ₹{(donor.totalPaid || 0).toLocaleString("en-IN")}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {donor.donationCount || (donor.status === "PAID" ? 1 : 0)} successful contribution(s)
              </p>
            </div>
            <span
              className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full ${cfg.className}`}
            >
              {cfg.label}
            </span>
          </div>

          {/* Contact details */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Donor Profile & Contact
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Phone
                </span>
                <span className="font-medium text-black font-mono">
                  {donor.phone || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Email
                </span>
                <span className="font-medium text-black">
                  {donor.email || "—"}
                </span>
              </div>
              {donor.pan && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    PAN Card
                  </span>
                  <span className="font-mono font-bold text-black">
                    {donor.pan}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recursive Donation History */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Contribution History ({donationsList.length || (donor.totalPaid ? 1 : 0)})
              </p>
            </div>

            {donationsList.length > 0 ? (
              <div className="space-y-2.5">
                {donationsList.map((d: any, idx: number) => {
                  const camp =
                    typeof d.campaign === "object"
                      ? d.campaign?.name || d.campaign?.title
                      : d.campaign || d.initiative || "General Support";
                  return (
                    <div
                      key={d._id || idx}
                      className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          ₹{(d.amount || 0).toLocaleString("en-IN")}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            d.paymentStatus === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : d.paymentStatus === "FAILED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {d.paymentStatus || "PAID"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 text-[11px]">
                        <span className="truncate max-w-[180px] font-medium">{camp}</span>
                        <span>
                          {d.createdAt
                            ? new Date(d.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                      {d.receiptNumber && (
                        <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Receipt: <strong className="text-slate-700 font-mono">{d.receiptNumber}</strong></span>
                          <a
                            href={`/verify/${d.receiptNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4C6FFF] hover:underline font-bold"
                          >
                            Certificate →
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600">
                <p className="font-medium text-slate-900">{campaignName}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Primary contribution registered.
                </p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          {donor.createdAt && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Record Info
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  First Seen
                </span>
                <span className="font-medium text-black">
                  {new Date(donor.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
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
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <SortTh label="Donor" sortKey="name" />
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                  Contact
                </th>
                <SortTh label="Total Paid" sortKey="totalPaid" />
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                  Campaign / Cause
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
                    colSpan={7}
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
                              {donor.phone || donor.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm text-black">{donor.email || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            ₹{(donor.totalPaid || 0).toLocaleString("en-IN")}
                          </span>
                          {donor.donationCount && donor.donationCount > 1 ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {donor.donationCount} gifts
                            </span>
                          ) : null}
                        </div>
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
