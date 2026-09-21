"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Award, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyCertificateIndexPage() {
  const router = useRouter();
  const [certNo, setCertNo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = certNo.trim();
    if (!cleaned) {
      setError("Please enter a valid certificate number");
      return;
    }
    setError(null);
    router.push(`/verify/${encodeURIComponent(cleaned)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mb-4 shadow-sm">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-3xl font-semibold text-[#0B2C6B] tracking-tight">
            Verify Certificate
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Verify the authenticity of digital certificates issued by Seva India Foundation.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="certNo" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Certificate Number
              </label>
              <div className="relative">
                <input
                  id="certNo"
                  type="text"
                  value={certNo}
                  onChange={(e) => setCertNo(e.target.value)}
                  placeholder="e.g. SIF-CER-2026-123456"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2C6B]/20 focus:border-[#0B2C6B] transition-all"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#0B2C6B] hover:bg-[#071d47] text-white font-semibold py-3.5 px-6 rounded-xl shadow-md shadow-[#0B2C6B]/15 transition-all text-sm group"
            >
              <span>Verify Authenticity</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Instant cryptographically sealed verification</span>
            </div>
            <div className="flex items-start gap-2">
              <Award size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span>Direct PDF download with authorized signatures</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-gray-500 hover:text-[#0B2C6B] font-medium transition-colors">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
