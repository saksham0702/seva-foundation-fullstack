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
  Video,
  Award,
  Shield,
  ShieldCheck,
  Eye,
  Users,
  Target,
  Percent,
  Heart,
  Lock,
  Scale,
  BarChart2,
  Code,
  Search,
  Home as HomeIcon,
} from "lucide-react";
import { getCmsPages, getCmsPageBySlug, saveCmsPage, saveCmsSection, deleteCmsSection, uploadCmsImageFile, uploadCmsMediaFile, CmsPage, CmsSection } from "@/app/api/cms";
import { getImageUrl } from "@/lib/image";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { RichTextEditor } from "@/components/dashboard/richtexteditor/RichTextEditor";

function CmsVideoField({
  label = "Hero Banner Video",
  value = "",
  onChange,
  recommended = "MP4, WebM, MOV · Max 50MB · Takes priority over static image in hero background",
  placeholder = "Upload video or enter URL (e.g. /uploads/... or https://...)",
}: {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  recommended?: string;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError("Video file exceeds 50MB size limit. Please optimize or compress the video.");
      return;
    }

    const validExts = [".mp4", ".webm", ".mov", ".ogg", ".m4v"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!file.type.startsWith("video/") && !validExts.includes(ext)) {
      setError("Please select a valid video format (MP4, WebM, MOV, OGG).");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const url = await uploadCmsMediaFile(file);
      if (url) {
        onChange(url);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload video to server");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-600 dark:text-muted flex items-center gap-1.5">
          <Video size={13} className="text-[#E8542A]" />
          {label}
        </label>
        <span className="text-[10px] text-gray-400 font-medium">
          {recommended}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-sm text-[#0f2347] dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
        />
        <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-panel border border-gray-200 dark:border-border hover:bg-gray-50 text-xs font-bold rounded-xl text-[#0f2347] dark:text-text-primary shrink-0 transition-colors shadow-sm">
          {uploading ? (
            <Loader2 size={14} className="animate-spin text-[#E8542A]" />
          ) : (
            <Upload size={14} className="text-[#E8542A]" />
          )}
          <span>{uploading ? "Uploading..." : "Upload Video"}</span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/ogg,video/*"
            className="hidden"
            disabled={uploading}
            onChange={handleVideoFileChange}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-3 py-2.5 bg-white dark:bg-panel border border-gray-200 dark:border-border text-xs font-semibold text-red-500 rounded-xl hover:bg-red-50 transition-colors"
          >
            Clear Video
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {value && (
        <div className="p-3 bg-gray-50 dark:bg-bg/50 rounded-xl border border-gray-100 dark:border-border mt-2 flex items-center gap-3">
          <div className="w-20 h-12 bg-black rounded-lg overflow-hidden flex items-center justify-center shrink-0">
            <video
              src={getImageUrl(value)}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              {value}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">Video Ready · Plays automatically in hero section</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CmsImageField({
  label,
  value,
  onChange,
  recommendedDimensions = "1200 × 630 px · Max 5MB",
  placeholder = "Upload image file or enter custom URL...",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  recommendedDimensions?: string;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB size limit.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const url = await uploadCmsImageFile(file);
      if (url) {
        onChange(url);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload image to server");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-600 dark:text-muted">
          {label}
        </label>
        <span className="text-[10px] text-gray-400 font-medium">
          {recommendedDimensions}
        </span>
      </div>

      {/* Upload Zone / Active Preview */}
      {value ? (
        <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-bg/60 rounded-xl border border-gray-200 dark:border-border">
          <img
            src={getImageUrl(value)}
            alt="Preview"
            className="w-20 h-14 rounded-lg object-cover border border-gray-200 shadow-sm shrink-0 bg-white"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#0f2347] dark:text-text-primary truncate">
              {value}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={11} /> Image Ready &amp; Saved
            </p>
          </div>
          <div className="flex items-center gap-1">
            <label className="cursor-pointer p-2 text-gray-500 hover:text-[#0f2347] hover:bg-white rounded-lg transition-colors" title="Replace Image">
              <Upload size={14} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleFileChange}
              />
            </label>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white transition-colors"
              title="Remove Image"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 transition-all text-center ${isDragOver
              ? "border-[#E8542A] bg-orange-50/50"
              : "border-gray-200 dark:border-border bg-gray-50/60 dark:bg-bg/40 hover:border-gray-300"
            }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white dark:bg-panel shadow-sm flex items-center justify-center text-[#E8542A]">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            </div>
            <div>
              <label className="cursor-pointer text-xs font-bold text-[#E8542A] hover:underline inline-flex items-center gap-1">
                <span>{uploading ? "Uploading image..." : "Click to browse"}</span>
                <span className="text-gray-500 font-normal">or drag &amp; drop image here</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP, SVG up to 5MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Fallback direct URL input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
        />
        <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-panel border border-gray-200 dark:border-border hover:bg-gray-200 text-gray-700 dark:text-text-primary rounded-lg text-xs font-semibold shrink-0 transition-colors">
          <Upload size={12} className="text-[#E8542A]" />
          <span>Upload</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

const CMS_PAGES_META = [
  {
    slug: "home",
    name: "Home Page Sections",
    path: "/",
    description: "Manage Featured In marquee, Dev Bhoomi Samiti patron, Excellence awards, and Integrity & Compliance",
    icon: HomeIcon,
  },
  {
    slug: "header-footer",
    name: "Header Navigation & Topbar",
    path: "/",
    description: "Topbar contact, socials, Google Analytics, Google Console & dynamic header codes",
    icon: Sparkles,
  },
  {
    slug: "footer-settings",
    name: "Footer & Legal Compliance",
    path: "/",
    description: "Registered office address, CIN, Darpan ID, 80G/12A status, primary contact email, footer socials",
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
    slug: "terms",
    name: "Terms & Conditions",
    path: "/terms",
    description: "Website usage terms, donation compliance, and legal terms of service",
    icon: FileText,
  },
  {
    slug: "privacy",
    name: "Privacy Policy",
    path: "/privacy",
    description: "Data protection guidelines, donor privacy, and confidentiality disclosures",
    icon: FileText,
  },
  {
    slug: "refund-policy",
    name: "Refund & Cancellation Policy",
    path: "/refund-policy",
    description: "Donation refund conditions, request procedures, and dispute resolution guidelines",
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
  const [policyViewMode, setPolicyViewMode] = useState<"edit" | "preview">("edit");
  const [homeSubTab, setHomeSubTab] = useState<string>("all");
  const [aboutSubTab, setAboutSubTab] = useState<string>("all");
  const [ourWorkSubTab, setOurWorkSubTab] = useState<string>("all");
  const [getInvolvedSubTab, setGetInvolvedSubTab] = useState<string>("all");

  const getSection = (key: string): CmsSection | undefined => {
    return (formData.sections || []).find((s) => s.key === key);
  };

  const updateSection = (
    key: string,
    updater: (sec: CmsSection) => Partial<CmsSection>
  ) => {
    const currentSections = [...(formData.sections || [])];
    const idx = currentSections.findIndex((s) => s.key === key);
    if (idx >= 0) {
      currentSections[idx] = {
        ...currentSections[idx],
        ...updater(currentSections[idx]),
      };
    } else {
      currentSections.push({
        key,
        name: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        ...updater({ key }),
      });
    }
    setFormData({ ...formData, sections: currentSections });
  };

  // Sync loaded pageData into formData
  React.useEffect(() => {
    if (pageData) {
      setFormData(pageData);
    }
  }, [pageData]);

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

  const isSaving = saveMutation.isPending;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  // Section-wise saving states
  const [savingSectionKey, setSavingSectionKey] = useState<string | null>(null);
  const [savedSectionKey, setSavedSectionKey] = useState<string | null>(null);

  const handleSaveSection = async (sectionKey: string, sectionTitle?: string) => {
    setSavingSectionKey(sectionKey);
    setErrorMessage(null);
    try {
      let updatedPage: CmsPage;
      const isBannerOrPageField =
        sectionKey.includes("hero") ||
        sectionKey.includes("banner") ||
        sectionKey.includes("header");

      const targetSection = (formData.sections || []).find((s) => s.key === sectionKey);

      if (!targetSection || isBannerOrPageField) {
        // Page level or banner fields (title, subtitle, bannerImage, bannerVideo, etc.)
        updatedPage = await saveCmsPage(activeSlug, formData);
      } else {
        try {
          updatedPage = await saveCmsSection(activeSlug, sectionKey, targetSection);
        } catch (subErr) {
          console.warn("saveCmsSection endpoint fallback to saveCmsPage", subErr);
          updatedPage = await saveCmsPage(activeSlug, formData);
        }
      }

      if (updatedPage) {
        setFormData(updatedPage);
      }
      queryClient.invalidateQueries({ queryKey: ["cms-page", activeSlug] });
      queryClient.invalidateQueries({ queryKey: ["cms-pages"] });

      setSavedSectionKey(sectionKey);
      setSuccessMessage(`"${sectionTitle || sectionKey}" section saved successfully!`);
      setTimeout(() => {
        setSavedSectionKey((curr) => (curr === sectionKey ? null : curr));
        setSuccessMessage(null);
      }, 3500);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || `Failed to save section "${sectionTitle || sectionKey}"`);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSavingSectionKey(null);
    }
  };

  const activeMeta = CMS_PAGES_META.find((p) => p.slug === activeSlug) || CMS_PAGES_META[0];

  return (
    <PermissionGuard module="cms">
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 cms-dashboard-container">
        {/* Sticky Top Header Bar */}
        <div className="sticky top-0 z-30 bg-[#f8fafc]/95 dark:bg-bg/95 backdrop-blur-md py-3 px-6 sm:px-8 border-b border-slate-200/80 dark:border-border/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0f2347] dark:text-text-primary tracking-tight">
              Website CMS Manager
            </h1>
            <p className="text-xs text-gray-500 dark:text-muted mt-0.5">
              Editing: <span className="font-bold text-[#E8542A]">{activeMeta.name}</span> ({activeMeta.path})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={activeMeta.path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-panel border border-gray-200 dark:border-border rounded-xl text-xs font-semibold text-[#0f2347] dark:text-text-primary hover:border-[#1a3a6b] transition-colors shadow-sm"
            >
              <ExternalLink size={13} />
              Preview Page
            </a>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E8542A] hover:bg-[#c9431d] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20"
            >
              {saveMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saveMutation.isPending ? "Saving changes..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="px-6 pb-12">
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
            {/* LEFT: Page Selectors (Sticky Sidebar) */}
            <div className="lg:col-span-1 space-y-2 lg:sticky lg:top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
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
                  {activeSlug !== "header-footer" && activeSlug !== "footer-settings" && activeSlug !== "home" && activeSlug !== "about" && activeSlug !== "our-work" && activeSlug !== "get-involved" && (
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
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347] focus:ring-1 focus:ring-[#0f2347]"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-4">
                            <CmsImageField
                              label="Hero Banner Background Image"
                              value={formData.bannerImage || ""}
                              onChange={(url) =>
                                setFormData({ ...formData, bannerImage: url })
                              }
                              recommendedDimensions="1920 × 600 px · Max 5MB"
                              placeholder="Upload banner image or enter custom URL..."
                            />

                            <CmsVideoField
                              label="Hero Banner Video (Optional)"
                              value={formData.bannerVideo || ""}
                              onChange={(url) =>
                                setFormData({ ...formData, bannerVideo: url })
                              }
                              recommended="MP4 / WebM video URL · Takes priority over image in hero background"
                              placeholder="Paste video URL (e.g. /uploads/video.mp4 or https://...)"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Subtitle / Tagline
                          </label>
                          <textarea
                            rows={2}
                            value={formData.subtitle || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, subtitle: e.target.value })
                            }
                            placeholder="A promise made in the streets of Dehradun..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347] focus:ring-1 focus:ring-[#0f2347] leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Page Specific Sections */}
                  {activeSlug === "home" && (
                    <div className="space-y-10 text-slate-900">
                      {/* Top Overview Banner */}
                      <div className="bg-gradient-to-r from-[#0a1628] via-[#0f2347] to-[#1a3a6b] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-orange-300 mb-2">
                            <HomeIcon size={13} className="text-[#E8542A]" />
                            Home Page Live Content Manager
                          </div>
                          <h2 className="text-xl font-bold tracking-tight text-white">
                            Section-Wise Home Page Controller
                          </h2>
                          <p className="text-xs text-white/70 mt-1 max-w-2xl leading-relaxed">
                            Each section below is visually separated with its own dedicated <span className="font-semibold text-orange-400">Save Section</span> button. You can update and save individual sections independently, or use the bottom bar to save all sections at once.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            5 Sections Active
                          </span>
                        </div>
                      </div>

                      {/* Home Section Navigation Sub-Tabs */}
                      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
                        {[
                          { id: "all", label: "All Sections" },
                          { id: "hero", label: "1. Hero Section" },
                          { id: "featured_in", label: "2. Featured In Media" },
                          { id: "patron_samiti", label: "3. Dev Bhoomi Patron" },
                          { id: "excellence_awards", label: "4. Excellence Awards" },
                          { id: "integrity_compliance", label: "5. Integrity & Compliance" },
                        ].map((tab) => {
                          const isActive = homeSubTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setHomeSubTab(tab.id)}
                              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                                isActive
                                  ? "bg-[#0f2347] text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              }`}
                            >
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* ─────────────────────────────────────────────────────────────
                        SECTION 1: HERO SECTION
                    ────────────────────────────────────────────────────────────── */}
                      {(homeSubTab === "all" || homeSubTab === "hero") && (
                      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Section Header */}
                        <div className="bg-gradient-to-r from-[#0a1628] via-[#0f2347] to-[#1a3a6b] p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#E8542A]/20 border border-[#E8542A]/40 flex items-center justify-center flex-shrink-0">
                              <Sparkles size={18} className="text-[#E8542A]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#E8542A] uppercase tracking-wider">
                                  Section 1
                                </span>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono">
                                  key: hero
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white leading-tight">
                                Hero Section — Left Headline, Live Stats &amp; Bottom Trust Bar
                              </h3>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "hero"}
                            onClick={() => handleSaveSection("hero", "Hero Section")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "hero"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "hero" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "hero" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Hero Section</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Section Body */}
                        <div className="p-6 space-y-6 bg-slate-50/50">
                          <p className="text-xs text-slate-500">
                            Controls the left-hand text, CTA buttons, live stats ticker amounts (e.g. ₹4.2Cr+ Raised), trust badges, and the bottom trust bar items. The campaign slider on the right automatically features active campaigns.
                          </p>

                          {/* Top Trust Badge */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Pill Trust Badge (Above Headline)
                            </label>
                            <input
                              type="text"
                              value={getSection("hero")?.extra?.badgeText ?? ""}
                              onChange={(e) =>
                                updateSection("hero", (sec) => ({
                                  extra: { ...sec.extra, badgeText: e.target.value },
                                }))
                              }
                              placeholder="India's Most Trusted Crowdfunding Platform"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0f2347]"
                            />
                          </div>

                          {/* Main Headline (2-line split with highlights) */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Hero Main Headline (with Orange Highlights)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                                  Line 1 Text (White)
                                </span>
                                <input
                                  type="text"
                                  value={getSection("hero")?.extra?.headlinePart1 ?? ""}
                                  onChange={(e) =>
                                    updateSection("hero", (sec) => ({
                                      extra: { ...sec.extra, headlinePart1: e.target.value },
                                    }))
                                  }
                                  placeholder="Give with"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>
                              <div>
                                <span className="text-[11px] font-semibold text-[#E8542A] block mb-1">
                                  Line 1 Highlight Word (Orange)
                                </span>
                                <input
                                  type="text"
                                  value={getSection("hero")?.extra?.headlineHighlight1 ?? ""}
                                  onChange={(e) =>
                                    updateSection("hero", (sec) => ({
                                      extra: { ...sec.extra, headlineHighlight1: e.target.value },
                                    }))
                                  }
                                  placeholder="confidence"
                                  className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white text-xs font-bold text-[#E8542A] focus:outline-none focus:border-[#E8542A]"
                                />
                              </div>
                              <div>
                                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                                  Line 2 Text (White)
                                </span>
                                <input
                                  type="text"
                                  value={getSection("hero")?.extra?.headlinePart2 ?? ""}
                                  onChange={(e) =>
                                    updateSection("hero", (sec) => ({
                                      extra: { ...sec.extra, headlinePart2: e.target.value },
                                    }))
                                  }
                                  placeholder="See the"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>
                              <div>
                                <span className="text-[11px] font-semibold text-[#E8542A] block mb-1">
                                  Line 2 Highlight Word (Orange)
                                </span>
                                <input
                                  type="text"
                                  value={getSection("hero")?.extra?.headlineHighlight2 ?? ""}
                                  onChange={(e) =>
                                    updateSection("hero", (sec) => ({
                                      extra: { ...sec.extra, headlineHighlight2: e.target.value },
                                    }))
                                  }
                                  placeholder="impact"
                                  className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white text-xs font-bold text-[#E8542A] focus:outline-none focus:border-[#E8542A]"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Narrative / Description */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Narrative Subtitle / Description
                            </label>
                            <textarea
                              rows={3}
                              value={getSection("hero")?.description ?? ""}
                              onChange={(e) =>
                                updateSection("hero", () => ({
                                  description: e.target.value,
                                }))
                              }
                              placeholder="Seva India Foundation connects you directly to verified campaigns in Uttarakhand. Every rupee tracked. Every life changed."
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0f2347] leading-relaxed"
                            />
                          </div>

                          {/* CTA Buttons */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Call To Action (CTA Buttons)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                                  Primary Button Label
                                </span>
                                <input
                                  type="text"
                                  value={getSection("hero")?.extra?.primaryCtaText ?? ""}
                                  onChange={(e) =>
                                    updateSection("hero", (sec) => ({
                                      extra: { ...sec.extra, primaryCtaText: e.target.value },
                                    }))
                                  }
                                  placeholder="Browse Campaigns"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>
                              <div>
                                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                                  Primary Button Link URL
                                </span>
                                <input
                                  type="text"
                                  value={getSection("hero")?.extra?.primaryCtaLink ?? ""}
                                  onChange={(e) =>
                                    updateSection("hero", (sec) => ({
                                      extra: { ...sec.extra, primaryCtaLink: e.target.value },
                                    }))
                                  }
                                  placeholder="/campaigns"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Live Stats Ticker Amounts & Metrics */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Target size={14} className="text-[#E8542A]" />
                                Live Stats Ticker (Amounts &amp; Metrics)
                              </label>
                              <span className="text-[10px] text-slate-400">
                                Displays on the left bottom ticker
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {/* Stat 1 */}
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                <span className="text-[11px] font-bold text-[#E8542A] uppercase block">
                                  Stat Metric 1
                                </span>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 uppercase">
                                    Amount / Number
                                  </label>
                                  <input
                                    type="text"
                                    value={getSection("hero")?.extra?.stat1Value ?? ""}
                                    onChange={(e) =>
                                      updateSection("hero", (sec) => ({
                                        extra: { ...sec.extra, stat1Value: e.target.value },
                                      }))
                                    }
                                    placeholder="₹4.2Cr+"
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 uppercase">
                                    Metric Label
                                  </label>
                                  <input
                                    type="text"
                                    value={getSection("hero")?.extra?.stat1Label ?? ""}
                                    onChange={(e) =>
                                      updateSection("hero", (sec) => ({
                                        extra: { ...sec.extra, stat1Label: e.target.value },
                                      }))
                                    }
                                    placeholder="Raised"
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                  />
                                </div>
                              </div>

                              {/* Stat 2 */}
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                <span className="text-[11px] font-bold text-[#E8542A] uppercase block">
                                  Stat Metric 2
                                </span>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 uppercase">
                                    Amount / Number
                                  </label>
                                  <input
                                    type="text"
                                    value={getSection("hero")?.extra?.stat2Value ?? ""}
                                    onChange={(e) =>
                                      updateSection("hero", (sec) => ({
                                        extra: { ...sec.extra, stat2Value: e.target.value },
                                      }))
                                    }
                                    placeholder="38,000+"
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 uppercase">
                                    Metric Label
                                  </label>
                                  <input
                                    type="text"
                                    value={getSection("hero")?.extra?.stat2Label ?? ""}
                                    onChange={(e) =>
                                      updateSection("hero", (sec) => ({
                                        extra: { ...sec.extra, stat2Label: e.target.value },
                                      }))
                                    }
                                    placeholder="Lives Impacted"
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                  />
                                </div>
                              </div>

                              {/* Stat 3 */}
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                <span className="text-[11px] font-bold text-[#E8542A] uppercase block">
                                  Stat Metric 3
                                </span>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 uppercase">
                                    Amount / Number
                                  </label>
                                  <input
                                    type="text"
                                    value={getSection("hero")?.extra?.stat3Value ?? ""}
                                    onChange={(e) =>
                                      updateSection("hero", (sec) => ({
                                        extra: { ...sec.extra, stat3Value: e.target.value },
                                      }))
                                    }
                                    placeholder="120+"
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 uppercase">
                                    Metric Label
                                  </label>
                                  <input
                                    type="text"
                                    value={getSection("hero")?.extra?.stat3Label ?? ""}
                                    onChange={(e) =>
                                      updateSection("hero", (sec) => ({
                                        extra: { ...sec.extra, stat3Label: e.target.value },
                                      }))
                                    }
                                    placeholder="Campaigns"
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Trust Signals / Highlights (Max 4 Cards) */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <Sparkles size={14} className="text-[#E8542A]" />
                                  Hero Highlight Cards (Trust Badges)
                                </label>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Displays above the CTA button in a 2-column grid. Currently {(() => {
                                    const list = getSection("hero")?.extra?.trustSignals || [
                                      { label: "12A & 80G Certified", sub: "Tax benefits on every donation", icon: "shield" },
                                      { label: "100% Transparent", sub: "Track where your money goes", icon: "trend" },
                                      { label: "Dehradun Based", sub: "Serving Uttarakhand since 2012", icon: "location" },
                                    ];
                                    return list.length;
                                  })()} of 4 cards (Max 4 allowed).
                                </p>
                              </div>

                              {(() => {
                                const currSignals = getSection("hero")?.extra?.trustSignals || [
                                  { label: "12A & 80G Certified", sub: "Tax benefits on every donation", icon: "shield" },
                                  { label: "100% Transparent", sub: "Track where your money goes", icon: "trend" },
                                  { label: "Dehradun Based", sub: "Serving Uttarakhand since 2012", icon: "location" },
                                ];

                                if (currSignals.length < 4) {
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [
                                          ...currSignals,
                                          { label: "Direct Impact", sub: "100% verified grassroots support", icon: "award" },
                                        ];
                                        updateSection("hero", (sec) => ({
                                          extra: { ...sec.extra, trustSignals: updated },
                                        }));
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-xs font-bold rounded-lg transition-colors shadow-sm self-start sm:self-auto"
                                    >
                                      <Plus size={13} />
                                      <span>Add Highlight Card</span>
                                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                                        {currSignals.length}/4
                                      </span>
                                    </button>
                                  );
                                }

                                return (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-lg self-start sm:self-auto">
                                    <AlertCircle size={13} /> Max 4 Cards Reached
                                  </span>
                                );
                              })()}
                            </div>

                            {/* Dynamic Highlight Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {(() => {
                                const currSignals = getSection("hero")?.extra?.trustSignals || [
                                  { label: "12A & 80G Certified", sub: "Tax benefits on every donation", icon: "shield" },
                                  { label: "100% Transparent", sub: "Track where your money goes", icon: "trend" },
                                  { label: "Dehradun Based", sub: "Serving Uttarakhand since 2012", icon: "location" },
                                ];

                                return currSignals.slice(0, 4).map((signal: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 shadow-sm hover:border-slate-300 transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-[#E8542A] uppercase tracking-wider flex items-center gap-1.5">
                                        Highlight Card #{idx + 1}
                                      </span>
                                      {currSignals.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = currSignals.filter((_: any, i: number) => i !== idx);
                                            updateSection("hero", (sec) => ({
                                              extra: { ...sec.extra, trustSignals: updated },
                                            }));
                                          }}
                                          className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                                          title="Delete Highlight Card"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                                        Icon
                                      </label>
                                      <select
                                        value={signal.icon || (idx === 0 ? "shield" : idx === 1 ? "trend" : "location")}
                                        onChange={(e) => {
                                          const updated = [...currSignals];
                                          updated[idx] = { ...updated[idx], icon: e.target.value };
                                          updateSection("hero", (sec) => ({
                                            extra: { ...sec.extra, trustSignals: updated },
                                          }));
                                        }}
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                      >
                                        <option value="shield">🛡️ Shield / Security (12A &amp; 80G Certified)</option>
                                        <option value="trend">📈 Trending / Growth (100% Transparent)</option>
                                        <option value="location">📍 Location / Map (Dehradun Based)</option>
                                        <option value="award">🏆 Award / Excellence</option>
                                        <option value="heart">❤️ Heart / Care &amp; Compassion</option>
                                        <option value="users">👥 Users / Community</option>
                                        <option value="sparkles">✨ Sparkles / Impact</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                                        Title / Heading
                                      </label>
                                      <input
                                        type="text"
                                        value={signal.label || ""}
                                        onChange={(e) => {
                                          const updated = [...currSignals];
                                          updated[idx] = { ...updated[idx], label: e.target.value };
                                          updateSection("hero", (sec) => ({
                                            extra: { ...sec.extra, trustSignals: updated },
                                          }));
                                        }}
                                        placeholder="e.g. 12A & 80G Certified"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                                        Subtitle / Description
                                      </label>
                                      <input
                                        type="text"
                                        value={signal.sub || ""}
                                        onChange={(e) => {
                                          const updated = [...currSignals];
                                          updated[idx] = { ...updated[idx], sub: e.target.value };
                                          updateSection("hero", (sec) => ({
                                            extra: { ...sec.extra, trustSignals: updated },
                                          }));
                                        }}
                                        placeholder="e.g. Tax benefits on every donation"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#0f2347]"
                                      />
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>

                          {/* Bottom Trust Bar (4 items across full width) */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Bottom Trust Bar (4 Items at Base of Hero)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[0, 1, 2, 3].map((idx) => {
                                const defaultPlaceholders = [
                                  "Verified by Seva India Foundation",
                                  "Zero platform fees on donations",
                                  "12,000+ verified donors",
                                  "80G tax benefit on every donation",
                                ];
                                const currentList = getSection("hero")?.extra?.bottomTrustItems || [];
                                const val = currentList[idx] ?? "";

                                return (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-400 w-5">
                                      #{idx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={val}
                                      placeholder={defaultPlaceholders[idx]}
                                      onChange={(e) => {
                                        const updated = [...currentList];
                                        updated[idx] = e.target.value;
                                        updateSection("hero", (sec) => ({
                                          extra: { ...sec.extra, bottomTrustItems: updated },
                                        }));
                                      }}
                                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* ─────────────────────────────────────────────────────────────
                        SECTION 2: FEATURED IN MEDIA MARQUEE
                    ────────────────────────────────────────────────────────────── */}
                      {(homeSubTab === "all" || homeSubTab === "featured_in") && (
                      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Section Header */}
                        <div className="bg-gradient-to-r from-[#1e1b4b] to-[#3730a3] p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                              <Sparkles size={18} className="text-indigo-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                  Section 2
                                </span>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono">
                                  key: featured_in
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white leading-tight">
                                Featured In — Media Marquee Loop
                              </h3>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "featured_in"}
                            onClick={() => handleSaveSection("featured_in", "Featured In Media")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "featured_in"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "featured_in" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "featured_in" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Featured In</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Section Body */}
                        <div className="p-6 space-y-4 bg-slate-50/50">
                          <p className="text-xs text-slate-500">
                            Admin enters media outlet names or uploads logos. Displays as an infinite continuous marquee loop on the home page.
                          </p>

                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Section Heading
                            </label>
                            <input
                              type="text"
                              value={getSection("featured_in")?.title ?? ""}
                              onChange={(e) =>
                                updateSection("featured_in", () => ({
                                  title: e.target.value,
                                }))
                              }
                              placeholder="Featured In"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                            />
                          </div>

                          {/* Media Outlets List */}
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Media Outlets &amp; Press Badges
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const curr = getSection("featured_in")?.items || [];
                                  updateSection("featured_in", () => ({
                                    items: [...curr, { name: "NEW OUTLET", color: "#e11d48", logo: "" }],
                                  }));
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f2347] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a6b]"
                              >
                                <Plus size={12} /> Add Media Outlet
                              </button>
                            </div>

                            <div className="space-y-3">
                              {(getSection("featured_in")?.items || []).map((m: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-[#E8542A] uppercase">
                                      Media Outlet #{idx + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curr = [...(getSection("featured_in")?.items || [])];
                                        curr.splice(idx, 1);
                                        updateSection("featured_in", () => ({ items: curr }));
                                      }}
                                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg"
                                      title="Remove Media Outlet"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                        Media Name (e.g. THE BETTER INDIA)
                                      </label>
                                      <input
                                        type="text"
                                        value={m.name || ""}
                                        onChange={(e) => {
                                          const curr = [...(getSection("featured_in")?.items || [])];
                                          curr[idx] = { ...curr[idx], name: e.target.value };
                                          updateSection("featured_in", () => ({ items: curr }));
                                        }}
                                        placeholder="THE BETTER INDIA"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                        Accent Color (Hex)
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="color"
                                          value={m.color || "#e11d48"}
                                          onChange={(e) => {
                                            const curr = [...(getSection("featured_in")?.items || [])];
                                            curr[idx] = { ...curr[idx], color: e.target.value };
                                            updateSection("featured_in", () => ({ items: curr }));
                                          }}
                                          className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                                        />
                                        <input
                                          type="text"
                                          value={m.color || "#e11d48"}
                                          onChange={(e) => {
                                            const curr = [...(getSection("featured_in")?.items || [])];
                                            curr[idx] = { ...curr[idx], color: e.target.value };
                                            updateSection("featured_in", () => ({ items: curr }));
                                          }}
                                          placeholder="#e11d48"
                                          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0f2347]"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <CmsImageField
                                    label="Optional Outlet Logo Image (Leave blank to use stylized typography)"
                                    value={m.logo || ""}
                                    onChange={(url) => {
                                      const curr = [...(getSection("featured_in")?.items || [])];
                                      curr[idx] = { ...curr[idx], logo: url };
                                      updateSection("featured_in", () => ({ items: curr }));
                                    }}
                                    recommendedDimensions="240 × 80 px · Transparent PNG recommended"
                                    placeholder="Upload logo image or enter URL..."
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* ─────────────────────────────────────────────────────────────
                        SECTION 3: PRINCIPAL PATRON (DEV BHOOMI SAMITI)
                    ────────────────────────────────────────────────────────────── */}
                      {(homeSubTab === "all" || homeSubTab === "patron_samiti") && (
                      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Section Header */}
                        <div className="bg-gradient-to-r from-[#064e3b] to-[#047857] p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                              <ShieldCheck size={18} className="text-emerald-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                                  Section 3
                                </span>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono">
                                  key: patron_samiti
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white leading-tight">
                                Principal Patron (Dev Bhoomi Samiti)
                              </h3>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "patron_samiti"}
                            onClick={() => handleSaveSection("patron_samiti", "Principal Patron")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "patron_samiti"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "patron_samiti" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "patron_samiti" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Patron Section</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Section Body */}
                        <div className="p-6 space-y-4 bg-slate-50/50">
                          <p className="text-xs text-slate-500">
                            When the user clicks &apos;Learn More&apos; or &apos;Read More&apos;, it links directly to the About Us page section.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Pill Badge Text
                              </label>
                              <input
                                type="text"
                                value={getSection("patron_samiti")?.extra?.badgeText ?? ""}
                                onChange={(e) =>
                                  updateSection("patron_samiti", (sec) => ({
                                    extra: { ...sec.extra, badgeText: e.target.value },
                                  }))
                                }
                                placeholder="PRINCIPAL PATRON"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                              />
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Section Main Title
                              </label>
                              <input
                                type="text"
                                value={getSection("patron_samiti")?.title ?? ""}
                                onChange={(e) =>
                                  updateSection("patron_samiti", () => ({
                                    title: e.target.value,
                                  }))
                                }
                                placeholder="DEV BHOOMI SAMITI"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                              />
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Narrative / Subtitle (Inside Highlight Box)
                            </label>
                            <textarea
                              rows={3}
                              value={getSection("patron_samiti")?.subtitle ?? ""}
                              onChange={(e) =>
                                updateSection("patron_samiti", () => ({
                                  subtitle: e.target.value,
                                }))
                              }
                              placeholder="Dev Bhoomi Samiti is our spiritual and strategic cornerstone..."
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347] leading-relaxed"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Button Label (CTA)
                              </label>
                              <input
                                type="text"
                                value={getSection("patron_samiti")?.extra?.buttonText ?? ""}
                                onChange={(e) =>
                                  updateSection("patron_samiti", (sec) => ({
                                    extra: { ...sec.extra, buttonText: e.target.value },
                                  }))
                                }
                                placeholder="Learn More"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                              />
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Button Destination URL
                              </label>
                              <input
                                type="text"
                                value={getSection("patron_samiti")?.extra?.buttonLink ?? ""}
                                onChange={(e) =>
                                  updateSection("patron_samiti", (sec) => ({
                                    extra: { ...sec.extra, buttonLink: e.target.value },
                                  }))
                                }
                                placeholder="/about"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                              />
                            </div>
                          </div>

                          {/* Right Card Content */}
                          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                            <span className="text-[11px] font-bold text-[#E8542A] uppercase block">
                              Right Dark Card Content
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Card Eyebrow
                                </label>
                                <input
                                  type="text"
                                  value={getSection("patron_samiti")?.extra?.cardEyebrow ?? ""}
                                  onChange={(e) =>
                                    updateSection("patron_samiti", (sec) => ({
                                      extra: { ...sec.extra, cardEyebrow: e.target.value },
                                    }))
                                  }
                                  placeholder="OUR VISIONARY BACKBONE"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Card Title
                                </label>
                                <input
                                  type="text"
                                  value={getSection("patron_samiti")?.extra?.cardTitle ?? ""}
                                  onChange={(e) =>
                                    updateSection("patron_samiti", (sec) => ({
                                      extra: { ...sec.extra, cardTitle: e.target.value },
                                    }))
                                  }
                                  placeholder="Spiritual & Social Support"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Quote Text
                              </label>
                              <textarea
                                rows={2}
                                value={getSection("patron_samiti")?.extra?.cardQuote ?? ""}
                                onChange={(e) =>
                                  updateSection("patron_samiti", (sec) => ({
                                    extra: { ...sec.extra, cardQuote: e.target.value },
                                  }))
                                }
                                placeholder='"Uttarakhand, the land of gods, teaches us that service to humanity is the highest form of worship..."'
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347] leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* ─────────────────────────────────────────────────────────────
                        SECTION 4: HONORS & GLOBAL RECOGNITION (AWARDS)
                    ────────────────────────────────────────────────────────────── */}
                      {(homeSubTab === "all" || homeSubTab === "excellence_awards") && (
                      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Section Header */}
                        <div className="bg-gradient-to-r from-[#78350f] to-[#b45309] p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                              <Award size={18} className="text-amber-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                                  Section 4
                                </span>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono">
                                  key: excellence_awards
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white leading-tight">
                                Honors &amp; Global Recognition (Awards Cards)
                              </h3>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "excellence_awards"}
                            onClick={() => handleSaveSection("excellence_awards", "Excellence Awards")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "excellence_awards"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "excellence_awards" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "excellence_awards" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Awards Section</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Section Body */}
                        <div className="p-6 space-y-4 bg-slate-50/50">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Eyebrow Badge
                              </label>
                              <input
                                type="text"
                                value={getSection("excellence_awards")?.subtitle ?? ""}
                                onChange={(e) =>
                                  updateSection("excellence_awards", () => ({
                                    subtitle: e.target.value,
                                  }))
                                }
                                placeholder="HONORS & GLOBAL RECOGNITION"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                              />
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Main Heading
                              </label>
                              <input
                                type="text"
                                value={getSection("excellence_awards")?.title ?? ""}
                                onChange={(e) =>
                                  updateSection("excellence_awards", () => ({
                                    title: e.target.value,
                                  }))
                                }
                                placeholder="EXCELLENCE IN HUMAN SERVICE"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                              />
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Watermark Year Text
                              </label>
                              <input
                                type="text"
                                value={getSection("excellence_awards")?.extra?.watermarkText ?? ""}
                                onChange={(e) =>
                                  updateSection("excellence_awards", (sec) => ({
                                    extra: { ...sec.extra, watermarkText: e.target.value },
                                  }))
                                }
                                placeholder="2026"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                              />
                            </div>
                          </div>

                          {/* Awards Grid Repeater */}
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Honors &amp; Awards Cards ({getSection("excellence_awards")?.items?.length || 0})
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const curr = getSection("excellence_awards")?.items || [];
                                  updateSection("excellence_awards", () => ({
                                    items: [...curr, { category: "RECOGNITION", title: "NEW AWARD", year: "2026" }],
                                  }));
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f2347] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a6b]"
                              >
                                <Plus size={12} /> Add Award Card
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(getSection("excellence_awards")?.items || []).map((aw: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-[#E8542A] uppercase">
                                      Award #{idx + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curr = [...(getSection("excellence_awards")?.items || [])];
                                        curr.splice(idx, 1);
                                        updateSection("excellence_awards", () => ({ items: curr }));
                                      }}
                                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg"
                                      title="Remove Award"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>

                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 uppercase">
                                        Category
                                      </label>
                                      <input
                                        type="text"
                                        value={aw.category || ""}
                                        onChange={(e) => {
                                          const curr = [...(getSection("excellence_awards")?.items || [])];
                                          curr[idx] = { ...curr[idx], category: e.target.value };
                                          updateSection("excellence_awards", () => ({ items: curr }));
                                        }}
                                        placeholder="OVERALL EXCELLENCE"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 uppercase">
                                        Award Title
                                      </label>
                                      <input
                                        type="text"
                                        value={aw.title || ""}
                                        onChange={(e) => {
                                          const curr = [...(getSection("excellence_awards")?.items || [])];
                                          curr[idx] = { ...curr[idx], title: e.target.value };
                                          updateSection("excellence_awards", () => ({ items: curr }));
                                        }}
                                        placeholder="BEST NGO OF THE YEAR"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 uppercase">
                                        Year
                                      </label>
                                      <input
                                        type="text"
                                        value={aw.year || ""}
                                        onChange={(e) => {
                                          const curr = [...(getSection("excellence_awards")?.items || [])];
                                          curr[idx] = { ...curr[idx], year: e.target.value };
                                          updateSection("excellence_awards", () => ({ items: curr }));
                                        }}
                                        placeholder="2026"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* ─────────────────────────────────────────────────────────────
                        SECTION 5: INTEGRITY & COMPLIANCE (LEGAL & TRANSPARENCY)
                    ────────────────────────────────────────────────────────────── */}
                      {(homeSubTab === "all" || homeSubTab === "integrity_compliance") && (
                      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Section Header */}
                        <div className="bg-gradient-to-r from-[#0f172a] to-[#334155] p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                              <ShieldCheck size={18} className="text-blue-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                                  Section 5
                                </span>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono">
                                  key: integrity_compliance
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white leading-tight">
                                Integrity &amp; Compliance (Legal, Office &amp; Allocations)
                              </h3>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "integrity_compliance"}
                            onClick={() => handleSaveSection("integrity_compliance", "Integrity & Compliance")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "integrity_compliance"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "integrity_compliance" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "integrity_compliance" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Integrity Section</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Section Body */}
                        <div className="p-6 space-y-4 bg-slate-50/50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Main Title
                              </label>
                              <input
                                type="text"
                                value={getSection("integrity_compliance")?.title ?? ""}
                                onChange={(e) =>
                                  updateSection("integrity_compliance", () => ({
                                    title: e.target.value,
                                  }))
                                }
                                placeholder="INTEGRITY & COMPLIANCE"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                              />
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Registered Office Title
                              </label>
                              <input
                                type="text"
                                value={getSection("integrity_compliance")?.extra?.officeTitle ?? ""}
                                onChange={(e) =>
                                  updateSection("integrity_compliance", (sec) => ({
                                    extra: { ...sec.extra, officeTitle: e.target.value },
                                  }))
                                }
                                placeholder="REGISTERED OFFICE"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                              />
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Introductory Narrative
                            </label>
                            <textarea
                              rows={2}
                              value={getSection("integrity_compliance")?.description ?? ""}
                              onChange={(e) =>
                                updateSection("integrity_compliance", () => ({
                                  description: e.target.value,
                                }))
                              }
                              placeholder="At Seva India Foundation, trust isn't a promise—it's a practice..."
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347] leading-relaxed"
                            />
                          </div>

                          {/* Percentage Allocations */}
                          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                            <span className="text-[11px] font-bold text-[#E8542A] uppercase block">
                              Fund Allocation Progress Bars
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                    Program Support Label
                                  </label>
                                  <input
                                    type="text"
                                    value={getSection("integrity_compliance")?.extra?.programSupportLabel ?? ""}
                                    onChange={(e) =>
                                      updateSection("integrity_compliance", (sec) => ({
                                        extra: { ...sec.extra, programSupportLabel: e.target.value },
                                      }))
                                    }
                                    placeholder="DIRECT PROGRAM SUPPORT"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                    Program Support % (e.g. 90%)
                                  </label>
                                  <input
                                    type="text"
                                    value={getSection("integrity_compliance")?.extra?.programSupportPercent ?? ""}
                                    onChange={(e) =>
                                      updateSection("integrity_compliance", (sec) => ({
                                        extra: { ...sec.extra, programSupportPercent: e.target.value },
                                      }))
                                    }
                                    placeholder="90%"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-amber-600 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                    Admin &amp; Fundraising Label
                                  </label>
                                  <input
                                    type="text"
                                    value={getSection("integrity_compliance")?.extra?.adminLabel ?? ""}
                                    onChange={(e) =>
                                      updateSection("integrity_compliance", (sec) => ({
                                        extra: { ...sec.extra, adminLabel: e.target.value },
                                      }))
                                    }
                                    placeholder="FUNDRAISING & ADMIN"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                    Admin &amp; Fundraising % (e.g. 10%)
                                  </label>
                                  <input
                                    type="text"
                                    value={getSection("integrity_compliance")?.extra?.adminPercent ?? ""}
                                    onChange={(e) =>
                                      updateSection("integrity_compliance", (sec) => ({
                                        extra: { ...sec.extra, adminPercent: e.target.value },
                                      }))
                                    }
                                    placeholder="10%"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Government IDs */}
                          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                            <span className="text-[11px] font-bold text-[#E8542A] uppercase block">
                              Legal &amp; Regulatory Numbers
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  NGO Darpan ID
                                </label>
                                <input
                                  type="text"
                                  value={getSection("integrity_compliance")?.extra?.darpanId ?? ""}
                                  onChange={(e) =>
                                    updateSection("integrity_compliance", (sec) => ({
                                      extra: { ...sec.extra, darpanId: e.target.value },
                                    }))
                                  }
                                  placeholder="UK/2026/0993905"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  CIN Number
                                </label>
                                <input
                                  type="text"
                                  value={getSection("integrity_compliance")?.extra?.cin ?? ""}
                                  onChange={(e) =>
                                    updateSection("integrity_compliance", (sec) => ({
                                      extra: { ...sec.extra, cin: e.target.value },
                                    }))
                                  }
                                  placeholder="U88900UT2026NPL020825"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Section 8 License
                                </label>
                                <input
                                  type="text"
                                  value={getSection("integrity_compliance")?.extra?.licenseNo ?? ""}
                                  onChange={(e) =>
                                    updateSection("integrity_compliance", (sec) => ({
                                      extra: { ...sec.extra, licenseNo: e.target.value },
                                    }))
                                  }
                                  placeholder="No. 179973"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  PAN Number
                                </label>
                                <input
                                  type="text"
                                  value={getSection("integrity_compliance")?.extra?.panNumber ?? ""}
                                  onChange={(e) =>
                                    updateSection("integrity_compliance", (sec) => ({
                                      extra: { ...sec.extra, panNumber: e.target.value },
                                    }))
                                  }
                                  placeholder="ABSCS7219M"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  TAN Number
                                </label>
                                <input
                                  type="text"
                                  value={getSection("integrity_compliance")?.extra?.tanNumber ?? ""}
                                  onChange={(e) =>
                                    updateSection("integrity_compliance", (sec) => ({
                                      extra: { ...sec.extra, tanNumber: e.target.value },
                                    }))
                                  }
                                  placeholder="MRTS38379F"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Compliance Documents Link
                                </label>
                                <input
                                  type="text"
                                  value={getSection("integrity_compliance")?.extra?.complianceDocLink ?? ""}
                                  onChange={(e) =>
                                    updateSection("integrity_compliance", (sec) => ({
                                      extra: { ...sec.extra, complianceDocLink: e.target.value },
                                    }))
                                  }
                                  placeholder="/about"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Registered Office Address */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Registered Office Full Physical Address
                            </label>
                            <textarea
                              rows={2}
                              value={getSection("integrity_compliance")?.extra?.officeAddress ?? ""}
                              onChange={(e) =>
                                updateSection("integrity_compliance", (sec) => ({
                                  extra: { ...sec.extra, officeAddress: e.target.value },
                                }))
                              }
                              placeholder="20, Sahastradhara Road, Rishinagar Upper Adhoiwala, Dehradun, Uttarakhand - 248001"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347] leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Unified Home Save Bar at Bottom */}
                      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg sticky bottom-4 z-20">
                        <div>
                          <h4 className="text-sm font-bold text-[#0f2347]">
                            Ready to publish Home Page changes?
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Click below to save and update all home page sections to the live database immediately.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saveMutation.isPending}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#E8542A] hover:bg-[#c9431d] disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
                        >
                          {saveMutation.isPending ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> Saving all sections...
                            </>
                          ) : (
                            <>
                              <Save size={16} /> Save All Home Sections
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSlug === "about" && (
                    <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-6 shadow-sm space-y-8">
                      <div className="border-b border-gray-100 dark:border-border pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary flex items-center gap-2">
                              <FileText size={16} className="text-[#E8542A]" />
                              About Us Page - Section-wise Content Manager
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Edit each section individually. Data entered here updates dynamically on the live website.
                            </p>
                          </div>
                          <span className="text-xs bg-blue-50 text-[#0f2347] border border-blue-200 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 self-start sm:self-auto">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            8 Sections Active
                          </span>
                        </div>
                      </div>

                      {/* About Section Navigation Sub-Tabs */}
                      <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-bg rounded-xl border border-gray-200 dark:border-border overflow-x-auto shadow-xs">
                        {[
                          { id: "all", label: "All Sections" },
                          { id: "hero", label: "0. Hero Banner & Header" },
                          { id: "sacred_promise", label: "1. Sacred Promise" },
                          { id: "vision_mission", label: "2. Vision & Mission" },
                          { id: "areas_of_focus", label: "3. Areas of Focus" },
                          { id: "leadership", label: "4. Leadership & Stewards" },
                          { id: "trust_stewardship", label: "5. Stewardship of Trust" },
                          { id: "awards_recognition", label: "6. Awards & Recognition" },
                          { id: "allies_in_impact", label: "7. Allies in Impact" },
                          { id: "transparency", label: "8. Transparency & Governance" },
                        ].map((tab) => {
                          const isActive = aboutSubTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setAboutSubTab(tab.id)}
                              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                                isActive
                                  ? "bg-[#0f2347] text-white shadow-xs"
                                  : "text-gray-600 dark:text-muted hover:text-[#0f2347] hover:bg-white dark:hover:bg-panel"
                              }`}
                            >
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Section 0: Hero Banner & Header */}
                      {(aboutSubTab === "all" || aboutSubTab === "hero") && (
                      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
                              <ImageIcon size={15} className="text-[#E8542A]" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                0. Hero Banner &amp; Header
                              </h4>
                              <span className="text-[10px] text-gray-400 font-mono">Page Top Header</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "about_hero"}
                            onClick={() => handleSaveSection("about_hero", "About Us Hero Banner")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "about_hero"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "about_hero" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "about_hero" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Hero Banner</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-muted mb-1">
                              Page Main Title
                            </label>
                            <input
                              type="text"
                              value={formData.title || ""}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="e.g. OUR LEGACY"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary font-semibold focus:outline-none"
                            />
                          </div>

                          <div className="space-y-4">
                            <CmsImageField
                              label="Hero Banner Background Image"
                              value={formData.bannerImage || ""}
                              onChange={(url) => setFormData({ ...formData, bannerImage: url })}
                              recommendedDimensions="1920 × 600 px · Max 5MB"
                              placeholder="Upload banner image or enter custom URL..."
                            />

                            <CmsVideoField
                              label="Hero Banner Video (Optional)"
                              value={formData.bannerVideo || ""}
                              onChange={(url) => setFormData({ ...formData, bannerVideo: url })}
                              recommended="MP4 / WebM video URL · Takes priority over image in hero background"
                              placeholder="Paste video URL (e.g. /uploads/video.mp4 or https://...)"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-muted mb-1">
                              Subtitle / Tagline
                            </label>
                            <textarea
                              rows={2}
                              value={formData.subtitle || ""}
                              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                              placeholder="A promise made in the streets of Dehradun..."
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Section 1: Sacred Promise Story */}
                      {(aboutSubTab === "all" || aboutSubTab === "sacred_promise") && (
                      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
                              <Heart size={15} className="text-[#E8542A]" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                1. The Sacred Promise Story
                              </h4>
                              <span className="text-[10px] text-gray-400 font-mono">Key: sacred_promise</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "sacred_promise"}
                            onClick={() => handleSaveSection("sacred_promise", "Sacred Promise Story")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "sacred_promise"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "sacred_promise" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "sacred_promise" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Sacred Promise</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-muted mb-1">
                              Story Narrative — Paragraph 1 (Main Story)
                            </label>
                            <textarea
                              rows={3}
                              value={getSection("sacred_promise")?.description || ""}
                              onChange={(e) =>
                                updateSection("sacred_promise", () => ({
                                  description: e.target.value,
                                }))
                              }
                              placeholder="In 2026, when we were just school students walking the quiet streets of Dehradun..."
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-bold text-[#0f2347] dark:text-blue-300">
                                Story Narrative — Paragraph 2 (Blue Highlight on Website)
                              </label>
                              <span className="text-[10px] text-[#0f2347] bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
                                Theme Blue Card Highlight
                              </span>
                            </div>
                            <textarea
                              rows={3}
                              value={getSection("sacred_promise")?.extra?.paragraph2 ?? ""}
                              onChange={(e) =>
                                updateSection("sacred_promise", (sec) => ({
                                  extra: { ...sec.extra, paragraph2: e.target.value },
                                }))
                              }
                              placeholder="When you donate, your support directly fuels these grassroots interventions across Uttarakhand..."
                              className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 text-xs text-[#0f2347] dark:text-blue-200 font-medium focus:outline-none focus:border-[#0f2347] leading-relaxed"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                              Rendered immediately after Paragraph 1 inside a styled blue quote container on the website.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Founded Year Badge
                            </label>
                            <input
                              type="text"
                              value={getSection("sacred_promise")?.extra?.year ?? ""}
                              onChange={(e) =>
                                updateSection("sacred_promise", (sec) => ({
                                  extra: { ...sec.extra, year: e.target.value },
                                }))
                              }
                              placeholder="2026"
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Badge Subtitle Text
                            </label>
                            <input
                              type="text"
                              value={getSection("sacred_promise")?.extra?.badgeText ?? ""}
                              onChange={(e) =>
                                updateSection("sacred_promise", (sec) => ({
                                  extra: { ...sec.extra, badgeText: e.target.value },
                                }))
                              }
                              placeholder="Born of Student Empathy"
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        <CmsImageField
                          label="Sacred Promise Story Feature Photo"
                          value={getSection("sacred_promise")?.image || ""}
                          onChange={(url) =>
                            updateSection("sacred_promise", () => ({ image: url }))
                          }
                          recommendedDimensions="800 × 600 px · Max 5MB"
                          placeholder="Upload story image or paste URL..."
                        />
                      </div>
                      )}

                      {/* Section 2: Vision & Mission */}
                      {(aboutSubTab === "all" || aboutSubTab === "vision_mission") && (
                      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
                              <Eye size={15} className="text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                2. Vision &amp; Mission Statements
                              </h4>
                              <span className="text-[10px] text-gray-400 font-mono">Key: vision_mission</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "vision_mission"}
                            onClick={() => handleSaveSection("vision_mission", "Vision & Mission")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "vision_mission"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "vision_mission" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "vision_mission" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Vision & Mission</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase">
                              Our Vision Statement
                            </label>
                            <textarea
                              rows={4}
                              value={getSection("vision_mission")?.extra?.vision || ""}
                              onChange={(e) =>
                                updateSection("vision_mission", (sec) => ({
                                  extra: { ...sec.extra, vision: e.target.value },
                                }))
                              }
                              placeholder="Seva India Foundation envisions a Uttarakhand..."
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase">
                              Our Mission Statement
                            </label>
                            <textarea
                              rows={4}
                              value={getSection("vision_mission")?.extra?.mission || ""}
                              onChange={(e) =>
                                updateSection("vision_mission", (sec) => ({
                                  extra: { ...sec.extra, mission: e.target.value },
                                }))
                              }
                              placeholder="Aligned with the vision of a poverty-free India..."
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Section 3: Areas of Focus */}
                      {(aboutSubTab === "all" || aboutSubTab === "areas_of_focus") && (
                      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                              <Check size={15} className="text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                3. Areas of Focus Cards
                              </h4>
                              <span className="text-[10px] text-gray-400 font-mono">Key: areas_of_focus</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "areas_of_focus"}
                            onClick={() => handleSaveSection("areas_of_focus", "Areas of Focus")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "areas_of_focus"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "areas_of_focus" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "areas_of_focus" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Focus Areas</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Section Title
                            </label>
                            <input
                              type="text"
                              value={getSection("areas_of_focus")?.title ?? ""}
                              onChange={(e) =>
                                updateSection("areas_of_focus", () => ({ title: e.target.value }))
                              }
                              placeholder="AREAS OF FOCUS"
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Section Subtitle
                            </label>
                            <input
                              type="text"
                              value={getSection("areas_of_focus")?.subtitle ?? ""}
                              onChange={(e) =>
                                updateSection("areas_of_focus", () => ({ subtitle: e.target.value }))
                              }
                              placeholder="Our organization's efforts are concentrated on these key areas."
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Focus Cards ({((getSection("areas_of_focus")?.items as any[]) || []).length})
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const items = [...((getSection("areas_of_focus")?.items as any[]) || [])];
                                items.push({
                                  title: "NEW FOCUS AREA",
                                  desc: "Description of the focus area and mission impact.",
                                });
                                updateSection("areas_of_focus", () => ({ items }));
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-[11px] font-bold rounded-lg transition-colors"
                            >
                              <Plus size={12} />
                              Add Focus Area
                            </button>
                          </div>

                          {(((getSection("areas_of_focus")?.items as any[]) || []).length === 0) ? (
                            <p className="text-xs text-gray-400 italic p-3 bg-white dark:bg-panel rounded-xl">
                              Using default 5 focus areas (Women Empowerment, Senior Citizen Welfare, Youth Development, Rural Development, Leprosy Support). Click &ldquo;Add Focus Area&rdquo; to customize.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {((getSection("areas_of_focus")?.items as any[]) || []).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="p-3.5 bg-white dark:bg-panel rounded-xl border border-gray-200 dark:border-border space-y-2 relative"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <input
                                      type="text"
                                      value={item.title || ""}
                                      onChange={(e) => {
                                        const items = [...((getSection("areas_of_focus")?.items as any[]) || [])];
                                        items[idx] = { ...items[idx], title: e.target.value };
                                        updateSection("areas_of_focus", () => ({ items }));
                                      }}
                                      placeholder="Focus Area Title (e.g. WOMEN EMPOWERMENT)"
                                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const items = ((getSection("areas_of_focus")?.items as any[]) || []).filter((_, i) => i !== idx);
                                        updateSection("areas_of_focus", () => ({ items }));
                                      }}
                                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                      title="Delete focus card"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={item.desc || ""}
                                    onChange={(e) => {
                                      const items = [...((getSection("areas_of_focus")?.items as any[]) || [])];
                                      items[idx] = { ...items[idx], desc: e.target.value };
                                      updateSection("areas_of_focus", () => ({ items }));
                                    }}
                                    placeholder="Focus area description..."
                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      )}

                      {/* Section 4: Stewards / Leadership */}
                      {(aboutSubTab === "all" || aboutSubTab === "leadership") && (
                      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/40 flex items-center justify-center">
                              <Users size={15} className="text-teal-700" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                4. Stewards of the Mission / Leadership
                              </h4>
                              <span className="text-[10px] text-gray-400 font-mono">Key: leadership</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "leadership"}
                            onClick={() => handleSaveSection("leadership", "Stewards of the Mission")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "leadership"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "leadership" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "leadership" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Leadership</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Section Title
                            </label>
                            <input
                              type="text"
                              value={getSection("leadership")?.title ?? ""}
                              onChange={(e) =>
                                updateSection("leadership", () => ({ title: e.target.value }))
                              }
                              placeholder="STEWARDS OF THE MISSION"
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Section Subtitle
                            </label>
                            <input
                              type="text"
                              value={getSection("leadership")?.subtitle ?? ""}
                              onChange={(e) =>
                                updateSection("leadership", () => ({ subtitle: e.target.value }))
                              }
                              placeholder="Our leadership is a blend of seasoned social architects and corporate experts, all united by a singular commitment to ethical service."
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Leaders List with Avatar Upload */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Team Members &amp; Stewards ({((getSection("leadership")?.items as any[]) || []).length})
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const items = [...((getSection("leadership")?.items as any[]) || [])];
                                items.push({
                                  name: "NEW LEADER",
                                  role: "BOARD MEMBER / ADVISOR",
                                  initials: "NL",
                                  image: "",
                                });
                                updateSection("leadership", () => ({ items }));
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-[11px] font-bold rounded-lg transition-colors"
                            >
                              <Plus size={12} />
                              Add Leader
                            </button>
                          </div>

                          {(((getSection("leadership")?.items as any[]) || []).length === 0) ? (
                            <p className="text-xs text-gray-400 italic p-3 bg-white dark:bg-panel rounded-xl">
                              Using default stewards (Pravesh Uniyal, Swati, Dr. Rajesh Kumar). Click &ldquo;Add Leader&rdquo; to customize or upload images.
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {((getSection("leadership")?.items as any[]) || []).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="p-4 bg-white dark:bg-panel rounded-xl border border-gray-200 dark:border-border space-y-3"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                      <input
                                        type="text"
                                        value={item.name || ""}
                                        onChange={(e) => {
                                          const items = [...((getSection("leadership")?.items as any[]) || [])];
                                          items[idx] = { ...items[idx], name: e.target.value };
                                          updateSection("leadership", () => ({ items }));
                                        }}
                                        placeholder="Full Name (e.g. PRAVESH UNIYAL)"
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={item.role || ""}
                                        onChange={(e) => {
                                          const items = [...((getSection("leadership")?.items as any[]) || [])];
                                          items[idx] = { ...items[idx], role: e.target.value };
                                          updateSection("leadership", () => ({ items }));
                                        }}
                                        placeholder="Role / Designation (e.g. FOUNDER & CHAIRMAN)"
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={item.initials || ""}
                                        onChange={(e) => {
                                          const items = [...((getSection("leadership")?.items as any[]) || [])];
                                          items[idx] = { ...items[idx], initials: e.target.value };
                                          updateSection("leadership", () => ({ items }));
                                        }}
                                        placeholder="Initials fallback (e.g. PU)"
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs font-mono uppercase text-[#0f2347] dark:text-text-primary focus:outline-none"
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const items = ((getSection("leadership")?.items as any[]) || []).filter((_, i) => i !== idx);
                                        updateSection("leadership", () => ({ items }));
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors shrink-0"
                                      title="Delete leader"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>

                                  {/* Leader Photo Upload */}
                                  <CmsImageField
                                    label={`Photo for ${item.name || "Leader"}`}
                                    value={item.image || ""}
                                    onChange={(url) => {
                                      const items = [...((getSection("leadership")?.items as any[]) || [])];
                                      items[idx] = { ...items[idx], image: url };
                                      updateSection("leadership", () => ({ items }));
                                    }}
                                    recommendedDimensions="Square avatar · 400 × 400 px · Optional (fallback initials PU/S/RK used if empty)"
                                    placeholder="Upload leader photo or enter image URL..."
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      )}

                      {/* Section 5: The Stewardship of Your Trust */}
                      {(aboutSubTab === "all" || aboutSubTab === "trust_stewardship") && (
                      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                              <Percent size={15} className="text-amber-700" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                5. The Stewardship of Your Trust &amp; Fund Allocation
                              </h4>
                              <span className="text-[10px] text-gray-400 font-mono">Key: trust_stewardship</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "trust_stewardship"}
                            onClick={() => handleSaveSection("trust_stewardship", "Stewardship of Trust")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "trust_stewardship"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "trust_stewardship" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "trust_stewardship" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Trust Section</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Section Title
                            </label>
                            <input
                              type="text"
                              value={getSection("trust_stewardship")?.title ?? ""}
                              onChange={(e) =>
                                updateSection("trust_stewardship", () => ({ title: e.target.value }))
                              }
                              placeholder="THE STEWARDSHIP OF YOUR TRUST"
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Section Lead Description
                            </label>
                            <textarea
                              rows={3}
                              value={getSection("trust_stewardship")?.description ?? ""}
                              onChange={(e) =>
                                updateSection("trust_stewardship", () => ({ description: e.target.value }))
                              }
                              placeholder="At Seva India Foundation, trust isn't a promise—it's a practice. Your donation is 100% safe with us, and we ensure it reaches the ground where it is needed most, with 100% updates sent to you via WhatsApp and email."
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                            />
                          </div>

                          {/* Breakdown Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {/* Program Support */}
                            <div className="p-3.5 bg-white dark:bg-panel rounded-xl border border-gray-200 dark:border-border space-y-2">
                              <span className="text-[11px] font-bold text-[#E8542A] uppercase">Left Card (Direct Program)</span>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={getSection("trust_stewardship")?.extra?.programSupportPercent ?? ""}
                                  onChange={(e) =>
                                    updateSection("trust_stewardship", (sec) => ({
                                      extra: { ...sec.extra, programSupportPercent: e.target.value },
                                    }))
                                  }
                                  placeholder="90%"
                                  className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={getSection("trust_stewardship")?.extra?.programSupportTitle ?? ""}
                                  onChange={(e) =>
                                    updateSection("trust_stewardship", (sec) => ({
                                      extra: { ...sec.extra, programSupportTitle: e.target.value },
                                    }))
                                  }
                                  placeholder="DIRECT PROGRAM SUPPORT"
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                                />
                              </div>
                              <textarea
                                rows={2}
                                value={getSection("trust_stewardship")?.extra?.programSupportDesc ?? ""}
                                onChange={(e) =>
                                  updateSection("trust_stewardship", (sec) => ({
                                    extra: { ...sec.extra, programSupportDesc: e.target.value },
                                  }))
                                }
                                placeholder="Goes directly to funding our on-the-ground projects, resources, and beneficiary aid."
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                              />
                            </div>

                            {/* Admin & Fundraising */}
                            <div className="p-3.5 bg-white dark:bg-panel rounded-xl border border-gray-200 dark:border-border space-y-2">
                              <span className="text-[11px] font-bold text-[#0f2347] dark:text-text-primary uppercase">Right Card (Admin &amp; Fundraising)</span>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={getSection("trust_stewardship")?.extra?.adminPercent ?? ""}
                                  onChange={(e) =>
                                    updateSection("trust_stewardship", (sec) => ({
                                      extra: { ...sec.extra, adminPercent: e.target.value },
                                    }))
                                  }
                                  placeholder="10%"
                                  className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={getSection("trust_stewardship")?.extra?.adminTitle ?? ""}
                                  onChange={(e) =>
                                    updateSection("trust_stewardship", (sec) => ({
                                      extra: { ...sec.extra, adminTitle: e.target.value },
                                    }))
                                  }
                                  placeholder="ADMIN & FUNDRAISING"
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                                />
                              </div>
                              <textarea
                                rows={2}
                                value={getSection("trust_stewardship")?.extra?.adminDesc ?? ""}
                                onChange={(e) =>
                                  updateSection("trust_stewardship", (sec) => ({
                                    extra: { ...sec.extra, adminDesc: e.target.value },
                                  }))
                                }
                                placeholder="Essential operations, technology, and compliance to ensure radical transparency."
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Section 6: Awards & Recognition */}
                      {(aboutSubTab === "all" || aboutSubTab === "awards_recognition") && (
                      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-950/40 flex items-center justify-center">
                              <Award size={15} className="text-yellow-700" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                6. Awards &amp; Recognition
                              </h4>
                              <span className="text-[10px] text-gray-400 font-mono">Key: awards_recognition</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "awards_recognition"}
                            onClick={() => handleSaveSection("awards_recognition", "Awards & Recognition")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "awards_recognition"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "awards_recognition" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "awards_recognition" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Awards</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Section Title
                            </label>
                            <input
                              type="text"
                              value={getSection("awards_recognition")?.title ?? ""}
                              onChange={(e) =>
                                updateSection("awards_recognition", () => ({ title: e.target.value }))
                              }
                              placeholder="Awards & Recognition"
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Optional Subtitle
                            </label>
                            <input
                              type="text"
                              value={getSection("awards_recognition")?.subtitle || ""}
                              onChange={(e) =>
                                updateSection("awards_recognition", () => ({ subtitle: e.target.value }))
                              }
                              placeholder="Optional subtitle..."
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Awards Items */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Award Badges ({((getSection("awards_recognition")?.items as any[]) || []).length})
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const items = [...((getSection("awards_recognition")?.items as any[]) || [])];
                                items.push({ title: "NEW EXCELLENCE AWARD" });
                                updateSection("awards_recognition", () => ({ items }));
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-[11px] font-bold rounded-lg transition-colors"
                            >
                              <Plus size={12} />
                              Add Award
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {((getSection("awards_recognition")?.items as any[]) || []).map((item, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-white dark:bg-panel rounded-xl border border-gray-200 dark:border-border flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <Award size={16} className="text-[#f5a623] shrink-0" />
                                  <input
                                    type="text"
                                    value={item.title || ""}
                                    onChange={(e) => {
                                      const items = [...((getSection("awards_recognition")?.items as any[]) || [])];
                                      items[idx] = { ...items[idx], title: e.target.value };
                                      updateSection("awards_recognition", () => ({ items }));
                                    }}
                                    placeholder="Award Title (e.g. BEST NGO FOR EDUCATION)"
                                    className="w-full px-2.5 py-1 rounded-lg border border-gray-200 dark:border-border text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const items = ((getSection("awards_recognition")?.items as any[]) || []).filter((_, i) => i !== idx);
                                    updateSection("awards_recognition", () => ({ items }));
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                  title="Delete award"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Section 7: Allies in Impact */}
                      {(aboutSubTab === "all" || aboutSubTab === "allies_in_impact") && (
                      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-950/40 flex items-center justify-center">
                              <HeartHandshake size={15} className="text-pink-600" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                7. Allies in Impact (Dev Bhoomi Samiti)
                              </h4>
                              <span className="text-[10px] text-gray-400 font-mono">Key: allies_in_impact</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "allies_in_impact"}
                            onClick={() => handleSaveSection("allies_in_impact", "Allies in Impact")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "allies_in_impact"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "allies_in_impact" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "allies_in_impact" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Allies</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Section Title
                            </label>
                            <input
                              type="text"
                              value={getSection("allies_in_impact")?.title ?? ""}
                              onChange={(e) =>
                                updateSection("allies_in_impact", () => ({ title: e.target.value }))
                              }
                              placeholder="ALLIES IN IMPACT"
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Section Subtitle
                            </label>
                            <input
                              type="text"
                              value={getSection("allies_in_impact")?.subtitle ?? ""}
                              onChange={(e) =>
                                updateSection("allies_in_impact", () => ({ subtitle: e.target.value }))
                              }
                              placeholder="Powered by organizations that prioritize direct, ground-level action over corporate lip-service."
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {/* Left Card: DEV BHOOMI SAMITI */}
                          <div className="p-4 bg-white dark:bg-panel rounded-xl border border-gray-200 dark:border-border space-y-3">
                            <span className="text-[11px] font-bold text-[#f5a623] uppercase">Principal Patron Card</span>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Partner Organization Name</label>
                              <input
                                type="text"
                                value={getSection("allies_in_impact")?.extra?.partnerName ?? ""}
                                onChange={(e) =>
                                  updateSection("allies_in_impact", (sec) => ({
                                    extra: { ...sec.extra, partnerName: e.target.value },
                                  }))
                                }
                                placeholder="DEV BHOOMI SAMITI"
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Strategic Pillar Narrative</label>
                              <textarea
                                rows={3}
                                value={getSection("allies_in_impact")?.extra?.partnerPillar ?? ""}
                                onChange={(e) =>
                                  updateSection("allies_in_impact", (sec) => ({
                                    extra: { ...sec.extra, partnerPillar: e.target.value },
                                  }))
                                }
                                placeholder="Strategic Pillar: The immense contribution of Dev Bhoomi Samiti is what makes our mission possible. As our principal patron, they provide the visionary leadership and total support that fuels every project, every camp, and every life we touch."
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Official Website Link</label>
                              <input
                                type="text"
                                value={getSection("allies_in_impact")?.extra?.partnerWebsiteUrl ?? ""}
                                onChange={(e) =>
                                  updateSection("allies_in_impact", (sec) => ({
                                    extra: { ...sec.extra, partnerWebsiteUrl: e.target.value },
                                  }))
                                }
                                placeholder="https://devbhoomisamiti.org"
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-mono"
                              />
                            </div>
                          </div>

                          {/* Right Card: Foundation Core Strength */}
                          <div className="p-4 bg-white dark:bg-panel rounded-xl border border-gray-200 dark:border-border space-y-3">
                            <span className="text-[11px] font-bold text-[#0f2347] dark:text-text-primary uppercase">Core Strength Card</span>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Card Title</label>
                              <input
                                type="text"
                                value={getSection("allies_in_impact")?.extra?.coreStrengthTitle ?? ""}
                                onChange={(e) =>
                                  updateSection("allies_in_impact", (sec) => ({
                                    extra: { ...sec.extra, coreStrengthTitle: e.target.value },
                                  }))
                                }
                                placeholder="FOUNDATION'S CORE STRENGTH"
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Operational Model Narrative</label>
                              <textarea
                                rows={3}
                                value={getSection("allies_in_impact")?.extra?.coreStrengthDesc ?? ""}
                                onChange={(e) =>
                                  updateSection("allies_in_impact", (sec) => ({
                                    extra: { ...sec.extra, coreStrengthDesc: e.target.value },
                                  }))
                                }
                                placeholder="Our operational model is built on the immense contribution and full visionary backing of Dev Bhoomi Samiti. This unique alliance allows us to focus 100% of our energy on ground-level implementation, ensuring that every resource is utilized for maximum social impact."
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status Label</label>
                                <input
                                  type="text"
                                  value={getSection("allies_in_impact")?.extra?.partnershipStatusLabel ?? ""}
                                  onChange={(e) =>
                                    updateSection("allies_in_impact", (sec) => ({
                                      extra: { ...sec.extra, partnershipStatusLabel: e.target.value },
                                    }))
                                  }
                                  placeholder="PARTNERSHIP STATUS"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status Value</label>
                                <input
                                  type="text"
                                  value={getSection("allies_in_impact")?.extra?.partnershipStatusValue ?? ""}
                                  onChange={(e) =>
                                    updateSection("allies_in_impact", (sec) => ({
                                      extra: { ...sec.extra, partnershipStatusValue: e.target.value },
                                    }))
                                  }
                                  placeholder="CORE STRATEGIC ALLIANCE"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Section 8: 100% Transparency & Governance Compliance */}
                      {(aboutSubTab === "all" || aboutSubTab === "transparency") && (
                      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                              <ShieldCheck size={15} className="text-blue-700" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                8. 100% Transparency &amp; Governance Compliance Box
                              </h4>
                              <span className="text-[10px] text-gray-400 font-mono">Key: transparency</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={savingSectionKey === "transparency"}
                            onClick={() => handleSaveSection("transparency", "100% Transparency & Governance")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              savedSectionKey === "transparency"
                                ? "bg-emerald-500 text-white"
                                : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                            }`}
                          >
                            {savingSectionKey === "transparency" ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : savedSectionKey === "transparency" ? (
                              <>
                                <Check size={13} />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                <span>Save Transparency</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Section Headline
                            </label>
                            <input
                              type="text"
                              value={getSection("transparency")?.title ?? ""}
                              onChange={(e) =>
                                updateSection("transparency", () => ({ title: e.target.value }))
                              }
                              placeholder="100% TRANSPARENT & ACCOUNTABLE"
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                              Section Description
                            </label>
                            <textarea
                              rows={2}
                              value={getSection("transparency")?.description ?? ""}
                              onChange={(e) =>
                                updateSection("transparency", () => ({ description: e.target.value }))
                              }
                              placeholder="At Seva India Foundation, trust isn't a promise—it's a practice. As a registered Section 8 NGO, we protect your trust through meticulous accountability and radical transparency."
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                            />
                          </div>
                        </div>

                        {/* 4 Compliance Data Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                              NGO Darpan ID
                            </label>
                            <input
                              type="text"
                              value={getSection("transparency")?.extra?.darpanId ?? ""}
                              onChange={(e) =>
                                updateSection("transparency", (sec) => ({
                                  extra: { ...sec.extra, darpanId: e.target.value },
                                }))
                              }
                              placeholder="UK/2026/0993905"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs font-mono font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                              CIN Number
                            </label>
                            <input
                              type="text"
                              value={getSection("transparency")?.extra?.cin ?? ""}
                              onChange={(e) =>
                                updateSection("transparency", (sec) => ({
                                  extra: { ...sec.extra, cin: e.target.value },
                                }))
                              }
                              placeholder="U88900UT2026NPL020825"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs font-mono font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                              Tax Exemption
                            </label>
                            <input
                              type="text"
                              value={getSection("transparency")?.extra?.taxExemption ?? ""}
                              onChange={(e) =>
                                updateSection("transparency", (sec) => ({
                                  extra: { ...sec.extra, taxExemption: e.target.value },
                                }))
                              }
                              placeholder="80G & 12A"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs font-semibold text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                              Legal Status
                            </label>
                            <input
                              type="text"
                              value={getSection("transparency")?.extra?.legalStatus ?? ""}
                              onChange={(e) =>
                                updateSection("transparency", (sec) => ({
                                  extra: { ...sec.extra, legalStatus: e.target.value },
                                }))
                              }
                              placeholder="Section 8 Company"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs font-semibold text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Unified Bottom Save Bar for About Us */}
                      <div className="p-4 rounded-2xl bg-[#0f2347] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg sticky bottom-4 z-20">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-xl bg-[#E8542A] flex items-center justify-center shrink-0">
                            <Save size={20} className="text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Save All About Us Sections</h4>
                            <p className="text-xs text-gray-300">
                              One-click save: Updates all narrative, leadership, focus areas, allies, and compliance data live on website.
                            </p>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#E8542A] hover:bg-[#d4431b] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Saving Live Data...</span>
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              <span>Save All About Us Sections</span>
                            </>
                          )}
                        </button>
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
                            Our Work &amp; Initiatives Management
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Configure page hero banner, core pillars, lead paragraphs, imagery, alt tags, FAQs, and impact metrics.
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
                            setOurWorkSubTab(newKey);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                          Add Initiative
                        </button>
                      </div>

                      {/* Our Work Section Navigation Sub-Tabs */}
                      <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-bg rounded-xl border border-gray-200 dark:border-border overflow-x-auto shadow-xs">
                        {[
                          { id: "all", label: "All Initiatives & Banner" },
                          { id: "hero", label: "0. Hero Banner & Header" },
                          ...(formData.sections || []).map((sec, idx) => ({
                            id: sec.key || String(idx),
                            label: `${idx + 1}. ${sec.title || sec.name || `Initiative ${idx + 1}`}`,
                            rawSec: sec,
                            idx,
                          })),
                        ].map((tab: any) => {
                          const isActive = ourWorkSubTab === tab.id;
                          return (
                            <div key={tab.id} className="relative inline-flex items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setOurWorkSubTab(tab.id);
                                  if (tab.idx !== undefined) {
                                    setActiveInitiativeIndex(tab.idx);
                                  }
                                }}
                                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                                  isActive
                                    ? "bg-[#0f2347] text-white shadow-xs"
                                    : "text-gray-600 dark:text-muted hover:text-[#0f2347] hover:bg-white dark:hover:bg-panel"
                                }`}
                              >
                                <span>{tab.label}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Section 0: Hero Banner & Header */}
                      {(ourWorkSubTab === "all" || ourWorkSubTab === "hero") && (
                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
                                <ImageIcon size={15} className="text-[#E8542A]" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                  0. Hero Banner &amp; Header
                                </h4>
                                <span className="text-[10px] text-gray-400 font-mono">Our Work Top Banner</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={savingSectionKey === "our_work_hero"}
                              onClick={() => handleSaveSection("our_work_hero", "Our Work Hero Banner")}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                                savedSectionKey === "our_work_hero"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                              }`}
                            >
                              {savingSectionKey === "our_work_hero" ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : savedSectionKey === "our_work_hero" ? (
                                <>
                                  <Check size={13} />
                                  <span>Saved!</span>
                                </>
                              ) : (
                                <>
                                  <Save size={13} />
                                  <span>Save Hero Banner</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 dark:text-muted mb-1">
                                Page Main Title
                              </label>
                              <input
                                type="text"
                                value={formData.title || ""}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. OUR WORK & IMPACT"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary font-semibold focus:outline-none"
                              />
                            </div>

                            <div className="space-y-4">
                              <CmsImageField
                                label="Hero Banner Background Image"
                                value={formData.bannerImage || ""}
                                onChange={(url) => setFormData({ ...formData, bannerImage: url })}
                                recommendedDimensions="1920 × 600 px · Max 5MB"
                                placeholder="Upload banner image or enter custom URL..."
                              />

                              <CmsVideoField
                                label="Hero Banner Video (Optional)"
                                value={formData.bannerVideo || ""}
                                onChange={(url) => setFormData({ ...formData, bannerVideo: url })}
                                recommended="MP4 / WebM video URL · Takes priority over image in hero background"
                                placeholder="Paste video URL (e.g. /uploads/video.mp4 or https://...)"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 dark:text-muted mb-1">
                                Subtitle / Tagline
                              </label>
                              <textarea
                                rows={2}
                                value={formData.subtitle || ""}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="Transforming communities through dedicated grassroots initiatives across Uttarakhand and beyond."
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Initiative Sections List / Selected Initiative */}
                      {(() => {
                        const sectionsList = formData.sections || [];
                        const displayList =
                          ourWorkSubTab === "all"
                            ? sectionsList.map((sec, idx) => ({ sec, idx }))
                            : ourWorkSubTab === "hero"
                            ? []
                            : sectionsList
                                .map((sec, idx) => ({ sec, idx }))
                                .filter((item) => (item.sec.key || String(item.idx)) === ourWorkSubTab);

                        return displayList.map(({ sec, idx }) => {
                          const updateCurrentSec = (partial: Partial<CmsSection>) => {
                            const updated = [...(formData.sections || [])];
                            updated[idx] = {
                              ...updated[idx],
                              ...partial,
                            };
                            setFormData({ ...formData, sections: updated });
                          };

                          const updateExtra = (partialExtra: Record<string, any>) => {
                            const updated = [...(formData.sections || [])];
                            updated[idx] = {
                              ...updated[idx],
                              extra: {
                                ...(updated[idx].extra || {}),
                                ...partialExtra,
                              },
                            };
                            setFormData({ ...formData, sections: updated });
                          };

                          const isThisDeleting =
                            isDeletingInitiative &&
                            deletingInitiativeKey === (sec.key || String(idx));

                          return (
                            <div
                              key={sec.key || idx}
                              className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-5 shadow-sm"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-border">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
                                    <Layout size={15} className="text-[#E8542A]" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                      {idx + 1}. {sec.name || sec.title || `Initiative ${idx + 1}`}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 font-mono">Key: {sec.key || `initiative-${idx}`}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={savingSectionKey === sec.key}
                                    onClick={() => handleSaveSection(sec.key, sec.title || sec.name)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                                      savedSectionKey === sec.key
                                        ? "bg-emerald-500 text-white"
                                        : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                                    }`}
                                  >
                                    {savingSectionKey === sec.key ? (
                                      <>
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>Saving...</span>
                                      </>
                                    ) : savedSectionKey === sec.key ? (
                                      <>
                                        <Check size={13} />
                                        <span>Saved!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Save size={13} />
                                        <span>Save This Initiative</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isDeletingInitiative}
                                    onClick={() => handleDeleteInitiative(sec, idx)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                                  >
                                    {isThisDeleting ? (
                                      <>
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>Deleting...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 size={13} />
                                        <span>Delete</span>
                                      </>
                                    )}
                                  </button>
                                </div>
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
                                    value={sec.extra?.eyebrow ?? ""}
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
                                  Initiative Photo &amp; SEO Alt Tag
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                  <CmsImageField
                                    label="Initiative Cover Photo"
                                    value={sec.image || ""}
                                    onChange={(url) => updateCurrentSec({ image: url })}
                                    recommendedDimensions="800 × 600 px · Max 5MB"
                                    placeholder="Upload image or enter custom URL..."
                                  />
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-muted mb-2">
                                      Image Alt Tag (SEO &amp; Accessibility)
                                    </label>
                                    <input
                                      type="text"
                                      value={sec.extra?.alt || ""}
                                      onChange={(e) => updateExtra({ alt: e.target.value })}
                                      placeholder="e.g. Children smiling in rural bridge school"
                                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-panel text-xs text-slate-900 dark:text-text-primary placeholder:text-slate-400 focus:outline-none focus:border-slate-800 font-medium"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">
                                      Displayed to search engines and shown as text fallback if the image is missing.
                                    </p>
                                  </div>
                                </div>
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
                                    className="text-[11px] text-[#E8542A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
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
                                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
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
                        });
                      })()}

                      {/* Unified Bottom Save Bar for Our Work */}
                      <div className="p-4 rounded-2xl bg-[#0f2347] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg sticky bottom-4 z-20">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-xl bg-[#E8542A] flex items-center justify-center shrink-0">
                            <Save size={20} className="text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Save All Initiatives</h4>
                            <p className="text-xs text-gray-300">
                              One-click save: Updates all initiatives, photos, FAQs, and impact metrics instantly.
                            </p>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#E8542A] hover:bg-[#d4431b] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Saving Live Data...</span>
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              <span>Save All Initiatives</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2.6 Get Involved / Volunteers CMS */}
                  {activeSlug === "get-involved" && (
                    <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-6 shadow-sm space-y-8">
                      <div className="border-b border-gray-100 dark:border-border pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary flex items-center gap-2">
                              <HeartHandshake size={16} className="text-[#E8542A]" />
                              Get Involved &amp; Volunteers — Section-wise Content Manager
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Manage volunteer recruitment hero banner, live impact statistics, volunteer culture/perks, and FAQ accordion.
                            </p>
                          </div>
                          <span className="text-xs bg-orange-50 text-[#E8542A] border border-orange-200 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 self-start sm:self-auto">
                            <span className="w-2 h-2 rounded-full bg-[#E8542A] animate-pulse" />
                            4 Sections Active
                          </span>
                        </div>
                      </div>

                      {/* Get Involved Sub-Tabs */}
                      <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-bg rounded-xl border border-gray-200 dark:border-border overflow-x-auto shadow-xs">
                        {[
                          { id: "all", label: "All Sections" },
                          { id: "hero", label: "1. Hero Banner & Header" },
                          { id: "impact_numbers", label: "2. Impact Numbers" },
                          { id: "volunteer_perks", label: "3. Volunteer Perks & Culture" },
                          { id: "faqs", label: "4. Frequently Asked Questions" },
                        ].map((tab) => {
                          const isActive = getInvolvedSubTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setGetInvolvedSubTab(tab.id)}
                              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                                isActive
                                  ? "bg-[#0f2347] text-white shadow-xs"
                                  : "text-gray-600 dark:text-muted hover:text-[#0f2347] hover:bg-white dark:hover:bg-panel"
                              }`}
                            >
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Section 1: Hero Banner & Header */}
                      {(getInvolvedSubTab === "all" || getInvolvedSubTab === "hero") && (
                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
                                <ImageIcon size={15} className="text-[#E8542A]" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                  1. Hero Banner &amp; Header
                                </h4>
                                <span className="text-[10px] text-gray-400 font-mono">Top Volunteer Header</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={savingSectionKey === "get_involved_hero"}
                              onClick={() => handleSaveSection("get_involved_hero", "Get Involved Hero Banner")}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                                savedSectionKey === "get_involved_hero"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                              }`}
                            >
                              {savingSectionKey === "get_involved_hero" ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : savedSectionKey === "get_involved_hero" ? (
                                <>
                                  <Check size={13} />
                                  <span>Saved!</span>
                                </>
                              ) : (
                                <>
                                  <Save size={13} />
                                  <span>Save Hero Banner</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 dark:text-muted mb-1">
                                Main Catchy Title
                              </label>
                              <input
                                type="text"
                                value={formData.title || ""}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Your time is the most valuable thing you can give"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary font-semibold focus:outline-none"
                              />
                            </div>

                            <div className="space-y-4">
                              <CmsImageField
                                label="Hero Banner Background Image"
                                value={formData.bannerImage || ""}
                                onChange={(url) => setFormData({ ...formData, bannerImage: url })}
                                recommendedDimensions="1920 × 700 px · Max 5MB"
                                placeholder="Upload volunteer hero photo..."
                              />

                              <CmsVideoField
                                label="Hero Banner Video (Optional)"
                                value={formData.bannerVideo || ""}
                                onChange={(url) => setFormData({ ...formData, bannerVideo: url })}
                                recommended="MP4 / WebM video URL · Takes priority over image in hero background"
                                placeholder="Paste video URL (e.g. /uploads/video.mp4 or https://...)"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 dark:text-muted mb-1">
                                Subtitle / Mission Statement
                              </label>
                              <textarea
                                rows={2}
                                value={formData.subtitle || ""}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="We do not need your money. We need your hands, your mind, and your heart. Whether you have 2 hours or 2 years — there is a place for you here."
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 2: Impact Numbers */}
                      {(getInvolvedSubTab === "all" || getInvolvedSubTab === "impact_numbers") && (
                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                                <BarChart2 size={15} className="text-blue-600" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                  2. Impact Numbers (4 Highlight Metrics)
                                </h4>
                                <span className="text-[10px] text-gray-400 font-mono">Key: impact_numbers</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={savingSectionKey === "impact_numbers"}
                              onClick={() => handleSaveSection("impact_numbers", "Impact Numbers")}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                                savedSectionKey === "impact_numbers"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                              }`}
                            >
                              {savingSectionKey === "impact_numbers" ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : savedSectionKey === "impact_numbers" ? (
                                <>
                                  <Check size={13} />
                                  <span>Saved!</span>
                                </>
                              ) : (
                                <>
                                  <Save size={13} />
                                  <span>Save Impact Numbers</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Volunteer Statistics Cards ({getSection("impact_numbers")?.items?.length || 0})
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const curr = getSection("impact_numbers")?.items || [
                                    { number: "200+", label: "ACTIVE VOLUNTEERS", sub: "Across 8 states" },
                                    { number: "100%", label: "FIELD DIRECTED", sub: "Zero bureaucratic waste" },
                                    { number: "8+", label: "ACTIVE REGIONS", sub: "Uttarakhand to Delhi NCR" },
                                    { number: "15,000+", label: "HOURS INVESTED", sub: "Community service logged" },
                                  ];
                                  updateSection("impact_numbers", () => ({
                                    items: [...curr, { number: "100+", label: "NEW METRIC", sub: "Community reach" }],
                                  }));
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f2347] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a6b] cursor-pointer"
                              >
                                <Plus size={12} /> Add Metric Card
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {(() => {
                                const statsList = getSection("impact_numbers")?.items || [
                                  { number: "200+", label: "ACTIVE VOLUNTEERS", sub: "Across 8 states" },
                                  { number: "100%", label: "FIELD DIRECTED", sub: "Zero bureaucratic waste" },
                                  { number: "8+", label: "ACTIVE REGIONS", sub: "Uttarakhand to Delhi NCR" },
                                  { number: "15,000+", label: "HOURS INVESTED", sub: "Community service logged" },
                                ];

                                return statsList.map((st: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="p-4 bg-white dark:bg-panel rounded-xl border border-gray-200 dark:border-border space-y-2.5 shadow-sm"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-[#E8542A] uppercase">
                                        Stat #{idx + 1}
                                      </span>
                                      {statsList.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = statsList.filter((_: any, i: number) => i !== idx);
                                            updateSection("impact_numbers", () => ({ items: updated }));
                                          }}
                                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg cursor-pointer"
                                          title="Remove Stat Card"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                                        Big Number / Stat
                                      </label>
                                      <input
                                        type="text"
                                        value={st.number || ""}
                                        onChange={(e) => {
                                          const updated = [...statsList];
                                          updated[idx] = { ...updated[idx], number: e.target.value };
                                          updateSection("impact_numbers", () => ({ items: updated }));
                                        }}
                                        placeholder="200+"
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-border bg-white dark:bg-bg text-sm font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                                        Label / Heading
                                      </label>
                                      <input
                                        type="text"
                                        value={st.label || ""}
                                        onChange={(e) => {
                                          const updated = [...statsList];
                                          updated[idx] = { ...updated[idx], label: e.target.value };
                                          updateSection("impact_numbers", () => ({ items: updated }));
                                        }}
                                        placeholder="ACTIVE VOLUNTEERS"
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-border bg-white dark:bg-bg text-xs font-bold uppercase text-slate-900 dark:text-text-primary focus:outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                                        Subtitle / Caption
                                      </label>
                                      <input
                                        type="text"
                                        value={st.sub || ""}
                                        onChange={(e) => {
                                          const updated = [...statsList];
                                          updated[idx] = { ...updated[idx], sub: e.target.value };
                                          updateSection("impact_numbers", () => ({ items: updated }));
                                        }}
                                        placeholder="Across 8 states"
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-border bg-white dark:bg-bg text-xs text-slate-600 dark:text-muted focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 3: Volunteer Perks & Culture */}
                      {(getInvolvedSubTab === "all" || getInvolvedSubTab === "volunteer_perks") && (
                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                                <Award size={15} className="text-emerald-600" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                  3. Volunteer Perks &amp; Culture
                                </h4>
                                <span className="text-[10px] text-gray-400 font-mono">Key: volunteer_perks</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={savingSectionKey === "volunteer_perks"}
                              onClick={() => handleSaveSection("volunteer_perks", "Volunteer Perks")}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                                savedSectionKey === "volunteer_perks"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                              }`}
                            >
                              {savingSectionKey === "volunteer_perks" ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : savedSectionKey === "volunteer_perks" ? (
                                <>
                                  <Check size={13} />
                                  <span>Saved!</span>
                                </>
                              ) : (
                                <>
                                  <Save size={13} />
                                  <span>Save Volunteer Perks</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Volunteer Perks &amp; Growth Highlights ({getSection("volunteer_perks")?.items?.length || 0})
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const curr = getSection("volunteer_perks")?.items || [
                                    { title: "Direct Field Work", desc: "No middle layers — you work directly with rural families and children in need." },
                                    { title: "Flexible Commitment", desc: "Whether you have 2 hours a weekend or 6 months for a full sabbatical, there is an impactful role for you." },
                                    { title: "Official Certification", desc: "Receive recognized certificates, recommendation letters, and leadership credentials." },
                                    { title: "Skill Exchange", desc: "Apply and hone your professional skillsets in real-world grassroots and crisis zones." },
                                  ];
                                  updateSection("volunteer_perks", () => ({
                                    items: [...curr, { title: "NEW BENEFIT", desc: "Description of the volunteering perk." }],
                                  }));
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f2347] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a6b] cursor-pointer"
                              >
                                <Plus size={12} /> Add Perk Card
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(() => {
                                const perksList = getSection("volunteer_perks")?.items || [
                                  { title: "Direct Field Work", desc: "No middle layers — you work directly with rural families, learning centres, and children in need." },
                                  { title: "Flexible Commitment", desc: "Whether you have 2 hours a weekend or 6 months for a full sabbatical, there is an impactful role for you." },
                                  { title: "Official Certification", desc: "Receive recognized certificates, recommendation letters, and leadership credentials for your service." },
                                  { title: "Skill Exchange", desc: "Apply and hone your professional skillsets in real-world grassroots and crisis zones." },
                                ];

                                return perksList.map((pk: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="p-4 bg-white dark:bg-panel rounded-xl border border-gray-200 dark:border-border space-y-2.5 shadow-sm"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-[#E8542A] uppercase">
                                        Perk #{idx + 1}
                                      </span>
                                      {perksList.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = perksList.filter((_: any, i: number) => i !== idx);
                                            updateSection("volunteer_perks", () => ({ items: updated }));
                                          }}
                                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg cursor-pointer"
                                          title="Remove Perk"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                                        Perk Title
                                      </label>
                                      <input
                                        type="text"
                                        value={pk.title || ""}
                                        onChange={(e) => {
                                          const updated = [...perksList];
                                          updated[idx] = { ...updated[idx], title: e.target.value };
                                          updateSection("volunteer_perks", () => ({ items: updated }));
                                        }}
                                        placeholder="Direct Field Work"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-border bg-white dark:bg-bg text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                                        Perk Description
                                      </label>
                                      <textarea
                                        rows={2}
                                        value={pk.desc || ""}
                                        onChange={(e) => {
                                          const updated = [...perksList];
                                          updated[idx] = { ...updated[idx], desc: e.target.value };
                                          updateSection("volunteer_perks", () => ({ items: updated }));
                                        }}
                                        placeholder="No middle layers — you work directly with beneficiaries..."
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-border bg-white dark:bg-bg text-xs text-slate-700 dark:text-muted focus:outline-none leading-relaxed font-medium"
                                      />
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 4: Frequently Asked Questions (FAQs) */}
                      {(getInvolvedSubTab === "all" || getInvolvedSubTab === "faqs") && (
                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-200 dark:border-border space-y-4 shadow-sm">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-border">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
                                <HelpCircle size={15} className="text-indigo-600" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider">
                                  4. Frequently Asked Questions (Accordion)
                                </h4>
                                <span className="text-[10px] text-gray-400 font-mono">Key: faqs</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={savingSectionKey === "faqs"}
                              onClick={() => handleSaveSection("faqs", "Volunteer FAQs")}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                                savedSectionKey === "faqs"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-[#E8542A] hover:bg-[#d4431b] text-white"
                              }`}
                            >
                              {savingSectionKey === "faqs" ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : savedSectionKey === "faqs" ? (
                                <>
                                  <Check size={13} />
                                  <span>Saved!</span>
                                </>
                              ) : (
                                <>
                                  <Save size={13} />
                                  <span>Save Volunteer FAQs</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Volunteer FAQ Questions ({getSection("faqs")?.items?.length || 0})
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const curr = getSection("faqs")?.items || [
                                    { question: "Do I need prior experience to volunteer?", answer: "No prior experience is necessary. We provide complete orientation and ground training." },
                                    { question: "Can I volunteer remotely?", answer: "Yes! We have roles in digital education, design, curriculum writing, and fundraising that can be done online." },
                                    { question: "Will I receive a volunteer certificate?", answer: "Yes, all volunteers who complete at least 25 hours of active service receive official recognition certificates." },
                                  ];
                                  updateSection("faqs", () => ({
                                    items: [...curr, { question: "NEW QUESTION?", answer: "Answer details..." }],
                                  }));
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f2347] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a6b] cursor-pointer"
                              >
                                <Plus size={12} /> Add FAQ Question
                              </button>
                            </div>

                            {(() => {
                              const faqsList = getSection("faqs")?.items || [
                                { question: "Do I need prior experience to volunteer?", answer: "No prior experience is necessary. We provide complete orientation and ground training." },
                                { question: "Can I volunteer remotely?", answer: "Yes! We have roles in digital education, design, curriculum writing, and fundraising that can be done online." },
                                { question: "Will I receive a volunteer certificate?", answer: "Yes, all volunteers who complete at least 25 hours of active service receive official recognition certificates." },
                              ];

                              return faqsList.map((faq: any, fIndex: number) => (
                                <div key={fIndex} className="p-3.5 bg-white dark:bg-panel rounded-xl border border-slate-200 dark:border-border space-y-2.5 shadow-sm">
                                  <div className="flex items-center justify-between gap-2">
                                    <input
                                      type="text"
                                      value={faq.question || faq.q || ""}
                                      onChange={(e) => {
                                        const updated = [...faqsList];
                                        updated[fIndex] = { ...updated[fIndex], question: e.target.value, q: e.target.value };
                                        updateSection("faqs", () => ({ items: updated }));
                                      }}
                                      placeholder="DO I NEED PRIOR EXPERIENCE TO VOLUNTEER?"
                                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-border text-xs font-bold uppercase text-slate-900 dark:text-text-primary bg-white dark:bg-bg placeholder:text-slate-400 focus:outline-none"
                                    />
                                    {faqsList.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = faqsList.filter((_: any, i: number) => i !== fIndex);
                                          updateSection("faqs", () => ({ items: updated }));
                                        }}
                                        className="text-slate-400 hover:text-red-500 p-1.5 cursor-pointer"
                                        title="Delete FAQ"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={faq.answer || faq.a || ""}
                                    onChange={(e) => {
                                      const updated = [...faqsList];
                                      updated[fIndex] = { ...updated[fIndex], answer: e.target.value, a: e.target.value };
                                      updateSection("faqs", () => ({ items: updated }));
                                    }}
                                    placeholder="No prior experience is necessary. We provide complete orientation and ground training."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-border text-xs text-slate-800 dark:text-text-primary bg-white dark:bg-bg placeholder:text-slate-400 focus:outline-none leading-relaxed font-medium"
                                  />
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Unified Bottom Save Bar for Get Involved */}
                      <div className="p-4 rounded-2xl bg-[#0f2347] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg sticky bottom-4 z-20">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-xl bg-[#E8542A] flex items-center justify-center shrink-0">
                            <Save size={20} className="text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Save All Get Involved Sections</h4>
                            <p className="text-xs text-gray-300">
                              One-click save: Updates volunteer hero banner, live impact stats, volunteer perks, and FAQs live on website.
                            </p>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#E8542A] hover:bg-[#d4431b] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Saving Live Data...</span>
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              <span>Save All Get Involved Sections</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. Header Global Settings */}
                  {activeSlug === "header-footer" && (
                    <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-6 shadow-sm space-y-6">
                      <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary pb-3 border-b border-gray-100 dark:border-border flex items-center gap-2">
                        <Sparkles size={16} className="text-[#E8542A]" />
                        Header Navigation & Topbar Information
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                            Header Topbar Helpline Phone
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
                            Header Official Contact Email
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

                      {/* Social Media Links for Header */}
                      <div className="pt-4 border-t border-gray-100 dark:border-border space-y-3">
                        <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <Share2 size={14} className="text-[#E8542A]" />
                          Header Social Media Links
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

                      {/* Announcement Banner Notice */}
                      <div className="pt-4 border-t border-gray-100 dark:border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={14} className="text-[#E8542A]" />
                            Header Topbar Announcement Banner
                          </h4>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                            <input
                              type="checkbox"
                              checked={formData.settings?.announcementBanner?.enabled ?? true}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    announcementBanner: {
                                      ...formData.settings?.announcementBanner,
                                      enabled: e.target.checked,
                                    },
                                  },
                                })
                              }
                              className="rounded border-gray-300 text-[#E8542A] focus:ring-[#E8542A]"
                            />
                            <span>Show Banner</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={formData.settings?.announcementBanner?.text || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                announcementBanner: {
                                  ...formData.settings?.announcementBanner,
                                  text: e.target.value,
                                },
                              },
                            })
                          }
                          placeholder="e.g. 80G Tax Exemption available on all donations. Claim 50% deduction on your income tax."
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                        />
                      </div>

                      {/* Google Analytics & Search Console Integration */}
                      <div className="pt-5 border-t border-gray-100 dark:border-border space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-[#0f2347] dark:text-text-primary flex items-center gap-2">
                              <BarChart2 size={16} className="text-[#E8542A]" />
                              Google Analytics &amp; Google Search Console (SEO &amp; Tracking)
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Dynamically injected into the header (&lt;head&gt;) of the main public website for production analytics &amp; search verification.
                            </p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Dynamic SSR Header
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                              <BarChart2 size={13} className="text-[#E8542A]" />
                              Google Analytics Measurement ID or Tag
                            </label>
                            <input
                              type="text"
                              value={formData.settings?.googleAnalyticsId || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    googleAnalyticsId: e.target.value,
                                  },
                                })
                              }
                              placeholder="G-XXXXXXXXXX (or full gtag script)"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-xs font-mono text-[#0f2347] dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                              Enter GA4 Measurement ID (e.g. G-ABC123XYZ) or full Google tag script.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                              <Search size={13} className="text-[#E8542A]" />
                              Google Search Console Verification Code / Meta Tag
                            </label>
                            <input
                              type="text"
                              value={formData.settings?.googleConsoleCode || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    googleConsoleCode: e.target.value,
                                  },
                                })
                              }
                              placeholder='verification-token or <meta name="google-site-verification" ... />'
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-bg text-xs font-mono text-[#0f2347] dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                              Google Search Console verification meta tag token or complete tag.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Unified Bottom Save Bar for Header */}
                      <div className="p-4 rounded-2xl bg-[#0f2347] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg sticky bottom-4 z-20">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-xl bg-[#E8542A] flex items-center justify-center shrink-0">
                            <Save size={20} className="text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Save Header Settings</h4>
                            <p className="text-xs text-gray-300">
                              One-click save: Updates helpline phone, email, banner, and analytics tags live on website.
                            </p>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#E8542A] hover:bg-[#d4431b] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Saving Live Data...</span>
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              <span>Save Header Settings</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4. Footer & Legal Compliance Global Settings */}
                  {activeSlug === "footer-settings" && (
                    <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-6 shadow-sm space-y-6">
                      <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary pb-3 border-b border-gray-100 dark:border-border flex items-center gap-2">
                        <Sparkles size={16} className="text-[#E8542A]" />
                        Footer & Legal Compliance Information
                      </h3>

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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1.5">
                            Footer Contact Phone / Helpline
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
                            Footer Official Inquiries Email
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

                      {/* Social Media Links for Footer */}
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

                      {/* Unified Bottom Save Bar for Footer */}
                      <div className="p-4 rounded-2xl bg-[#0f2347] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg sticky bottom-4 z-20">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-xl bg-[#E8542A] flex items-center justify-center shrink-0">
                            <Save size={20} className="text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Save Footer Settings</h4>
                            <p className="text-xs text-gray-300">
                              One-click save: Updates address, CIN, Darpan ID, 80G tax status, and social media handles.
                            </p>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#E8542A] hover:bg-[#d4431b] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Saving Live Data...</span>
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              <span>Save Footer Settings</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 5. Legal Policies Rich Content (Terms, Privacy, Refund Policy) */}
                  {(activeSlug === "privacy" ||
                    activeSlug === "terms" ||
                    activeSlug === "refund-policy") && (
                      <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-6 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-border">
                          <div className="flex items-center gap-2">
                            <FileText size={18} className="text-[#E8542A]" />
                            <div>
                              <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary">
                                Policy Document Content Editor
                              </h3>
                              <p className="text-xs text-gray-500">
                                Format headings, bold text, lists, and paragraphs. No image uploads allowed.
                              </p>
                            </div>
                          </div>

                          {/* View mode toggle */}
                          <div className="flex items-center bg-gray-100 dark:bg-bg p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setPolicyViewMode("edit")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${policyViewMode === "edit"
                                  ? "bg-white dark:bg-panel text-[#0f2347] dark:text-text-primary shadow-xs"
                                  : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                              Rich Text Editor
                            </button>
                            <button
                              type="button"
                              onClick={() => setPolicyViewMode("preview")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${policyViewMode === "preview"
                                  ? "bg-white dark:bg-panel text-[#0f2347] dark:text-text-primary shadow-xs"
                                  : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                              Live Website Preview
                            </button>
                          </div>
                        </div>

                        {policyViewMode === "edit" ? (
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-muted">
                              Document Clauses &amp; Content (Bold, Headings, Bullets supported)
                            </label>
                            <RichTextEditor
                              value={formData.content || ""}
                              onChange={(val) => setFormData({ ...formData, content: val })}
                              hideImageUpload={true}
                              placeholder="Enter policy sections, headings, bold clauses, lists..."
                            />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-700 flex items-center justify-between">
                              <span>Live Website Replica: Exact styling matches public website view</span>
                              <span className="font-semibold uppercase tracking-wider text-[10px] bg-blue-100 px-2 py-0.5 rounded">
                                Interactive Preview
                              </span>
                            </div>
                            <div className="bg-[#f8fafc] rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-inner">
                              <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                <div className="text-center pb-6 mb-6 border-b border-slate-100">
                                  <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-[#F5A623] text-[10px] font-bold uppercase tracking-wider mb-2">
                                    Official Policy
                                  </span>
                                  <h2 className="text-2xl font-serif font-bold text-[#0A1A2F]">
                                    {formData.title || activeMeta.name}
                                  </h2>
                                  <p className="text-slate-500 text-xs mt-1">
                                    {formData.subtitle || activeMeta.description}
                                  </p>
                                </div>
                                <div
                                  className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#0A1A2F] [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#0A1A2F] [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:my-1 [&_p]:my-2"
                                  dangerouslySetInnerHTML={{
                                    __html: formData.content || "<p className='text-slate-400 italic'>No content written yet. Switch to Editor tab to add clauses.</p>",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Unified Bottom Save Bar for Policies */}
                        <div className="p-4 rounded-2xl bg-[#0f2347] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg sticky bottom-4 z-20">
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-10 h-10 rounded-xl bg-[#E8542A] flex items-center justify-center shrink-0">
                              <Save size={20} className="text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">Save Policy Document</h4>
                              <p className="text-xs text-gray-300">
                                One-click save: Updates policy clauses and publishes live to the website.
                              </p>
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full sm:w-auto px-6 py-2.5 bg-[#E8542A] hover:bg-[#d4431b] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Saving Live Data...</span>
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                <span>Save Policy Document</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
