import React from "react";
import { Metadata } from "next";
import { ShieldCheck, Lock, FileText, CheckCircle2, Clock, Building2 } from "lucide-react";
import { getServerCmsPage } from "@/lib/server-api";
import { constructMetadata, getWebPageSchema } from "@/lib/seo";
import PrivacySubscribeForm from "@/components/website/privacy/PrivacySubscribeForm";
import SeoHead from "@/components/common/SeoHead";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getServerCmsPage("privacy");
  const title = pageData?.seo?.metaTitle || pageData?.title || "Privacy & Donor Trust Policy";
  const description =
    pageData?.seo?.metaDescription ||
    pageData?.subtitle ||
    "Seva India Foundation is committed to 100% data security, 80G tax receipt transparency, and strict donor confidentiality.";

  return constructMetadata({
    title,
    description,
    canonicalPath: "/privacy",
    keywords: [
      "Privacy Policy",
      "Donor Trust",
      "Data Protection NGO",
      "80G Tax Exemption Policy",
      "Seva India Foundation Privacy",
    ],
  });
}

export default async function PrivacyPolicyPage() {
  const pageData = await getServerCmsPage("privacy");

  const title = pageData?.title || "Privacy & Donor Trust Policy";
  const subtitle =
    pageData?.subtitle ||
    "At Seva India Foundation, trust isn't a promise—it's a practice. We protect your personal and financial information with rigorous security standards.";
  const customContent = pageData?.content;

  const privacySchema = getWebPageSchema({
    title,
    description: subtitle,
    path: "/privacy",
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <SeoHead
        title={title}
        description={subtitle}
        canonicalPath="/privacy"
        jsonLd={privacySchema}
      />
      {/* Hero Banner */}
      <section className="relative bg-[#0A1A2F] text-white py-14 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#F5A623_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-400 text-xs font-medium tracking-wide mb-5 border border-white/10">
            <Lock size={13} className="text-amber-400" />
            <span>Section 8 Transparency &amp; Data Security</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-4">
            {title}
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            {subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-400 font-normal">
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={13} className="text-amber-400/80" />
              CIN: U88900UT2026NPL020825
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span>NGO Darpan ID: UK/2026/0993905</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span>Section 8 Registered Non-Profit</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-10 lg:p-12">
          
          {/* Top Metadata Header Strip */}
          <div className="pb-6 mb-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 font-normal">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span className="font-medium text-slate-700">Official Data Governance Policy</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock size={14} className="text-slate-400" />
              <span>Effective for FY 2025–2026 • Version 2.1</span>
            </div>
          </div>

          {customContent ? (
            <div
              className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm sm:text-base [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-slate-900 [&_h1]:mb-4 [&_h2]:text-lg sm:[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:pt-6 [&_h2]:border-t [&_h2]:border-slate-100 first:[&_h2]:pt-0 first:[&_h2]:border-t-0 [&_h3]:text-base sm:[&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-slate-800 [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:text-slate-600 [&_p]:leading-relaxed [&_p]:my-3.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_ol]:space-y-1.5 [&_li]:text-slate-600 [&_li]:text-sm sm:[&_li]:text-[15px] [&_strong]:font-semibold [&_strong]:text-slate-800 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-700"
              dangerouslySetInnerHTML={{ __html: customContent }}
            />
          ) : (
            <div className="space-y-6">
              {/* Pillar 1 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 sm:p-6 transition-colors hover:border-slate-200">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 font-semibold text-xs flex items-center justify-center shrink-0">
                    01
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Information We Collect
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-10 font-normal">
                  When you donate, apply to volunteer, or subscribe to our updates, we collect your name, email, phone number, PAN (for 80G tax receipt issuance), and communication preferences. We do not store sensitive payment card details or netbanking passwords on our servers.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 sm:p-6 transition-colors hover:border-slate-200">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 font-semibold text-xs flex items-center justify-center shrink-0">
                    02
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    How Your Information Is Used
                  </h2>
                </div>
                <ul className="text-sm text-slate-600 space-y-2 pl-10 list-disc font-normal">
                  <li>To generate and deliver cryptographically sealed 80G tax exemption certificates.</li>
                  <li>To transmit transactional receipts and verification records directly to your registered email.</li>
                  <li>To notify you about the tangible field progress of programs you have funded.</li>
                  <li>To verify volunteer applicants and conduct orientation sessions.</li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 sm:p-6 transition-colors hover:border-slate-200">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 font-semibold text-xs flex items-center justify-center shrink-0">
                    03
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Zero-Spam &amp; Non-Disclosure Guarantee
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-10 font-normal">
                  We maintain a strict zero-tolerance policy against selling, renting, or commercializing donor data. Your details are accessible only by authorized compliance officers for statutory filing with the Income Tax Department of India.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 sm:p-6 transition-colors hover:border-slate-200">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 font-semibold text-xs flex items-center justify-center shrink-0">
                    04
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Payment Security &amp; Encryption
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-10 font-normal">
                  All transactions on our platform are processed through PCI-DSS Level 1 certified payment gateways with 256-bit TLS encryption, ensuring bank-grade protection for every transaction.
                </p>
              </div>
            </div>
          )}

          {/* Subscribe to Transparency Reports */}
          <PrivacySubscribeForm />
        </div>
      </div>
    </main>
  );
}

