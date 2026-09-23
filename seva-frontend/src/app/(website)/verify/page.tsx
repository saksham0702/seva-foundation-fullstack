import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Award, CheckCircle2 } from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import VerifySearchForm from "@/components/website/verify/VerifySearchForm";

export const metadata: Metadata = constructMetadata({
  title: "Verify Certificate",
  description:
    "Verify the authenticity of digital certificates issued by Seva India Foundation for donors, volunteers, and participants.",
  canonicalPath: "/verify",
  keywords: [
    "Verify Certificate",
    "NGO Certificate Validation",
    "Donation 80G Certificate Verification",
    "Volunteer Certificate Registry",
  ],
});

export default function VerifyCertificateIndexPage() {
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
          <VerifySearchForm />

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
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-[#0B2C6B] font-medium transition-colors"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
