import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import { ICmsSection } from "@/types/cms";

export default function HomeIntegritySection({ section }: { section?: ICmsSection }) {
  const extra = section?.extra || {};
  const title = section?.title || "INTEGRITY & COMPLIANCE";
  const description =
    section?.description ||
    "At Seva India Foundation, trust isn't a promise—it's a practice. As a registered Section 8 NGO, we protect your trust through meticulous accountability and radical transparency.";

  const programPercent = extra.programSupportPercent || "90%";
  const programLabel = extra.programSupportLabel || "DIRECT PROGRAM SUPPORT";
  const adminPercent = extra.adminPercent || "10%";
  const adminLabel = extra.adminLabel || "FUNDRAISING & ADMIN";

  const darpanId = extra.darpanId || "UK/2026/0993905";
  const cin = extra.cin || "U88900UT2026NPL020825";
  const licenseNo = extra.licenseNo || "No. 179973";
  const panNumber = extra.panNumber || "ABSCS7219M";
  const tanNumber = extra.tanNumber || "MRTS38379F";

  const officeTitle = extra.officeTitle || "REGISTERED OFFICE";
  const officeAddress =
    extra.officeAddress ||
    "20, Sahastradhara Road, Rishinagar Upper Adhoiwala, Dehradun, Uttarakhand - 248001";
  const complianceDocLink = extra.complianceDocLink || "/about";

  const numProgram = parseInt(programPercent) || 90;
  const numAdmin = parseInt(adminPercent) || 10;

  return (
    <section className="py-20 lg:py-28 bg-[#0B1120] text-white relative overflow-hidden">
      {/* Background subtle watermark shield */}
      <ShieldCheck
        strokeWidth={1}
        className="w-80 h-80 text-white/[0.03] absolute -right-10 -top-10 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading, Description, Bars, Compliance Identifiers */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-serif font-extrabold tracking-wide uppercase text-white">
                {title}
              </h2>
              <p className="text-blue-100/70 text-sm md:text-base leading-relaxed max-w-2xl font-normal">
                {description}
              </p>
            </div>

            {/* Fund Allocation Bars */}
            <div className="space-y-5 max-w-xl">
              {/* Program Support Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-blue-200">{programLabel}</span>
                  <span className="text-[#f5a623] text-sm font-black font-mono">{programPercent}</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#f5a623] rounded-full transition-all duration-1000"
                    style={{ width: `${numProgram}%` }}
                  />
                </div>
              </div>

              {/* Admin & Fundraising Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-blue-300/80">{adminLabel}</span>
                  <span className="text-white text-sm font-black font-mono">{adminPercent}</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-slate-400 rounded-full transition-all duration-1000"
                    style={{ width: `${numAdmin}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Compliance Numbers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
                  NGO DARPAN ID
                </span>
                <span className="text-white font-mono font-bold text-sm tracking-wide">
                  {darpanId}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
                  CIN NUMBER
                </span>
                <span className="text-white font-mono font-bold text-sm tracking-wide break-all">
                  {cin}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
                  SECTION 8 LICENSE
                </span>
                <span className="text-white font-mono font-bold text-sm tracking-wide">
                  {licenseNo}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
                  PAN NUMBER
                </span>
                <span className="text-white font-mono font-bold text-sm tracking-wide">
                  {panNumber}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
                  TAN NUMBER
                </span>
                <span className="text-white font-mono font-bold text-sm tracking-wide">
                  {tanNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Registered Office Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#111C30]/70 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden space-y-8 hover:border-white/20 transition-colors">
              <h3 className="font-serif font-extrabold text-base md:text-lg tracking-wider text-white uppercase">
                {officeTitle}
              </h3>

              <div className="flex items-start gap-3.5 text-slate-200">
                <MapPin className="w-5 h-5 text-[#f5a623] shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-slate-300">
                  {officeAddress}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Link
                  href={complianceDocLink}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#f5a623] uppercase tracking-wider hover:text-amber-300 transition-colors group"
                >
                  <span>VIEW COMPLIANCE DOCUMENTS</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
