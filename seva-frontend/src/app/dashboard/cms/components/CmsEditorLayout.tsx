"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCms } from "../CmsProvider";
import { CmsStepMeta } from "./CmsStepMeta";
import { CmsStepContent } from "./CmsStepContent";
import { CmsSidebar } from "./CmsSidebar";

export function CmsEditorLayout() {
  const { tab, setTab, metaComplete, contentComplete, isEditMode, contentType } = useCms();

  const backHref =
    contentType === "blog"
      ? "/dashboard/blogs"
      : contentType === "news"
      ? "/dashboard/news"
      : "/dashboard/events";

  const typeLabel =
    contentType === "blog" ? "Blog Post" : contentType === "news" ? "News Release" : "Event";

  const tabs: { id: "meta" | "content"; label: string }[] = [
    { id: "meta", label: "Meta & Details" },
    { id: "content", label: "Content & FAQs" },
  ];

  return (
    <div className="min-h-screen">
      <div className="px-4 py-2">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-muted hover:text-white text-xs font-semibold mb-4 transition-colors"
          >
            <ChevronLeft size={14} /> Back to {typeLabel}s
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
              CMS EDITOR
            </span>
            <span className="text-[11px] text-muted font-mono uppercase">/{contentType}s</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isEditMode ? `Edit ${typeLabel}` : `Create New ${typeLabel}`}
          </h1>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1 mb-6 bg-bg p-1 rounded-xl w-fit border border-border">
          {tabs.map(({ id, label }) => {
            const done = id === "meta" ? metaComplete : contentComplete;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg transition-all ${
                  tab === id
                    ? "bg-panel text-white shadow-sm border border-border"
                    : "text-muted hover:text-white"
                }`}
              >
                {label}
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    done ? "bg-emerald-400" : "bg-border"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
          {/* Form Card */}
          <div className="bg-panel border border-border rounded-xl shadow-sm p-7">
            {tab === "meta" && <CmsStepMeta />}
            {tab === "content" && <CmsStepContent />}

            {/* Bottom Tab Navigation controls */}
            <div className="flex justify-between mt-6 pt-4 border-t border-border">
              {tab === "content" ? (
                <button
                  type="button"
                  onClick={() => setTab("meta")}
                  className="flex items-center gap-1.5 border border-border text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-white/5 transition-all"
                >
                  ← Back to Meta & Details
                </button>
              ) : (
                <div />
              )}
              {tab === "meta" && (
                <button
                  type="button"
                  onClick={() => setTab("content")}
                  className="ml-auto flex items-center gap-2 bg-gold hover:bg-gold-light text-navy text-sm font-bold px-6 py-2.5 rounded-lg transition-all shadow-md"
                >
                  Write Content & FAQs →
                </button>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <CmsSidebar />
        </div>
      </div>
    </div>
  );
}
