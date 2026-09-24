"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Newspaper,
  BookOpen,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { CmsItem } from "@/types/cms";
import { getImageUrl } from "@/lib/image";

interface RecentStoriesHomeSectionProps {
  items?: CmsItem[];
}

const DEFAULT_STORIES: CmsItem[] = [
  {
    id: "1",
    type: "blog",
    title: "How Rural Bridge Schools are Transforming Lives in Uttarakhand",
    slug: "rural-bridge-schools-transforming-lives",
    status: "published",
    category: "Education (Vidhya)",
    publishedAt: "18 Sep 2026",
    featuredImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
    excerpt: "Discover how Seva Foundation is bridging the educational gap for over 10,000 children across remote Himalayan villages.",
    content: "",
    authorName: "Dr. Ananya Sharma",
    readTime: "4 min read",
  },
  {
    id: "2",
    type: "blog",
    title: "Mobile Medical Vans: Bringing Lifesaving Care to Mountain Hamlets",
    slug: "mobile-medical-vans-mountain-hamlets",
    status: "published",
    category: "Healthcare (Arogya)",
    publishedAt: "15 Sep 2026",
    featuredImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
    excerpt: "Our mobile healthcare teams travel through terrain to provide primary diagnosis, medicines, and free surgeries.",
    content: "",
    authorName: "SEVA Medical Team",
    readTime: "3 min read",
  },
  {
    id: "3",
    type: "event",
    title: "Annual Health & Eye Care Camp Dehradun 2026",
    slug: "annual-health-eye-care-camp-2026",
    status: "published",
    category: "Healthcare (Arogya)",
    publishedAt: "Upcoming Event",
    featuredImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    excerpt: "Join our comprehensive medical and eye care camp providing free consultations, spectacles, and medicine distribution.",
    content: "",
    eventDate: "30 Sep 2026",
    eventLocation: "Community Center, Sahastradhara Road, Dehradun",
  },
];

const TYPE_CONFIG: Record<
  string,
  { label: string; badge: string; icon: any; linkPrefix: string }
> = {
  blog: {
    label: "Story / Blog",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: BookOpen,
    linkPrefix: "/blogs",
  },
  news: {
    label: "Press & News",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Newspaper,
    linkPrefix: "/news",
  },
  event: {
    label: "Upcoming Event",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Calendar,
    linkPrefix: "/events",
  },
};

export default function RecentStoriesHomeSection({
  items,
}: RecentStoriesHomeSectionProps) {
  const displayItems =
    items && items.length > 0 ? items.slice(0, 3) : DEFAULT_STORIES;

  return (
    <section className="bg-white py-16 sm:py-24 border-b border-slate-200/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8542A] mb-3">
              <span className="w-5 h-px bg-[#E8542A]" />
              Field Insights &amp; Stories
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#0A1A2F] leading-tight">
              Stories of resilience, hope &amp;{" "}
              <span className="text-[#E8542A]">real transformation</span>
            </h2>
            <p className="mt-3 text-slate-500 text-sm sm:text-base leading-relaxed">
              Explore firsthand reports from the field, medical outreach updates, and announcements from Seva Foundation&apos;s journey across India.
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-3">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0A1A2F] hover:text-[#E8542A] bg-slate-50 border border-slate-200 hover:border-[#E8542A] px-5 py-3 rounded-xl transition-all shadow-sm group"
            >
              <span>Explore All Stories</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayItems.map((item) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.blog;
            const TypeIcon = config.icon;
            const linkHref = `${config.linkPrefix}/${item.slug || item.id || item._id}`;
            const imageSrc = item.featuredImage
              ? getImageUrl(item.featuredImage)
              : item.images?.[0]
              ? getImageUrl(item.images[0])
              : "";

            return (
              <article
                key={item.id || item._id || item.slug}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Image Container */}
                  <Link href={linkHref} className="block relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-6">
                        <TypeIcon size={32} className="text-slate-400 mb-2" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Seva Media
                        </span>
                      </div>
                    )}

                    {/* Content Type Pill */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-md bg-white/95 shadow-sm ${config.badge}`}
                      >
                        <TypeIcon size={11} />
                        <span>{config.label}</span>
                      </span>
                    </div>

                    {/* Category */}
                    {item.category && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-md">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    {/* Meta line */}
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                      {item.type === "event" && item.eventDate ? (
                        <span className="flex items-center gap-1 text-amber-700">
                          <Calendar size={12} />
                          {item.eventDate}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {item.publishedAt}
                        </span>
                      )}

                      {item.readTime && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {item.readTime}
                          </span>
                        </>
                      )}

                      {item.authorName && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">
                            {item.authorName}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-serif font-bold text-[#0A1A2F] group-hover:text-[#E8542A] transition-colors leading-snug line-clamp-2">
                      <Link href={linkHref}>
                        {item.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                      {item.excerpt || item.content}
                    </p>

                    {/* Event location if event */}
                    {item.type === "event" && item.eventLocation && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 font-medium">
                        <MapPin size={12} className="text-[#E8542A] flex-shrink-0" />
                        <span className="truncate">{item.eventLocation}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={linkHref}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A1A2F] group-hover:text-[#E8542A] transition-colors"
                  >
                    <span>{item.type === "event" ? "Event Details" : "Read Full Story"}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Seva Foundation
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
