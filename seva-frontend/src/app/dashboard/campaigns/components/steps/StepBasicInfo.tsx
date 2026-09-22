"use client";

import { useRef, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, X, AlertCircle } from "lucide-react";
import { Field, inputCls } from "@/components/dashboard/field/Field";
import { useCampaign } from "../../provider";
import { useQuery } from "@tanstack/react-query";
import { getCategories, Category } from "@/app/api/category";
import { getCampaignOptions } from "@/app/api/campaign";
import { getImageUrl } from "@/lib/image";

export function StepBasicInfo() {
  const { form, set, setStep, isEditing, editId } = useCampaign();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: existingCampaigns = [] } = useQuery({
    queryKey: ["campaign-options"],
    queryFn: getCampaignOptions,
  });

  const isDuplicateTitle = useMemo(() => {
    if (!form.title.trim()) return false;
    return existingCampaigns.some(
      (c: any) =>
        c.name &&
        c.name.trim().toLowerCase() === form.title.trim().toLowerCase() &&
        (!editId || c._id !== editId)
    );
  }, [form.title, existingCampaigns, editId]);

  // Auto-generate slug from title (only for new campaigns or when slug is not set)
  const handleTitleChange = (val: string) => {
    set("title", val);
    if (!isEditing || !form.slug) {
      set(
        "slug",
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      );
    }
  };

  const canProceed =
    Boolean(form.title.trim()) &&
    Boolean(form.category) &&
    !isDuplicateTitle &&
    !imageError;

  // Compute preview URL
  const imagePreview: string | null =
    form.image instanceof File
      ? URL.createObjectURL(form.image)
      : typeof form.image === "string" && form.image
        ? getImageUrl(form.image)
        : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Selected image exceeds 5MB size limit. Please choose a smaller image (max 5MB).");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setImageError(null);
    set("image", file);
  };

  const handleRemoveImage = () => {
    set("image", null);
    setImageError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Title + Slug */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Campaign Title" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Health Camp for Tribal Regions"
            className={`${inputCls} ${isDuplicateTitle ? "border-red-500 focus:border-red-500" : ""}`}
          />
          {isDuplicateTitle && (
            <p className="text-[11px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle size={12} /> A campaign with this name already exists. Please choose a different title.
            </p>
          )}
        </Field>
        <Field label="Slug" hint="Auto-generated from title, editable">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="health-camp-tribal-regions"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Meta Title + Category */}
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Meta Title"
          hint="For SEO, leave blank to use Campaign Title"
        >
          <input
            type="text"
            value={form.metaTitle}
            onChange={(e) => set("metaTitle", e.target.value)}
            placeholder="Enter meta title"
            className={inputCls}
          />
        </Field>
        <Field
          label="Category"
          required
          extra={
            <Link
              href="/dashboard/campaigns/category"
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold ml-2"
            >
              + Add Category
            </Link>
          }
        >
          <div className="relative">
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputCls + " appearance-none"}
              disabled={categoriesLoading}
            >
              <option value="" disabled>
                {categoriesLoading
                  ? "Loading categories…"
                  : "Select a category"}
              </option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categoriesLoading && (
              <Loader2
                size={14}
                className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            )}
          </div>
        </Field>
      </div>

      {/* Meta Description */}
      <Field
        label="Meta Description"
        hint="150–160 characters recommended for SEO"
      >
        <textarea
          value={form.metaDescription}
          onChange={(e) => set("metaDescription", e.target.value)}
          placeholder="Brief description for search engines..."
          rows={3}
          className={inputCls + " resize-none"}
        />
        <div className="flex justify-end mt-1">
          <span
            className={`text-[11px] font-semibold ${form.metaDescription.length > 160 ? "text-red-500" : "text-slate-400"}`}
          >
            {form.metaDescription.length}/160
          </span>
        </div>
      </Field>

      {/* Campaign Image */}
      <Field
        label="Campaign Cover Image"
        hint="Max file size: 5MB. Recommended dimensions: 1200 × 630 px (16:9 ratio)."
      >
        {imageError && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <AlertCircle size={14} className="shrink-0" />
            {imageError}
          </div>
        )}
        {imagePreview ? (
          <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Campaign preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-panel hover:border-blueaccent/40 transition-all group">
            <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <span className="text-xl">🖼️</span>
            </div>
            <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">
              Click to upload cover photo
            </span>
            <span className="text-[10px] text-faint mt-0.5">
              1200 × 630 px · Max 5MB
            </span>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        )}
      </Field>

      {/* Actions */}
      <div className="flex justify-end pt-6 border-t border-border mt-10">
        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={!canProceed}
          className="flex items-center gap-2 bg-blueaccent hover:bg-blue-dark disabled:bg-gray-500 disabled:text-gray-700 text-white text-sm font-bold px-8 py-3 rounded-xl "
        >
          Next Step <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
