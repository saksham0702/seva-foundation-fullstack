// components/website/cms/sections/VisionMission.tsx  (Server Component)
import { Eye, Target } from "lucide-react";
import { ICmsSection } from "@/types/cms";

export default function VisionMission({ section }: { section?: ICmsSection }) {
  if (!section || (!section.extra?.vision && !section.extra?.mission)) {
    return null;
  }

  const visionText = section.extra?.vision || "";
  const missionText = section.extra?.mission || "";

  return (
    <section className="py-20 lg:py-28 bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* VISION CARD */}
          <div className="relative bg-[#111827]/60 border border-white/5 rounded-3xl p-8 lg:p-10 overflow-hidden reveal-left">
            <Eye className="absolute top-6 right-6 w-24 h-24 text-white/5" />
            <div className="w-12 h-12 bg-[#f5a623] rounded-xl flex items-center justify-center mb-6">
              <Eye className="w-6 h-6 text-[#0B1120]" />
            </div>
            <h3 className="text-white text-xl font-bold uppercase tracking-wide mb-4">
              Our Vision
            </h3>
            <p className="text-blue-200/80 leading-relaxed text-sm md:text-base">
              {visionText}
            </p>
          </div>

          {/* MISSION CARD */}
          <div className="relative bg-[#111827]/60 border border-white/5 rounded-3xl p-8 lg:p-10 overflow-hidden reveal-right delay-100">
            <Target className="absolute top-6 right-6 w-24 h-24 text-white/5" />
            <div className="w-12 h-12 bg-[#f5a623] rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-[#0B1120]" />
            </div>
            <h3 className="text-white text-xl font-bold uppercase tracking-wide mb-4">
              Our Mission
            </h3>
            <p className="text-blue-200/80 leading-relaxed text-sm md:text-base">
              {missionText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
