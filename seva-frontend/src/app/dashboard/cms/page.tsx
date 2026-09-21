"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  Globe,
  Layout,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  HelpCircle,
  Share2,
  HeartHandshake,
  Plus,
  Trash2,
  Upload,
  Tag,
  Layers,
  Check,
} from "lucide-react";
import { getCmsPages, getCmsPageBySlug, saveCmsPage, deleteCmsSection, uploadCmsImageFile, CmsPage, CmsSection } from "@/app/api/cms";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";

const CMS_PAGES_META = [
  {
    slug: "header-footer",
    name: "Header & Footer Global",
    path: "/",
    description: "Contact phone, email, address, social media links, Darpan ID, and registration notice",
    icon: Sparkles,
  },
  {
    slug: "about",
    name: "About Us Page",
    path: "/about",
    description: "Manage legacy hero, Sacred Promise story, Vision & Mission, and Governance cards",
    icon: Globe,
  },
  {
    slug: "our-work",
    name: "Our Work & Impact",
    path: "/our-work",
    description: "Manage focus areas, impact pillars, and community transformation initiatives",
    icon: Layout,
  },
  {
    slug: "get-involved",
    name: "Get Involved / Volunteers",
    path: "/get-involved",
    description: "Volunteer recruitment hero banner, call-to-action text, and program perks",
    icon: HeartHandshake,
  },
  {
    slug: "privacy",
    name: "Privacy Policy",
    path: "/privacy",
    description: "Data protection guidelines, donor privacy, and confidentiality disclosures",
    icon: FileText,
  },
  {
    slug: "terms",
    name: "Terms & Conditions",
    path: "/terms",
    description: "Website usage terms, donation compliance, and legal terms of service",
    icon: FileText,
  },
];

