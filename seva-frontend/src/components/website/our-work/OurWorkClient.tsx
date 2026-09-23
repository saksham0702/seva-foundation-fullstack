"use client";

import React, { useState, useMemo } from "react";
import InitiativeCard, { InitiativeData } from "@/components/website/our-work/InitiativeCard";
import InitiativeDonationSection from "@/components/website/donations/InitiativeDonationSection";

interface OurWorkClientProps {
  initiatives: InitiativeData[];
}

export default function OurWorkClient({ initiatives }: OurWorkClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredInitiatives = useMemo(() => {
    if (selectedCategory === "all") return initiatives;
    return initiatives.filter(
      (init) => init.key.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [initiatives, selectedCategory]);

  const handleCategorySelect = (key: string) => {
    setSelectedCategory(key);
    if (key !== "all") {
      const el = document.getElementById(key);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <>
      {/* ── Category Filter Bar ── */}
      <section className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3.5 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === "all"
                  ? "bg-[#0A1A2F] text-white shadow-sm"
                  : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80"
              }`}
            >
              All Categories ({initiatives.length})
            </button>

            {initiatives.map((init) => {
              const isSelected =
                selectedCategory.toLowerCase() === init.key.toLowerCase();
              return (
                <button
                  key={init.key}
                  type="button"
                  onClick={() => handleCategorySelect(init.key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isSelected
                      ? "bg-[#F5A623] text-white shadow-sm shadow-amber-500/20"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80"
                  }`}
                >
                  {init.title || init.name || init.key}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Initiatives List: One by one with full rich content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        {filteredInitiatives.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-sm text-slate-700">
              No initiatives found under this category.
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-3 text-xs font-bold text-[#F5A623] hover:underline"
            >
              View all initiatives
            </button>
          </div>
        ) : (
          filteredInitiatives.map((initiative) => (
            <InitiativeCard key={initiative.key} initiative={initiative} />
          ))
        )}
      </main>

      {/* ── Direct Initiative Donation Module (In-page) ── */}
      <div id="initiative-donation-form" className="scroll-mt-24">
        <InitiativeDonationSection
          initialInitiative={selectedCategory !== "all" ? selectedCategory : undefined}
        />
      </div>
    </>
  );
}
