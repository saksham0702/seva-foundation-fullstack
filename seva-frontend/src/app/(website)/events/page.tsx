import React from "react";
import { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { getServerCmsItems, getServerCategories } from "@/lib/server-api";
import { constructMetadata } from "@/lib/seo";
import MediaHubListingClient from "@/components/website/media/MediaHubListingClient";

export const metadata: Metadata = constructMetadata({
  title: "Events & Community Drives",
  description:
    "Join healthcare camps, education workshops, blood donation drives, and disaster relief programs organized by Seva India Foundation.",
  canonicalPath: "/events",
  keywords: [
    "NGO Events India",
    "Charity Drives Uttarakhand",
    "Medical Camps Seva",
    "Community Volunteering Events",
  ],
});

export default async function EventsListingPage() {
  const [events, blogs, news, categories] = await Promise.all([
    getServerCmsItems("event"),
    getServerCmsItems("blog"),
    getServerCmsItems("news"),
    getServerCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative min-h-[48vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1A2F] via-[#0e2747] to-[#0A1A2F]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1A2F]/90 via-[#0A1A2F]/85 to-[#0A1A2F]/95" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={13} /> Foundation Programs &amp; Camps
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] mb-6">
            <span className="text-white">Events &amp; </span>
            <span className="text-cyan-400">Community Drives</span>
          </h1>
          <div className="w-16 h-1 bg-cyan-400 mx-auto mb-6 rounded-full" />
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
            Participate in our health camps, fundraising galas, food distribution drives, and community outreach programs.
          </p>
        </div>
      </section>

      <MediaHubListingClient
        initialTab="events"
        blogs={blogs}
        events={events}
        news={news}
        categories={categories}
      />
    </div>
  );
}
