import React from "react";
import { Award } from "lucide-react";
import { ICmsSection } from "@/types/cms";

const DEFAULT_AWARDS = [
  { title: "BEST NGO FOR EDUCATION" },
  { title: "EXCELLENCE IN HEALTHCARE DELIVERY" },
  { title: "TRANSPARENCY IN GOVERNANCE AWARD" },
  { title: "SOCIAL IMPACT PIONEER" },
];

export default function AwardsRecognition({ section }: { section?: ICmsSection }) {
  const title = section?.title || "Awards & Recognition";
  const rawItems = section?.items && section.items.length > 0 ? section.items : DEFAULT_AWARDS;

  const awards = rawItems.map((item: any) => ({
    title: item.title || item.name || "Award",
  }));

  return (
    <section className="py-20 lg:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-extrabold tracking-wide text-[#0B1120]">
            {title}
          </h2>
          {section?.subtitle && (
            <p className="text-[#4f46e5] text-sm md:text-base mt-3 font-medium">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {awards.map((award, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[2.2rem] border border-blue-100/90 p-8 text-center flex flex-col items-center justify-center min-h-[190px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_35px_rgba(245,166,35,0.12)] hover:-translate-y-1.5 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#f5a623] transition-all duration-300">
                <Award
                  strokeWidth={1.8}
                  className="w-8 h-8 text-[#f5a623] group-hover:text-white transition-colors duration-300"
                />
              </div>
              <h3 className="text-xs md:text-sm font-serif font-bold text-[#0B1120] uppercase tracking-wider leading-snug group-hover:text-[#f5a623] transition-colors">
                {award.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
