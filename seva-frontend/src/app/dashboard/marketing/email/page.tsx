"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Mail, RefreshCw, Settings, CheckCircle, XCircle, Clock, RotateCcw } from "lucide-react";
import axiosInstance from "@/app/api";
import { endpoint } from "@/app/api/endpoints";

type LogStatus = "SENT" | "FAILED" | "PENDING";

interface MailLog {
  _id: string;
  to: string;
  templateKey: string;
  subject: string;
  status: LogStatus;
  error?: string;
  relatedToModel?: string;
  createdAt: string;
}

const statusConfig: Record<LogStatus, { label: string; icon: React.ElementType; className: string }> = {
  SENT: { label: "Sent", icon: CheckCircle, className: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  FAILED: { label: "Failed", icon: XCircle, className: "text-red-600 bg-red-50 border-red-200" },
  PENDING: { label: "Pending", icon: Clock, className: "text-amber-600 bg-amber-50 border-amber-200" },
};

const TEMPLATE_LABELS: Record<string, string> = {
  USER_CREDENTIALS: "New User Welcome",
  USER_UPDATED: "User Account Updated",
  VOLUNTEER_APPLICATION_RECEIVED: "Volunteer Application Received",
  VOLUNTEER_APPLICATION_STATUS_UPDATE: "Volunteer Status Update",
  CAMPAIGN_DONATION_RECEIPT: "Donation Receipt",
  DONOR_PAYMENT_CONFIRMED: "Payment Confirmed",
  CERTIFICATE_GENERATED: "Certificate Generated",
  CUSTOM: "Custom Email",
};

export default function EmailMarketingPage() {
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | LogStatus>("ALL");
  const [resending, setResending] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filter !== "ALL") params.status = filter;
      const res = await axiosInstance.get(endpoint.mail.getLogs, { params });
      const data: MailLog[] = res.data?.data || [];
      setLogs(data);
      setStats({
        total: data.length,
        sent: data.filter((l) => l.status === "SENT").length,
        failed: data.filter((l) => l.status === "FAILED").length,
        pending: data.filter((l) => l.status === "PENDING").length,
      });
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResend = async (id: string) => {
    setResending(id);
    try {
      await axiosInstance.post(endpoint.mail.resendLog(id));
      await fetchLogs();
    } catch {
      // silently handled
    } finally {
      setResending(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-black tracking-tight">Email Activity</h1>
            <p className="text-sm text-slate-400 mt-1">All system-triggered emails — welcome mails, receipts, volunteer confirmations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:border-black hover:text-black transition-all"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
            <Link
              href="/dashboard/marketing/email/templates"
              className="flex items-center gap-2 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#0f2347]/10"
            >
              <Mail size={15} />
              Mail Templates
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Emails", value: stats.total, color: "text-black" },
            { label: "Sent", value: stats.sent, color: "text-emerald-600" },
            { label: "Failed", value: stats.failed, color: "text-red-600" },
            { label: "Pending", value: stats.pending, color: "text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          {(["ALL", "SENT", "FAILED", "PENDING"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-bold px-5 py-2 rounded-xl border transition-all ${
                filter === f
                  ? "bg-black text-white border-black shadow-lg shadow-black/10"
                  : "bg-white text-slate-500 border-slate-200 hover:border-black hover:text-black"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-sm">Loading mail logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Mail size={36} strokeWidth={1.2} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No emails found</p>
              <p className="text-xs mt-1 text-slate-300">
                Emails are sent automatically when users are created, donors marked as paid, or volunteers apply.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Recipient</th>
                  <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">Reason Sent</th>
                  <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">Subject</th>
                  <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">Date</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const cfg = statusConfig[log.status] || statusConfig.PENDING;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={log._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-black">{log.to}</p>
                        {log.relatedToModel && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{log.relatedToModel}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-slate-700 font-medium">
                          {TEMPLATE_LABELS[log.templateKey] || log.templateKey}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <p className="text-sm text-slate-500 line-clamp-1">{log.subject}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border ${cfg.className}`}>
                          <StatusIcon size={11} />
                          {cfg.label}
                        </span>
                        {log.error && (
                          <p className="text-[10px] text-red-400 mt-1 line-clamp-1" title={log.error}>{log.error}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-xs text-slate-400">
                          {new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {log.status === "FAILED" && (
                          <button
                            onClick={() => handleResend(log._id)}
                            disabled={resending === log._id}
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-600 transition-colors disabled:opacity-40"
                          >
                            <RotateCcw size={12} className={resending === log._id ? "animate-spin" : ""} />
                            Resend
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Templates link */}
        <div className="mt-4 flex justify-end">
          <Link
            href="/dashboard/marketing/email/templates"
            className="text-xs text-slate-400 hover:text-black transition-colors font-medium"
          >
            Manage email templates →
          </Link>
        </div>
      </div>
    </div>
  );
}
