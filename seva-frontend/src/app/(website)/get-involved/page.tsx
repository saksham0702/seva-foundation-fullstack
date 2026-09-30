import React, { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import { Heart, ArrowRight, ChevronDown } from "lucide-react";
import {
  getServerCmsPage,
  getServerPublicVolunteerCategories,
} from "@/lib/server-api";
import { constructMetadata, getWebPageSchema } from "@/lib/seo";
import { getImageUrl } from "@/lib/image";
import GetInvolvedClient from "@/components/website/volunteers/GetInvolvedClient";
import SeoHead from "@/components/common/SeoHead";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getServerCmsPage("get-involved");

  const title =
    cmsPage?.seo?.metaTitle ||
    cmsPage?.title ||
    "Volunteer & Join Us | Get Involved";
  const description =
    cmsPage?.seo?.metaDescription ||
    cmsPage?.subtitle ||
    "Join our volunteers across India. Give your time, skills, and heart to grassroots initiatives in education, health, and hunger relief with Seva India Foundation.";

  const bannerImg = cmsPage?.bannerImage
    ? getImageUrl(cmsPage.bannerImage)
    : undefined;

  return constructMetadata({
    title,
    description,
    canonicalPath: "/get-involved",
    ogImage: bannerImg,
    keywords: [
      "Volunteer India",
      "Get Involved Charity",
      "Volunteer in Uttarakhand",
      "NGO Volunteer Programs",
      "Corporate CSR Volunteering",
    ],
  });
}

export default async function GetInvolvedPage() {
  const [cmsPage, categories] = await Promise.all([
    getServerCmsPage("get-involved"),
    getServerPublicVolunteerCategories(),
  ]);

  const heroTitle =
    cmsPage?.title || "Your time is the most valuable thing you can give";
  const heroSubtitle =
    cmsPage?.subtitle ||
    "We do not need your money. We need your hands, your mind, and your heart. Whether you have 2 hours or 2 years — there is a place for you here.";
  const heroBannerUrl = cmsPage?.bannerImage
    ? getImageUrl(cmsPage.bannerImage)
    : "";
  const heroBannerVideo = cmsPage?.bannerVideo
    ? getImageUrl(cmsPage.bannerVideo)
    : "";

  const impactNumbers =
    (cmsPage?.sections?.find((s) => s.key === "impact_numbers")?.items as any[]) || [];

  const rawFaqs =
    (cmsPage?.sections?.find((s) => s.key === "faqs")?.items as any[]) || [];
  const faqs = rawFaqs.map((f: any) => ({
    q: f.q || f.question || "",
    a: f.a || f.answer || "",
  }));

  const getInvolvedSchema = getWebPageSchema({
    title: heroTitle,
    description: heroSubtitle,
    path: "/get-involved",
  });

  return (
    <div className="min-h-screen bg-white">
      <SeoHead
        title={heroTitle}
        description={heroSubtitle}
        canonicalPath="/get-involved"
        ogImage={heroBannerUrl}
        jsonLd={getInvolvedSchema}
      />
      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0B1120]">
          {heroBannerVideo ? (
            <video
              src={heroBannerVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : heroBannerUrl ? (
            <Image
              src={heroBannerUrl}
              alt="Volunteers working together in community"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0f2347] via-[#102a5c] to-[#0B1120]" />
          )}
          {/* Lightened, lively gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2347]/80 via-[#0f2347]/50 to-black/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8542A]/20 backdrop-blur-sm rounded-full text-[#E8542A] text-xs font-bold uppercase tracking-wider mb-6">
              <Heart size={14} fill="currentColor" />
              Join 200+ Volunteers Across India
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] mb-6">
              {heroTitle}
            </h1>
            <p className="text-lg text-gray-200 leading-relaxed mb-8 max-w-lg">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#select-and-apply"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold rounded-xl transition-colors shadow-xl shadow-orange-900/30"
              >
                Join as Volunteer
                <ArrowRight size={18} />
              </a>
              <a
                href="#select-and-apply"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl transition-colors border border-white/20"
              >
                Explore Roles
                <ChevronDown size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact Numbers ── */}
      {impactNumbers.length > 0 && (
        <section className="bg-[#0f2347] py-14 -mt-1 scroll-reveal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {impactNumbers.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm font-semibold text-gray-300 mb-0.5">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-500">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Interactive Selection Grid & Form ── */}
      <div className="scroll-reveal">
        <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading volunteer categories...</div>}>
          <GetInvolvedClient categories={categories} faqs={faqs} />
        </Suspense>
      </div>
    </div>
  );
}