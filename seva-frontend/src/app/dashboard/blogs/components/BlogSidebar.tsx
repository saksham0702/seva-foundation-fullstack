import { Info, Search } from "lucide-react";
import { useBlog } from "../BlogProvider";

export function BlogSidebar() {
  const { form, set } = useBlog();
  const metaDescLen = form.metaDescription.length;
  const metaTitleLen = (form.metaTitle || form.title).length;

  return (
    <div className="space-y-4">

      {/* Publish panel */}
      <div className="bg-panel border border-border rounded-xl shadow-sm p-5">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-4">Publish</p>

        <div className="space-y-3">
          {/* Status */}
          <div>
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Status</label>
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

          {/* Scheduled date */}
          {form.status === "scheduled" && (
            <div>
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Publish At</label>
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
          <button
            type="button"
            className="w-full bg-emerald-accent hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-all shadow-sm"
          >
            {form.status === "published" ? "Update Post" : form.status === "scheduled" ? "Schedule Post" : "Save Draft"}
          </button>
          <button
            type="button"
            className="w-full border border-border text-white text-sm font-semibold py-2 rounded-lg hover:bg-white/5 transition-all"
          >
            Preview
          </button>
        </div>
      </div>

      {/* SEO Preview */}
      <div className="bg-panel border border-border rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Search size={13} className="text-muted" />
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted">SEO Preview</p>
        </div>

        {/* Google-style preview */}
        <div className="bg-bg rounded-lg p-3 mb-4 border border-border">
          <p className="text-[11px] text-muted mb-1 font-mono truncate">
            yoursite.com/blog/{form.slug || "post-slug"}
          </p>
          <p className={`text-sm font-semibold leading-snug mb-1 ${metaTitleLen > 60 ? "text-amber-400" : "text-blueaccent"}`}>
            {(form.metaTitle || form.title) || "Post Title"}
          </p>
          <p className={`text-xs leading-relaxed ${metaDescLen > 160 ? "text-amber-400" : "text-muted"}`}>
            {form.metaDescription || "Meta description will appear here. Keep it under 160 characters for best results."}
          </p>
        </div>

        {/* Character counts */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted">Title</span>
            <span className={metaTitleLen > 60 ? "text-amber-400 font-semibold" : "text-muted"}>
              {metaTitleLen}/60
            </span>
          </div>
          <div className="w-full bg-bg rounded-full h-1 border border-border">
            <div
              className={`h-1 rounded-full transition-all ${metaTitleLen > 60 ? "bg-amber-400" : "bg-emerald-accent"}`}
              style={{ width: `${Math.min(100, (metaTitleLen / 60) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] mt-2">
            <span className="text-muted">Description</span>
            <span className={metaDescLen > 160 ? "text-amber-400 font-semibold" : "text-muted"}>
              {metaDescLen}/160
            </span>
          </div>
          <div className="w-full bg-bg rounded-full h-1 border border-border">
            <div
              className={`h-1 rounded-full transition-all ${metaDescLen > 160 ? "bg-amber-400" : "bg-emerald-accent"}`}
              style={{ width: `${Math.min(100, (metaDescLen / 160) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Info tip */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-2.5">
        <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-300 leading-relaxed">
          Images added inside the editor are embedded as base64. For production, configure an upload endpoint to store them in your CDN.
        </p>
      </div>
    </div>
  );
}