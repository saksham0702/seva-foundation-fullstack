"use client";

import Link from "next/link";
import { ShieldCheck, ArrowLeft, Mail } from "lucide-react";

export default function MailSettingsPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <ShieldCheck size={28} />
        </div>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          Mail Configuration Managed
        </h1>

        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          SMTP credentials and outbound email infrastructure are securely configured at the server system environment level. Manual edits from this console are currently restricted.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard/marketing/email"
            className="flex items-center justify-center gap-2 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-xs font-bold py-3 px-5 rounded-xl transition-colors"
          >
            <Mail size={14} />
            <span>View Mail Logs</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-semibold py-2.5 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
