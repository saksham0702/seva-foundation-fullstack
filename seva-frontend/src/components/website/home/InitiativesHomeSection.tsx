"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  Sparkles,
  GraduationCap,
  HeartPulse,
  Utensils,
  Smile,
  ShieldAlert,
  Flame,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { getImageUrl } from "@/lib/image";
import { InitiativeData } from "@/components/website/our-work/InitiativeCard";

interface InitiativesHomeSectionProps {
  initiatives?: InitiativeData[];
}

const DEFAULT_HOME_INITIATIVES: InitiativeData[] = [
  {
    key: "vidhya",
    name: "VIDHYA (EDUCATION)",
    title: "VIDHYA (EDUCATION)",
    subtitle: "Bridge schools & scholarships for remote and underprivileged children.",
    description: "Democratizing access to quality education, empowering over 100,000 children in rural communities.",
    image: "",
    extra: {
      eyebrow: "FOUNDATIONAL LEARNING",
      alt: "Children in rural bridge school smiling and studying",
      features: ["RURAL BRIDGE SCHOOLS", "TEACHER TRAINING", "SCHOLARSHIPS"],
      impactMetrics: [{ value: "100,000+", label: "STUDENTS ENROLLED" }],
    },
  },
  {
    key: "arogya",
    name: "AROGYA (HEALTHCARE)",
    title: "AROGYA (HEALTHCARE)",
    subtitle: "Mobile medical clinics reaching isolated Himalayan hamlets.",
    description: "Bringing free primary care, diagnostic testing, and life-saving medicines to the vulnerable.",
    image: "",
    extra: {
      eyebrow: "MOBILE MEDICAL AID",
      alt: "Compassionate medical caregiver holding hands with patient",
      features: ["MOBILE CLINIC CAMPS", "FREE MEDICINES & LABS", "MATERNAL CARE"],
      impactMetrics: [{ value: "50,000+", label: "PATIENTS TREATED" }],
    },
  },
  {
    key: "annapurna",
    name: "ANNAPURNA (HUNGER)",
    title: "ANNAPURNA (HUNGER)",
    subtitle: "Hygienic daily meals & emergency ration distributions.",
    description: "Guaranteeing nutrition security for daily-wage workers, homeless elders, and distress zones.",
    image: "",
    extra: {
      eyebrow: "ZERO HUNGER MISSION",
      alt: "Nutritious warm meals distributed to families",
      features: ["COMMUNITY KITCHENS", "DAILY HOT MEALS", "DRY RATIONS"],
      impactMetrics: [{ value: "500,000+", label: "MEALS SERVED" }],
    },
    },
  {
    key: "sammaan",
    name: "SAMMAAN (ELDERLY CARE)",
    title: "SAMMAAN (ELDERLY CARE)",
    subtitle: "Dignity, nutrition, and healthcare for destitute senior citizens.",
    description: "Protecting abandoned elders through doorstep medicine, hot meals, and social companionship.",
    image: "",
    extra: {
      eyebrow: "SENIOR CITIZEN DIGNITY",
      alt: "Elderly individual receiving care and companionship",
      features: ["GERIATRIC HEALTHCARE", "MONTHLY RATIONS", "COMPANIONSHIP"],
      impactMetrics: [{ value: "10,000+", label: "ELDERS CARED FOR" }],
    },
  },
];

const INITIATIVE_ICONS: Record<string, any> = {
  vidhya: GraduationCap,
  arogya: HeartPulse,
  annapurna: Utensils,
  sammaan: Smile,
  shakti: Sparkles,
  gramodaya: Globe,
  rakshak: ShieldAlert,
};

const INITIATIVE_ACCENTS: Record<string, { badge: string; text: string; lightBg: string }> = {
  vidhya: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    text: "text-blue-600",
    lightBg: "bg-blue-50/50",
  },
  arogya: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    text: "text-emerald-600",
    lightBg: "bg-emerald-50/50",
  },
  annapurna: {
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    text: "text-orange-600",
    lightBg: "bg-orange-50/50",
  },
  sammaan: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    text: "text-amber-600",
    lightBg: "bg-amber-50/50",
  },
  shakti: {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    text: "text-purple-600",
    lightBg: "bg-purple-50/50",
  },
  gramodaya: {
    badge: "bg-teal-50 text-teal-700 border-teal-200",
    text: "text-teal-600",
    lightBg: "bg-teal-50/50",
  },
  rakshak: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    text: "text-rose-600",
    lightBg: "bg-rose-50/50",
  },
};

