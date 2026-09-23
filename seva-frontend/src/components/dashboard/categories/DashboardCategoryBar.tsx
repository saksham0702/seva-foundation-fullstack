"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderTree, Plus, Sparkles, ExternalLink, Loader2, Tag, Check, X } from "lucide-react";
import { getCategories, createCategory, Category } from "@/app/api/category";

interface DashboardCategoryBarProps {
  onCategorySelected?: (categoryName: string) => void;
  selectedCategory?: string;
  onCategoriesChanged?: () => void;
  title?: string;
}

export function DashboardCategoryBar({
  onCategorySelected,
  selectedCategory,
  onCategoriesChanged,
  title = "Content Categories & Taxonomy",
}: DashboardCategoryBarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddInline, setShowAddInline] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCats = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setCreating(true);
      setError(null);
      const created = await createCategory({ name: newCatName.trim() });
      setNewCatName("");
      setShowAddInline(false);
      await fetchCats();
      if (onCategorySelected) onCategorySelected(created.name);
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const [showAll, setShowAll] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FolderTree size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {title}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {categories.length} {categories.length === 1 ? "Category" : "Categories"}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Categories created here are shared dynamically across Blogs, Events, News, and Website filters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!showAddInline && (
            <button
              onClick={() => setShowAddInline(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Category</span>
            </button>
          )}

          <Link
            href="/dashboard/categories"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-700"
          >
            <span>Manage All</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Inline Create Form */}
      {showAddInline && (
        <form onSubmit={handleCreate} className="mb-4 p-3 bg-slate-800/80 border border-emerald-500/30 rounded-xl space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles size={13} /> Add New Category
            </span>
            <button
              type="button"
              onClick={() => {
                setShowAddInline(false);
                setError(null);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Health Camps, Education Drive, Stories…"
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={creating || !newCatName.trim()}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Save
            </button>
          </div>

          {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
        </form>
      )}

      {/* Category Badges */}
      {loading ? (
        <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
          <Loader2 size={14} className="animate-spin text-emerald-400" />
          <span>Loading categories…</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-4 text-center bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
          <p className="text-xs text-slate-300 font-medium">No categories created yet.</p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-2.5">
            Create your first category above so you can select it when publishing blogs, events, and news.
          </p>
          <button
            onClick={() => setShowAddInline(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            Add First Category
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {onCategorySelected && (
            <button
              onClick={() => onCategorySelected("all")}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer border ${
                selectedCategory === "all" || !selectedCategory
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
              }`}
            >
              All Categories
            </button>
          )}

          {(showAll ? categories : categories.slice(0, 8)).map((cat) => {
            const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat._id}
                onClick={() => onCategorySelected && onCategorySelected(cat.name)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm"
                    : "bg-slate-800/80 text-slate-200 border-slate-700/80 hover:bg-slate-700 hover:text-white"
                } ${onCategorySelected ? "cursor-pointer" : "cursor-default"}`}
              >
                <Tag size={11} className={isSelected ? "text-slate-950" : "text-emerald-400"} />
                <span>{cat.name}</span>
              </button>
            );
          })}

          {categories.length > 8 && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              {showAll ? "Show Less ↑" : `+ View More (${categories.length - 8}) ↓`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
