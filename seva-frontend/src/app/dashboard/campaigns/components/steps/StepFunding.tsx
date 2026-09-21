"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Plus,
  Trash2,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Field, inputCls } from "@/components/dashboard/field/Field";
import { useCampaign } from "../../provider";
import { type Product } from "../../utils";
import { useQuery } from "@tanstack/react-query";
import { getProducts, Product as APIProduct } from "@/app/api/product";
import { uploadCampaignProductImage } from "@/app/api/campaign";
import { getImageUrl } from "@/lib/image";
import { useToast } from "@/lib/toast";
import { extractErrorMessage } from "@/lib/api-error";

export function StepFunding() {
  const { form, set, setStep } = useCampaign();
  const toast = useToast();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const { data: backendProducts = [], isLoading: productsLoading } =
    useQuery<APIProduct[]>({
      queryKey: ["products"],
      queryFn: getProducts,
    });

  const isDateInvalid =
    form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate);

  const durationDays =
    form.startDate && form.endDate && !isDateInvalid
      ? Math.max(
          0,
          Math.round(
            (new Date(form.endDate).getTime() -
              new Date(form.startDate).getTime()) /
              86400000,
          ),
        )
      : null;

  const totalProductPrice = form.products.reduce(
    (acc, p) => acc + (Number(p.totalPrice) || 0),
    0,
  );

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
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  function addProduct() {
    set("products", [
      ...form.products,
      { product: "", requiredUnit: "", totalPrice: "", image: "" },
    ]);
  }

  function removeProduct(i: number) {
    set(
      "products",
      form.products.filter((_, idx) => idx !== i),
    );
  }

  function updateProduct(i: number, key: keyof Product, value: string) {
    const updated = form.products.map((p, idx) =>
      idx === i ? { ...p, [key]: value } : p,
    );
    set("products", updated);
  }

  const handleProductSelect = (index: number, value: string) => {
    const found = backendProducts.find((pr) => pr.name === value || pr._id === value);
    const updated = form.products.map((item, idx) => {
      if (idx !== index) return item;
      if (found) {
        return {
          ...item,
          product: found.name,
          requiredUnit: item.requiredUnit || (found.unit && found.unitType ? `${found.unit} ${found.unitType}` : ""),
          totalPrice: item.totalPrice || (found.price ? String(found.price) : ""),
          image: item.image || found.image || "",
        };
      }
      return { ...item, product: value };
    });
    set("products", updated);
  };

  const handleUploadProductImage = async (index: number, file: File) => {
    try {
      setUploadingIndex(index);
      const url = await uploadCampaignProductImage(file);
      updateProduct(index, "image", url);
      toast.success("Product image uploaded successfully!");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to upload product image"));
    } finally {
      setUploadingIndex(null);
    }
  };

  const canProceed =
    Number(form.goal) > 0 &&
    Boolean(form.startDate) &&
    Boolean(form.endDate) &&
    !isDateInvalid;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-text-primary mb-8">Funding & Products</h2>

      {/* Goal */}
      <Field label="Fundraising Goal (INR)" required hint="Only numbers allowed">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-semibold text-sm">
            ₹
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.goal}
            onKeyDown={preventNonNumericKeys}
            onChange={(e) => set("goal", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="100000"
            className={inputCls + " pl-8 font-semibold"}
          />
        </div>
        {form.goal && Number(form.goal) > 0 ? (
          <p className="text-[11px] text-emerald-accent font-semibold mt-1.5">
            Target: ₹{Number(form.goal).toLocaleString("en-IN")}
          </p>
        ) : form.goal ? (
          <p className="text-[11px] text-red-500 font-semibold mt-1.5">
            Please enter a valid amount greater than 0
          </p>
        ) : null}
      </Field>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start Date" required>
          <input
            type="date"
            value={form.startDate ? form.startDate.split("T")[0] : ""}
            onChange={(e) => set("startDate", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="End Date" required>
          <input
            type="date"
            min={form.startDate ? form.startDate.split("T")[0] : undefined}
            value={form.endDate ? form.endDate.split("T")[0] : ""}
            onChange={(e) => set("endDate", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      {isDateInvalid && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-xs font-semibold text-red-500">
          <Info size={13} /> End Date must be after or on Start Date
        </div>
      )}

      {durationDays !== null && !isDateInvalid && (
        <div className="flex items-center gap-2 bg-blueaccent/10 border border-blueaccent/30 rounded-lg px-4 py-2.5 text-xs font-semibold text-blueaccent">
          <Info size={13} /> Campaign Duration: {durationDays} day{durationDays === 1 ? "" : "s"}
        </div>
      )}

      {/* Min Donation */}
      <Field label="Minimum Donation (INR)" hint="Custom amount or select preset (optional)">
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-semibold text-sm">₹</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.minDonation}
              onKeyDown={preventNonNumericKeys}
              onChange={(e) => set("minDonation", e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 100"
              className={inputCls + " pl-8 font-semibold"}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {["100", "500", "1000", "5000"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => set("minDonation", v)}
                className={`text-xs font-bold py-2.5 rounded-xl border transition-all ${
                  form.minDonation === v
                    ? "bg-blueaccent text-white border-blueaccent shadow-lg shadow-blueaccent/20"
                    : "border-border text-muted hover:border-blueaccent/60 hover:text-text-primary bg-panel"
                }`}
              >
                ₹{v}
              </button>
            ))}
          </div>
        </div>
      </Field>

      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">
            Products (Optional)
          </label>
          <button
            type="button"
            onClick={addProduct}
            className="flex items-center gap-1 text-[11px] font-semibold text-blueaccent hover:text-blue-dark"
          >
            <Plus size={12} /> Add Product
          </button>
        </div>

        {form.products.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg px-4 py-5 text-center text-xs text-muted">
            No products added yet. Click &quot;Add Product&quot; to link items
            to this campaign (optional).
          </div>
        ) : (
          <div className="space-y-3">
            {form.products.map((p, i) => (
              <div
                key={i}
                className="p-3 bg-panel/40 border border-border rounded-xl space-y-2.5 transition-colors hover:border-border/80"
              >
                <div className="grid grid-cols-1 sm:grid-cols-[auto_1.2fr_1fr_1fr_auto] gap-2.5 items-center">
                  {/* Product Image Thumbnail / Upload Button */}
                  <div className="relative group shrink-0 self-center">
                    {uploadingIndex === i ? (
                      <div className="w-12 h-12 rounded-lg border border-border bg-panel flex items-center justify-center text-blueaccent">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                    ) : p.image ? (
                      <div className="relative w-12 h-12 rounded-lg border border-border overflow-hidden bg-white group/img shadow-sm">
                        <img
                          src={getImageUrl(p.image)}
                          alt={p.product || "Product"}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => updateProduct(i, "image", "")}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label
                        className="w-12 h-12 rounded-lg border-2 border-dashed border-border hover:border-blueaccent text-muted hover:text-blueaccent flex flex-col items-center justify-center cursor-pointer transition-colors bg-panel hover:bg-blueaccent/5 shadow-sm"
                        title="Upload Product Image"
                      >
                        <Upload size={14} />
                        <span className="text-[8px] font-semibold mt-0.5 uppercase tracking-wider">Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadProductImage(i, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Product Select / Name */}
                  <div className="relative">
                    <select
                      value={p.product}
                      onChange={(e) => handleProductSelect(i, e.target.value)}
                      className={inputCls + " appearance-none text-xs"}
                      disabled={productsLoading}
                    >
                      <option value="">
                        {productsLoading ? "Loading…" : "Select or Type Product"}
                      </option>
                      {backendProducts.map((pr) => (
                        <option key={pr._id} value={pr.name}>
                          {pr.name} ({pr.unit} {pr.unitType})
                        </option>
                      ))}
                      {p.product && !backendProducts.some((pr) => pr.name === p.product || pr._id === p.product) && (
                        <option value={p.product}>{p.product}</option>
                      )}
                    </select>
                    {productsLoading && (
                      <Loader2
                        size={12}
                        className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    )}
                  </div>

                  {/* Unit */}
                  <input
                    type="text"
                    value={p.requiredUnit}
                    onChange={(e) =>
                      updateProduct(i, "requiredUnit", e.target.value)
                    }
                    placeholder="Unit (e.g. Kits, 10)"
                    className={inputCls + " text-xs"}
                  />

                  {/* Total Price */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs font-semibold">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={p.totalPrice}
                      onChange={(e) =>
                        updateProduct(i, "totalPrice", e.target.value.replace(/[^0-9.]/g, ""))
                      }
                      placeholder="Total Price"
                      className={inputCls + " pl-7 text-xs"}
                    />
                  </div>

                  {/* Remove Row Button */}
                  <button
                    type="button"
                    onClick={() => removeProduct(i)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all self-center"
                    title="Remove product"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Sub-bar for image change if image is present */}
                {p.image && (
                  <div className="flex items-center gap-2 pl-14 text-[11px] text-muted pt-0.5">
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      ✓ Image attached
                    </span>
                    <span className="text-muted">•</span>
                    <label className="text-blueaccent hover:underline cursor-pointer font-medium">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadProductImage(i, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}

            {/* Totals row */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div>
                <label className="text-[11px] text-muted font-semibold uppercase tracking-wider">
                  Total Product Price
                </label>
                <p className="text-sm font-bold text-text-primary mt-1">
                  ₹{totalProductPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <Field label="Payment Gateway Charges (%)">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.gatewayCharges}
                  onKeyDown={preventNonNumericKeys}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    const clamped = raw ? String(Math.min(100, Math.max(0, Number(raw)))) : "";
                    set("gatewayCharges", clamped);
                  }}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* YouTube */}
      <Field label="YouTube Video URL">
        <input
          type="url"
          value={form.youtubeUrl}
          onChange={(e) => set("youtubeUrl", e.target.value)}
          placeholder="https://youtu.be/abc123 or https://www.youtube.com/watch?v=..."
          className={inputCls}
        />
        {form.youtubeUrl &&
          (() => {
            const id = form.youtubeUrl.match(
              /(?:youtu\.be\/|v=)([^&?/]+)/,
            )?.[1];
            return id ? (
              <div className="mt-3 aspect-video rounded-lg overflow-hidden border border-border">
                <iframe
                  src={`https://www.youtube.com/embed/${id}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : null;
          })()}
      </Field>

      {/* Validation requirement guide */}
      {!canProceed && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-xs font-semibold text-amber-500">
          <Info size={15} className="shrink-0" />
          <span>
            Please complete required fields to proceed:{" "}
            {[
              !(Number(form.goal) > 0) && "Fundraising Goal (> 0)",
              !form.startDate && "Start Date",
              !form.endDate && "End Date",
              isDateInvalid && "End Date must be after Start Date",
            ]
              .filter(Boolean)
              .join(" • ")}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-border mt-10">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-2 border border-border text-muted text-sm font-bold px-6 py-3 rounded-xl hover:bg-panel transition-all"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          disabled={!canProceed}
          className="flex items-center gap-2 bg-blueaccent hover:bg-blue-dark disabled:bg-panel disabled:text-faint text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blueaccent/20 ml-auto"
        >
          Next Step <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
