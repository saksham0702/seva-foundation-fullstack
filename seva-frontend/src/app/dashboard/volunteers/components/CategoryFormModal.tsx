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
  const activeType = category?.formType || formType;
  const isSimpleCategory = activeType === "corporate" || activeType === "career";

  const [form, setForm] = useState({
    title: "",
    slug: "",
    badge: "",
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
        badge: category.badge || "",
        description: category.description || "",
        color: category.color || COLOR_PRESETS[0],
        isActive: category.isActive !== false,
      });
    } else {
      setForm({
        title: "",
        slug: "",
        badge: "",
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
      formData.append("formType", activeType);
      formData.append("title", form.title);
      if (form.slug) formData.append("slug", form.slug);
      if (form.badge) formData.append("badge", form.badge);
      formData.append("description", form.description || "");
      formData.append("color", form.color || "#1a3a6b");
      formData.append("isActive", String(form.isActive));

      if (iconFile) {
        formData.append("icon", iconFile);
      } else if (!category && !isSimpleCategory) {
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

  const modalTitle = category
    ? isSimpleCategory
      ? activeType === "corporate"
        ? "Edit Corporate Category"
        : "Edit Career Department"
      : "Edit Role Category"
    : isSimpleCategory
    ? activeType === "corporate"
      ? "New Corporate Category"
      : "New Career Department"
    : "Create Role Category";

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  {modalTitle}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isSimpleCategory
                    ? `Define categories and tags for ${activeType === "corporate" ? "corporate inquiries" : "career applications"}`
                    : "Configure role cards, badges, theme colors, and icons"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-black rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title & Slug */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isSimpleCategory
                    ? activeType === "corporate"
                      ? "Partnership / Category Name *"
                      : "Job Division / Role Name *"
                    : "Role Title *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isSimpleCategory
                      ? activeType === "corporate"
                        ? "e.g. CSR Partnership, Employee Giving"
                        : "e.g. Social Work, Marketing, Tech"
                      : "e.g. Community Kitchen, Field Volunteer"
                  }
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-black placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Slug (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. csr-partnership"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-black placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Badge / Tag Meta */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Badge / Meta Tag (Optional)
              </label>
              <input
                type="text"
                placeholder={
                  isSimpleCategory
                    ? activeType === "corporate"
                      ? "e.g. CSR • SPONSORSHIP • CORPORATE GRANT"
                      : "e.g. FULL-TIME • DEHRADUN • HYBRID"
                    : "e.g. MULTIPLE LOCATIONS • FULL-TIME"
                }
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-black placeholder:text-slate-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Description {isSimpleCategory ? "(Optional)" : "*"}
              </label>
              <textarea
                rows={isSimpleCategory ? 2 : 3}
                required={!isSimpleCategory}
                placeholder={
                  isSimpleCategory
                    ? "Briefly describe this category or scope of opportunities..."
                    : "Describe what this role / project involves and key responsibilities..."
                }
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-black placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Only for Volunteer / Individual: Icon Upload and Color Presets */}
            {!isSimpleCategory && (
              <div className="grid sm:grid-cols-2 gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                    className="w-28 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
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
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                  />
                  {category?.icon && !iconFile && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Current icon saved. Upload new .svg to replace.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Active Checkbox + Actions */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
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
                  Active (visible to applicants on website)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
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
                    "Create Category"
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
