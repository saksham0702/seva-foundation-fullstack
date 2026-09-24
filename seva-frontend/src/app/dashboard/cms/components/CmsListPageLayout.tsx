"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Layers, FileText, CheckCircle2, Clock, FileCheck, Eye } from "lucide-react";
import { useCms } from "../CmsProvider";
import { CmsCard } from "./CmsCard";
import { CmsStatus } from "@/types/cms";
import { DashboardCategoryBar } from "@/components/dashboard/categories/DashboardCategoryBar";

export function CmsListPageLayout() {
  const { items, contentType, isLoading } = useCms();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | CmsStatus>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const title =
    contentType === "blog" ? "Blog Posts" : contentType === "news" ? "News & Press Releases" : "Events & Drives";

  const description =
    contentType === "blog"
      ? "Manage official articles, stories of impact, and foundation blogs."
      : contentType === "news"
      ? "Publish press statements, announcements, and media updates."
      : "Manage upcoming foundation events, fundraisers, and community drives.";

  const createHref =
    contentType === "blog"
      ? "/dashboard/blogs/create-blog"
      : contentType === "news"
      ? "/dashboard/news/create-news"
      : "/dashboard/events/create-event";

  const createBtnLabel =
    contentType === "blog" ? "New Blog Post" : contentType === "news" ? "New Press Release" : "New Event";

  // Categories list derived dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchQuery, selectedStatus, selectedCategory]);

  // Statistics
  const stats = useMemo(() => {
    const published = items.filter((i) => i.status === "published").length;
    const draft = items.filter((i) => i.status === "draft").length;
    const scheduled = items.filter((i) => i.status === "scheduled").length;
    const views = items.reduce((acc, i) => acc + (i.viewsCount || 0), 0);
    return { total: items.length, published, draft, scheduled, views };
  }, [items]);

  return (
    <div className="min-h-screen">
      <div className="px-4 py-2">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                CMS NODE
              </span>
              <span className="text-[11px] text-muted font-mono uppercase">/{contentType}s</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-xs text-muted mt-1">{description}</p>
          </div>
          <Link
            href={createHref}
            className="flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-navy text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-gold/15"
          >
            <Plus size={16} /> {createBtnLabel}
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-panel border border-border rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/[0.05] text-gold border border-white/10">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted">Total Items</p>
              <p className="text-lg font-bold text-white leading-tight">{stats.total}</p>
            </div>
          </div>

          <div className="bg-panel border border-border rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted">Published</p>
              <p className="text-lg font-bold text-emerald-400 leading-tight">{stats.published}</p>
            </div>
          </div>

          <div className="bg-panel border border-border rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-500/10 text-slate-400 border border-slate-500/20">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted">Drafts</p>
              <p className="text-lg font-bold text-slate-300 leading-tight">{stats.draft}</p>
            </div>
          </div>

          <div className="bg-panel border border-border rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Eye size={18} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted">Total Views</p>
              <p className="text-lg font-bold text-purple-400 leading-tight">{stats.views.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Category Taxonomy Bar */}
        <div className="mb-6">
          <DashboardCategoryBar
            selectedCategory={selectedCategory}
            onCategorySelected={(cat) => setSelectedCategory(cat)}
            title={`${title} Categories`}
          />
        </div>

        {/* Controls Toolbar: Search & Filters */}
        <div className="bg-panel border border-border rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${contentType}s by title, excerpt or slug...`}
              className="w-full bg-bg border border-border rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-gold/50"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-bg p-1 rounded-lg border border-border overflow-x-auto shrink-0">
            {(["all", "published", "draft", "scheduled"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md capitalize transition-all whitespace-nowrap ${
                  selectedStatus === status
                    ? "bg-panel text-gold shadow-sm border border-white/10 font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Category Filter Dropdown */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <Filter size={13} className="text-muted" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/50"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Content Listing Cards */}
        {isLoading ? (
          <div className="p-12 text-center text-muted text-sm border border-border rounded-xl bg-panel">
            Loading content...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl bg-panel/50">
            <FileCheck className="w-10 h-10 text-muted/40 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No items found</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              {searchQuery || selectedStatus !== "all"
                ? "Try adjusting your search terms or status filter."
                : `Get started by creating your first ${contentType}.`}
            </p>
            <Link
              href={createHref}
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-navy bg-gold hover:bg-gold-light px-4 py-2 rounded-lg transition-all"
            >
              <Plus size={14} /> {createBtnLabel}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <CmsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
