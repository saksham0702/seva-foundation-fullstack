// components/website/cms/sections/Transparency.tsx  (Server Component)
import { Shield } from "lucide-react";
import { ICmsSection } from "@/types/cms";

export default function Transparency({ section }: { section?: ICmsSection }) {
  const extra = section?.extra || {};
  const darpanId = extra.darpanId || "UK/2026/0993905";
  const cin = extra.cin || "U88900UT2026NPL020825";
  const taxExemption = extra.taxExemption || "80G & 12A";
  const legalStatus = extra.legalStatus || "Section 8 Company";
  const title = section?.title || "100% TRANSPARENT & ACCOUNTABLE";
  const description =
    section?.description ||
    "At Seva India Foundation, trust isn't a promise—it's a practice. As a registered Section 8 NGO, we protect your trust through meticulous accountability and radical transparency.";

  return (
    <section
      className="py-20 lg:py-28"
      style={{
        backgroundColor: "#f5a623",
        backgroundImage: "radial-gradient(circle, #d97706 1.5px, transparent 1.5px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1120] rounded-[2.5rem] p-8 md:p-12 lg:p-16 shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <Shield className="w-4 h-4 text-[#f5a623]" />
                <span className="text-[#f5a623] text-xs font-bold uppercase tracking-wider">
                  Government Recognized
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-2">
                100% TRANSPARENT
              </h2>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#f5a623] mb-6">
                & ACCOUNTABLE
              </h2>

              <p className="text-blue-200/70 leading-relaxed text-sm md:text-base">
                {description}
              </p>
            </div>

            {/* RIGHT: 2x2 Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 min-w-0 overflow-hidden hover:bg-white/[0.08] transition-colors">
                <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  NGO Darpan ID
                </div>
                <div className="text-white font-semibold text-xs sm:text-sm font-mono break-all select-all leading-snug">
                  {darpanId}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 min-w-0 overflow-hidden hover:bg-white/[0.08] transition-colors">
                <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  CIN Number
                </div>
                <div className="text-white font-semibold text-xs sm:text-sm font-mono break-all select-all leading-snug">
                  {cin}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 min-w-0 overflow-hidden hover:bg-white/[0.08] transition-colors">
                <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  Tax Exemption
                </div>
                <div className="text-white font-semibold text-xs sm:text-sm break-words leading-snug">
                  {taxExemption}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 min-w-0 overflow-hidden hover:bg-white/[0.08] transition-colors">
                <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  Legal Status
                </div>
                <div className="text-white font-semibold text-xs sm:text-sm break-words leading-snug">
                  {legalStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
