import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, FileText, ChevronRight, CheckCircle2 } from "lucide-react";
import { getServerCmsPage } from "@/lib/server-api";
import { constructMetadata } from "@/lib/seo";
import PrivacySubscribeForm from "@/components/website/privacy/PrivacySubscribeForm";

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

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Banner */}
      <section className="relative bg-[#0A1A2F] text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#F5A623_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#F5A623] text-xs font-bold uppercase tracking-wider mb-4">
            <Lock size={14} />
            Section 8 Transparency &amp; Data Security
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-serif tracking-tight text-white mb-4">
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
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#0A1A2F] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0A1A2F] [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_li]:my-1.5 [&_p]:my-2.5"
              dangerouslySetInnerHTML={{ __html: customContent }}
            />
          ) : (
            <>
              {/* Pillar 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0A1A2F]">
                    Information We Collect
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-11">
                  When you donate, apply to volunteer, or subscribe to our updates, we collect your name, email, phone number, PAN (for 80G tax receipt issuance), and communication preferences. We do not store sensitive payment card details or netbanking passwords on our servers.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0A1A2F]">
                    How Your Information Is Used
                  </h2>
                </div>
                <ul className="text-sm text-slate-600 space-y-2 pl-11 list-disc">
                  <li>To generate and deliver cryptographically sealed 80G tax exemption certificates.</li>
                  <li>To transmit transactional receipts and verification records directly to your registered email.</li>
                  <li>To notify you about the tangible field progress of programs you have funded.</li>
                  <li>To verify volunteer applicants and conduct orientation sessions.</li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0A1A2F]">
                    Zero-Spam &amp; Non-Disclosure Guarantee
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-11">
                  We maintain a strict zero-tolerance policy against selling, renting, or commercializing donor data. Your details are accessible only by authorized compliance officers for statutory filing with the Income Tax Department of India.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0A1A2F]">
                    Payment Security &amp; Encryption
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-11">
                  All transactions on our platform are processed through PCI-DSS Level 1 certified payment gateways with 256-bit TLS encryption, ensuring bank-grade protection for every transaction.
                </p>
              </div>
            </>
          )}

          {/* Subscribe to Transparency Reports */}
          <PrivacySubscribeForm />
        </div>
      </div>
    </main>
  );
}
