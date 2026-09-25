import React from "react";
import { ICmsSection } from "@/types/cms";
import { getImageUrl } from "@/lib/image";

const DEFAULT_MEDIA = [
  { name: "THE BETTER INDIA", color: "#e11d48", logo: "" },
  { name: "THE INDIAN EXPRESS", color: "#0f172a", logo: "" },
  { name: "YOURSTORY", color: "#dc2626", logo: "" },
  { name: "ANI", color: "#ea580c", logo: "" },
  { name: "NDTV", color: "#ef4444", logo: "" },
  { name: "TIMES OF INDIA", color: "#1e293b", logo: "" },
];

export default function FeaturedInMarquee({ section }: { section?: ICmsSection }) {
  const title = section?.title || "Featured In";
  const rawItems = section?.items && section.items.length > 0 ? section.items : DEFAULT_MEDIA;

  // Duplicate items for continuous seamless loop
  const marqueeItems = [...rawItems, ...rawItems, ...rawItems];

  return (
    <section className="py-12 bg-white border-y border-slate-100 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-serif italic font-extrabold text-[#0B1120] tracking-tight">
          {title}
        </h2>
      </div>

      {/* Marquee Container with Left & Right Gradient Fades */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex items-center gap-6 w-max animate-marquee hover:[animation-play-state:paused] py-2">
          {marqueeItems.map((item: any, idx: number) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-8 py-3.5 flex items-center justify-center shrink-0 min-w-[170px] h-[64px] hover:shadow-md hover:border-blue-100 hover:scale-105 transition-all duration-300 select-none"
            >
              {item.logo ? (
                <img
                  src={getImageUrl(item.logo) || item.logo}
                  alt={item.name}
                  className="max-h-8 max-w-[130px] object-contain"
                />
              ) : (
                <span
                  className="font-serif font-extrabold text-sm md:text-base tracking-wider uppercase text-center"
                  style={{ color: item.color || "#0B1120" }}
                >
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
