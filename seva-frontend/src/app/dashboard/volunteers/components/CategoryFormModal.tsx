import React, { useState, useEffect } from "react";
import { X, Layers, Check, AlertCircle, Loader2 } from "lucide-react";
import { Portal } from "@/components/shared/Portal";
import {
  createVolunteerCategory,
  updateVolunteerCategory,
  VolunteerCategory,
  FormType,
} from "@/app/api/volunteer";

const COLOR_PRESETS = [
  "#1a3a6b",
  "#E8542A",
  "#059669",
  "#0d9488",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#2563eb",
  "#d97706",
  "#4b5563",
];

interface CategoryFormModalProps {
  isOpen: boolean;
  category: VolunteerCategory | null;
  formType: FormType;
  onClose: () => void;
  onSaved: (savedCategory: VolunteerCategory, isNew: boolean) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  category,
  formType,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    color: COLOR_PRESETS[0],
    isActive: true,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setForm({
        title: category.title,
        slug: category.slug,
        description: category.description,
        color: category.color || COLOR_PRESETS[0],
        isActive: category.isActive !== false,
      });
    } else {
      setForm({
        title: "",
        slug: "",
        description: "",
        color: COLOR_PRESETS[0],
        isActive: true,
      });
    }
    setIconFile(null);
    setError(null);
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("formType", category?.formType || formType);
      formData.append("title", form.title);
      if (form.slug) formData.append("slug", form.slug);
      formData.append("description", form.description);
      formData.append("color", form.color);
      formData.append("isActive", String(form.isActive));

      if (iconFile) {
        formData.append("icon", iconFile);
      } else if (!category) {
        formData.append("icon", "/assets/icons/volunteer-default.svg");
      }

      if (category) {
        const updated = await updateVolunteerCategory(category._id, formData);
        onSaved(updated, false);
      } else {
        const created = await createVolunteerCategory(formData);
        onSaved(created, true);
      }
      onClose();
    } catch (err: any) {
      console.error("Error saving category:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to save category."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
              <Layers size={15} />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              {category ? "Edit Role Category" : "Create Role Category"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-black rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Row 1: Title & Slug */}
          <div className="grid sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Role Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Community Kitchen"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-black placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Slug (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. community-kitchen"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-black placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Description *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Describe what volunteers in this role do..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-black placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Row 3: Color & Icon Upload */}
          <div className="grid sm:grid-cols-2 gap-3.5 items-start">
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Theme Color
              </label>
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                      form.color === c
                        ? "ring-2 ring-black ring-offset-1 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {form.color === c && (
                      <Check size={11} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-28 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Role Icon (SVG)
              </label>
              <input
                type="file"
                accept=".svg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setIconFile(e.target.files[0]);
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
              {category?.icon && !iconFile && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Current icon is saved. Upload new .svg to replace.
                </p>
              )}
            </div>
          </div>

          {/* Row 4: Active Checkbox + Actions */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActiveToggleComp"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
              />
              <label
                htmlFor="isActiveToggleComp"
                className="text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Active role (visible to applicants)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl disabled:opacity-60 transition-all shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Saving...
                  </>
                ) : category ? (
                  "Save Changes"
                ) : (
                  "Create Role"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      </div>
    </Portal>
  );
};
