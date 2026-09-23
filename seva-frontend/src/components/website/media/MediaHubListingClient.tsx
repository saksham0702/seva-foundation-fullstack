"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Clock,
  User,
  Globe,
  Search,
  Sparkles,
  BookOpen,
  Newspaper,
  Inbox,
  Filter,
  Layers,
} from "lucide-react";
import { CmsItem } from "@/types/cms";
import { getImageUrl } from "@/lib/image";
import { EventRegisterModal } from "@/components/website/events/EventRegisterModal";

/* ------------------------------------------------------------------ */
/*  CARD COMPONENTS (DISTINCT DESIGNS FOR BLOG, EVENT, NEWS)          */
/* ------------------------------------------------------------------ */

export function BlogCard({ post }: { post: CmsItem }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#E8542A]/30 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="relative h-52 overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getImageUrl(post.featuredImage)}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getImageUrl(null);
            }}
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#E8542A] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
              {post.category || "Story"}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar size={13} />
              {post.publishedAt}
            </span>
            {post.authorName && (
              <span className="flex items-center gap-1.5">
                <User size={13} />
                {post.authorName}
              </span>
            )}
            {post.readTime && (
              <span className="flex items-center gap-1.5 ml-auto">
                <Clock size={13} />
                {post.readTime}
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-[#0f2347] leading-snug mb-2.5 group-hover:text-[#E8542A] transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#E8542A]">
            Read Full Story
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function EventCard({
  event,
  onRegister,
}: {
  event: CmsItem;
  onRegister: (e: CmsItem) => void;
}) {
  const isUpcoming = event.eventDate
    ? new Date(event.eventDate).getTime() >= Date.now() - 86400000
    : true;

  const eventDateObj = event.eventDate ? new Date(event.eventDate) : null;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-cyan-500/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="relative h-56 overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getImageUrl(event.featuredImage)}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getImageUrl(null);
            }}
          />
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md ${
                isUpcoming
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              {isUpcoming ? "Upcoming Event" : "Past Event"}
            </span>
            <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-[#0A1A2F] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
              {event.category || "Community Drive"}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Date & Location Pills */}
          <div className="space-y-2 mb-4">
            {eventDateObj && (
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-800 bg-cyan-50 border border-cyan-100/80 px-3 py-1.5 rounded-xl">
                <Calendar size={13} className="shrink-0 text-cyan-600" />
                <span>
                  {eventDateObj.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="text-cyan-300">•</span>
                <Clock size={12} className="shrink-0 text-cyan-600" />
                <span>
                  {eventDateObj.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {event.eventLocation && (
              <div className="flex items-center gap-2 text-xs text-gray-600 font-medium px-1">
                <MapPin size={13} className="text-red-500 shrink-0" />
                <span className="truncate">{event.eventLocation}</span>
              </div>
            )}
          </div>

          <Link href={`/events/${event.slug}`}>
            <h3 className="text-lg font-bold text-[#0A1A2F] leading-snug mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
            {event.excerpt}
          </p>
        </div>
      </div>

      <div className="p-6 pt-0 border-t border-gray-100 mt-2 flex items-center justify-between gap-3">
        <Link
          href={`/events/${event.slug}`}
          className="text-xs font-bold text-gray-600 hover:text-[#0A1A2F] transition-colors"
        >
          View Details &rarr;
        </Link>

        {isUpcoming ? (
          <button
            onClick={() => onRegister(event)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            Register / RSVP
          </button>
        ) : (
          <span className="text-xs font-semibold text-gray-400">
            Concluded
          </span>
        )}
      </div>
    </div>
  );
}

export function NewsCard({ item }: { item: CmsItem }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#F5A623]/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="relative h-52 overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getImageUrl(item.featuredImage)}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getImageUrl(null);
            }}
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-[#0A1A2F] text-[#F5A623] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md border border-[#F5A623]/30">
              {item.category || "Press"}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar size={13} />
              {item.publishedAt}
            </span>
            {item.newsSource && (
              <span className="flex items-center gap-1 text-[#0A1A2F] font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
                <Globe size={11} className="text-[#F5A623]" />
                {item.newsSource}
              </span>
            )}
            {item.readTime && (
              <span className="flex items-center gap-1 text-gray-400 ml-auto">
                <Clock size={12} />
                {item.readTime}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-[#0A1A2F] leading-snug mb-2.5 group-hover:text-[#F5A623] transition-colors line-clamp-2">
            {item.title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3">
            {item.excerpt}
          </p>
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#F5A623]">
            Read Full Statement
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  MEDIA HUB LISTING CLIENT (UNIFIED TAB & CATEGORY HANDLER)         */
/* ------------------------------------------------------------------ */

export type MediaTab = "all" | "blogs" | "events" | "news";

interface MediaHubListingClientProps {
  initialTab?: MediaTab;
  blogs: CmsItem[];
  events: CmsItem[];
  news: CmsItem[];
  categories: { _id: string; name: string; slug?: string }[];
}

export default function MediaHubListingClient({
  initialTab = "all",
  blogs = [],
  events = [],
  news = [],
  categories = [],
}: MediaHubListingClientProps) {
  const [activeTab, setActiveTab] = useState<MediaTab>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [registeringEvent, setRegisteringEvent] = useState<CmsItem | null>(null);

  // Dynamic category options computed from DB categories + items
  const categoryList = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((cat) => {
      if (cat.name) set.add(cat.name);
    });
    blogs.forEach((b) => b.category && set.add(b.category));
    events.forEach((e) => e.category && set.add(e.category));
    news.forEach((n) => n.category && set.add(n.category));
    return ["all", ...Array.from(set)];
  }, [categories, blogs, events, news]);

  // Helper filter function
  const filterList = (items: CmsItem[]) => {
    return items.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(q)) ||
        (item.newsSource && item.newsSource.toLowerCase().includes(q)) ||
        (item.authorName && item.authorName.toLowerCase().includes(q)) ||
        (item.eventLocation && item.eventLocation.toLowerCase().includes(q));

      const matchCategory =
        selectedCategory === "all" ||
        (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(selectedCategory.toLowerCase()));

      return matchSearch && matchCategory;
    });
  };

  const filteredBlogs = useMemo(() => filterList(blogs), [blogs, search, selectedCategory]);
  const filteredEvents = useMemo(() => filterList(events), [events, search, selectedCategory]);
  const filteredNews = useMemo(() => filterList(news), [news, search, selectedCategory]);

  const totalBlogs = filteredBlogs.length;
  const totalEvents = filteredEvents.length;
  const totalNews = filteredNews.length;
  const totalAll = totalBlogs + totalEvents + totalNews;

  // Smart Cross-Category check: when the current tab has 0 items, but another tab has items in this category
  const hasOnlyCrossContent =
    selectedCategory !== "all" &&
    ((activeTab === "blogs" && totalBlogs === 0 && (totalEvents > 0 || totalNews > 0)) ||
      (activeTab === "events" && totalEvents === 0 && (totalBlogs > 0 || totalNews > 0)) ||
      (activeTab === "news" && totalNews === 0 && (totalBlogs > 0 || totalEvents > 0)));

  return (
    <>
      {/* ── Tabs & Filter Bar ── */}
      <section className="border-b border-gray-100 bg-gray-50/70 py-6 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          {/* Top Row: Type Tabs & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Content Tabs */}
            <div className="flex items-center p-1.5 bg-white border border-gray-200 rounded-2xl shadow-xs overflow-x-auto w-full md:w-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "all"
                    ? "bg-[#0A1A2F] text-white shadow-sm"
                    : "text-gray-600 hover:text-[#0A1A2F] hover:bg-gray-50"
                }`}
              >
                <Layers size={14} />
                All Updates
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {blogs.length + events.length + news.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("blogs")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "blogs"
                    ? "bg-[#E8542A] text-white shadow-sm"
                    : "text-gray-600 hover:text-[#E8542A] hover:bg-gray-50"
                }`}
              >
                <BookOpen size={14} />
                Blogs &amp; Stories
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === "blogs" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {blogs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("events")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "events"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-cyan-600 hover:bg-gray-50"
                }`}
              >
                <Calendar size={14} />
                Events &amp; Drives
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === "events" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {events.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("news")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "news"
                    ? "bg-[#F5A623] text-[#0A1A2F] shadow-sm"
                    : "text-gray-600 hover:text-[#F5A623] hover:bg-gray-50"
                }`}
              >
                <Newspaper size={14} />
                News &amp; Media
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === "news" ? "bg-black/15 text-[#0A1A2F]" : "bg-gray-100 text-gray-600"
                }`}>
                  {news.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stories, events, news…"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#0A1A2F] focus:outline-none focus:border-cyan-500 shadow-xs"
              />
            </div>
          </div>

          {/* Bottom Row: Dynamic Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mr-1 shrink-0">
              <Filter size={12} /> Category:
            </span>
            {categoryList.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold px-4 py-1.5 rounded-full capitalize transition-all whitespace-nowrap border cursor-pointer ${
                    isSelected
                      ? "bg-[#0A1A2F] border-[#0A1A2F] text-white shadow-xs"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100/50"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Content Grid Display ── */}
      <section className="py-12 bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fallback alert if cross content is found */}
          {hasOnlyCrossContent && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
              <div className="flex items-center gap-2.5 text-xs font-medium">
                <Sparkles size={16} className="text-amber-500 shrink-0" />
                <span>
                  No items under <strong>{activeTab.toUpperCase()}</strong> in category &ldquo;{selectedCategory}&rdquo;.
                  Showing related matching items below:
                </span>
              </div>
              <div className="flex items-center gap-2">
                {totalBlogs > 0 && (
                  <button
                    onClick={() => setActiveTab("blogs")}
                    className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-[#E8542A]"
                  >
                    View Blogs ({totalBlogs})
                  </button>
                )}
                {totalEvents > 0 && (
                  <button
                    onClick={() => setActiveTab("events")}
                    className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-cyan-700"
                  >
                    View Events ({totalEvents})
                  </button>
                )}
                {totalNews > 0 && (
                  <button
                    onClick={() => setActiveTab("news")}
                    className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-700"
                  >
                    View News ({totalNews})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ALL CONTENT TAB */}
          {activeTab === "all" && (
            <div className="space-y-16">
              {totalAll === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <Inbox className="mx-auto text-gray-300 mb-3" size={48} />
                  <h3 className="text-lg font-bold text-gray-700">No content found</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting your category filter or search keywords.
                  </p>
                </div>
              ) : (
                <>
                  {filteredBlogs.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-[#0f2347] flex items-center gap-2">
                          <BookOpen size={20} className="text-[#E8542A]" />
                          Latest Stories &amp; Blogs ({filteredBlogs.length})
                        </h2>
                        <button
                          onClick={() => setActiveTab("blogs")}
                          className="text-xs font-bold text-[#E8542A] hover:underline"
                        >
                          View All Blogs &rarr;
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((post) => (
                          <BlogCard key={post._id} post={post} />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredEvents.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-[#0A1A2F] flex items-center gap-2">
                          <Calendar size={20} className="text-cyan-600" />
                          Upcoming Events &amp; Drives ({filteredEvents.length})
                        </h2>
                        <button
                          onClick={() => setActiveTab("events")}
                          className="text-xs font-bold text-cyan-600 hover:underline"
                        >
                          View All Events &rarr;
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event) => (
                          <EventCard
                            key={event._id}
                            event={event}
                            onRegister={(e) => setRegisteringEvent(e)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredNews.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-[#0A1A2F] flex items-center gap-2">
                          <Newspaper size={20} className="text-[#F5A623]" />
                          Press &amp; Announcements ({filteredNews.length})
                        </h2>
                        <button
                          onClick={() => setActiveTab("news")}
                          className="text-xs font-bold text-[#F5A623] hover:underline"
                        >
                          View All News &rarr;
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredNews.map((item) => (
                          <NewsCard key={item._id} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* BLOGS TAB */}
          {activeTab === "blogs" && (
            <div>
              {totalBlogs > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredBlogs.map((post) => (
                    <BlogCard key={post._id} post={post} />
                  ))}
                </div>
              ) : hasOnlyCrossContent ? (
                <div className="space-y-12">
                  {filteredEvents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[#0A1A2F] mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-cyan-600" />
                        Related Events in &ldquo;{selectedCategory}&rdquo;
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event) => (
                          <EventCard
                            key={event._id}
                            event={event}
                            onRegister={(e) => setRegisteringEvent(e)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredNews.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[#0A1A2F] mb-4 flex items-center gap-2">
                        <Newspaper size={18} className="text-[#F5A623]" />
                        Related News in &ldquo;{selectedCategory}&rdquo;
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredNews.map((item) => (
                          <NewsCard key={item._id} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <Inbox className="mx-auto text-gray-300 mb-3" size={48} />
                  <h3 className="text-lg font-bold text-gray-700">No blog posts found</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Try selecting a different category or clearing your search.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <div>
              {totalEvents > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      onRegister={(e) => setRegisteringEvent(e)}
                    />
                  ))}
                </div>
              ) : hasOnlyCrossContent ? (
                <div className="space-y-12">
                  {filteredBlogs.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[#0A1A2F] mb-4 flex items-center gap-2">
                        <BookOpen size={18} className="text-[#E8542A]" />
                        Related Stories in &ldquo;{selectedCategory}&rdquo;
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((post) => (
                          <BlogCard key={post._id} post={post} />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredNews.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[#0A1A2F] mb-4 flex items-center gap-2">
                        <Newspaper size={18} className="text-[#F5A623]" />
                        Related News in &ldquo;{selectedCategory}&rdquo;
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredNews.map((item) => (
                          <NewsCard key={item._id} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <Inbox className="mx-auto text-gray-300 mb-3" size={48} />
                  <h3 className="text-lg font-bold text-gray-700">No events found</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Try selecting a different category or clearing your search.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* NEWS TAB */}
          {activeTab === "news" && (
            <div>
              {totalNews > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredNews.map((item) => (
                    <NewsCard key={item._id} item={item} />
                  ))}
                </div>
              ) : hasOnlyCrossContent ? (
                <div className="space-y-12">
                  {filteredBlogs.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[#0A1A2F] mb-4 flex items-center gap-2">
                        <BookOpen size={18} className="text-[#E8542A]" />
                        Related Stories in &ldquo;{selectedCategory}&rdquo;
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((post) => (
                          <BlogCard key={post._id} post={post} />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredEvents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[#0A1A2F] mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-cyan-600" />
                        Related Events in &ldquo;{selectedCategory}&rdquo;
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event) => (
                          <EventCard
                            key={event._id}
                            event={event}
                            onRegister={(e) => setRegisteringEvent(e)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <Inbox className="mx-auto text-gray-300 mb-3" size={48} />
                  <h3 className="text-lg font-bold text-gray-700">No news or press releases found</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Try selecting a different category or clearing your search.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Event Registration Modal */}
      {registeringEvent && (
        <EventRegisterModal
          event={registeringEvent}
          onClose={() => setRegisteringEvent(null)}
        />
      )}
    </>
  );
}
