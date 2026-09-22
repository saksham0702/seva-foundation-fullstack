"use client";

import { Info, Search } from "lucide-react";
import { useCms } from "../CmsProvider";

export function CmsSidebar() {
  const { form, set, saveItem, isEditMode, contentType } = useCms();
  const metaDescLen = form.metaDescription.length;
  const metaTitleLen = (form.metaTitle || form.title).length;

  const typeLabel = contentType === "blog" ? "Post" : contentType === "news" ? "News" : "Event";

  return (
    <div className="space-y-4">
      {/* Publish Panel */}
      <div className="bg-panel border border-border rounded-xl shadow-sm p-5">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-gold/90 mb-4">
          Publish Settings
        </p>

        <div className="space-y-3">
          {/* Status Select */}
          <div>
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-white bg-bg focus:outline-none focus:ring-2 focus:ring-blueaccent/30 appearance-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {/* Category Select */}
          <div>
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">
              Category
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Humanitarian"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-white bg-bg focus:outline-none focus:ring-2 focus:ring-blueaccent/30"
            />
          </div>

          {/* Scheduled Date */}
          {form.status === "scheduled" && (
            <div>
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                Publish At
              </label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => set("scheduledAt", e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-white bg-bg focus:outline-none focus:ring-2 focus:ring-blueaccent/30"
              />
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border space-y-2">
          {form.status === "scheduled" ? (
            <button
              type="button"
              onClick={() => saveItem("scheduled")}
              className="w-full bg-blueaccent hover:bg-blue-dark text-white font-bold text-sm py-2.5 rounded-lg transition-all shadow-md cursor-pointer"
            >
              Schedule {typeLabel}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => saveItem("published")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-lg transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isEditMode ? `Publish / Update Live` : `Publish ${typeLabel} Now`}
              </button>
              <button
                type="button"
                onClick={() => saveItem("draft")}
                className="w-full bg-panel hover:bg-white/5 border border-border text-white text-xs font-semibold py-2.5 rounded-lg transition-all cursor-pointer"
              >
                Save as Draft
              </button>
            </>
          )}
        </div>
      </div>

      {/* SEO Preview Panel */}
      <div className="bg-panel border border-border rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Search size={13} className="text-gold" />
          <p className="text-[11px] uppercase tracking-wider font-semibold text-gold/90">
            SEO Preview
          </p>
        </div>

        {/* Google snippet preview */}
        <div className="bg-bg rounded-lg p-3 mb-4 border border-border">
          <p className="text-[11px] text-muted mb-1 font-mono truncate">
            yoursite.com/{contentType}/{form.slug || "item-slug"}
          </p>
          <p
            className={`text-sm font-semibold leading-snug mb-1 ${
              metaTitleLen > 60 ? "text-amber-400" : "text-blueaccent"
            }`}
          >
            {form.metaTitle || form.title || `${typeLabel} Title`}
          </p>
          <p
            className={`text-xs leading-relaxed ${
              metaDescLen > 160 ? "text-amber-400" : "text-muted"
            }`}
          >
            {form.metaDescription ||
              "Meta description preview. Keep under 160 characters for optimum search rankings."}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted">Title Length</span>
            <span className={metaTitleLen > 60 ? "text-amber-400 font-semibold" : "text-muted"}>
              {metaTitleLen}/60
            </span>
          </div>
          <div className="w-full bg-bg rounded-full h-1 border border-border">
            <div
              className={`h-1 rounded-full transition-all ${
                metaTitleLen > 60 ? "bg-amber-400" : "bg-emerald-400"
              }`}
              style={{ width: `${Math.min(100, (metaTitleLen / 60) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] mt-2">
            <span className="text-muted">Description Length</span>
            <span className={metaDescLen > 160 ? "text-amber-400 font-semibold" : "text-muted"}>
              {metaDescLen}/160
            </span>
          </div>
          <div className="w-full bg-bg rounded-full h-1 border border-border">
            <div
              className={`h-1 rounded-full transition-all ${
                metaDescLen > 160 ? "bg-amber-400" : "bg-emerald-400"
              }`}
              style={{ width: `${Math.min(100, (metaDescLen / 160) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Integration Tip */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-2.5">
        <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-300 leading-relaxed">
          Content created here is ready to sync with your backend CMS API.
        </p>
      </div>
    </div>
  );
}
