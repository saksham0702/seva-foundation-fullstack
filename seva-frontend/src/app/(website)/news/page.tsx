"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  Globe,
  Clock,
  ArrowRight,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";
import { cmsAPI } from "@/app/api/cms";
import { CmsItem } from "@/types/cms";
import { getImageUrl } from "@/lib/image";

function NewsCard({ item }: { item: CmsItem }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#F5A623]/40 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
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

      <div className="p-6 flex flex-col flex-1">
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

        <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1 line-clamp-3">
          {item.excerpt}
        </p>

        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#F5A623] mt-auto">
          Read Full Statement
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

export default function NewsListingPage() {
  const [newsList, setNewsList] = useState<CmsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function loadNews() {
      setIsLoading(true);
      try {
        const items = await cmsAPI.getItems("news");
        setNewsList(items);
      } catch (err) {
        console.error("Failed to fetch news:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNews();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    newsList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["all", ...Array.from(set)];
  }, [newsList]);

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        (item.newsSource && item.newsSource.toLowerCase().includes(search.toLowerCase()));

      const matchCat =
        selectedCategory === "all" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCat;
    });
  }, [newsList, search, selectedCategory]);

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
            <Newspaper size={13} /> Official News & Media
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] mb-6">
            <span className="text-white">Press & </span>
            <span className="text-[#F5A623]">Announcements</span>
          </h1>
          <div className="w-16 h-1 bg-[#F5A623] mx-auto mb-6 rounded-full" />
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
            Stay informed with verified press releases, awards, media coverage, and official statements from SEVA Foundation.
          </p>
        </div>
      </section>

      {/* ── Search & Filters ── */}
      <section className="py-8 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search news & statements…"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#0A1A2F] focus:outline-none focus:border-[#F5A623] shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold px-4 py-2 rounded-full capitalize transition-all whitespace-nowrap border ${
                    selectedCategory === cat
                      ? "bg-[#0A1A2F] border-[#0A1A2F] text-[#F5A623] shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {cat === "all" ? "All News" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── News Grid ── */}
      <section className="py-16 sm:py-20 bg-[#f8f9fc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="animate-spin text-[#F5A623]" />
              <p className="text-sm font-semibold text-[#0A1A2F]">Loading news releases…</p>
            </div>
          ) : filteredNews.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((item) => (
                <NewsCard key={item.id || item.slug} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 max-w-md mx-auto">
              <p className="text-base font-bold text-[#0A1A2F] mb-1">No news items found</p>
              <p className="text-gray-400 text-xs">
                No press releases match your search criteria. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
