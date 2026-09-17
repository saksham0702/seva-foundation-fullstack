import { useState } from "react";
import { Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
} from "@/app/api/category";
import { useToast } from "@/lib/toast";
import { extractErrorMessage } from "@/lib/api-error";

export default function CategoriesTab() {
  const toast = useToast();
  const queryClient = useQueryClient();

  // ─── Data ───────────────────────────────────────────────────────────────────
  const { data: categories = [], isLoading, isError } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string } }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // ─── Local UI State ─────────────────────────────────────────────────────────
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    createMutation.mutate(
      { name: trimmed },
      {
        onSuccess: (data) => {
          toast.success(`Category "${data.name}" created successfully.`);
          setInput("");
        },
        onError: (err) => {
          toast.error(extractErrorMessage(err, "Failed to create category."));
        },
      }
    );
  };

  const handleEditSave = () => {
    if (!editId || !editValue.trim()) return;
    updateMutation.mutate(
      { id: editId, payload: { name: editValue.trim() } },
      {
        onSuccess: (data) => {
          toast.success(`Category "${data.name}" updated.`);
          setEditId(null);
        },
        onError: (err) => {
          toast.error(extractErrorMessage(err, "Failed to update category."));
        },
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Category "${name}" deleted.`);
      },
      onError: (err) => {
        toast.error(extractErrorMessage(err, "Failed to delete category."));
      },
    });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* List */}
      <div className="lg:col-span-3 bg-panel border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">All Categories</h2>
          <span className="text-[10px] text-muted bg-bg px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-border">
            {categories.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-muted text-sm">
            <Loader2 size={16} className="animate-spin" />
            <span>Loading categories…</span>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-400 text-sm font-medium">
            Failed to load categories. Please refresh.
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center text-muted text-sm">
            No categories yet. Add one on the right.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {categories.map((cat, i) => (
              <div
                key={cat._id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-bg transition-colors group"
              >
                <span className="text-xs text-faint font-medium w-6 shrink-0 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {editId === cat._id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave();
                      if (e.key === "Escape") setEditId(null);
                    }}
                    className="flex-1 text-sm text-text-primary border-b border-blueaccent outline-none bg-transparent font-bold pb-1"
                  />
                ) : (
                  <span className="flex-1 text-sm text-text-primary font-bold">{cat.name}</span>
                )}

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editId === cat._id ? (
                    <>
                      <button
                        onClick={handleEditSave}
                        disabled={updateMutation.isPending}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-blueaccent text-white hover:bg-blue-dark transition-colors shadow-lg shadow-blueaccent/20 disabled:opacity-50"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} strokeWidth={3} />
                        )}
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-panel text-muted hover:bg-bg transition-colors border border-border"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditId(cat._id); setEditValue(cat.name); }}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-muted hover:bg-panel hover:text-text-primary transition-colors border border-transparent hover:border-border"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        disabled={deleteMutation.isPending}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-panel border border-border rounded-2xl p-7">
          <h2 className="text-base font-semibold text-text-primary mb-6">Add New Category</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="e.g. Disaster Relief"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-faint focus:outline-none focus:ring-2 focus:ring-blueaccent/20 focus:border-blueaccent transition-all bg-bg"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!input.trim() || createMutation.isPending}
              className="w-full bg-blueaccent hover:bg-blue-dark disabled:bg-panel disabled:text-faint text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-blueaccent/20 flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Adding…
                </>
              ) : (
                "Add Category"
              )}
            </button>
          </div>
        </div>

        <div className="bg-blueaccent/10 border border-blueaccent/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-blueaccent mb-1.5 flex items-center gap-2">
            <span className="text-base">💡</span> Tip
          </p>
          <p className="text-[11px] text-blueaccent/70 leading-relaxed font-medium">
            Categories help donors discover campaigns faster. Keep names short, clear and professional.
          </p>
        </div>
      </div>
    </div>
  );
}