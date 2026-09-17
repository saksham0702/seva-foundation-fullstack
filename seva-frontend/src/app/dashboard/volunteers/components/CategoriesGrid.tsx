import React from "react";
import { Plus, Layers, Heart, Edit2, Trash2, Loader2 } from "lucide-react";
import { VolunteerCategory } from "@/app/api/volunteer";

interface CategoriesGridProps {
  categories: VolunteerCategory[];
  isLoading: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (cat: VolunteerCategory) => void;
  onToggleActive: (cat: VolunteerCategory) => void;
  onDeleteRequest: (cat: VolunteerCategory) => void;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  isLoading,
  onOpenCreate,
  onOpenEdit,
  onToggleActive,
  onDeleteRequest,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-black">
            Volunteer Roles &amp; Categories
          </h2>
          <p className="text-xs text-slate-500">
            Configure roles available for volunteer signup on the public website.
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-1.5 bg-black hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <Plus size={15} />
          New Role
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 size={30} className="animate-spin text-slate-400" />
          <p className="text-xs font-semibold text-slate-500">
            Loading role categories...
          </p>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-6">
          <div className="w-11 h-11 rounded-full bg-white shadow-xs flex items-center justify-center mx-auto mb-2.5 text-slate-400">
            <Layers size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            No volunteer categories created yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Create roles such as &ldquo;Community Kitchen&rdquo;, &ldquo;Teach &amp; Mentor&rdquo;, &ldquo;Health Camp Support&rdquo; to accept applications.
          </p>
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            <Plus size={14} />
            Add First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const catColor = cat.color || "#E8542A";
            return (
              <div
                key={cat._id}
                className={`border rounded-2xl p-4 sm:p-5 transition-all bg-white relative flex flex-col justify-between ${
                  cat.isActive !== false
                    ? "border-slate-200 hover:border-slate-400 hover:shadow-xs"
                    : "border-slate-200/60 opacity-60 bg-slate-50/50"
                }`}
              >
                <div>
                  {/* Header: Icon & Action buttons */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: catColor + "18" }}
                    >
                      {cat.icon ? (
                        <img
                          src={cat.icon}
                          alt=""
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Heart size={18} style={{ color: catColor }} />
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleActive(cat)}
                        title={
                          cat.isActive !== false
                            ? "Active (Click to Deactivate)"
                            : "Inactive (Click to Activate)"
                        }
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                          cat.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {cat.isActive !== false ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => onOpenEdit(cat)}
                        title="Edit Category"
                        className="p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteRequest(cat)}
                        title="Delete Category"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">
                    {cat.description || "No description provided."}
                  </p>
                </div>

                {/* Footer Info */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1 font-mono">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: catColor }}
                    />
                    {catColor}
                  </span>
                  <span className="font-mono text-[10px]">
                    /{cat.slug || cat.title.toLowerCase().replace(/\s+/g, "-")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
