import React from "react";
import Link from "next/link";
import { ShieldCheck, HeartHandshake, ArrowRight } from "lucide-react";
import { ICmsSection } from "@/types/cms";

export default function AlliesInImpact({ section }: { section?: ICmsSection }) {
  const title = section?.title || "ALLIES IN IMPACT";
  const subtitle =
    section?.subtitle ||
    "Powered by organizations that prioritize direct, ground-level action over corporate lip-service.";

  const extra = section?.extra || {};
  const partnerName = extra.partnerName || "DEV BHOOMI SAMITI";
  const partnerPillar =
    extra.partnerPillar ||
    "Strategic Pillar: The immense contribution of Dev Bhoomi Samiti is what makes our mission possible. As our principal patron, they provide the visionary leadership and total support that fuels every project, every camp, and every life we touch.";
  const partnerWebsiteUrl = extra.partnerWebsiteUrl || "https://devbhoomisamiti.org";

  const coreStrengthTitle =
    extra.coreStrengthTitle || "FOUNDATION'S CORE STRENGTH";
  const coreStrengthDesc =
    extra.coreStrengthDesc ||
    "Our operational model is built on the immense contribution and full visionary backing of Dev Bhoomi Samiti. This unique alliance allows us to focus 100% of our energy on ground-level implementation, ensuring that every resource is utilized for maximum social impact.";

  const statusLabel = extra.partnershipStatusLabel || "PARTNERSHIP STATUS";
  const statusValue = extra.partnershipStatusValue || "CORE STRATEGIC ALLIANCE";

  const words = title.split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  const firstWords = words.join(" ");

  return (
    <section className="py-20 lg:py-28 bg-[#fafbff] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-5xl font-serif font-extrabold tracking-wide text-[#0B1120] mb-4">
            {firstWords && <span>{firstWords} </span>}
            <span className="text-[#f5a623]">{lastWord || title}</span>
          </h2>
          <p className="text-[#4f46e5] text-base md:text-lg font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 2 Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Left Card: DEV BHOOMI SAMITI (Dark) */}
          <div className="bg-[#0B1120] text-white rounded-[2.8rem] p-8 sm:p-12 lg:p-14 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/5 hover:-translate-y-1.5 transition-all duration-300 group">
            <div>
              {/* Icon badge */}
              <div className="w-16 h-16 rounded-2xl bg-[#f5a623] flex items-center justify-center mb-8 shadow-md group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck className="w-8 h-8 text-[#0B1120] stroke-[2.2]" />
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-serif font-extrabold uppercase tracking-wider text-[#f5a623] mb-5">
                {partnerName}
              </h3>

              {/* Description */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
                {partnerPillar}
              </p>
            </div>

            {/* Visit link */}
            <div>
              <Link
                href={partnerWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#f5a623] hover:text-amber-300 transition-colors group/link"
              >
                <span>VISIT OFFICIAL WEBSITE</span>
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Card: Foundation's Core Strength (Light) */}
          <div className="bg-[#f8fafc] border border-blue-100 rounded-[2.8rem] p-8 sm:p-12 lg:p-14 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-extrabold uppercase tracking-wider text-[#0B1120] mb-5">
                {coreStrengthTitle}
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-10">
                {coreStrengthDesc}
              </p>
            </div>

            {/* Status card */}
            <div className="bg-white border border-blue-100/90 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-0.5">
                  {statusLabel}
                </span>
                <span className="text-xs sm:text-sm font-serif font-extrabold text-[#0B1120] uppercase tracking-wider block truncate">
                  {statusValue}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
