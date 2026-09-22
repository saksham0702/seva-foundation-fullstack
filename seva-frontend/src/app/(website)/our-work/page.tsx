"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Users,
  Award,
  Globe,
  Loader2,
} from "lucide-react";
import InitiativeCard, { InitiativeData } from "@/components/website/our-work/InitiativeCard";
import InitiativeDonationSection from "@/components/website/donations/InitiativeDonationSection";
import { getCmsPageBySlug, CmsPage } from "@/app/api/cms";
import { DEFAULT_INITIATIVES } from "@/components/website/our-work/initiativeDefaults";

export default function OurWorkPage() {
  const [cmsPage, setCmsPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getCmsPageBySlug("our-work");
        if (active && data) {
          setCmsPage(data);
        }
      } catch (err) {
        console.error("Failed to load CMS initiatives from backend:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const initiatives: InitiativeData[] = useMemo(() => {
    if (cmsPage?.sections && cmsPage.sections.length > 0) {
      return cmsPage.sections as InitiativeData[];
    }
    return DEFAULT_INITIATIVES;
  }, [cmsPage]);

  const filteredInitiatives = useMemo(() => {
    if (selectedCategory === "all") return initiatives;
    return initiatives.filter(
      (init) => init.key.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [initiatives, selectedCategory]);

  const pageTitle = cmsPage?.title || "OUR WORK & IMPACT";
  const pageSubtitle =
    cmsPage?.subtitle ||
    "Transforming communities through dedicated grassroots initiatives across Uttarakhand and beyond.";

  const handleCategorySelect = (key: string) => {
    setSelectedCategory(key);
    if (key !== "all") {
      const el = document.getElementById(key);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900">
      {/* ── Top Hero Header ── */}
      <section className="relative bg-[#0A1A2F] text-white pt-20 pb-16 sm:pt-24 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#F5A623] text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
            <Sparkles size={12} className="text-[#F5A623]" />
            Grassroots Interventions
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-white mb-4">
            {pageTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {pageSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/donations"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#F5A623] hover:bg-[#e0951a] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <span>Support Our Work</span>
              <Heart size={16} fill="currentColor" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-sm transition-colors"
            >
              <span>Our Vision & Legacy</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category Filter Bar (Top Categories Bar as requested) ── */}
      <section className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3.5 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === "all"
                  ? "bg-[#0A1A2F] text-white shadow-sm"
                  : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80"
              }`}
            >
              All Categories ({initiatives.length})
            </button>

            {initiatives.map((init) => {
              const isSelected =
                selectedCategory.toLowerCase() === init.key.toLowerCase();
              return (
                <button
                  key={init.key}
                  type="button"
                  onClick={() => handleCategorySelect(init.key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isSelected
                      ? "bg-[#F5A623] text-white shadow-sm shadow-amber-500/20"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80"
                  }`}
                >
                  {init.title || init.name || init.key}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Initiatives List: One by one with full rich content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-slate-600">
            <Loader2 className="animate-spin text-[#F5A623]" size={32} />
            <p className="text-sm font-medium">Loading initiatives from field...</p>
          </div>
        ) : filteredInitiatives.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-sm text-slate-700">No initiatives found under this category.</p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-3 text-xs font-bold text-[#F5A623] hover:underline"
            >
              View all initiatives
            </button>
          </div>
        ) : (
          filteredInitiatives.map((initiative) => (
            <InitiativeCard key={initiative.key} initiative={initiative} />
          ))
        )}
      </main>

      {/* ── Direct Initiative Donation Module ── */}
      <InitiativeDonationSection
        initialInitiative={selectedCategory !== "all" ? selectedCategory : undefined}
      />

      {/* ── Bottom Call to Action ── */}
      <section className="bg-[#0A1A2F] text-white py-16 sm:py-20 mt-12 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5A623]">
            Be A Changemaker
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white leading-tight">
            Together, We Transform Remote Communities Across India
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Every contribution directly funds learning centres, mobile healthcare camps, elderly companionship, and disaster relief operations.
          </p>
          <div className="pt-2">
            <Link
              href="/donations"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#F5A623] hover:bg-[#e0951a] text-white font-semibold text-sm transition-all shadow-xl shadow-amber-500/20"
            >
              <span>Donate Online (80G Tax Benefit)</span>
              <Heart size={16} fill="currentColor" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
