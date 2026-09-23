"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

export default function VerifySearchForm() {
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
    <form onSubmit={handleSearch} className="space-y-4">
      <div>
        <label
          htmlFor="certNo"
          className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2"
        >
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
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-[#0B2C6B] hover:bg-[#071d47] text-white font-semibold py-3.5 px-6 rounded-xl shadow-md shadow-[#0B2C6B]/15 transition-all text-sm group"
      >
        <span>Verify Authenticity</span>
        <ArrowRight
          size={16}
          className="group-hover:translate-x-1 transition-transform"
        />
      </button>
    </form>
  );
}
