"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Utensils,
  MapPin,
  Shield,
  HeartHandshake,
  Calendar,
  User,
  ArrowRight,
  Clock,
  Loader2,
} from "lucide-react";
import { cmsAPI } from "@/app/api/cms";
import { CmsItem } from "@/types/cms";
import { getImageUrl } from "@/lib/image";

const CATEGORIES = [
  { id: "all", label: "All Stories", icon: null },
  { id: "General", label: "General Seva", icon: Heart },
  { id: "Vidhya (Education)", label: "Vidhya (Education)", icon: GraduationCap },
  { id: "Arogya (Healthcare)", label: "Arogya (Healthcare)", icon: Stethoscope },
  { id: "Sammaan (Elderly Care)", label: "Sammaan (Elderly Care)", icon: HeartHandshake },
  { id: "Shakti (Women Empowerment)", label: "Shakti (Women)", icon: Briefcase },
  { id: "Annapurna (Hunger Relief)", label: "Annapurna (Hunger Relief)", icon: Utensils },
  { id: "Gramodaya (Rural Dev)", label: "Gramodaya (Rural)", icon: MapPin },
  { id: "Rakshak (Disaster Response)", label: "Rakshak (Disaster)", icon: Shield },
];

function BlogCard({ post }: { post: CmsItem }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#E8542A]/30 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl(post.featuredImage)}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getImageUrl(null);
          }}
        />
        <span className="absolute top-4 left-4 px-3 py-1.5 bg-[#E8542A] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
          {post.category || "Story"}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1.5">
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

        <h3 className="text-lg font-bold text-[#0f2347] leading-snug mb-2 group-hover:text-[#E8542A] transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1 line-clamp-3">
          {post.excerpt}
        </p>

        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E8542A] mt-auto">
          Read Full Article
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

export default function BlogListingPage() {
  const [posts, setPosts] = useState<CmsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    async function loadBlogs() {
      setIsLoading(true);
      try {
        const items = await cmsAPI.getItems("blog");
        setPosts(items);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return posts;
    return posts.filter(
      (post) =>
        post.category?.toLowerCase() === activeCategory.toLowerCase() ||
        post.category?.toLowerCase().includes(activeCategory.toLowerCase())
    );
  }, [posts, activeCategory]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
    setVisibleCount(6);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2347] via-[#1a3a6b] to-[#0f2347]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2347]/90 via-[#0f2347]/85 to-[#0f2347]/95" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E8542A]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <div className="inline-flex items-center gap-2 bg-[#E8542A]/20 border border-[#E8542A]/40 text-[#E8542A] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Official Stories & Impact
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

      {/* ── Filter by Initiative ── */}
      <section className="py-10 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7c8aab] whitespace-nowrap">
              Filter by Initiative
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                    isActive
                      ? "bg-[#0f2347] border-[#0f2347] text-white shadow-md shadow-[#0f2347]/20"
                      : "bg-white border-gray-200 text-[#1a3a6b] hover:border-[#0f2347]/40 hover:bg-white"
                  }`}
                >
                  {Icon && <Icon size={13} />}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Blog Grid ── */}
      <section className="py-16 sm:py-20 bg-[#f8f9fc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="animate-spin text-[#E8542A]" />
              <p className="text-sm font-semibold text-[#1a3a6b]">Loading stories…</p>
            </div>
          ) : visiblePosts.length > 0 ? (
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

          {hasMore && !isLoading && (
            <div className="flex justify-center mt-14">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 6)}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-gray-200 hover:border-[#E8542A] text-[#0f2347] font-bold rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
              >
                Load More Stories
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}