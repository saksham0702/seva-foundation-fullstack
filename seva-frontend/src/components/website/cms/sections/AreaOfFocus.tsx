// components/website/cms/sections/AreasOfFocus.tsx  (Server Component, no "use client")
import { Check } from "lucide-react";
import { ICmsSection } from "@/types/cms";

export default function AreasOfFocus({ section }: { section: ICmsSection }) {
    const areas = (section.items || []) as { title: string; desc: string }[];
    if (areas.length === 0) return null;

    return (
        <section className="py-20 lg:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-semibold text-[#0B1120] mb-3">
                        {section.title || "AREAS OF FOCUS"}
                    </h2>
                    <p className="text-[#4f46e5] text-base">{section.subtitle}</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {areas.map((area, idx) => (
                        <div key={idx} className="bg-gray-50/80 border border-gray-100 rounded-3xl p-8">
                            <div className="w-10 h-10 rounded-full border border-blue-200 flex items-center justify-center mb-5">
                                <Check className="w-5 h-5 text-blue-500" />
                            </div>
                            <h3 className="text-[#0B1120] font-bold text-sm uppercase mb-3">{area.title}</h3>
                            <p className="text-[#4f46e5] text-sm leading-relaxed">{area.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}