export default function CmsDashboardPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const [activeSlug, setActiveSlug] = useState<string>(pageParam || "header-footer");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (pageParam && CMS_PAGES_META.some((p) => p.slug === pageParam)) {
      setActiveSlug(pageParam);
    }
  }, [pageParam]);

  // Fetch page data for active slug
  const {
    data: pageData,
    isLoading,
    isError,
  } = useQuery<CmsPage>({
    queryKey: ["cms-page", activeSlug],
    queryFn: () => getCmsPageBySlug(activeSlug),
  });

  // Local form state
  const [formData, setFormData] = useState<Partial<CmsPage>>({});
  const [activeInitiativeIndex, setActiveInitiativeIndex] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Sync loaded pageData into formData
  React.useEffect(() => {
    if (pageData) {
      setFormData(pageData);
    }
  }, [pageData]);

  const handleInitiativeImageUpload = async (file: File, secIndex: number) => {
    try {
      setIsUploadingImage(true);
      const url = await uploadCmsImageFile(file);
      if (url) {
        const updatedSections = [...(formData.sections || [])];
        if (updatedSections[secIndex]) {
          updatedSections[secIndex] = {
            ...updatedSections[secIndex],
            image: url,
          };
          setFormData({ ...formData, sections: updatedSections });
          setSuccessMessage("Image uploaded successfully!");
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Failed to upload image");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Deleting initiative state
  const [isDeletingInitiative, setIsDeletingInitiative] = useState(false);
  const [deletingInitiativeKey, setDeletingInitiativeKey] = useState<string | null>(null);

  // Proper CRUD Delete Initiative
  const handleDeleteInitiative = async (sec: CmsSection, index: number) => {
    const displayName = sec.title || sec.name || sec.key || `Initiative ${index + 1}`;
    if (!confirm(`Are you sure you want to permanently delete "${displayName}" from the website and database?`)) {
      return;
    }

    setIsDeletingInitiative(true);
    setDeletingInitiativeKey(sec.key || String(index));
    try {
      const remainingSections = (formData.sections || []).filter((_, i) => i !== index);

      let updatedPage: CmsPage | null = null;
      if (sec.key) {
        try {
          updatedPage = await deleteCmsSection(activeSlug, sec.key);
        } catch (subErr) {
          console.warn("deleteCmsSection fallback to saveCmsPage", subErr);
        }
      }

      // If backend didn't return updated document, save the filtered sections array directly
      if (!updatedPage || !updatedPage.sections) {
        updatedPage = await saveCmsPage(activeSlug, {
          ...formData,
          sections: remainingSections,
        });
      }

      // Sync state and react-query caches
      setFormData(updatedPage || { ...formData, sections: remainingSections });
      setActiveInitiativeIndex(Math.max(0, index - 1));
      queryClient.invalidateQueries({ queryKey: ["cms-page", activeSlug] });
      queryClient.invalidateQueries({ queryKey: ["cms-pages"] });

      setSuccessMessage(`Initiative "${displayName}" successfully deleted from database!`);
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Failed to delete initiative from server");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsDeletingInitiative(false);
      setDeletingInitiativeKey(null);
    }
  };

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<CmsPage>) => saveCmsPage(activeSlug, payload),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["cms-page", activeSlug] });
      queryClient.invalidateQueries({ queryKey: ["cms-pages"] });
      setFormData(saved);
      setSuccessMessage("Page content saved successfully!");
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3500);
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || "Failed to save CMS page");
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const activeMeta = CMS_PAGES_META.find((p) => p.slug === activeSlug) || CMS_PAGES_META[0];

  return (
    <PermissionGuard module="cms">
      <div className="min-h-screen bg-[#f8fafc] dark:bg-bg p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0f2347] dark:text-text-primary tracking-tight">
              Website CMS Manager
            </h1>
            <p className="text-xs text-gray-500 dark:text-muted mt-1">
              Customize text, banner images, contact details, and static page sections
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={activeMeta.path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-panel border border-gray-200 dark:border-border rounded-xl text-xs font-semibold text-[#0f2347] dark:text-text-primary hover:border-[#1a3a6b] transition-colors"
            >
              <ExternalLink size={14} />
              Preview Live Page
            </a>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8542A] hover:bg-[#c9431d] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20"
            >
              {saveMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMessage}
          </div>
        )}

        {/* Main Grid: Left Tabs, Right Form */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* LEFT: Page Selectors */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-muted px-2 mb-2">
              Static Pages & Layout
            </p>
            {CMS_PAGES_META.map((p) => {
              const Icon = p.icon;
              const isActive = activeSlug === p.slug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => {
                    setActiveSlug(p.slug);
                    setSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${isActive
                      ? "bg-[#0f2347] text-white border-[#0f2347] shadow-md shadow-[#0f2347]/10"
                      : "bg-white dark:bg-panel border-gray-100 dark:border-border text-gray-700 dark:text-text-primary hover:border-gray-200 hover:bg-gray-50/50"
                    }`}
                >
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${isActive
                        ? "bg-white/10 text-white"
                        : "bg-gray-100 dark:bg-bg text-gray-600 dark:text-muted"
                      }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-snug">{p.name}</h4>
                    <p
                      className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isActive ? "text-gray-300" : "text-gray-400 dark:text-muted"
                        }`}
                    >
                      {p.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Editor Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-12 text-center text-gray-400">
                <Loader2 size={32} className="animate-spin mx-auto mb-3 text-[#E8542A]" />
                <p className="text-xs font-medium">Loading page settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                {/* 1. Header & Banner Card */}
                {activeSlug !== "header-footer" && (
                  <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary mb-4 pb-3 border-b border-gray-100 dark:border-border flex items-center gap-2">
                      <ImageIcon size={16} className="text-[#E8542A]" />
                      Hero Banner & Header
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                            Page Main Title
                          </label>
                          <input
                            type="text"
                            value={formData.title || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="e.g. OUR LEGACY"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                            Banner Image URL
                          </label>
                          <input
                            type="text"
                            value={formData.bannerImage || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, bannerImage: e.target.value })
                            }
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                          Subtitle / Tagline
                        </label>
                        <textarea
                          rows={2}
                          value={formData.subtitle || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, subtitle: e.target.value })
                          }
                          placeholder="A promise made in the streets of Dehradun..."
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Page Specific Sections */}
                {activeSlug === "about" && (
                  <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-6 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary pb-3 border-b border-gray-100 dark:border-border flex items-center gap-2">
                      <FileText size={16} className="text-[#E8542A]" />
                      About Page Content Sections
                    </h3>

                    {/* Sacred Promise Story */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-bg border border-gray-100 dark:border-border space-y-3">
                      <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                        Section: The Sacred Promise Story
                      </h4>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Story Narrative Paragraphs
                        </label>
                        <textarea
                          rows={4}
                          value={
                            formData.sections?.find((s) => s.key === "sacred_promise")
                              ?.description || ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const updatedSections = [...(formData.sections || [])];
                            const idx = updatedSections.findIndex(
                              (s) => s.key === "sacred_promise"
                            );
                            if (idx >= 0) {
                              updatedSections[idx] = {
                                ...updatedSections[idx],
                                description: val,
                              };
                            } else {
                              updatedSections.push({
                                key: "sacred_promise",
                                name: "The Sacred Promise",
                                description: val,
                              });
                            }
                            setFormData({ ...formData, sections: updatedSections });
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-sm text-[#0f2347] dark:text-text-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Vision & Mission */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-bg border border-gray-100 dark:border-border space-y-2">
                        <label className="block text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase">
                          Our Vision
                        </label>
                        <textarea
                          rows={4}
                          value={
                            formData.sections?.find((s) => s.key === "vision_mission")
                              ?.extra?.vision || ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const updatedSections = [...(formData.sections || [])];
                            const idx = updatedSections.findIndex(
                              (s) => s.key === "vision_mission"
                            );
                            if (idx >= 0) {
                              updatedSections[idx] = {
                                ...updatedSections[idx],
                                extra: {
                                  ...updatedSections[idx].extra,
                                  vision: val,
                                },
                              };
                            } else {
                              updatedSections.push({
                                key: "vision_mission",
                                name: "Vision & Mission",
                                extra: { vision: val },
                              });
                            }
                            setFormData({ ...formData, sections: updatedSections });
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-bg border border-gray-100 dark:border-border space-y-2">
                        <label className="block text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase">
                          Our Mission
                        </label>
                        <textarea
                          rows={4}
                          value={
                            formData.sections?.find((s) => s.key === "vision_mission")
                              ?.extra?.mission || ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const updatedSections = [...(formData.sections || [])];
                            const idx = updatedSections.findIndex(
                              (s) => s.key === "vision_mission"
                            );
                            if (idx >= 0) {
                              updatedSections[idx] = {
                                ...updatedSections[idx],
                                extra: {
                                  ...updatedSections[idx].extra,
                                  mission: val,
                                },
                              };
                            } else {
                              updatedSections.push({
                                key: "vision_mission",
                                name: "Vision & Mission",
                                extra: { mission: val },
                              });
                            }
                            setFormData({ ...formData, sections: updatedSections });
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2.5 Our Work Initiatives CMS */}
                {activeSlug === "our-work" && (
                  <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-6 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-border">
                      <div>
                        <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary flex items-center gap-2">
                          <Layout size={16} className="text-[#E8542A]" />
                          Our Work & Initiatives Management
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Configure all 7 core pillars, lead paragraphs, imagery, alt tags, FAQs, and impact metrics.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentSections = formData.sections || [];
                          const newKey = `initiative-${Date.now()}`;
                          const newSec: CmsSection = {
                            key: newKey,
                            name: "NEW INITIATIVE",
                            title: "NEW INITIATIVE",
                            subtitle: "Brief lead summary highlighting the mission.",
                            description: "Detailed description of the program and its impact.",
                            image: "",
                            extra: {
                              eyebrow: "OUR INITIATIVES",
                              alt: "Image describing this initiative",
                              features: ["KEY FEATURE 1", "KEY FEATURE 2"],
                              faqs: [{ question: "Common question?", answer: "Helpful explanatory answer." }],
                              impactMetrics: [
                                { value: "1,000+", label: "PEOPLE SUPPORTED" },
                                { value: "50+", label: "COMMUNITIES REACHED" },
                              ],
                            },
                          };
                          const nextSections = [...currentSections, newSec];
                          setFormData({ ...formData, sections: nextSections });
                          setActiveInitiativeIndex(nextSections.length - 1);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        <Plus size={14} />
                        Add Initiative
                      </button>
                    </div>

                    {/* Initiative Tabs with Quick Delete Icons */}
                    <div className="flex flex-wrap gap-2 pb-2">
                      {(formData.sections || []).map((sec, idx) => {
                        const isSelected = activeInitiativeIndex === idx;
                        const isThisDeleting =
                          isDeletingInitiative &&
                          deletingInitiativeKey === (sec.key || String(idx));

                        return (
                          <div
                            key={sec.key || idx}
                            className={`group/tab relative inline-flex items-center rounded-lg transition-all border ${isSelected
                                ? "bg-[#E8542A] border-[#E8542A] text-white shadow-sm"
                                : "bg-white dark:bg-bg border-slate-200 dark:border-border text-slate-700 dark:text-gray-300 hover:bg-slate-50"
                              }`}
                          >
                            <button
                              type="button"
                              onClick={() => setActiveInitiativeIndex(idx)}
                              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider pr-7"
                            >
                              {sec.name || sec.title || `Initiative ${idx + 1}`}
                            </button>
                            <button
                              type="button"
                              title={`Delete ${sec.name || sec.title || sec.key}`}
                              disabled={isDeletingInitiative}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteInitiative(sec, idx);
                              }}
                              className={`absolute right-1 p-1 rounded transition-opacity ${isSelected
                                  ? "text-white/80 hover:text-white hover:bg-black/20 opacity-90"
                                  : "text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/tab:opacity-100"
                                }`}
                            >
                              {isThisDeleting ? (
                                <Loader2 size={11} className="animate-spin text-white" />
                              ) : (
                                <Trash2 size={11} />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Initiative Form */}
                    {formData.sections && formData.sections[activeInitiativeIndex] && (() => {
                      const sec = formData.sections[activeInitiativeIndex];
                      const updateCurrentSec = (partial: Partial<CmsSection>) => {
                        const updated = [...formData.sections!];
                        updated[activeInitiativeIndex] = {
                          ...updated[activeInitiativeIndex],
                          ...partial,
                        };
                        setFormData({ ...formData, sections: updated });
                      };
                      const updateExtra = (partialExtra: Record<string, any>) => {
                        const updated = [...formData.sections!];
                        updated[activeInitiativeIndex] = {
                          ...updated[activeInitiativeIndex],
                          extra: {
                            ...(updated[activeInitiativeIndex].extra || {}),
                            ...partialExtra,
                          },
                        };
                        setFormData({ ...formData, sections: updated });
                      };

                      return (
                        <div className="space-y-5 pt-2">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-border">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Editing: {sec.name || sec.title || sec.key}
                            </span>
                            <button
                              type="button"
                              disabled={isDeletingInitiative}
                              onClick={() => handleDeleteInitiative(sec, activeInitiativeIndex)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              {isDeletingInitiative &&
                              deletingInitiativeKey === (sec.key || String(activeInitiativeIndex)) ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Deleting from server...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 size={13} />
                                  <span>Delete This Initiative</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-900 dark:text-text-primary uppercase mb-1">
                                Initiative Name / Title
                              </label>
                              <input
                                type="text"
                                value={sec.title || sec.name || ""}
                                onChange={(e) => updateCurrentSec({ title: e.target.value, name: e.target.value })}
                                placeholder="e.g. VIDHYA (EDUCATION)"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-bg text-xs font-bold text-slate-900 dark:text-text-primary placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-900 dark:text-text-primary uppercase mb-1">
                                Slug / Key (URL Identifier)
                              </label>
                              <input
                                type="text"
                                value={sec.key || ""}
                                onChange={(e) => updateCurrentSec({ key: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                                placeholder="e.g. vidhya"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-bg text-xs font-mono text-slate-900 dark:text-text-primary placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-900 dark:text-text-primary uppercase mb-1">
                                Eyebrow Tag
                              </label>
                              <input
                                type="text"
                                value={sec.extra?.eyebrow || "OUR INITIATIVES"}
                                onChange={(e) => updateExtra({ eyebrow: e.target.value })}
                                placeholder="e.g. OUR INITIATIVES"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-bg text-xs font-semibold text-slate-900 dark:text-text-primary placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                              />
                            </div>
                          </div>

                          {/* Subtitle / Lead Quote */}
                          <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-text-primary uppercase mb-1">
                              Lead Summary / Quote (Paragraph 1)
                            </label>
                            <textarea
                              rows={2}
                              value={sec.subtitle || ""}
                              onChange={(e) => updateCurrentSec({ subtitle: e.target.value })}
                              placeholder="Rural children often leave school to support their families..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-bg text-xs text-slate-900 dark:text-text-primary placeholder:text-slate-400 focus:outline-none focus:border-slate-800 leading-relaxed font-medium"
                            />
                          </div>

                          {/* Full Story / Description */}
                          <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-text-primary uppercase mb-1">
                              Detailed Description Narrative (Paragraph 2)
                            </label>
                            <textarea
                              rows={4}
                              value={sec.description || ""}
                              onChange={(e) => updateCurrentSec({ description: e.target.value })}
                              placeholder="The 'Vidhya (Education)' Program is a robust, nationwide initiative..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-bg text-xs text-slate-900 dark:text-text-primary placeholder:text-slate-400 focus:outline-none focus:border-slate-800 leading-relaxed font-medium"
                            />
                          </div>

                          {/* Image & Alt Tag */}
                          <div className="p-4 rounded-xl bg-orange-50/40 dark:bg-bg border border-orange-100 dark:border-border space-y-4">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-text-primary uppercase flex items-center gap-1.5">
                              <ImageIcon size={14} className="text-[#E8542A]" />
                              Initiative Photo & SEO Alt Tag
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-muted mb-1">
                                  Image URL
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={sec.image || ""}
                                    onChange={(e) => updateCurrentSec({ image: e.target.value })}
                                    placeholder="https://images.unsplash.com/... or /uploads/cms/..."
                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-panel text-xs text-slate-900 dark:text-text-primary placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                                  />
                                  <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 bg-white dark:bg-panel border border-slate-300 dark:border-border hover:bg-slate-50 text-xs font-semibold rounded-xl text-slate-900 dark:text-text-primary">
                                    <Upload size={13} />
                                    <span>Upload</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          await handleInitiativeImageUpload(file, activeInitiativeIndex);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                                {isUploadingImage && (
                                  <p className="text-[11px] text-[#E8542A] mt-1 flex items-center gap-1">
                                    <Loader2 size={12} className="animate-spin" /> Uploading image to server...
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-muted mb-1">
                                  Image Alt Tag (SEO & Missing Image Fallback)
                                </label>
                                <input
                                  type="text"
                                  value={sec.extra?.alt || ""}
                                  onChange={(e) => updateExtra({ alt: e.target.value })}
                                  placeholder="e.g. Children smiling in rural bridge school"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-panel text-xs text-slate-900 dark:text-text-primary placeholder:text-slate-400 focus:outline-none focus:border-slate-800 font-medium"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                  Displayed to search engines and shown as text fallback if the image is missing.
                                </p>
                              </div>
                            </div>
                            {sec.image && (
                              <div className="flex items-center gap-3 pt-2">
                                <img
                                  src={sec.image}
                                  alt={sec.extra?.alt || sec.title}
                                  className="w-16 h-16 rounded-xl object-cover border border-slate-300"
                                />
                                <span className="text-xs text-slate-700 font-medium">Preview: {sec.extra?.alt || "No alt provided"}</span>
                              </div>
                            )}
                          </div>

                          {/* Key Feature Pills */}
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-bg border border-slate-200 dark:border-border space-y-2">
                            <label className="block text-xs font-bold text-slate-900 dark:text-text-primary uppercase">
                              Key Feature Pills (comma-separated tags with checkmarks)
                            </label>
                            <input
                              type="text"
                              value={(sec.extra?.features || []).join(", ")}
                              onChange={(e) => {
                                const feats = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                updateExtra({ features: feats });
                              }}
                              placeholder="RURAL BRIDGE SCHOOLS, TEACHER TRAINING, SCHOLARSHIPS, RESOURCE SUPPORT"
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-panel text-xs text-slate-900 dark:text-text-primary placeholder:text-slate-400 focus:outline-none focus:border-slate-800 font-medium"
                            />
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(sec.extra?.features || []).map((f: string, i: number) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-100 text-slate-900 text-[11px] font-bold">
                                  <Check size={11} className="text-[#E8542A]" />
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Common Questions (FAQs) */}
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-bg border border-slate-200 dark:border-border space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-slate-900 dark:text-text-primary uppercase flex items-center gap-1.5">
                                <HelpCircle size={14} className="text-[#E8542A]" />
                                Common Questions (FAQs Accordion)
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentFaqs = sec.extra?.faqs || [];
                                  updateExtra({
                                    faqs: [...currentFaqs, { question: "NEW QUESTION?", answer: "Answer details..." }],
                                  });
                                }}
                                className="text-[11px] text-[#E8542A] hover:underline font-bold flex items-center gap-1"
                              >
                                <Plus size={12} /> Add FAQ
                              </button>
                            </div>
                            {(sec.extra?.faqs || []).map((faq: any, fIndex: number) => (
                              <div key={fIndex} className="p-3 bg-white dark:bg-panel rounded-xl border border-slate-200 dark:border-border space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={faq.question || ""}
                                    onChange={(e) => {
                                      const updatedFaqs = [...(sec.extra?.faqs || [])];
                                      updatedFaqs[fIndex] = { ...updatedFaqs[fIndex], question: e.target.value };
                                      updateExtra({ faqs: updatedFaqs });
                                    }}
                                    placeholder="WHAT IS A BRIDGE SCHOOL?"
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-border text-xs font-bold uppercase text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedFaqs = (sec.extra?.faqs || []).filter((_: any, i: number) => i !== fIndex);
                                      updateExtra({ faqs: updatedFaqs });
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                                <textarea
                                  rows={2}
                                  value={faq.answer || ""}
                                  onChange={(e) => {
                                    const updatedFaqs = [...(sec.extra?.faqs || [])];
                                    updatedFaqs[fIndex] = { ...updatedFaqs[fIndex], answer: e.target.value };
                                    updateExtra({ faqs: updatedFaqs });
                                  }}
                                  placeholder="Bridge schools are transitional educational centres..."
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-border text-xs text-slate-800 dark:text-text-primary bg-white placeholder:text-slate-400 focus:outline-none focus:border-slate-800 leading-relaxed font-medium"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Impact Metrics */}
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-bg border border-slate-200 dark:border-border space-y-3">
                            <label className="block text-xs font-bold text-slate-900 dark:text-text-primary uppercase flex items-center gap-1.5">
                              <Layers size={14} className="text-[#E8542A]" />
                              Impact Metrics (Shown in Dark Navy Card)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[0, 1, 2, 3].map((mIndex) => {
                                const metric = (sec.extra?.impactMetrics || [])[mIndex] || { value: "", label: "" };
                                return (
                                  <div key={mIndex} className="p-3 bg-white dark:bg-panel rounded-xl border border-slate-200 dark:border-border flex gap-2 items-center">
                                    <div className="w-1/2">
                                      <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Value (e.g. 100,000+)</label>
                                      <input
                                        type="text"
                                        value={metric.value || ""}
                                        onChange={(e) => {
                                          const metrics = [...(sec.extra?.impactMetrics || [])];
                                          while (metrics.length <= mIndex) metrics.push({ value: "", label: "" });
                                          metrics[mIndex] = { ...metrics[mIndex], value: e.target.value };
                                          updateExtra({ impactMetrics: metrics });
                                        }}
                                        placeholder="100,000+"
                                        className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-border text-xs font-bold text-[#E8542A] bg-white placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                                      />
                                    </div>
                                    <div className="w-1/2">
                                      <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Label (e.g. STUDENTS ENROLLED)</label>
                                      <input
                                        type="text"
                                        value={metric.label || ""}
                                        onChange={(e) => {
                                          const metrics = [...(sec.extra?.impactMetrics || [])];
                                          while (metrics.length <= mIndex) metrics.push({ value: "", label: "" });
                                          metrics[mIndex] = { ...metrics[mIndex], label: e.target.value };
                                          updateExtra({ impactMetrics: metrics });
                                        }}
                                        placeholder="STUDENTS ENROLLED"
                                        className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-border text-xs uppercase font-bold text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 3. Header & Footer Global Settings */}
                {activeSlug === "header-footer" && (
                  <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-6 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary pb-3 border-b border-gray-100 dark:border-border flex items-center gap-2">
                      <Sparkles size={16} className="text-[#E8542A]" />
                      Global Contact & Legal Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                          Helpline Phone Number
                        </label>
                        <input
                          type="text"
                          value={formData.settings?.phone || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                phone: e.target.value,
                              },
                            })
                          }
                          placeholder="+91 94565 17577"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                          Official Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.settings?.email || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                email: e.target.value,
                              },
                            })
                          }
                          placeholder="info@sevaindiafoundation.org"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                        Registered Office Address
                      </label>
                      <input
                        type="text"
                        value={formData.settings?.address || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              address: e.target.value,
                            },
                          })
                        }
                        placeholder="20, Sahastradhara Road, Upper Adhoiwala, Dehradun, UK – 248001"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                          NGO Darpan ID
                        </label>
                        <input
                          type="text"
                          value={formData.settings?.darpanId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                darpanId: e.target.value,
                              },
                            })
                          }
                          placeholder="UK/2026/0993905"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                          CIN Number
                        </label>
                        <input
                          type="text"
                          value={formData.settings?.cin || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                cin: e.target.value,
                              },
                            })
                          }
                          placeholder="U88900UT2026NPL020825"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                          Tax Exemption Status
                        </label>
                        <input
                          type="text"
                          value={formData.settings?.taxExemption || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                taxExemption: e.target.value,
                              },
                            })
                          }
                          placeholder="80G & 12A REGISTERED"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="pt-4 border-t border-gray-100 dark:border-border space-y-3">
                      <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Share2 size={14} className="text-[#E8542A]" />
                        Official Social Media URLs
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Facebook Page URL
                          </label>
                          <input
                            type="text"
                            value={formData.settings?.socialLinks?.facebook || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  socialLinks: {
                                    ...formData.settings?.socialLinks,
                                    facebook: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="https://facebook.com/..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Twitter / X Profile URL
                          </label>
                          <input
                            type="text"
                            value={formData.settings?.socialLinks?.twitter || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  socialLinks: {
                                    ...formData.settings?.socialLinks,
                                    twitter: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="https://twitter.com/..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Instagram Profile URL
                          </label>
                          <input
                            type="text"
                            value={formData.settings?.socialLinks?.instagram || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  socialLinks: {
                                    ...formData.settings?.socialLinks,
                                    instagram: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="https://instagram.com/..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            YouTube Channel URL
                          </label>
                          <input
                            type="text"
                            value={formData.settings?.socialLinks?.youtube || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  socialLinks: {
                                    ...formData.settings?.socialLinks,
                                    youtube: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="https://youtube.com/..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Privacy & Terms Rich Content */}
                {(activeSlug === "privacy" || activeSlug === "terms") && (
                  <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary pb-3 border-b border-gray-100 dark:border-border flex items-center gap-2">
                      <FileText size={16} className="text-[#E8542A]" />
                      Legal Policy Content (HTML / Text)
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                        Full Document Text
                      </label>
                      <textarea
                        rows={10}
                        value={formData.content || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        placeholder="Enter the full policy clauses and disclosures..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Bottom Save Action */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8542A] hover:bg-[#c9431d] disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {saveMutation.isPending ? "Saving changes..." : "Save Page Settings"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
