import React from "react";
import { Metadata } from "next";
import { Heart, ArrowRight, ChevronDown } from "lucide-react";
import {
  getServerCmsPage,
  getServerPublicVolunteerCategories,
} from "@/lib/server-api";
import { constructMetadata } from "@/lib/seo";
import { getImageUrl } from "@/lib/image";
import GetInvolvedClient from "@/components/website/volunteers/GetInvolvedClient";

const DEFAULT_IMPACT_NUMBERS = [
  { number: "200+", label: "Active Volunteers", sub: "Across Uttarakhand" },
  { number: "45,000+", label: "Hours Contributed", sub: "In the last 12 months" },
  { number: "12,000+", label: "Lives Touched", sub: "Through volunteer efforts" },
  { number: "8", label: "Cities Represented", sub: "Volunteers from across India" },
];

const DEFAULT_FAQS = [
  {
    q: "Do I need to be from Dehradun to volunteer?",
    a: "Not at all. We have volunteers from Delhi, Mumbai, Bangalore, and even abroad who visit for week-long intensives. Remote roles like design, content, and tech are fully location-independent.",
  },
  {
    q: "How much time do I need to commit?",
    a: "As little as 2 hours a week or as much as full-time. Teaching roles need 4-6 hours weekly. Kitchen shifts are 2-3 hours. Health camps are full-day commitments. You choose what fits your life.",
  },
  {
    q: "Is there any training provided?",
    a: "Yes. Every volunteer attends an orientation at our Rajpur Road office. Field roles get additional safety briefings. Teaching volunteers receive our curriculum guide and mentor support.",
  },
  {
    q: "Can I volunteer as a group or company?",
    a: "Absolutely. We regularly host corporate CSR days, college groups, and family volunteering weekends. Contact us at corporate@sevaindia.org for group bookings.",
  },
  {
    q: "Will I get a certificate?",
    a: "Yes. All volunteers receive a digital certificate after 20 hours of service. Long-term volunteers get a recommendation letter and are invited to our annual volunteer meet.",
  },
  {
    q: "What if I can only help remotely?",
    a: "We have plenty of remote roles — content writing, graphic design, social media, website maintenance, data entry, and fundraising. You can make a real impact from your laptop.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getServerCmsPage("get-involved");

  const title =
    cmsPage?.seo?.metaTitle ||
    cmsPage?.title ||
    "Volunteer & Join Us | Get Involved";
  const description =
    cmsPage?.seo?.metaDescription ||
    cmsPage?.subtitle ||
    "Join 200+ volunteers across India. Give your time, skills, and heart to grassroots initiatives in education, health, and hunger relief with Seva India Foundation.";

  return constructMetadata({
    title,
    description,
    canonicalPath: "/get-involved",
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
    getServerPublicVolunteerCategories("volunteer"),
  ]);

  const heroTitle =
    cmsPage?.title || "Your time is the most valuable thing you can give";
  const heroSubtitle =
    cmsPage?.subtitle ||
    "We do not need your money. We need your hands, your mind, and your heart. Whether you have 2 hours or 2 years — there is a place for you here.";
  const heroBannerUrl = cmsPage?.bannerImage
    ? getImageUrl(cmsPage.bannerImage)
    : "";

  const impactNumbers =
    (cmsPage?.sections?.find((s) => s.key === "impact_numbers")
      ?.items as typeof DEFAULT_IMPACT_NUMBERS) || DEFAULT_IMPACT_NUMBERS;

  const faqs =
    (cmsPage?.sections?.find((s) => s.key === "faqs")
      ?.items as typeof DEFAULT_FAQS) || DEFAULT_FAQS;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0B1120]">
          {heroBannerUrl ? (
            <img
              src={heroBannerUrl}
              alt="Volunteers working together in community"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0f2347] via-[#102a5c] to-[#0B1120]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2347]/95 via-[#0f2347]/85 to-[#0f2347]/60" />
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
            <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
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
      <section className="bg-[#0f2347] py-14 -mt-1">
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

      {/* ── Interactive Selection Grid & Form ── */}
      <GetInvolvedClient categories={categories} faqs={faqs} />
    </div>
  );
}