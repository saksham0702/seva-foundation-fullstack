"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
  X,
  Loader2,
  Sparkles,
  Search,
  Tag,
  ToggleLeft,
  ToggleRight,
  Lightbulb,
} from "lucide-react";
import {
  getFollowUpConfigs,
  createFollowUpConfig,
  updateFollowUpConfig,
  deleteFollowUpConfig,
  FollowUpConfig,
  FollowUpCategory,
} from "@/app/api/leads";
import { Portal } from "@/components/shared/Portal";

const COLOR_PRESETS = [
  { label: "Emerald Green", value: "#16a34a" },
  { label: "Sky Blue", value: "#0284c7" },
  { label: "Amber Orange", value: "#d97706" },
  { label: "Rose Red", value: "#ef4444" },
  { label: "Royal Purple", value: "#7c3aed" },
  { label: "Slate Gray", value: "#64748b" },
  { label: "Teal", value: "#0d9488" },
];

const QUICK_SUGGESTIONS = [
  {
    name: "Promise to Pay (Weekend)",
    category: "POSITIVE" as FollowUpCategory,
    color: "#16a34a",
    defaultNotes: "Donor requested a reminder over the weekend to complete payment.",
    requiresNextAction: true,
  },
  {
    name: "Tax 80G Receipt Assistance",
    category: "NEUTRAL" as FollowUpCategory,
    color: "#0d9488",
    defaultNotes: "Donor wants PAN / 80G tax exemption details before contributing.",
    requiresNextAction: true,
  },
  {
    name: "Requested WhatsApp Info First",
    category: "CALLBACK" as FollowUpCategory,
    color: "#0284c7",
    defaultNotes: "Shared brochure and donation link on WhatsApp as requested.",
    requiresNextAction: true,
  },
  {
    name: "Family Consultation",
    category: "CALLBACK" as FollowUpCategory,
    color: "#7c3aed",
    defaultNotes: "Donor is discussing with family before deciding on amount.",
    requiresNextAction: true,
  },
  {
    name: "Call Disconnected / Network Error",
    category: "CALLBACK" as FollowUpCategory,
    color: "#d97706",
    defaultNotes: "Call dropped abruptly. Will retry callback.",
    requiresNextAction: true,
  },
  {
    name: "Financial Constraints Currently",
    category: "NEGATIVE" as FollowUpCategory,
    color: "#ef4444",
    defaultNotes: "Unable to contribute at present due to personal reasons.",
    requiresNextAction: false,
  },
];

