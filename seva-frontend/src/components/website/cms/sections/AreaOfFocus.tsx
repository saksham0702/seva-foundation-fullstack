import React from "react";
import { Check } from "lucide-react";
import { ICmsSection } from "@/types/cms";

export default function AreasOfFocus({ section }: { section?: ICmsSection }) {
  if (!section || !section.items || section.items.length === 0) {
    return null;
  }

  const title = section.title || "AREAS OF FOCUS";
  const subtitle =
    section.subtitle ||
    "Our organization's efforts are concentrated on these key areas.";
  const rawItems = section.items;

  const areas = rawItems.map((item: any) => ({
    title: item.title || item.name || "Focus Area",
    desc: item.desc || item.description || "",
  }));

  const words = title.split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  const firstWords = words.join(" ");

  return (
    <section className="py-20 lg:py-28 bg-[#fafbff] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-up">
          <h2 className="text-3xl md:text-5xl font-serif font-extrabold tracking-wide text-[#0B1120] mb-4">
            {firstWords && <span>{firstWords} </span>}
            <span className="text-[#f5a623]">{lastWord || title}</span>
          </h2>
          <p className="text-[#4f46e5] text-base md:text-lg font-medium">
            {subtitle}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {areas.map((area, idx) => (
            <div
              key={idx}
              className={`bg-white/90 backdrop-blur-sm border border-blue-100/80 rounded-[2.2rem] p-8 lg:p-9 shadow-[0_4px_20px_rgba(79,70,229,0.04)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.12)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between ${
                idx % 2 === 0 ? "reveal-left" : "reveal-right"
              } delay-${Math.min((idx % 3) * 100, 300)}`}
            >
              <div>
                <div className="w-11 h-11 rounded-full border border-blue-200 bg-blue-50/70 flex items-center justify-center mb-6 group-hover:bg-[#4f46e5] group-hover:border-[#4f46e5] transition-colors duration-300 shadow-sm">
                  <Check className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300 stroke-[2.5]" />
                </div>
                <h3 className="text-[#0B1120] font-serif font-bold text-base md:text-lg uppercase tracking-wider mb-3 leading-snug">
                  {area.title}
                </h3>
                <p className="text-[#4f46e5] text-sm leading-relaxed font-normal">
                  {area.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}