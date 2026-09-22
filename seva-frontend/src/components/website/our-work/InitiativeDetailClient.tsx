"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertCircle, Compass } from "lucide-react";
import InitiativeCard, { InitiativeData } from "./InitiativeCard";
import InitiativeDonationSection from "@/components/website/donations/InitiativeDonationSection";
import { getCmsPageBySlug } from "@/app/api/cms";
import { findInitiativeBySlug, DEFAULT_INITIATIVES } from "./initiativeDefaults";

interface InitiativeDetailClientProps {
  initialInitiative: InitiativeData | null;
  initialAllInitiatives?: InitiativeData[];
  slug: string;
}

export default function InitiativeDetailClient({
  initialInitiative,
  initialAllInitiatives = DEFAULT_INITIATIVES,
  slug,
}: InitiativeDetailClientProps) {
  const [initiative, setInitiative] = useState<InitiativeData | null>(
    initialInitiative || findInitiativeBySlug(DEFAULT_INITIATIVES, slug)
  );
  const [allInitiatives, setAllInitiatives] = useState<InitiativeData[]>(
    initialAllInitiatives && initialAllInitiatives.length > 0
      ? initialAllInitiatives
      : DEFAULT_INITIATIVES
  );
  const [loading, setLoading] = useState(false);

  // Re-fetch live CMS data on the client to ensure server IP/production changes reflect instantly
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const page = await getCmsPageBySlug("our-work");
        if (active && page?.sections && page.sections.length > 0) {
          const cmsInitiatives = page.sections as InitiativeData[];
          setAllInitiatives(cmsInitiatives);

          const matched = findInitiativeBySlug(cmsInitiatives, slug);
          if (matched) {
            setInitiative(matched);
          }
        }
      } catch (err) {
        // Silently preserve initial / fallback initiative
        console.warn("Client fallback to default initiative data:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  // If initiative is still not found in CMS or defaults:
  if (!initiative) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFBF7] px-4 py-16">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5 text-[#E8542A]">
            <Compass size={32} />
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#0A1A2F] mb-2">
            Initiative Not Found
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            The initiative &ldquo;<span className="font-semibold text-slate-800">{slug}</span>&rdquo; could not be located. Explore our 7 core impact initiatives across Uttarakhand.
          </p>
          <div className="space-y-3">
            <Link
              href="/our-work"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#E8542A] hover:bg-[#c9431d] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-500/20"
            >
              <ArrowLeft size={16} />
              View All Our Work
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cleanKey = (initiative.key || slug).toLowerCase().trim();
  const otherInitiatives = (allInitiatives || DEFAULT_INITIATIVES).filter(
    (i) => (i.key || "").toLowerCase().trim() !== cleanKey
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Back Link ── */}
        <div>
          <Link
            href="/our-work"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4C6FFF] hover:text-[#3855db] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Our Work</span>
          </Link>
        </div>

        {/* ── Main Initiative Card ── */}
        <InitiativeCard initiative={initiative} isSinglePage={true} />

        {/* ── Direct Initiative Donation Module ── */}
        <div className="pt-4">
          <InitiativeDonationSection
            initialInitiative={initiative.title || initiative.name || cleanKey}
          />
        </div>

        {/* ── Other Initiatives Carousel / Grid ── */}
        {otherInitiatives.length > 0 && (
          <section className="pt-12 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-[#E8542A]" />
              <h3 className="text-xl font-serif font-semibold uppercase text-[#0A1A2F]">
                Other Core Initiatives
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherInitiatives.slice(0, 3).map((other) => (
                <Link
                  key={other.key}
                  href={`/our-work/${other.key}`}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/80 hover:shadow-lg transition-all flex flex-col justify-between text-slate-900"
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#4C6FFF] block mb-1">
                      {other.extra?.eyebrow || "OUR INITIATIVES"}
                    </span>
                    <h4 className="text-lg font-semibold text-[#0A1A2F] group-hover:text-[#E8542A] transition-colors">
                      {other.title || other.name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {other.subtitle || other.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-[#E8542A]">
                    <span>Explore Initiative</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
