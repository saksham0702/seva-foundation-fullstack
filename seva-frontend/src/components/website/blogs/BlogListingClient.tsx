"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  User,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { CmsItem } from "@/types/cms";
import { getImageUrl } from "@/lib/image";

function BlogCard({ post }: { post: CmsItem }) {
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
          <span className="absolute top-4 left-4 px-3 py-1.5 bg-[#E8542A] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
            {post.category || "Story"}
          </span>
        </div>

        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-400 flex-wrap">
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

      <div className="p-6 sm:p-7 pt-0">
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

interface BlogListingClientProps {
  initialPosts: CmsItem[];
  initialCategories?: { _id: string; name: string; slug?: string }[];
}

export default function BlogListingClient({
  initialPosts,
  initialCategories = [],
}: BlogListingClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);

  // Dynamically compute categories from created categories & posts
  const categories = useMemo(() => {
    const cats = new Set<string>();
    if (initialCategories && initialCategories.length > 0) {
      initialCategories.forEach((c) => {
        if (c.name) cats.add(c.name);
      });
    }
    initialPosts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });

    return [
      { id: "all", label: "All Stories" },
      ...Array.from(cats).map((c) => ({ id: c, label: c })),
    ];
  }, [initialCategories, initialPosts]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return initialPosts;
    return initialPosts.filter(
      (post) =>
        post.category?.toLowerCase() === activeCategory.toLowerCase() ||
        post.category?.toLowerCase().includes(activeCategory.toLowerCase())
    );
  }, [initialPosts, activeCategory]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
    setVisibleCount(6);
  };

  return (
    <>
      {/* ── Filter by Category ── */}
      <section className="py-8 sm:py-10 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7c8aab] whitespace-nowrap flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#E8542A]" />
              Filter by Category
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                    isActive
                      ? "bg-[#0f2347] border-[#0f2347] text-white shadow-md shadow-[#0f2347]/20"
                      : "bg-white border-gray-200 text-[#1a3a6b] hover:border-[#0f2347]/40 hover:bg-white"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Blog Grid ── */}
      <section className="py-16 sm:py-20 bg-[#f8f9fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {visiblePosts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {visiblePosts.map((post) => (
                <BlogCard key={post.id || post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 max-w-md mx-auto">
              <p className="text-base font-bold text-[#0f2347] mb-1">No stories found</p>
              <p className="text-gray-400 text-xs">
                No stories in this category yet. Check back soon.
              </p>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center mt-14">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 6)}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-gray-200 hover:border-[#E8542A] text-[#0f2347] font-bold rounded-xl transition-all text-sm shadow-sm hover:shadow-md cursor-pointer"
              >
                Load More Stories
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
