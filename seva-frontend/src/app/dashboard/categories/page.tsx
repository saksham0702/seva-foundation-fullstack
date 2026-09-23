"use client";

import React from "react";
import CategoriesTab from "../campaigns/components/CategoriesTab";
import { FolderTree } from "lucide-react";

export default function DedicatedCategoriesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 flex items-center gap-1">
              <FolderTree size={12} />
              Global Taxonomy
            </span>
            <span className="text-xs text-muted">
              Shared across Campaigns, Blogs, Events & News
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-display">
            Categories Management
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Create, edit, and manage shared categories. These categories are automatically available when creating campaigns, blogs, events, and news articles.
          </p>
        </div>
      </div>

      {/* Categories Management Panel */}
      <div className="bg-panel border border-border rounded-2xl p-6 shadow-sm">
        <CategoriesTab />
      </div>
    </div>
  );
}
