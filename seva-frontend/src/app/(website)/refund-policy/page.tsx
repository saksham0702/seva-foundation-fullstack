import React from "react";
import { Metadata } from "next";
import { RefreshCw, CheckCircle, ShieldCheck } from "lucide-react";
import { getServerCmsPage } from "@/lib/server-api";
import { constructMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getServerCmsPage("refund-policy");
  const title = pageData?.seo?.metaTitle || pageData?.title || "Refund & Cancellation Policy";
  const description =
    pageData?.seo?.metaDescription ||
    pageData?.subtitle ||
    "Official Donation Refund and Cancellation Policy of Seva India Foundation. Learn about refund conditions, processing timelines, and dispute resolution.";

  return constructMetadata({
    title,
    description,
    canonicalPath: "/refund-policy",
    keywords: [
      "Refund Policy",
      "Donation Refund India",
      "Cancellation Policy NGO",
      "Seva India Foundation Refund",
    ],
  });
}

export default async function RefundPolicyPage() {
  const pageData = await getServerCmsPage("refund-policy");

  const title = pageData?.title || "Refund & Cancellation Policy";
  const subtitle =
    pageData?.subtitle ||
    "Seva India Foundation is committed to transparency and ethical governance. This policy outlines guidelines regarding donations, cancellations, and refund requests.";
  const customContent = pageData?.content;

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Banner */}
      <section className="relative bg-[#0A1A2F] text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#F5A623_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#F5A623] text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck size={14} />
            Donation &amp; Payment Safeguards
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-serif tracking-tight text-white mb-4">
            {title}
          </h1>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
          <p className="text-xs text-white/50 mt-4">
            CIN: U88900UT2026NPL020825 | Section 8 Registered Nonprofit
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200">
          {customContent ? (
            <div
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#0A1A2F] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0A1A2F] [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_li]:my-1.5 [&_p]:my-2.5"
              dangerouslySetInnerHTML={{ __html: customContent }}
            />
          ) : (
            <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0f2347] font-serif flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#E8542A]" />
                  1. General Donation Policy
                </h2>
                <p>
                  Seva India Foundation is a registered Section 8 non-profit organisation dedicated to social welfare, education, healthcare, and rural empowerment. All donations made through our website (sevaindiafoundation.org), UPI, net banking, or debit/credit cards are considered voluntary contributions toward humanitarian causes and community relief programs.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0f2347] font-serif flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#E8542A]" />
                  2. Refund Eligibility &amp; Request Window
                </h2>
                <p>
                  As a general rule, donations once processed cannot be cancelled or refunded, as funds are allocated promptly to ongoing field operations and beneficiary support.
                </p>
                <p>
                  However, we understand that errors may occur. A refund may be granted strictly under the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                  <li><strong>Technical Glitch / Duplicate Deduction:</strong> If your account was debited multiple times for a single intended donation.</li>
                  <li><strong>Erroneous Amount:</strong> If an unintended amount was mistakenly entered and charged.</li>
                  <li><strong>Unauthorized Transaction:</strong> If a donation was made without authorization on your card/account (subject to banking verification).</li>
                </ul>
                <p className="text-xs text-slate-500 italic bg-amber-50 p-4 rounded-xl border border-amber-200">
                  Refund requests must be formally submitted in writing within <strong>7 days</strong> of the transaction date to <strong>info@sevaindiafoundation.org</strong>.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0f2347] font-serif flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#E8542A]" />
                  3. Refund Process &amp; Documentation
                </h2>
                <p>
                  To request a refund, please email us with the subject line <em>&ldquo;Donation Refund Request - [Transaction ID]&rdquo;</em> and provide:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                  <li>Donor full name, phone number, and email address</li>
                  <li>Transaction ID / Payment Reference ID / UTR Number</li>
                  <li>Date and amount of donation</li>
                  <li>Proof of transaction (bank statement snippet or payment receipt)</li>
                  <li>Reason for the refund request</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0f2347] font-serif flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#E8542A]" />
                  4. Processing Timelines &amp; Mode of Refund
                </h2>
                <p>
                  Once verified and approved by our finance committee, refunds will be credited back to the <strong>original payment method</strong> (credit card, debit card, UPI, or bank account) within <strong>7 to 10 working days</strong>.
                </p>
                <p className="text-xs text-slate-500">
                  Note: Any 80G tax exemption receipt issued for a refunded donation will become null and void automatically.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#0f2347] font-serif flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#E8542A]" />
                  5. Contact &amp; Grievance Redressal
                </h2>
                <p>
                  For any questions or concerns regarding this policy, please reach out to our Finance &amp; Accounts desk:
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm space-y-1">
                  <p><strong>Seva India Foundation</strong></p>
                  <p>Email: <a href="mailto:info@sevaindiafoundation.org" className="text-blue-600 underline">info@sevaindiafoundation.org</a></p>
                  <p>Phone / Helpline: +91 94565 17577</p>
                  <p>Address: 20, Sahastradhara Road, Upper Adhoiwala, Dehradun, Uttarakhand – 248001</p>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