export default function FollowupConfigsPage() {
  const [configs, setConfigs] = useState<FollowUpConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  // Notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<FollowUpConfig | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<FollowUpCategory>("NEUTRAL");
  const [color, setColor] = useState("#16a34a");
  const [defaultNotes, setDefaultNotes] = useState("");
  const [requiresNextAction, setRequiresNextAction] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFollowUpConfigs();
      setConfigs(data);
    } catch (e: any) {
      console.error(e);
      showNotification(e?.response?.data?.message || "Failed to load configurations", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleOpenCreate = () => {
    setEditingConfig(null);
    setName("");
    setCategory("CALLBACK");
    setColor("#0284c7");
    setDefaultNotes("");
    setRequiresNextAction(true);
    setFormError(null);
    setShowModal(true);
  };

  const handleApplySuggestion = (sug: typeof QUICK_SUGGESTIONS[0]) => {
    setName(sug.name);
    setCategory(sug.category);
    setColor(sug.color);
    setDefaultNotes(sug.defaultNotes);
    setRequiresNextAction(sug.requiresNextAction);
  };

  const handleOpenEdit = (config: FollowUpConfig) => {
    setEditingConfig(config);
    setName(config.name);
    setCategory(config.category);
    setColor(config.color || "#64748b");
    setDefaultNotes(config.defaultNotes || "");
    setRequiresNextAction(config.requiresNextAction);
    setFormError(null);
    setShowModal(true);
  };

  const handleToggleActive = async (config: FollowUpConfig) => {
    try {
      const updated = await updateFollowUpConfig(config._id, {
        isActive: !config.isActive,
      });
      setConfigs((prev) =>
        prev.map((c) => (c._id === config._id ? updated : c))
      );
      showNotification(`"${config.name}" is now ${updated.isActive ? "active" : "inactive"}.`);
    } catch (e: any) {
      showNotification(e?.response?.data?.message || "Failed to update configuration status", "error");
    }
  };

  const handleDelete = async (config: FollowUpConfig) => {
    if (!confirm(`Are you sure you want to delete the disposition "${config.name}"?`)) return;
    try {
      await deleteFollowUpConfig(config._id);
      setConfigs((prev) => prev.filter((c) => c._id !== config._id));
      showNotification(`"${config.name}" removed successfully.`);
    } catch (e: any) {
      showNotification(e?.response?.data?.message || "Failed to delete configuration", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Please enter a disposition name.");
      return;
    }

    setSaving(true);
    try {
      let savedConfig: FollowUpConfig;
      if (editingConfig) {
        savedConfig = await updateFollowUpConfig(editingConfig._id, {
          name: trimmedName,
          category,
          color,
          defaultNotes: defaultNotes.trim(),
          requiresNextAction,
        });
      } else {
        savedConfig = await createFollowUpConfig({
          name: trimmedName,
          category,
          color,
          defaultNotes: defaultNotes.trim(),
          requiresNextAction,
        });
      }

      setConfigs((prev) => {
        const idx = prev.findIndex((c) => c._id === savedConfig._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = savedConfig;
          return next;
        }
        return [...prev, savedConfig];
      });

      showNotification(`"${savedConfig.name}" saved successfully!`);
      setShowModal(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save configuration. Please try again.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const filteredConfigs = useMemo(() => {
    return configs.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.defaultNotes && c.defaultNotes.toLowerCase().includes(search.toLowerCase()));
      const matchCategory =
        selectedCategoryFilter === "ALL" || c.category === selectedCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [configs, search, selectedCategoryFilter]);

  const categoryCounts = useMemo(() => {
    return {
      ALL: configs.length,
      POSITIVE: configs.filter((c) => c.category === "POSITIVE").length,
      CALLBACK: configs.filter((c) => c.category === "CALLBACK").length,
      NEUTRAL: configs.filter((c) => c.category === "NEUTRAL").length,
      NEGATIVE: configs.filter((c) => c.category === "NEGATIVE").length,
    };
  }, [configs]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* ── Toast Notification ──────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20"
              : "bg-rose-600 text-white border-rose-700 shadow-rose-500/20"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400">
              CRM Follow-up Workflows
            </span>
            <span className="text-xs text-muted">
              {configs.length} configured dispositions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-display">
            Follow-up Configurations
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Standardize how your team logs calls with unpaid donors, failed payments, and prospective supporters.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#E8542A] hover:bg-[#c9431d] text-white shadow-md shadow-orange-500/20 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Disposition</span>
        </button>
      </div>

      {/* ── Friendly Explainer Banner ───────────────────────────────── */}
      <div className="bg-panel border border-border rounded-2xl p-4.5 flex items-start gap-3.5 text-xs leading-relaxed text-muted shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-[#E8542A]/10 text-[#E8542A] flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb size={18} />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-text-primary">
            How Follow-up Dispositions Work
          </p>
          <p className="text-[11.5px] text-muted">
            When staff or volunteers contact a donor who left the campaign without paying, they choose a disposition (e.g. &ldquo;Donation Promised&rdquo; or &ldquo;Not Interested&rdquo;). Dispositions with <strong>Requires Next Action</strong> prompt the user to pick a callback date so it automatically appears in the daily calling queue.
          </p>
        </div>
      </div>

      {/* ── Filters & Category Pills ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(
            [
              { key: "ALL", label: "All" },
              { key: "POSITIVE", label: "Positive" },
              { key: "CALLBACK", label: "Callbacks" },
              { key: "NEUTRAL", label: "Assistance" },
              { key: "NEGATIVE", label: "Negative" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategoryFilter(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryFilter === cat.key
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-panel border border-border text-muted hover:text-text-primary"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 rounded-full ${
                  selectedCategoryFilter === cat.key
                    ? "bg-white/20 dark:bg-slate-900/20"
                    : "bg-muted/10 text-muted"
                }`}
              >
                {categoryCounts[cat.key as keyof typeof categoryCounts]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dispositions…"
            className="w-full pl-8 pr-3 py-1.5 bg-panel border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
          />
        </div>
      </div>

      {/* ── Configurations List ─────────────────────────────────────── */}
      <div className="bg-panel border border-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-2">
            <Loader2 className="animate-spin text-[#E8542A]" size={28} />
            <p className="text-xs">Loading follow-up configurations…</p>
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <SlidersHorizontal size={36} className="mx-auto text-muted/60 mb-2" />
            <h3 className="text-sm font-bold text-text-primary">
              No matching dispositions found
            </h3>
            <p className="text-xs text-muted mt-1">
              Click &ldquo;Add Disposition&rdquo; to create a new custom follow-up outcome.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredConfigs.map((config) => {
              const isPositive = config.category === "POSITIVE";
              const isNegative = config.category === "NEGATIVE";
              const isCallback = config.category === "CALLBACK";

              return (
                <div
                  key={config._id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    !config.isActive ? "opacity-60 bg-muted/5" : "hover:bg-panel/60"
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full mt-0.5 shrink-0 shadow-sm ring-2 ring-white dark:ring-slate-900"
                      style={{ backgroundColor: config.color || "#64748b" }}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-text-primary">
                          {config.name}
                        </h4>

                        <span
                          className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                            isPositive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : isNegative
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              : isCallback
                              ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          }`}
                        >
                          {config.category}
                        </span>

                        {config.isSystem && (
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.2 rounded">
                            Standard System
                          </span>
                        )}

                        {!config.isActive && (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded">
                            Disabled
                          </span>
                        )}
                      </div>

                      {config.defaultNotes && (
                        <p className="text-xs text-muted mt-1 leading-relaxed italic">
                          &ldquo;{config.defaultNotes}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-[11px] text-muted">
                        <span>
                          Next Follow-up Scheduling:{" "}
                          <strong className="text-text-primary">
                            {config.requiresNextAction ? "Prompts for Callback Date" : "Optional"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Toggle Active Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(config)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                        config.isActive
                          ? "bg-panel border-border text-muted hover:text-text-primary"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold"
                      }`}
                      title={config.isActive ? "Click to deactivate" : "Click to activate"}
                    >
                      {config.isActive ? (
                        <>
                          <ToggleRight size={16} className="text-emerald-500" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={16} className="text-muted" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(config)}
                      className="p-2 rounded-xl bg-panel border border-border text-muted hover:text-text-primary hover:border-[#E8542A] transition-colors"
                      title="Edit disposition"
                    >
                      <Edit2 size={14} />
                    </button>

                    {/* Delete (only non-system) */}
                    {!config.isSystem && (
                      <button
                        type="button"
                        onClick={() => handleDelete(config)}
                        className="p-2 rounded-xl text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete disposition"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add / Edit Config Modal with Live Preview ───────────────── */}
      {showModal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
              onClick={() => setShowModal(false)}
            />
            <div className="relative w-full max-w-lg bg-background border border-border rounded-2xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    {editingConfig ? "Edit Follow-up Disposition" : "Create New Disposition"}
                  </h3>
                  <p className="text-xs text-muted">
                    Configure disposition outcome for your donor pipeline
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-xl text-muted hover:text-text-primary hover:bg-panel"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Error Alert */}
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Quick Template Suggestions (Shown on Create only) */}
              {!editingConfig && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5 flex items-center gap-1">
                    <Sparkles size={12} className="text-[#E8542A]" />
                    Or click a 1-click suggested outcome:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SUGGESTIONS.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplySuggestion(sug)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-panel border border-border hover:border-[#E8542A] text-text-primary transition-all text-left truncate max-w-[200px]"
                      >
                        + {sug.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Disposition Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="e.g. Donation Promised (Next Week), Call Back Later"
                    required
                    className="w-full px-3.5 py-2.5 bg-panel border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 focus:border-[#E8542A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Outcome Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FollowUpCategory)}
                      className="w-full px-3 py-2 bg-panel border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                    >
                      <option value="POSITIVE">Positive (Promised / Converted)</option>
                      <option value="CALLBACK">Callback (Call Back Later / Ringing)</option>
                      <option value="NEUTRAL">Neutral (General Assistance / 80G)</option>
                      <option value="NEGATIVE">Negative (Not Interested / Declined)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">
                      Badge Color
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {COLOR_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setColor(p.value)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                            color === p.value ? "scale-110 ring-2 ring-offset-2 ring-[#E8542A]" : ""
                          }`}
                          style={{ backgroundColor: p.value }}
                          title={p.label}
                        >
                          {color === p.value && <Check size={12} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Default Prompt / Template Notes (Optional)
                  </label>
                  <textarea
                    value={defaultNotes}
                    onChange={(e) => setDefaultNotes(e.target.value)}
                    placeholder="Helper template inserted automatically when staff logs this outcome..."
                    rows={2}
                    className="w-full p-2.5 bg-panel border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-panel border border-border">
                  <input
                    type="checkbox"
                    id="reqAction"
                    checked={requiresNextAction}
                    onChange={(e) => setRequiresNextAction(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E8542A] focus:ring-[#E8542A]"
                  />
                  <label
                    htmlFor="reqAction"
                    className="text-xs text-text-primary cursor-pointer font-medium leading-tight"
                  >
                    Requires Next Call Scheduling
                    <span className="block text-[11px] text-muted font-normal mt-0.5">
                      Prompts staff to select a callback appointment date when this disposition is picked.
                    </span>
                  </label>
                </div>

                {/* ── Live Preview ────────────────────────────────────── */}
                <div className="p-3 bg-panel/60 border border-border rounded-xl space-y-1">
                  <span className="text-[10.5px] uppercase font-bold text-muted block">
                    Live Preview in Call Drawer
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-bold text-text-primary">
                      {name || "Untitled Disposition"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-panel border border-border text-muted">
                      {category}
                    </span>
                  </div>
                  {defaultNotes && (
                    <p className="text-[11px] text-muted italic">
                      &ldquo;{defaultNotes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-muted hover:bg-panel rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#E8542A] hover:bg-[#c9431d] text-white shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    <span>{editingConfig ? "Save Changes" : "Create Disposition"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
