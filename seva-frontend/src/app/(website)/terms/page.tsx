import React from "react";
import { Metadata } from "next";
import { Scale, CheckCircle } from "lucide-react";
import { getServerCmsPage } from "@/lib/server-api";
import { constructMetadata } from "@/lib/seo";

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
              className="prose max-w-none text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: customContent }}
            />
          ) : (
            <>
              {/* Section 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0A1A2F]">
                    Incorporation &amp; Legal Character
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-11">
                  Seva India Foundation is a registered Section 8 non-profit organization under the Companies Act, 2013, with CIN U88900UT2026NPL020825 and NGO Darpan ID UK/2026/0993905. All activities and donations are dedicated exclusively to charitable and social welfare causes without profit distribution.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0A1A2F]">
                    Donations &amp; 80G Tax Exemption
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-11">
                  All donations made through our official portal are eligible for tax deduction under Section 80G of the Indian Income Tax Act. Instant verifiable digital receipts and certificates are issued to the donor upon transaction completion.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0A1A2F]">
                    Refund &amp; Cancellation Policy
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-11">
                  Donations made to charitable causes are generally non-refundable once deployed to field initiatives. In the exceptional case of erroneous duplicate transactions, refund requests submitted within 48 hours to info@sevaindiafoundation.org will be reviewed and processed via original payment mode.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0A1A2F]">
                    Code of Conduct for Volunteers
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-11">
                  Volunteers represent Seva India Foundation in local communities and must adhere to our values of empathy, dignity, child protection, and ethical service.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
