import React from "react";
import Image from "next/image";
import { ICmsSection } from "@/types/cms";
import { getImageUrl } from "@/lib/image";
import { Quote } from "lucide-react";

export default function Testimonials({ section }: { section?: ICmsSection }) {
  if (!section) return null;

  const items = section.items || [];
  if (!items || items.length === 0) return null;

  const sectionTitle = section.title || "Voices from the Ground";
  const sectionSubtitle = section.subtitle || section.extra?.subtitle || "Hear From Our Community";

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          {sectionSubtitle && (
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8542A] mb-2 block">
              {sectionSubtitle}
            </span>
          )}
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0f2347]">
            {sectionTitle}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item: any, idx: number) => {
            const avatarUrl = item.avatar || item.image;
            return (
              <div
                key={item.name || idx}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-3">
                  <Quote size={24} className="text-[#E8542A]/40" />
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                    &ldquo;{item.quote || item.content || item.description}&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  {avatarUrl ? (
                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-orange-200">
                      <Image
                        src={getImageUrl(avatarUrl)}
                        alt={item.name || "Volunteer"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-[#E8542A] flex items-center justify-center font-bold text-sm shrink-0">
                      {item.name?.charAt(0) || "V"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#0f2347] truncate">{item.name}</h4>
                    <p className="text-[11px] text-[#E8542A] font-semibold truncate">{item.role}</p>
                    {(item.since || item.hours) && (
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {item.since ? `Contributing since ${item.since}` : ""}
                        {item.since && item.hours ? " • " : ""}
                        {item.hours ? `${item.hours} hours` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
