"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Scale, CheckCircle, FileText, ArrowLeft } from "lucide-react";
import { getCmsPageBySlug, CmsPage } from "@/app/api/cms";

export default function TermsAndConditionsPage() {
  const [pageData, setPageData] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCmsPageBySlug("terms");
        setPageData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const title = pageData?.title || "Terms & Conditions";
  const subtitle =
    pageData?.subtitle ||
    "Welcome to Seva India Foundation. By accessing our portal, donating, or participating as a volunteer, you agree to these terms.";
  const customContent = pageData?.content;

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Banner */}
      <section className="relative bg-[#0A1A2F] text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#F5A623_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#F5A623] text-xs font-bold uppercase tracking-wider mb-4">
            <Scale size={14} />
            Legal Terms &amp; Conditions of Service
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-white mb-4">
            {title}
          </h1>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
          <p className="text-xs text-white/50 mt-4">
            CIN: U88900UT2026NPL020825 | NGO Darpan ID: UK/2026/0993905
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 space-y-8">
          {customContent ? (
            <div
              className="prose max-w-none text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: customContent }}
            />
          ) : (
            <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0A1A2F] flex items-center gap-2">
                  <CheckCircle size={18} className="text-[#F5A623]" />
                  1. Organization Status
                </h2>
                <p>
                  Seva India Foundation is a duly registered non-profit Section 8 Company incorporated under the Companies Act, 2013 in the State of Uttarakhand, India, dedicated to hunger relief, rural welfare, women empowerment, leprosy care, and youth development.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0A1A2F]">
                  2. Voluntary Contributions &amp; Donations
                </h2>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
                  <li>All donations made to Seva India Foundation are voluntary contributions meant solely for humanitarian and charitable relief programs.</li>
                  <li>Eligible donations qualify for tax deduction under Section 80G of the Indian Income Tax Act. Official 80G tax exemption receipts are issued automatically upon confirmation of donor PAN and transaction verification.</li>
                  <li>Donations must be remitted from legitimate accounts compliant with applicable Indian anti-money laundering (PMLA) regulations.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0A1A2F]">
                  3. Cancellation &amp; Refund Policy
                </h2>
                <p>
                  Because donations immediately fund ongoing on-ground supplies, medical items, and hot meals, refunds are generally not granted except in verified cases of technical duplicate debits or unauthorized card usage reported within 7 days of the transaction.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0A1A2F]">
                  4. Intellectual Property
                </h2>
                <p>
                  All content, photographs of field initiatives, reports, emblems, and logos published on this website are the intellectual property of Seva India Foundation and may not be reproduced for commercial exploitation without prior written consent.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0A1A2F]">
                  5. Governing Jurisdiction
                </h2>
                <p>
                  These Terms of Service are governed by the laws of India. Any disputes arising in connection with the operations or contributions of the foundation shall be subject exclusively to the courts of Dehradun, Uttarakhand.
                </p>
              </section>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0A1A2F] hover:text-[#F5A623] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Homepage
            </Link>
            <Link
              href="/donations"
              className="px-6 py-2.5 bg-[#F5A623] hover:bg-[#e0951a] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
