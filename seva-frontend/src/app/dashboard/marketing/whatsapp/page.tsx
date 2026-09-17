"use client";

import Link from "next/link";
import {
  Plus,
  Users,
  TrendingUp,
  MessageCircle,
  CheckCheck,
} from "lucide-react";

const waCampaigns = [
  {
    id: "w1",
    name: "Water Fund Appeal",
    list: "All Donors",
    sent: 2310,
    delivered: 2201,
    read: 1890,
    replied: 312,
    status: "sent",
    sentAt: "12 Jun 2025",
  },
  {
    id: "w2",
    name: "Classroom Campaign — Final Push",
    list: "Newsletter Subscribers",
    sent: 1200,
    delivered: 1180,
    read: 980,
    replied: 145,
    status: "sent",
    sentAt: "8 Jun 2025",
  },
  {
    id: "w3",
    name: "Assam Flood Relief Urgent",
    list: "Active Supporters",
    sent: 889,
    delivered: 881,
    read: 855,
    replied: 490,
    status: "sent",
    sentAt: "2 Jun 2025",
  },
  {
    id: "w4",
    name: "Thank You — 1,000 Donors!",
    list: "All Donors",
    sent: 0,
    delivered: 0,
    read: 0,
    replied: 0,
    status: "scheduled",
    sentAt: "20 Jun 2025",
  },
  {
    id: "w5",
    name: "Volunteer Drive — July",
    list: "Volunteers",
    sent: 0,
    delivered: 0,
    read: 0,
    replied: 0,
    status: "draft",
    sentAt: "—",
  },
];

const statusConfig = {
  sent: {
    label: "Sent",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  draft: {
    label: "Draft",
    className: "bg-amber-50 text-amber-600 border border-amber-200",
  },
};

export default function WAMarketingPage() {
  const totalSent = waCampaigns.reduce((s, c) => s + c.sent, 0);
  const totalRead = waCampaigns.reduce((s, c) => s + c.read, 0);
  const avgReadRate = totalSent ? Math.round((totalRead / totalSent) * 100) : 0;

  const stats = [
    {
      label: "Total Broadcasts",
      value: waCampaigns.length,
      icon: MessageCircle,
    },
    {
      label: "Messages Sent",
      value: totalSent.toLocaleString(),
      icon: TrendingUp,
    },
    { label: "Avg. Read Rate", value: `${avgReadRate}%`, icon: CheckCheck },
    { label: "Contact Lists", value: "4", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-semibold text-black tracking-tight">
              WhatsApp Marketing
            </h1>
          </div>
          <Link
            href="/dashboard/marketing/whatsapp/create"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-green-500/20"
          >
            <Plus size={18} strokeWidth={3} />
            New Broadcast
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-slate-200 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-all"
            >
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-2">
                {s.label}
              </p>
              <p className="text-3xl font-semibold text-black">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          {["All", "Sent", "Scheduled", "Draft"].map((f, i) => (
            <button
              key={f}
              className={`text-xs font-bold px-6 py-2.5 rounded-xl border transition-all shrink-0 ${
                i === 0
                  ? "bg-black text-white border-black shadow-lg shadow-black/10"
                  : "bg-white text-slate-500 border-slate-200 hover:border-black hover:text-black shadow-sm"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Broadcast
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                  List
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                  Delivered
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                  Read Rate
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden xl:table-cell">
                  Replies
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                  Date
                </th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {waCampaigns.map((c) => {
                const cfg = statusConfig[c.status as keyof typeof statusConfig];
                const readRate = c.sent
                  ? Math.round((c.read / c.sent) * 100)
                  : 0;
                const deliveredRate = c.sent
                  ? Math.round((c.delivered / c.sent) * 100)
                  : 0;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* WA icon dot */}
                        <div className="w-7 h-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center shrink-0">
                          <MessageCircle size={13} className="text-[#25D366]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black line-clamp-1">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 md:hidden">
                            {c.list}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div>
                        <p className="text-sm text-black font-medium">
                          {c.list}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {c.sent > 0 ? `${c.sent.toLocaleString()} sent` : "—"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {c.status === "sent" ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${deliveredRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-black">
                            {deliveredRate}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {c.status === "sent" ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#25D366] rounded-full"
                              style={{ width: `${readRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-black">
                            {readRate}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      {c.status === "sent" ? (
                        <span className="text-sm font-semibold text-black">
                          {c.replied.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full ${cfg.className}`}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs text-slate-500 font-medium">
                        {c.sentAt}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/marketing/whatsapp/${c.id}`}
                        className="text-[11px] font-bold text-slate-400 hover:text-black transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
