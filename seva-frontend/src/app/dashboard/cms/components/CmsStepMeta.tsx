"use client";

import { useRef, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Field, inputCls } from "@/components/dashboard/field/Field";
import { useCms } from "../CmsProvider";
import { CMS_CATEGORIES } from "../cms-data";
import { getImageUrl } from "@/lib/image";

export function CmsStepMeta() {
  const { form, set, contentType } = useCms();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  function handleTitleChange(val: string) {
    set("title", val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    set("slug", autoSlug);
  }

  const categoryOptions = CMS_CATEGORIES[contentType] || ["General"];

  const imagePreview: string | null =
    form.featuredImage instanceof File
      ? URL.createObjectURL(form.featuredImage)
      : typeof form.featuredImage === "string" && form.featuredImage
      ? getImageUrl(form.featuredImage)
      : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image file exceeds 5MB size limit. Please select a smaller photo (max 5MB).");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setImageError(null);
    set("featuredImage", file);
  };

  const handleRemoveImage = () => {
    set("featuredImage", null);
    setImageError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Title" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={
              contentType === "event"
                ? "e.g. Annual SEVA Charity Gala 2026"
                : contentType === "news"
                ? "e.g. SEVA Receives National Social Impact Award"
                : "e.g. How Donations Feed 100 Families"
            }
            className={inputCls}
          />
        </Field>

        <Field label="Slug" hint="Auto-generated · editable">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="item-url-slug"
            className={inputCls + " font-mono text-xs"}
          />
        </Field>
      </div>

      {/* Category Select & Author */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Category" required>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputCls}
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat} className="bg-navy text-white">
                {cat}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Author / Credit">
          <input
            type="text"
            value={form.authorName}
            onChange={(e) => set("authorName", e.target.value)}
            placeholder="e.g. SEVA Media Team"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Type-Specific Input Fields */}
      {contentType === "event" && (
        <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-4">
          <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            📅 Event Details
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Event Date & Time" required>
              <input
                type="datetime-local"
                value={form.eventDate}
                onChange={(e) => set("eventDate", e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Location / Venue" required>
              <input
                type="text"
                value={form.eventLocation}
                onChange={(e) => set("eventLocation", e.target.value)}
                placeholder="e.g. Dehradun Community Center"
                className={inputCls}
              />
            </Field>

            <Field label="Organizer / Host">
              <input
                type="text"
                value={form.eventOrganizer}
                onChange={(e) => set("eventOrganizer", e.target.value)}
                placeholder="e.g. SEVA Event Committee"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      )}

      {contentType === "news" && (
        <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-4">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            📰 News & Press Source
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="News Source / Press Outlet">
              <input
                type="text"
                value={form.newsSource}
                onChange={(e) => set("newsSource", e.target.value)}
                placeholder="e.g. The Times of India / Press Release"
                className={inputCls}
              />
            </Field>

            <Field label="Estimated Read Time">
              <input
                type="text"
                value={form.readTime}
                onChange={(e) => set("readTime", e.target.value)}
                placeholder="e.g. 3 min read"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Meta Title */}
      <Field label="Meta Title" hint="Leave blank to use main Title. Max 60 characters.">
        <input
          type="text"
          value={form.metaTitle}
          onChange={(e) => set("metaTitle", e.target.value)}
          placeholder="Override title for search engines"
          className={inputCls}
        />
      </Field>

      {/* Meta Description */}
      <Field label="Meta Description / Excerpt" required hint="Aim for 120–160 characters.">
        <textarea
          value={form.metaDescription}
          onChange={(e) => set("metaDescription", e.target.value)}
          placeholder="Short summary for listing cards and search engines..."
          rows={3}
          className={inputCls + " resize-none"}
        />
        <div className="flex justify-end mt-1">
          <span
            className={`text-[11px] font-semibold ${
              form.metaDescription.length > 160 ? "text-amber-400" : "text-muted"
            }`}
          >
            {form.metaDescription.length}/160
          </span>
        </div>
      </Field>

      {/* Featured Cover Image */}
      <Field
        label="Featured Cover Image"
        hint="Recommended dimensions: 1200 × 630 px (16:9 ratio). Max file size: 5MB."
      >
        {imageError && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <AlertCircle size={14} className="shrink-0" />
            {imageError}
          </div>
        )}
        {imagePreview ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border group shadow-sm bg-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getImageUrl(null);
              }}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 bg-navy/90 backdrop-blur-sm border border-white/20 text-white rounded-lg p-2 shadow-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-white/[0.02] hover:border-gold/50 transition-all group">
            <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-gold">
              <span className="text-xl">🖼️</span>
            </div>
            <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">
              Click to upload cover photo
            </span>
            <span className="text-[10px] text-gold/80 mt-0.5">
              1200 × 630 px · Max 5MB
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </Field>
    </div>
  );
}
