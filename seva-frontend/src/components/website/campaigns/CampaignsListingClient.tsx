"use client";

import React, { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Inbox, Sparkles } from "lucide-react";
import { CampaignCard } from "@/components/shared/CampaignCard";
import { toCampaignCardData } from "@/lib/campaign-stats";

interface CampaignsListingClientProps {
  initialCampaigns: any[];
  initialCategories?: { _id: string; name: string; slug?: string }[];
}

const ITEMS_PER_PAGE = 6;

export function CampaignsListingClient({
  initialCampaigns,
  initialCategories = [],
}: CampaignsListingClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all categories dynamically from admin-created categories & campaigns
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialCategories.forEach((cat) => {
      if (cat.name) set.add(cat.name);
    });
    initialCampaigns.forEach((camp) => {
      const catName =
        typeof camp.category === "object" && camp.category?.name
          ? camp.category.name
          : typeof camp.category === "string" && camp.category
          ? camp.category
          : null;
      if (catName) set.add(catName);
    });
    return ["all", ...Array.from(set)];
  }, [initialCampaigns, initialCategories]);

  // Filter campaigns by search & category
  const filteredCampaigns = useMemo(() => {
    return initialCampaigns.filter((camp) => {
      const title = (camp.title || camp.name || "").toLowerCase();
      const desc = (camp.description || camp.story || "").toLowerCase();
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || title.includes(q) || desc.includes(q);

      const catName =
        typeof camp.category === "object" && camp.category?.name
          ? camp.category.name.toLowerCase()
          : typeof camp.category === "string" && camp.category
          ? camp.category.toLowerCase()
          : "";

      const matchesCategory =
        selectedCategory === "all" ||
        catName === selectedCategory.toLowerCase() ||
        catName.includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [initialCampaigns, search, selectedCategory]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE) || 1;
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCampaigns.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCampaigns, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* ── Search and Category Filter Bar ── */}
      <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search campaigns by cause or title…"
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 focus:border-[#E8542A]"
            />
          </div>

          <p className="text-xs text-gray-500 self-start sm:self-center">
            Showing <strong className="text-[#0f2347]">{filteredCampaigns.length}</strong> active causes
          </p>
        </div>

        {/* Category Filter Chips */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-gray-200/60">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
              Causes:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all capitalize ${
                    active
                      ? "bg-[#E8542A] text-white shadow-sm shadow-orange-500/20"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#E8542A]/40"
                  }`}
                >
                  {cat === "all" ? "All Causes" : cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Campaigns Grid ── */}
      {paginatedCampaigns.length === 0 ? (
        <div className="min-h-[35vh] flex flex-col items-center justify-center gap-3 text-center bg-gray-50/50 rounded-3xl border border-gray-100 p-8">
          <Inbox className="text-gray-300" size={36} />
          <p className="text-gray-500 text-sm font-medium">
            No campaigns found matching your selected cause or search query.
          </p>
          {(search || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setCurrentPage(1);
              }}
              className="text-xs font-bold text-[#E8542A] underline hover:opacity-80"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign._id}
              campaign={toCampaignCardData(campaign)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination Controls ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8 border-t border-gray-100">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-[#0f2347] hover:border-[#E8542A] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => {
              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-[#E8542A] text-white shadow-sm shadow-orange-500/20"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-[#0f2347] hover:border-[#E8542A] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
