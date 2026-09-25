import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Heart } from "lucide-react";
import { ICmsSection } from "@/types/cms";

export default function HomePatronSection({ section }: { section?: ICmsSection }) {
  const title = section?.title || "DEV BHOOMI SAMITI";
  const subtitle =
    section?.subtitle ||
    "Dev Bhoomi Samiti is our spiritual and strategic cornerstone. Deeply interwoven with the social fabric of Uttarakhand, the Samiti provides the visionary leadership and structural backbone that makes our mission possible.";

  const extra = section?.extra || {};
  const badgeText = extra.badgeText || "PRINCIPAL PATRON";
  const buttonText = extra.buttonText || "Learn More";
  const buttonLink = extra.buttonLink || "/about";
  const cardEyebrow = extra.cardEyebrow || "OUR VISIONARY BACKBONE";
  const cardTitle = extra.cardTitle || "Spiritual & Social Support";
  const cardQuote =
    extra.cardQuote ||
    '"Uttarakhand, the land of gods, teaches us that service to humanity is the highest form of worship. Seva India Foundation carries this torch forward."';

  const words = title.split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  const firstWords = words.join(" ");

  return (
    <section className="py-20 lg:py-28 bg-[#fafbff] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#f5a623] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-[#f5a623]" />
              <span>{badgeText}</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl md:text-5xl font-serif font-extrabold tracking-wide text-[#0B1120] uppercase leading-tight">
              {firstWords && <span>{firstWords} </span>}
              <span className="text-[#f5a623]">{lastWord || title}</span>
            </h2>

            {/* Text Card */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-3xl p-6 md:p-8">
              <p className="text-[#4f46e5] text-sm md:text-base leading-relaxed font-normal">
                {subtitle}
              </p>
            </div>

            {/* Button */}
            <div>
              <Link
                href={buttonLink}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#f5a623] hover:bg-[#d97706] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/20 hover:gap-3 group"
              >
                <span>{buttonText}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Dark Patron Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#0B1120] text-white rounded-[2.8rem] p-8 sm:p-10 md:p-12 relative overflow-hidden shadow-2xl border border-white/5 hover:-translate-y-1.5 transition-all duration-300 group">
              {/* Background watermark icon */}
              <Heart
                strokeWidth={1}
                className="w-48 h-48 text-white/5 absolute -right-6 -bottom-6 pointer-events-none group-hover:scale-110 transition-transform duration-500"
              />

              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-[#f5a623] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <ShieldCheck className="w-7 h-7 text-[#0B1120] stroke-[2.2]" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#f5a623] uppercase tracking-widest block">
                    {cardEyebrow}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-white tracking-wide">
                    {cardTitle}
                  </h3>
                </div>

                <div className="w-12 h-0.5 bg-white/20" />

                <p className="text-slate-300 italic text-sm md:text-base leading-relaxed">
                  {cardQuote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
