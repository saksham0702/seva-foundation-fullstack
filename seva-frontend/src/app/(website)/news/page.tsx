import React from "react";
import { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { getServerCmsItems, getServerCategories } from "@/lib/server-api";
import { constructMetadata } from "@/lib/seo";
import MediaHubListingClient from "@/components/website/media/MediaHubListingClient";

export const metadata: Metadata = constructMetadata({
  title: "Press & Media Announcements",
  description:
    "Official statements, media coverage, government recognitions, and press releases from Seva India Foundation.",
  canonicalPath: "/news",
  keywords: [
    "NGO Press Releases India",
    "Seva Foundation News",
    "Media Coverage Charity",
    "Official Announcements",
  ],
});

export default async function NewsListingPage() {
  const [newsList, blogs, events, categories] = await Promise.all([
    getServerCmsItems("news"),
    getServerCmsItems("blog"),
    getServerCmsItems("event"),
    getServerCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1A2F] via-[#10233d] to-[#0A1A2F]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1A2F]/90 via-[#0A1A2F]/85 to-[#0A1A2F]/95" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5A623]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <div className="inline-flex items-center gap-2 bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Newspaper size={13} /> Official News &amp; Media
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] mb-6">
            <span className="text-white">Press &amp; </span>
            <span className="text-[#F5A623]">Announcements</span>
          </h1>
          <div className="w-16 h-1 bg-[#F5A623] mx-auto mb-6 rounded-full" />
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
            Stay informed with verified press releases, awards, media coverage, and official statements from SEVA Foundation.
          </p>
        </div>
      </section>

      <MediaHubListingClient
        initialTab="news"
        news={newsList}
        blogs={blogs}
        events={events}
        categories={categories}
      />
    </div>
  );
}
