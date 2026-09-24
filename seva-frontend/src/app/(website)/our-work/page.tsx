import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import { getServerCmsPage } from "@/lib/server-api";
import { InitiativeData } from "@/components/website/our-work/InitiativeCard";
import { DEFAULT_INITIATIVES } from "@/components/website/our-work/initiativeDefaults";
import { constructMetadata } from "@/lib/seo";
import { getImageUrl } from "@/lib/image";
import OurWorkClient from "@/components/website/our-work/OurWorkClient";

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getServerCmsPage("our-work");

  const title = cmsPage?.seo?.metaTitle || cmsPage?.title || "Our Work & Impact";
  const description =
    cmsPage?.seo?.metaDescription ||
    cmsPage?.subtitle ||
    "Transforming communities through dedicated grassroots initiatives in education, healthcare, hunger relief, and disaster response across India.";

  return constructMetadata({
    title,
    description,
    canonicalPath: "/our-work",
    keywords: [
      "Our Work NGO India",
      "Vidhya Education",
      "Arogya Healthcare",
      "Annapurna Hunger Relief",
      "Sammaan Elderly Care",
      "Rakshak Disaster Response",
      "Gramodaya Rural Development",
    ],
  });
}

export default async function OurWorkPage() {
  const cmsPage = await getServerCmsPage("our-work");

  const initiatives: InitiativeData[] =
    cmsPage?.sections && cmsPage.sections.length > 0
      ? (cmsPage.sections as InitiativeData[])
      : DEFAULT_INITIATIVES;

  const pageTitle = cmsPage?.title || "OUR WORK & IMPACT";
  const pageSubtitle =
    cmsPage?.subtitle ||
    "Transforming communities through dedicated grassroots initiatives across Uttarakhand and beyond.";

  const bannerImage = cmsPage?.bannerImage ? getImageUrl(cmsPage.bannerImage) : "";
  const bannerVideo = cmsPage?.bannerVideo ? getImageUrl(cmsPage.bannerVideo) : "";

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900">
      {/* ── Top Hero Header ── */}
      <section className="relative bg-[#0A1A2F] text-white pt-20 pb-16 sm:pt-24 sm:pb-20 overflow-hidden">
        {/* Background Media */}
        <div className="absolute inset-0">
          {bannerVideo ? (
            <video
              src={bannerVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : bannerImage ? (
            <Image
              src={bannerImage}
              alt={pageTitle}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0A1A2F] via-[#102a5c] to-[#0B1120]" />
          )}
          {/* Lightened, vibrant overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A2F]/90 via-[#0A1A2F]/50 to-black/30" />
        </div>

        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#F5A623] text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
            <Sparkles size={12} className="text-[#F5A623]" />
            Grassroots Interventions
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-white mb-4">
            {pageTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            {pageSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="#initiative-donation-form"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#F5A623] hover:bg-[#e0951a] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>Support Our Work</span>
              <Heart size={16} fill="currentColor" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-sm transition-colors backdrop-blur-sm"
            >
              <span>Our Vision &amp; Legacy</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Interactive Category Filtering & List ── */}
      <OurWorkClient initiatives={initiatives} />

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
              href="#initiative-donation-form"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#F5A623] hover:bg-[#e0951a] text-white font-semibold text-sm transition-all shadow-xl shadow-amber-500/20 cursor-pointer"
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
