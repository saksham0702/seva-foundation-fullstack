import { Field, inputCls } from "@/components/dashboard/field/Field";
import { useBlog } from "../../BlogProvider";

export function StepMeta() {
  const { form, set } = useBlog();
  function handleTitleChange(val: string) {
    set("title", val);
    // Auto-generate slug only if user hasn't manually edited it
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    set("slug", autoSlug);
  }

  return (
    <div className="space-y-5">

      {/* Title + Slug */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Post Title" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. How Donations Feed 100 Families"
            className={inputCls}
          />
        </Field>
        <Field label="Slug" hint="Auto-generated · editable">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="how-donations-feed-100-families"
            className={inputCls + " font-mono text-xs"}
          />
        </Field>
      </div>

      {/* Meta Title */}
      <Field label="Meta Title" hint="Leave blank to use Post Title. Max 60 characters.">
        <input
          type="text"
          value={form.metaTitle}
          onChange={(e) => set("metaTitle", e.target.value)}
          placeholder="Override title for search engines"
          className={inputCls}
        />
      </Field>

      {/* Meta Description */}
      <Field label="Meta Description" required hint="Shown in search results. Aim for 120–160 characters.">
        <textarea
          value={form.metaDescription}
          onChange={(e) => set("metaDescription", e.target.value)}
          placeholder="A short summary that appears under your post title in Google..."
          rows={3}
          className={inputCls + " resize-none"}
        />
        <div className="flex justify-end mt-1">
          <span className={`text-[11px] font-semibold ${form.metaDescription.length > 160 ? "text-amber-400" : "text-muted"}`}>
            {form.metaDescription.length}/160
          </span>
        </div>
      </Field>

      {/* Featured Image */}
      <Field label="Featured Image" hint="Paste a URL or upload a file. Shown on listing and at top of post.">
        <div className="flex gap-3">
          <input
            type="url"
            value={form.featuredImage}
            onChange={(e) => set("featuredImage", e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className={inputCls}
          />
          <label className="shrink-0 flex items-center gap-1.5 border border-border text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap">
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => set("featuredImage", ev.target?.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>

        {form.featuredImage && (
          <div className="mt-3 h-48 rounded-xl overflow-hidden border border-border relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.featuredImage}
              alt="Featured"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <button
              type="button"
              onClick={() => set("featuredImage", "")}
              className="absolute top-2 right-2 bg-bg/90 backdrop-blur-sm border border-border text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-red-400"
            >
              Remove
            </button>
          </div>
        )}
      </Field>
    </div>
  );
}