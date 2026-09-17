"use client";

import Link from "next/link";
import { Plus, Users, Clock, TrendingUp, Mail, BarChart2 } from "lucide-react";

const emailCampaigns = [
  {
    id: "e1",
    subject: "Help us reach our water fund goal!",
    list: "All Donors",
    listSize: 2310,
    sent: 2310,
    opened: 1042,
    clicked: 389,
    status: "sent",
    sentAt: "12 Jun 2025",
  },
  {
    id: "e2",
    subject: "Digital classrooms — last 5 days!",
    list: "Newsletter Subscribers",
    listSize: 4120,
    sent: 4120,
    opened: 2015,
    clicked: 890,
    status: "sent",
    sentAt: "8 Jun 2025",
  },
  {
    id: "e3",
    subject: "Urgent: Assam flood relief update",
    list: "Active Campaign Supporters",
    listSize: 889,
    sent: 889,
    opened: 710,
    clicked: 512,
    status: "sent",
    sentAt: "2 Jun 2025",
  },
  {
    id: "e4",
    subject: "Thank you — 1,000 donors milestone 🎉",
    list: "All Donors",
    listSize: 2310,
    sent: 0,
    opened: 0,
    clicked: 0,
    status: "scheduled",
    sentAt: "20 Jun 2025",
  },
  {
    id: "e5",
    subject: "Meet the children you're supporting",
    list: "Volunteers",
    listSize: 341,
    sent: 0,
    opened: 0,
    clicked: 0,
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

export default function EmailMarketingPage() {
  const totalSent = emailCampaigns.reduce((s, c) => s + c.sent, 0);
  const totalOpened = emailCampaigns.reduce((s, c) => s + c.opened, 0);
  const avgOpenRate = totalSent
    ? Math.round((totalOpened / totalSent) * 100)
    : 0;

  const stats = [
    { label: "Total Campaigns", value: emailCampaigns.length, icon: Mail },
    {
      label: "Emails Sent",
      value: totalSent.toLocaleString(),
      icon: TrendingUp,
    },
    { label: "Avg. Open Rate", value: `${avgOpenRate}%`, icon: BarChart2 },
    { label: "Active Lists", value: "4", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-semibold text-black tracking-tight">
              Email Marketing
            </h1>
          </div>
          <Link
            href="/dashboard/marketing/email/create"
            className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-black/10"
          >
            <Plus size={18} strokeWidth={3} />
            New Email Campaign
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
                  Subject
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                  List
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                  Open Rate
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                  Click Rate
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
              {emailCampaigns.map((c, i) => {
                const cfg = statusConfig[c.status as keyof typeof statusConfig];
                const openRate = c.sent
                  ? Math.round((c.opened / c.sent) * 100)
                  : 0;
                const clickRate = c.sent
                  ? Math.round((c.clicked / c.sent) * 100)
                  : 0;
                return (
                  <tr
                    key={c.id}
                    className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? "" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-black line-clamp-1">
                          {c.subject}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 md:hidden">
                          {c.list}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div>
                        <p className="text-sm text-black font-medium">
                          {c.list}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {c.listSize.toLocaleString()} contacts
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {c.status === "sent" ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${openRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-black">
                            {openRate}%
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
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${clickRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-black">
                            {clickRate}%
                          </span>
                        </div>
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
                        href={`/dashboard/email/${c.id}`}
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
