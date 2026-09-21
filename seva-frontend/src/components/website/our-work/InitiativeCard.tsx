"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Share2,
  Heart,
  ChevronDown,
  CheckCircle2,
  HelpCircle,
  Building2,
  GraduationCap,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { getImageUrl } from "@/lib/image";

export interface InitiativeData {
  key: string;
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  extra?: {
    eyebrow?: string;
    alt?: string;
    features?: string[];
    faqs?: Array<{ question: string; answer: string }>;
    impactMetrics?: Array<{ value: string; label: string }>;
  };
}

interface InitiativeCardProps {
  initiative: InitiativeData;
  isSinglePage?: boolean;
}

export default function InitiativeCard({
  initiative,
  isSinglePage = false,
}: InitiativeCardProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const title = initiative.title || initiative.name || initiative.key.toUpperCase();
  const eyebrow = initiative.extra?.eyebrow || "OUR INITIATIVES";
  const subtitle = initiative.subtitle || "";
  const description = initiative.description || "";
  const rawImage = initiative.image || "";
  const resolvedImage = rawImage ? getImageUrl(rawImage) : "";
  const altText = initiative.extra?.alt || `${title} initiative helping communities`;
  const features = initiative.extra?.features || [
    "COMMUNITY EMPOWERMENT",
    "DIRECT GRASSROOTS ACTION",
    "LONG-TERM SUSTAINABILITY",
    "TRANSPARENT REPORTING",
  ];
  const faqs = initiative.extra?.faqs || [
    {
      question: "HOW DOES THIS INITIATIVE CREATE LASTING CHANGE?",
      answer:
        "We collaborate directly with local village councils, deploying dedicated field teams and ensuring long-term community participation and monitoring.",
    },
  ];
  const impactMetrics = initiative.extra?.impactMetrics || [
    { value: "10,000+", label: "LIVES IMPACTED" },
    { value: "100%", label: "FIELD TRANSPARENCY" },
    { value: "50+", label: "VILLAGES REACHED" },
    { value: "365", label: "DAYS ACTIVE" },
  ];

  const handleShare = async () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/our-work/${initiative.key}`
      : `/our-work/${initiative.key}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Seva Foundation - ${title}`,
          text: subtitle,
          url,
        });
      } catch {
        // Fallback to copy
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const metricIcons = [Building2, GraduationCap, Users, Award];

  return (
    <article
      id={initiative.key}
      className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/80 shadow-sm transition-all duration-300 scroll-mt-28"
    >
      {/* ── Top Row: Text Header & Visual Image ── */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Info Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#4C6FFF] block mb-2">
                {eyebrow}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold tracking-tight text-[#0A1A2F] leading-[1.15]">
                {title}
              </h2>
            </div>
            <button
              onClick={handleShare}
              title="Share this program"
              aria-label="Share this program"
              className="p-3 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 flex-shrink-0"
            >
              <Share2 size={18} className="text-[#4C6FFF]" />
            </button>
          </div>

          {copied && (
            <p className="text-xs text-emerald-600 font-semibold animate-in fade-in">
              Link copied to clipboard!
            </p>
          )}

          {/* Lead Highlight Quote / Paragraph */}
          {subtitle && (
            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Full Narrative */}
          {description && (
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>

        {/* Right Visual / Image Column */}
        <div className="lg:col-span-5">
          <div className="bg-[#F8EFE0] p-3 sm:p-4 rounded-[32px] sm:rounded-[40px] shadow-sm">
            {resolvedImage && !imgError ? (
              <div className="relative w-full aspect-[4/3] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-slate-100">
                <img
                  src={resolvedImage}
                  alt={altText}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ) : (
              /* Fallback showing Alt Tag for SEO when no image exists or load fails */
              <div className="w-full aspect-[4/3] rounded-[24px] sm:rounded-[32px] bg-white border border-dashed border-amber-300 flex flex-col items-center justify-center p-6 text-center">
                <Sparkles className="w-10 h-10 text-[#F5A623] mb-3 opacity-70" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8542A] mb-1">
                  SEO Alt Representation
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 max-w-xs leading-snug">
                  "{altText}"
                </p>
                <span className="text-[10px] text-slate-400 mt-2">
                  Image placeholder enabled
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Questions & Actions + Impact Metrics ── */}
      <div className="mt-10 pt-8 border-t border-gray-100 grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: FAQs, Feature Pills, and CTA Buttons */}
        <div className="lg:col-span-7 space-y-6">
          {/* Common Questions Accordion */}
          {faqs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0A1A2F]">
                <HelpCircle size={18} className="text-[#F5A623]" />
                <h3 className="text-sm sm:text-base font-serif font-semibold tracking-wide uppercase">
                  Common Questions
                </h3>
              </div>
              <div className="space-y-2">
                {faqs.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div
                      key={i}
                      className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-left gap-3 text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-900"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-600 transition-transform duration-200 flex-shrink-0 ${
                            isOpen ? "rotate-180 text-[#F5A623]" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs sm:text-sm text-slate-700 leading-relaxed animate-in fade-in font-normal">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Feature Pills */}
          {features.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={13} className="text-slate-900" />
                  </div>
                  <span className="text-[12px] font-semibold tracking-wide uppercase text-slate-900">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href="/donations"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F5A623] hover:bg-[#e0951a] text-white font-semibold text-sm transition-all shadow-md shadow-amber-500/20"
            >
              <span>Donate Now</span>
              <Heart size={16} fill="currentColor" />
            </Link>

            <Link
              href={`/donations?cause=${initiative.key}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-[#4C6FFF] hover:bg-[#4C6FFF]/5 text-[#4C6FFF] font-semibold text-sm transition-colors"
            >
              <span>Support This Program</span>
              <Heart size={16} className="text-[#4C6FFF]" />
            </Link>

            {!isSinglePage ? (
              <Link
                href={`/our-work/${initiative.key}`}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-slate-300 hover:border-slate-800 text-slate-800 font-semibold text-sm transition-colors bg-white hover:bg-slate-50"
              >
                <span>Full Details</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-slate-300 hover:border-slate-800 text-slate-800 font-semibold text-sm transition-colors bg-white hover:bg-slate-50"
              >
                <span>Share Program</span>
                <Share2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: IMPACT METRICS Navy Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#0A1628] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 text-white shadow-xl">
            <h3 className="text-xl sm:text-2xl font-serif font-semibold uppercase tracking-wider text-white mb-6">
              Impact Metrics
            </h3>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              {impactMetrics.map((metric, mIdx) => {
                const IconComponent = metricIcons[mIdx % metricIcons.length];
                return (
                  <div key={mIdx} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <IconComponent size={14} className="text-[#F5A623]" />
                      <span className="text-2xl sm:text-3xl font-semibold text-[#F5A623] tracking-tight">
                        {metric.value}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/70 leading-snug">
                      {metric.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
