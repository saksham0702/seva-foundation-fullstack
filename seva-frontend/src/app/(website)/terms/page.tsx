import React from "react";
import { Metadata } from "next";
import { Scale, Clock, Building2, ShieldCheck, Mail } from "lucide-react";
import { getServerCmsPage } from "@/lib/server-api";
import { constructMetadata, getWebPageSchema } from "@/lib/seo";
import SeoHead from "@/components/common/SeoHead";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getServerCmsPage("terms");
  const title = pageData?.seo?.metaTitle || pageData?.title || "Terms & Conditions";
  const description =
    pageData?.seo?.metaDescription ||
    pageData?.subtitle ||
    "Official Terms and Conditions governing donations, volunteer participation, and portal access at Seva India Foundation.";

  return constructMetadata({
    title,
    description,
    canonicalPath: "/terms",
    keywords: [
      "Terms and Conditions",
      "NGO Terms of Service",
      "Donation Terms India",
      "Volunteer Terms",
      "Seva India Foundation Legal",
    ],
  });
}

export default async function TermsAndConditionsPage() {
  const pageData = await getServerCmsPage("terms");

  const title = pageData?.title || "Terms & Conditions";
  const subtitle =
    pageData?.subtitle ||
    "Welcome to Seva India Foundation. By accessing our portal, donating, or participating as a volunteer, you agree to these terms.";
  const customContent = pageData?.content;

  const termsSchema = getWebPageSchema({
    title,
    description: subtitle,
    path: "/terms",
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <SeoHead
        title={title}
        description={subtitle}
        canonicalPath="/terms"
        jsonLd={termsSchema}
      />
      {/* Hero Banner */}
      <section className="relative bg-[#0A1A2F] text-white py-14 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#F5A623_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-400 text-xs font-medium tracking-wide mb-5 border border-white/10">
            <Scale size={13} className="text-amber-400" />
            <span>Official Terms of Service &amp; Governance</span>
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
              <ShieldCheck size={16} className="text-blue-600" />
              <span className="font-medium text-slate-700">Official Terms &amp; Conditions Agreement</span>
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
              {/* Section 1 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 sm:p-6 transition-colors hover:border-slate-200">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 font-semibold text-xs flex items-center justify-center shrink-0">
                    01
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Incorporation &amp; Legal Character
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-10 font-normal">
                  Seva India Foundation is a registered Section 8 non-profit organization under the Companies Act, 2013, with CIN U88900UT2026NPL020825 and NGO Darpan ID UK/2026/0993905. All activities and donations are dedicated exclusively to charitable and social welfare causes without profit distribution.
                </p>
              </div>

              {/* Section 2 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 sm:p-6 transition-colors hover:border-slate-200">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 font-semibold text-xs flex items-center justify-center shrink-0">
                    02
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Donations &amp; 80G Tax Exemption
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-10 font-normal">
                  All donations made through our official portal are eligible for tax deduction under Section 80G of the Indian Income Tax Act. Instant verifiable digital receipts and certificates are issued to the donor upon transaction completion.
                </p>
              </div>

              {/* Section 3 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 sm:p-6 transition-colors hover:border-slate-200">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 font-semibold text-xs flex items-center justify-center shrink-0">
                    03
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Refund &amp; Cancellation Policy
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-10 font-normal">
                  Donations made to charitable causes are generally non-refundable once deployed to field initiatives. In the exceptional case of erroneous duplicate transactions, refund requests submitted within 48 hours to info@sevaindiafoundation.org will be reviewed and processed via original payment mode.
                </p>
              </div>

              {/* Section 4 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 sm:p-6 transition-colors hover:border-slate-200">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 font-semibold text-xs flex items-center justify-center shrink-0">
                    04
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Code of Conduct for Volunteers
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-10 font-normal">
                  Volunteers represent Seva India Foundation in local communities and must adhere to our values of empathy, dignity, child protection, and ethical service.
                </p>
              </div>
            </div>
          )}

          {/* Legal Compliance Support Card */}
          <div className="mt-10 rounded-xl bg-slate-50/80 border border-slate-200/70 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Have questions regarding our terms or compliance?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Our legal compliance office is available for queries regarding governance and transactions.
              </p>
            </div>
            <a
              href="mailto:info@sevaindiafoundation.org"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-xs shrink-0"
            >
              <Mail size={13} className="text-amber-500" />
              <span>info@sevaindiafoundation.org</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

