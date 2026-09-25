import React from "react";
import { ICmsSection } from "@/types/cms";
import { getImageUrl } from "@/lib/image";

const DEFAULT_STEWARDS = [
  {
    name: "PRAVESH UNIYAL",
    role: "FOUNDER & CHAIRMAN",
    initials: "PU",
    image: "",
  },
  {
    name: "SWATI",
    role: "CO-FOUNDER & DIRECTOR",
    initials: "S",
    image: "",
  },
  {
    name: "DR. RAJESH KUMAR",
    role: "MEDICAL ADVISOR",
    initials: "RK",
    image: "",
  },
];

export default function Leadership({ section }: { section?: ICmsSection }) {
  const title = section?.title || "STEWARDS OF THE MISSION";
  const subtitle =
    section?.subtitle ||
    "Our leadership is a blend of seasoned social architects and corporate experts, all united by a singular commitment to ethical service.";
  const rawItems = section?.items && section.items.length > 0 ? section.items : DEFAULT_STEWARDS;

  const stewards = rawItems.map((item: any) => {
    let initials = item.initials;
    if (!initials && item.name) {
      initials = item.name
        .split(" ")
        .map((w: string) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    return {
      name: item.name || "Leader",
      role: item.role || item.designation || "Leadership",
      initials: initials || "SIF",
      image: item.image || "",
    };
  });

  const words = title.split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  const firstWords = words.join(" ");

  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-extrabold tracking-wide text-[#0B1120] mb-4">
            {firstWords && <span>{firstWords} </span>}
            <span className="text-[#f5a623]">{lastWord || title}</span>
          </h2>
          <p className="text-[#4f46e5] text-base md:text-lg font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Stewards Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {stewards.map((steward, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_6px_28px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.09)] p-8 md:p-10 text-center flex flex-col items-center hover:-translate-y-2 transition-all duration-300 group"
            >
              {/* Circular Avatar / Initials */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-md mb-6 flex items-center justify-center bg-[#0B1120] text-[#f5a623] relative group-hover:scale-105 transition-transform duration-300">
                {steward.image ? (
                  <img
                    src={getImageUrl(steward.image) || steward.image}
                    alt={steward.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold tracking-widest font-serif text-[#f5a623]">
                    {steward.initials}
                  </span>
                )}
              </div>

              {/* Name & Role */}
              <h3 className="text-[#0B1120] font-serif font-bold text-base md:text-lg tracking-wider uppercase mb-1.5 group-hover:text-[#f5a623] transition-colors">
                {steward.name}
              </h3>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                {steward.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
