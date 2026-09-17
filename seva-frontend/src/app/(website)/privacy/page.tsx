"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Lock, FileText, ChevronRight, ArrowLeft } from "lucide-react";
import { getCmsPageBySlug, CmsPage } from "@/app/api/cms";

export default function PrivacyPolicyPage() {
  const [pageData, setPageData] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCmsPageBySlug("privacy");
        setPageData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const title = pageData?.title || "Privacy & Donor Trust Policy";
  const subtitle =
    pageData?.subtitle ||
    "Seva India Foundation is committed to protecting the privacy and personal data of our donors, volunteers, beneficiaries, and website visitors.";
  const customContent = pageData?.content;

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Banner */}
      <section className="relative bg-[#0A1A2F] text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#F5A623_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#F5A623] text-xs font-bold uppercase tracking-wider mb-4">
            <Shield size={14} />
            Data Protection &amp; Confidentiality
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-white mb-4">
            {title}
          </h1>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
          <p className="text-xs text-white/50 mt-4">
            Last Updated: September 2026 | Effective for all Seva India Foundation platforms
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
                  <Lock size={18} className="text-[#F5A623]" />
                  1. Information We Collect
                </h2>
                <p>
                  When you donate, register as a volunteer, or subscribe to updates through Seva India Foundation, we collect relevant information such as:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
                  <li>Full legal name, email address, phone number, and postal address.</li>
                  <li>Permanent Account Number (PAN) for issuing 80G tax exemption donation certificates under Indian Income Tax regulations.</li>
                  <li>Transaction reference identifiers and donation amounts (payment credentials like card numbers or UPI PINs are processed securely by PCI-DSS certified payment gateways such as Razorpay and are never stored on our servers).</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0A1A2F]">
                  2. Purpose &amp; Use of Personal Information
                </h2>
                <p>We use your information strictly to:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
                  <li>Process donations, generate official receipts, and issue 80G tax exemption certificates.</li>
                  <li>Send transparency updates, impact reports, and program newsletters (you may opt out anytime).</li>
                  <li>Coordinate volunteer tasks, disaster relief deployments, and food distribution camps.</li>
                  <li>Comply with statutory reporting requirements under the Companies Act, 2013 and Section 8 NGO governance rules.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0A1A2F]">
                  3. Non-Disclosure &amp; Zero-Spam Guarantee
                </h2>
                <p>
                  We have a strict <strong>Zero-Sale Policy</strong>. We do not sell, rent, trade, or transfer your personal data to any commercial third parties or advertisers under any circumstances.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0A1A2F]">
                  4. Data Security &amp; Encryption
                </h2>
                <p>
                  All transactions and interactions on our website are encrypted using 256-bit SSL protocols. Access to donor databases is restricted to authorized personnel who have signed strict non-disclosure covenants.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0A1A2F]">
                  5. Contact &amp; Grievance Redressal
                </h2>
                <p>
                  If you have questions regarding this Privacy Policy or wish to update your records, please contact our Compliance Officer at:
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs sm:text-sm space-y-1">
                  <p className="font-bold text-[#0A1A2F]">Seva India Foundation Grievance Desk</p>
                  <p>20, Sahastradhara Road, Upper Adhoiwala, Dehradun, Uttarakhand – 248001</p>
                  <p>Email: <a href="mailto:info@sevaindiafoundation.org" className="text-[#F5A623] underline">info@sevaindiafoundation.org</a> | Phone: +91 94565 17577</p>
                </div>
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
              Support Our Mission
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
