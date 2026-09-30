// components/website/cms/sections/SacredPromise.tsx  (Server Component)
import Image from "next/image";
import { Heart } from "lucide-react";
import { ICmsSection } from "@/types/cms";

function getImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function SacredPromise({ section }: { section?: ICmsSection }) {
  if (!section || (!section.description && !section.title)) {
    return null;
  }

  const sectionImage = getImageUrl(section.image);
  const year = section.extra?.year || "2026";
  const badgeText = section.extra?.badgeText || "Born of Student Empathy";
  const customStory = section.description;
  const paragraph2 = section.extra?.paragraph2 || section.extra?.secondParagraph || section.extra?.blueParagraph;

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#0B1120] mb-12 reveal-up">
          {section.title || "The Sacred Promise"}
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT: Story */}
          <div className="space-y-6 reveal-left">
            {customStory && (
              <div className="bg-gray-50 border-l-4 border-slate-300 rounded-r-xl p-6 md:p-8">
                <p className="text-[#0B1120] italic leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                  {customStory}
                </p>
              </div>
            )}
            {paragraph2 && (
              <div className="bg-[#0f2347]/5 border-l-4 border-[#0f2347] rounded-r-xl p-6 md:p-8 shadow-xs">
                <p className="text-[#0f2347] font-semibold leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                  {paragraph2}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Image card with year badge */}
          <div className="relative mt-6 lg:mt-0 reveal-right delay-100">
            <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[380px] lg:h-[520px] bg-gradient-to-br from-[#0B1120] via-[#1a3a6b] to-[#0B1120] flex items-center justify-center p-8 border border-white/10">
              {sectionImage ? (
                <Image
                  src={sectionImage}
                  alt={section.name || section.title || "The Sacred Promise"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-center space-y-4 max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-[#f5a623]/20 border border-[#f5a623]/40 flex items-center justify-center mx-auto shadow-lg">
                    <Heart className="w-8 h-8 text-[#f5a623]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Grassroots Impact</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Dedicated to eliminating poverty, nourishing underserved families, and uplifting communities across Uttarakhand.
                  </p>
                </div>
              )}
            </div>
            {/* Year badge */}
            <div className="absolute -bottom-6 -left-4 lg:left-6 bg-[#f5a623] rounded-2xl px-6 py-5 shadow-lg z-10">
              <div className="text-[#0B1120] text-4xl font-bold">{year}</div>
              <div className="text-[#0B1120] text-[10px] font-bold uppercase tracking-wider">{badgeText}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
