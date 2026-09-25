import React from "react";
import { ICmsSection } from "@/types/cms";

const DEFAULT_AWARDS = [
  { category: "OVERALL EXCELLENCE", title: "BEST NGO OF THE YEAR", year: "2026" },
  { category: "SOCIAL WELFARE", title: "BEST NGO FOR ELDERS", year: "2026" },
  { category: "HEALTHCARE", title: "BEST NGO FOR LEPROSY CARE", year: "2026" },
  { category: "MEDICAL OUTREACH", title: "EXCELLENCE IN HEALTHCARE", year: "2026" },
  { category: "GOVERNANCE", title: "TRANSPARENCY AWARD", year: "2026" },
  { category: "INNOVATION", title: "SOCIAL IMPACT PIONEER", year: "2026" },
];

export default function HomeExcellenceSection({ section }: { section?: ICmsSection }) {
  const title = section?.title || "EXCELLENCE IN HUMAN SERVICE";
  const subtitle = section?.subtitle || "HONORS & GLOBAL RECOGNITION";
  const rawItems = section?.items && section.items.length > 0 ? section.items : DEFAULT_AWARDS;
  const watermarkText = section?.extra?.watermarkText || "2026";

  const words = title.split(" ");
  const lastTwoWords = words.length > 2 ? words.splice(-2).join(" ") : words.pop();
  const firstWords = words.join(" ");

  return (
    <section className="py-20 lg:py-28 bg-[#070D18] text-white relative overflow-hidden">
      {/* Huge Subtle Watermark Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] md:text-[220px] font-black text-white/[0.02] pointer-events-none select-none tracking-widest font-mono">
        {watermarkText}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[#f5a623] text-xs font-bold uppercase tracking-wider">
            {subtitle}
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-extrabold tracking-wide uppercase">
            {firstWords && <span className="text-white">{firstWords} </span>}
            <span className="text-[#f5a623]">{lastTwoWords}</span>
          </h2>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {rawItems.map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-[#111C30]/75 backdrop-blur-md border border-white/5 rounded-[2rem] p-7 sm:p-8 flex flex-col justify-between min-h-[175px] hover:-translate-y-1.5 hover:border-amber-500/30 transition-all duration-300 shadow-xl group"
            >
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-3">
                  {item.category || "HONOR"}
                </span>
                <h3 className="text-white font-serif font-bold text-base md:text-lg tracking-wider uppercase leading-snug group-hover:text-[#f5a623] transition-colors">
                  {item.title}
                </h3>
              </div>

              {item.year && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-[10px] uppercase font-bold text-blue-200/60">
                  <span>YEAR</span>
                  <span className="text-white font-mono font-bold text-xs">{item.year}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