export default function InitiativesHomeSection({
  initiatives,
}: InitiativesHomeSectionProps) {
  const displayItems =
    initiatives && initiatives.length > 0
      ? initiatives.slice(0, 4)
      : DEFAULT_HOME_INITIATIVES;

  return (
    <section className="bg-[#FAF7F2] py-16 sm:py-24 border-y border-stone-200/60 relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5A623]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2F54EB]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8542A] mb-3">
              <span className="w-5 h-px bg-[#E8542A]" />
              Dedicated Grassroots Initiatives
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#0A1A2F] leading-tight">
              Creating lasting change from{" "}
              <span className="text-[#F5A623] italic">the ground up</span>
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Beyond individual campaigns, our 7 core initiatives establish sustained infrastructure, mobile clinics, bridge schools, and community kitchens across India.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/our-work"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0A1A2F] hover:text-[#E8542A] bg-white border border-slate-300 hover:border-[#E8542A] px-5 py-3 rounded-xl transition-all shadow-sm group"
            >
              <span>View All 7 Initiatives</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayItems.map((init) => {
            const key = init.key.toLowerCase();
            const Icon = INITIATIVE_ICONS[key] || Sparkles;
            const accent = INITIATIVE_ACCENTS[key] || {
              badge: "bg-slate-100 text-slate-800 border-slate-200",
              text: "text-slate-800",
              lightBg: "bg-slate-50",
            };

            const title = init.title || init.name || key.toUpperCase();
            const rawImage = init.image || "";
            const imageUrl = rawImage ? getImageUrl(rawImage) : "";
            const topMetric = init.extra?.impactMetrics?.[0];
            const features = init.extra?.features || [];

            return (
              <div
                key={init.key}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Image or Icon Hero */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={init.extra?.alt || title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50/30 p-6 text-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${accent.badge}`}>
                          <Icon size={24} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {init.extra?.eyebrow || "Seva Foundation"}
                        </span>
                      </div>
                    )}

                    {/* Top Eyebrow Tag */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-md bg-white/90 shadow-sm ${accent.text}`}
                      >
                        {init.extra?.eyebrow || "Initiative"}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-serif font-bold text-[#0A1A2F] group-hover:text-[#E8542A] transition-colors leading-snug">
                      {title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {init.subtitle || init.description}
                    </p>

                    {/* Impact Metric Callout */}
                    {topMetric && (
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <span className="text-base font-bold text-[#0A1A2F]">
                          {topMetric.value}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                          {topMetric.label}
                        </span>
                      </div>
                    )}

                    {/* Feature Pills */}
                    {features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {features.slice(0, 2).map((f, fIdx) => (
                          <span
                            key={fIdx}
                            className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-1"
                          >
                            <CheckCircle2 size={10} className="text-[#F5A623]" />
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom CTA Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Link
                    href={`/our-work/${init.key}`}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-800 text-slate-800 text-xs font-bold text-center transition-colors hover:bg-slate-50"
                  >
                    Details
                  </Link>

                  <Link
                    href="/our-work#initiative-donation-form"
                    className="py-2.5 px-3 rounded-xl bg-[#F5A623] hover:bg-[#e0951a] text-white text-xs font-bold text-center transition-colors shadow-sm flex items-center justify-center gap-1"
                  >
                    <span>Donate</span>
                    <Heart size={12} fill="currentColor" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#0A1A2F] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5A623]">
              80G Tax Exemption Available
            </span>
            <h4 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Support Grassroots Infrastructure &amp; Save Lives Daily
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              100% transparent and accountable. Receive instant 80G tax receipt and verified impact certificate for every contribution.
            </p>
          </div>

          <Link
            href="/our-work#initiative-donation-form"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#F5A623] hover:bg-[#e0951a] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Donate to Grassroots Work</span>
            <Heart size={15} fill="currentColor" />
          </Link>
        </div>
      </div>
    </section>
  );
}
