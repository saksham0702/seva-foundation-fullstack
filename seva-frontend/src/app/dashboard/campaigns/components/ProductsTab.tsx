import { useState, useRef } from "react";
import { Pencil, Trash2, Search, X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
} from "@/app/api/product";
import { useToast } from "@/lib/toast";
import { extractErrorMessage } from "@/lib/api-error";
import { getImageUrl } from "@/lib/image";

export type UnitType = "kg" | "g" | "l" | "ml" | "unit" | "pack" | "dozen";

const UNIT_TYPES: UnitType[] = ["kg", "g", "l", "ml", "unit", "pack", "dozen"];

interface FormState {
  name: string;
  unit: string;
  unitType: UnitType;
  price: string;
  imageFile: File | null;
  imagePreview: string | null;
}

const emptyForm: FormState = {
  name: "",
  unit: "",
  unitType: "kg",
  price: "",
  imageFile: null,
  imagePreview: null,
};

export default function ProductsTab() {
  const toast = useToast();
  const queryClient = useQueryClient();

  // ─── Data ───────────────────────────────────────────────────────────────────
  const { data: products = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const createMutation = useMutation({
    mutationFn: ({ payload, imageFile }: { payload: Omit<Product, "_id" | "image">; imageFile?: File }) =>
      createProduct(payload, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload, imageFile }: { id: string; payload: Partial<Omit<Product, "_id" | "image">>; imageFile?: File }) =>
      updateProduct(id, payload, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // ─── Local UI State ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(10);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const visible = filtered.slice(0, showEntries);

  const preventNonNumericKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(
        e.key
      ) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (!/^[0-9.]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((f) => ({ ...f, imageFile: file, imagePreview: preview }));
  };

  function buildPayload() {
    return {
      name: form.name.trim(),
      price: Number(form.price),
      unit: Number(form.unit),
      unitType: form.unitType,
    };
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.unit.trim() || !form.price.trim()) {
      setFormError("Please fill all required fields.");
      return;
    }
    if (Number(form.unit) <= 0) {
      setFormError("Unit value must be greater than 0.");
      return;
    }
    if (Number(form.price) <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }
    setFormError("");

    if (editId) {
      updateMutation.mutate(
        { id: editId, payload: buildPayload(), imageFile: form.imageFile ?? undefined },
        {
          onSuccess: (data) => {
            toast.success(`Product "${data.name}" updated successfully.`);
            handleCancel();
          },
          onError: (err) => {
            toast.error(extractErrorMessage(err, "Failed to update product."));
          },
        }
      );
    } else {
      createMutation.mutate(
        { payload: buildPayload(), imageFile: form.imageFile ?? undefined },
        {
          onSuccess: (data) => {
            toast.success(`Product "${data.name}" created successfully.`);
            handleCancel();
          },
          onError: (err) => {
            toast.error(extractErrorMessage(err, "Failed to create product."));
          },
        }
      );
    }
  };

  const handleEdit = (id: string) => {
    const p = products.find((x) => x._id === id);
    if (!p) return;
    setEditId(p._id);
    setForm({
      name: p.name,
      unit: String(p.unit),
      unitType: p.unitType as UnitType,
      price: String(p.price),
      imageFile: null,
      imagePreview: p.image ? getImageUrl(p.image) : null,
    });
    setFormError("");
  };

  const handleDelete = (id: string, name: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Product "${name}" deleted.`);
      },
      onError: (err) => {
        toast.error(extractErrorMessage(err, "Failed to delete product."));
      },
    });
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
      {/* Table Panel */}
      <div className="bg-panel border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-base font-semibold text-text-primary">Products Listing</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wider">
              <span>Show</span>
              <select
                value={showEntries}
                onChange={(e) => setShowEntries(Number(e.target.value))}
                className="border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-blueaccent/20 bg-bg"
              >
                {[5, 10, 25, 50].map((n) => <option key={n}>{n}</option>)}
              </select>
              <span>entries</span>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="pl-10 pr-4 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blueaccent/20 bg-bg text-text-primary w-56"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg border-b border-border">
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-muted uppercase tracking-widest w-20">Image</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-muted uppercase tracking-widest">Name</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-muted uppercase tracking-widest w-32">Unit</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-muted uppercase tracking-widest w-32">Price</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-muted uppercase tracking-widest w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      Loading products…
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-red-500 text-sm font-medium">
                    Failed to load products. Please refresh.
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-muted text-sm">
                    No products found.
                  </td>
                </tr>
              ) : (
                visible.map((p) => (
                  <tr key={p._id} className="hover:bg-panel transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl bg-bg overflow-hidden flex items-center justify-center border border-border shadow-sm transition-transform group-hover:scale-105">
                        {p.image ? (
                          <img
                            src={getImageUrl(p.image)}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getImageUrl(null);
                            }}
                          />
                        ) : (
                          <span className="text-faint text-xl">📦</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold text-text-primary">{p.name}</td>
                    <td className="px-4 py-4 text-muted font-medium">
                      <span className="bg-bg px-2.5 py-1 rounded-lg text-xs border border-border">{p.unit} {p.unitType}</span>
                    </td>
                    <td className="px-4 py-4 text-text-primary font-semibold">₹{p.price.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(p._id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-panel text-text-primary text-xs font-bold hover:bg-blueaccent hover:text-white transition-all border border-border"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          disabled={deleteMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-border bg-bg flex items-center justify-between">
          <p className="text-xs text-muted font-bold">
            Showing {Math.min(visible.length, showEntries)} of {filtered.length} entries
          </p>
        </div>
      </div>

      {/* Add / Edit Form */}
      <div className="bg-panel border border-border rounded-2xl p-8 sticky top-8">
        <h2 className="text-lg font-semibold text-text-primary mb-8 flex items-center gap-2">
          {editId ? (
            <span className="w-2 h-6 bg-blueaccent rounded-full" />
          ) : (
            <span className="w-2 h-6 bg-muted rounded-full" />
          )}
          {editId ? "Edit Product" : "Create Product"}
        </h2>

        {formError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl px-4 py-3">
            {formError}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Basmati Rice"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-medium placeholder-faint focus:outline-none focus:ring-2 focus:ring-blueaccent/20 focus:border-blueaccent transition-all bg-bg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2">
                Unit Value <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.unit}
                onKeyDown={preventNonNumericKeys}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value.replace(/[^0-9.]/g, "") }))}
                placeholder="10"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-medium placeholder-faint focus:outline-none focus:ring-2 focus:ring-blueaccent/20 focus:border-blueaccent transition-all bg-bg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2">
                Unit Type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.unitType}
                  onChange={(e) => setForm((f) => ({ ...f, unitType: e.target.value as UnitType }))}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-blueaccent/20 focus:border-blueaccent transition-all bg-bg appearance-none"
                >
                  {UNIT_TYPES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2">
              Price (INR) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm font-semibold">₹</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.price}
                onKeyDown={preventNonNumericKeys}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/[^0-9.]/g, "") }))}
                placeholder="0"
                className="w-full border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text-primary font-semibold placeholder-faint focus:outline-none focus:ring-2 focus:ring-blueaccent/20 focus:border-blueaccent transition-all bg-bg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2">
              Image Preview
            </label>
            {form.imagePreview ? (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-border group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl(form.imagePreview)}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getImageUrl(null);
                  }}
                />
                <button
                  onClick={() => { setForm((f) => ({ ...f, imageFile: null, imagePreview: null })); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-panel hover:border-blueaccent/40 transition-all group">
                <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <span className="text-xl">🖼️</span>
                </div>
                <span className="text-[10px] text-muted font-semibold uppercase tracking-widest">Click to upload</span>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isMutating}
              className="flex-1 bg-blueaccent hover:bg-blue-dark disabled:bg-panel disabled:text-faint text-white text-sm font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blueaccent/20 flex items-center justify-center gap-2"
            >
              {isMutating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {editId ? "Saving…" : "Creating…"}
                </>
              ) : (
                editId ? "Save Changes" : "Create Product"
              )}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 border border-border text-muted text-sm font-bold py-3.5 rounded-xl hover:bg-panel transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}