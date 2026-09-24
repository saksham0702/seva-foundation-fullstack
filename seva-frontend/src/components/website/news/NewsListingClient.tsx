"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Globe,
  Clock,
  ArrowRight,
  Search,
} from "lucide-react";
import { CmsItem } from "@/types/cms";
import { getImageUrl } from "@/lib/image";

function NewsCard({ item }: { item: CmsItem }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#F5A623]/40 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <Image
          src={getImageUrl(item.featuredImage)}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
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

interface NewsListingClientProps {
  initialNews: CmsItem[];
  initialCategories?: { _id: string; name: string; slug?: string }[];
}

export default function NewsListingClient({
  initialNews,
  initialCategories = [],
}: NewsListingClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialCategories.forEach((cat) => {
      if (cat.name) set.add(cat.name);
    });
    initialNews.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["all", ...Array.from(set)];
  }, [initialNews, initialCategories]);

  const filteredNews = useMemo(() => {
    return initialNews.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        (item.newsSource && item.newsSource.toLowerCase().includes(search.toLowerCase()));

      const matchCat =
        selectedCategory === "all" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCat;
    });
  }, [initialNews, search, selectedCategory]);

  return (
    <>
      {/* ── Search & Filters ── */}
      <section className="py-8 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredNews.length > 0 ? (
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
    </>
  );
}
