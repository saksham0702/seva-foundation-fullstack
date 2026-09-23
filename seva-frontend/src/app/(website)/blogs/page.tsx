import React from "react";
import { Metadata } from "next";
import { getServerCmsItems, getServerCategories } from "@/lib/server-api";
import { constructMetadata } from "@/lib/seo";
import MediaHubListingClient from "@/components/website/media/MediaHubListingClient";

export const metadata: Metadata = constructMetadata({
  title: "Official Stories & Blog",
  description:
    "Read inspiring stories of transformation, education, community kitchens, and medical camps across India from Seva India Foundation.",
  canonicalPath: "/blogs",
  keywords: [
    "NGO Stories India",
    "Charity Blog",
    "Social Impact Stories",
    "Seva Foundation Blog",
    "Community Work Updates",
  ],
});

export default async function BlogListingPage() {
  const [blogs, events, news, categories] = await Promise.all([
    getServerCmsItems("blog"),
    getServerCmsItems("event"),
    getServerCmsItems("news"),
    getServerCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative min-h-[48vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2347] via-[#1a3a6b] to-[#0f2347]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2347]/90 via-[#0f2347]/85 to-[#0f2347]/95" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E8542A]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <div className="inline-flex items-center gap-2 bg-[#E8542A]/20 border border-[#E8542A]/40 text-[#E8542A] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Official Stories &amp; Impact
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] mb-6">
            <span className="text-white">Our </span>
            <span className="text-[#E8542A]">Blog</span>
          </h1>
          <div className="w-16 h-1 bg-[#E8542A] mx-auto mb-6 rounded-full" />
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
            Stay informed about our work as a leading charity organisation in
            India. Discover how your contributions transform lives every single day.
          </p>
        </div>
      </section>

      {/* Dynamic Tab & Category Media Explorer */}
      <MediaHubListingClient
        initialTab="blogs"
        blogs={blogs}
        events={events}
        news={news}
        categories={categories}
      />
    </div>
  );
}