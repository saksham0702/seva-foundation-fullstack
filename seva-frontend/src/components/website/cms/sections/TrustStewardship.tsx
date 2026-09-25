import React from "react";
import { ShieldCheck } from "lucide-react";
import { ICmsSection } from "@/types/cms";

export default function TrustStewardship({ section }: { section?: ICmsSection }) {
  const extra = section?.extra || {};
  const title = section?.title || "THE STEWARDSHIP OF YOUR TRUST";
  const description =
    section?.description ||
    "At Seva India Foundation, trust isn't a promise—it's a practice. Your donation is 100% safe with us, and we ensure it reaches the ground where it is needed most, with 100% updates sent to you via WhatsApp and email.";

  const programPercent = extra.programSupportPercent || "90%";
  const programTitle = extra.programSupportTitle || "DIRECT PROGRAM SUPPORT";
  const programDesc =
    extra.programSupportDesc ||
    "Goes directly to funding our on-the-ground projects, resources, and beneficiary aid.";

  const adminPercent = extra.adminPercent || "10%";
  const adminTitle = extra.adminTitle || "ADMIN & FUNDRAISING";
  const adminDesc =
    extra.adminDesc ||
    "Essential operations, technology, and compliance to ensure radical transparency.";

  return (
    <section className="py-20 lg:py-28 bg-[#fafbff] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.8rem] border border-slate-100 shadow-[0_10px_35px_rgba(79,70,229,0.04)] p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          {/* Subtle shield watermark icon */}
          <ShieldCheck
            strokeWidth={1.2}
            className="w-56 h-56 md:w-72 md:h-72 text-blue-100/40 absolute -right-8 -top-8 pointer-events-none"
          />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold tracking-wider text-[#0B1120] uppercase">
              {title}
            </h2>

            {/* Accent divider */}
            <div className="w-20 h-1 bg-[#f5a623] rounded-full mx-auto my-4" />

            {/* Description */}
            <p className="text-[#4f46e5] text-sm md:text-base leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
              {description}
            </p>

            {/* Two Allocation Breakdown Cards */}
            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 items-stretch">
              {/* Left: Program Support (Dark) */}
              <div className="bg-[#0B1120] text-white rounded-3xl p-8 lg:p-10 text-center shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-center border border-white/5">
                <div className="text-5xl md:text-6xl font-serif font-black text-[#f5a623] mb-3 tracking-tight">
                  {programPercent}
                </div>
                <h3 className="font-serif font-bold text-xs md:text-sm uppercase tracking-wider text-white mb-2.5">
                  {programTitle}
                </h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  {programDesc}
                </p>
              </div>

              {/* Right: Admin & Fundraising (Light) */}
              <div className="bg-white border-2 border-blue-100/90 rounded-3xl p-8 lg:p-10 text-center shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-center">
                <div className="text-5xl md:text-6xl font-serif font-black text-[#0B1120] mb-3 tracking-tight">
                  {adminPercent}
                </div>
                <h3 className="font-serif font-bold text-xs md:text-sm uppercase tracking-wider text-[#0B1120] mb-2.5">
                  {adminTitle}
                </h3>
                <p className="text-xs md:text-sm text-[#4f46e5] leading-relaxed">
                  {adminDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
