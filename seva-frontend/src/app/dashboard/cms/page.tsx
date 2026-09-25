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
  Home as HomeIcon,
} from "lucide-react";
import { getCmsPages, getCmsPageBySlug, saveCmsPage, deleteCmsSection, uploadCmsImageFile, uploadCmsMediaFile, CmsPage, CmsSection } from "@/app/api/cms";
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
          className={`border-2 border-dashed rounded-xl p-4 transition-all text-center ${
            isDragOver
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
    description: "Topbar emergency phone, helpline, topbar socials, announcement notice",
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const activeMeta = CMS_PAGES_META.find((p) => p.slug === activeSlug) || CMS_PAGES_META[0];

  return (
    <PermissionGuard module="cms">
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 sm:p-6 lg:p-8 cms-dashboard-container">
        {/* Sticky Top Header Bar */}
        <div className="sticky top-0 z-30 bg-[#f8fafc]/95 dark:bg-bg/95 backdrop-blur-md py-3.5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-slate-200/80 dark:border-border/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
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
          <div className="lg:col-span-1 space-y-2 lg:sticky lg:top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
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
                {activeSlug !== "header-footer" && activeSlug !== "footer-settings" && activeSlug !== "home" && (
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
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-8 text-slate-900">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-sm font-bold text-[#0f2347] flex items-center gap-2">
                        <HomeIcon size={16} className="text-[#E8542A]" />
                        Home Page - Live Section-wise Content Manager
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Control Featured In media marquee, Principal Patron Dev Bhoomi Samiti, Honors &amp; Awards, and Integrity &amp; Compliance sections.
                      </p>
                    </div>

                    {/* Section 1: Featured In Media Marquee */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] uppercase tracking-wider flex items-center gap-2">
                          <Sparkles size={14} className="text-[#E8542A]" />
                          1. Featured In - Media Marquee Loop
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Key: featured_in</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Admin enters media outlet names or uploads logos. Displays as an infinite continuous marquee loop on the home page.
                      </p>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Section Heading
                        </label>
                        <input
                          type="text"
                          value={getSection("featured_in")?.title ?? "Featured In"}
                          onChange={(e) =>
                            updateSection("featured_in", () => ({
                              title: e.target.value,
                            }))
                          }
                          placeholder="Featured In"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347] focus:ring-1 focus:ring-[#0f2347]"
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
                              className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3 shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#E8542A] uppercase">
                                  Media #{idx + 1}
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

                    {/* Section 2: Principal Patron (Dev Bhoomi Samiti) */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] uppercase tracking-wider flex items-center gap-2">
                          <ShieldCheck size={14} className="text-[#E8542A]" />
                          2. Principal Patron (Dev Bhoomi Samiti)
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Key: patron_samiti</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        When the user clicks &apos;Learn More&apos; or &apos;Read More&apos;, it links directly to the About Us page section.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Pill Badge Text
                          </label>
                          <input
                            type="text"
                            value={getSection("patron_samiti")?.extra?.badgeText ?? "PRINCIPAL PATRON"}
                            onChange={(e) =>
                              updateSection("patron_samiti", (sec) => ({
                                extra: { ...sec.extra, badgeText: e.target.value },
                              }))
                            }
                            placeholder="PRINCIPAL PATRON"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Section Main Title
                          </label>
                          <input
                            type="text"
                            value={getSection("patron_samiti")?.title ?? "DEV BHOOMI SAMITI"}
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

                      <div>
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
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Button Label (CTA)
                          </label>
                          <input
                            type="text"
                            value={getSection("patron_samiti")?.extra?.buttonText ?? "Learn More"}
                            onChange={(e) =>
                              updateSection("patron_samiti", (sec) => ({
                                extra: { ...sec.extra, buttonText: e.target.value },
                              }))
                            }
                            placeholder="Learn More"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Button Destination URL
                          </label>
                          <input
                            type="text"
                            value={getSection("patron_samiti")?.extra?.buttonLink ?? "/about"}
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
                              value={getSection("patron_samiti")?.extra?.cardEyebrow ?? "OUR VISIONARY BACKBONE"}
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
                              value={getSection("patron_samiti")?.extra?.cardTitle ?? "Spiritual & Social Support"}
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

                    {/* Section 3: Honors & Global Recognition */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] uppercase tracking-wider flex items-center gap-2">
                          <Award size={14} className="text-[#E8542A]" />
                          3. Honors &amp; Global Recognition
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Key: excellence_awards</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Eyebrow Badge
                          </label>
                          <input
                            type="text"
                            value={getSection("excellence_awards")?.subtitle ?? "HONORS & GLOBAL RECOGNITION"}
                            onChange={(e) =>
                              updateSection("excellence_awards", () => ({
                                subtitle: e.target.value,
                              }))
                            }
                            placeholder="HONORS & GLOBAL RECOGNITION"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Main Heading
                          </label>
                          <input
                            type="text"
                            value={getSection("excellence_awards")?.title ?? "EXCELLENCE IN HUMAN SERVICE"}
                            onChange={(e) =>
                              updateSection("excellence_awards", () => ({
                                title: e.target.value,
                              }))
                            }
                            placeholder="EXCELLENCE IN HUMAN SERVICE"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Watermark Year Text
                          </label>
                          <input
                            type="text"
                            value={getSection("excellence_awards")?.extra?.watermarkText ?? "2026"}
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
                              className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-sm"
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

                    {/* Section 4: Integrity & Compliance */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] uppercase tracking-wider flex items-center gap-2">
                          <ShieldCheck size={14} className="text-[#E8542A]" />
                          4. Integrity &amp; Compliance Section
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Key: integrity_compliance</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Main Title
                          </label>
                          <input
                            type="text"
                            value={getSection("integrity_compliance")?.title ?? "INTEGRITY & COMPLIANCE"}
                            onChange={(e) =>
                              updateSection("integrity_compliance", () => ({
                                title: e.target.value,
                              }))
                            }
                            placeholder="INTEGRITY & COMPLIANCE"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2347]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Registered Office Title
                          </label>
                          <input
                            type="text"
                            value={getSection("integrity_compliance")?.extra?.officeTitle ?? "REGISTERED OFFICE"}
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

                      <div>
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
                                value={getSection("integrity_compliance")?.extra?.programSupportLabel ?? "DIRECT PROGRAM SUPPORT"}
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
                                value={getSection("integrity_compliance")?.extra?.programSupportPercent ?? "90%"}
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
                                value={getSection("integrity_compliance")?.extra?.adminLabel ?? "FUNDRAISING & ADMIN"}
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
                                value={getSection("integrity_compliance")?.extra?.adminPercent ?? "10%"}
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
                              value={getSection("integrity_compliance")?.extra?.darpanId ?? "UK/2026/0993905"}
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
                              value={getSection("integrity_compliance")?.extra?.cin ?? "U88900UT2026NPL020825"}
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
                              value={getSection("integrity_compliance")?.extra?.licenseNo ?? "No. 179973"}
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
                              value={getSection("integrity_compliance")?.extra?.panNumber ?? "ABSCS7219M"}
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
                              value={getSection("integrity_compliance")?.extra?.tanNumber ?? "MRTS38379F"}
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
                              value={getSection("integrity_compliance")?.extra?.complianceDocLink ?? "/about"}
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
                      <div>
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

                {activeSlug === "about" && (
                  <div className="bg-white dark:bg-panel rounded-2xl border border-gray-100 dark:border-border p-6 shadow-sm space-y-8">
                    <div className="border-b border-gray-100 dark:border-border pb-4">
                      <h3 className="text-sm font-bold text-[#0f2347] dark:text-text-primary flex items-center gap-2">
                        <FileText size={16} className="text-[#E8542A]" />
                        About Us Page - Section-wise Content Manager
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Edit each section individually. Data entered here updates dynamically on the live website.
                      </p>
                    </div>

                    {/* Section 1: Sacred Promise Story */}
                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-100 dark:border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider flex items-center gap-2">
                          <Heart size={14} className="text-[#E8542A]" />
                          1. The Sacred Promise Story
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Key: sacred_promise</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                          Story Narrative Paragraphs
                        </label>
                        <textarea
                          rows={4}
                          value={getSection("sacred_promise")?.description || ""}
                          onChange={(e) =>
                            updateSection("sacred_promise", () => ({
                              description: e.target.value,
                            }))
                          }
                          placeholder="In 2026, when we were just school students..."
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-sm text-[#0f2347] dark:text-text-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Founded Year Badge
                          </label>
                          <input
                            type="text"
                            value={getSection("sacred_promise")?.extra?.year || "2026"}
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
                            value={getSection("sacred_promise")?.extra?.badgeText || "Born of Student Empathy"}
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

                    {/* Section 2: Vision & Mission */}
                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-100 dark:border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider flex items-center gap-2">
                          <Eye size={14} className="text-[#E8542A]" />
                          2. Vision &amp; Mission Statements
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Key: vision_mission</span>
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

                    {/* Section 3: Areas of Focus (Screenshot 1) */}
                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-100 dark:border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider flex items-center gap-2">
                          <Check size={14} className="text-[#E8542A]" />
                          3. Areas of Focus Cards
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Key: areas_of_focus</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={getSection("areas_of_focus")?.title || "AREAS OF FOCUS"}
                            onChange={(e) =>
                              updateSection("areas_of_focus", () => ({ title: e.target.value }))
                            }
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Section Subtitle
                          </label>
                          <input
                            type="text"
                            value={getSection("areas_of_focus")?.subtitle || "Our organization's efforts are concentrated on these key areas."}
                            onChange={(e) =>
                              updateSection("areas_of_focus", () => ({ subtitle: e.target.value }))
                            }
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

                    {/* Section 4: Stewards / Leadership (Screenshot 2) */}
                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-100 dark:border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider flex items-center gap-2">
                          <Users size={14} className="text-[#E8542A]" />
                          4. Stewards of the Mission / Leadership (Pravesh Uniyal &amp; People)
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Key: leadership</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={getSection("leadership")?.title || "STEWARDS OF THE MISSION"}
                            onChange={(e) =>
                              updateSection("leadership", () => ({ title: e.target.value }))
                            }
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Section Subtitle
                          </label>
                          <input
                            type="text"
                            value={getSection("leadership")?.subtitle || "Our leadership is a blend of seasoned social architects and corporate experts, all united by a singular commitment to ethical service."}
                            onChange={(e) =>
                              updateSection("leadership", () => ({ subtitle: e.target.value }))
                            }
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

                    {/* Section 5: The Stewardship of Your Trust (Screenshot 3) */}
                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-100 dark:border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider flex items-center gap-2">
                          <Percent size={14} className="text-[#E8542A]" />
                          5. The Stewardship of Your Trust &amp; Fund Allocation
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Key: trust_stewardship</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={getSection("trust_stewardship")?.title || "THE STEWARDSHIP OF YOUR TRUST"}
                            onChange={(e) =>
                              updateSection("trust_stewardship", () => ({ title: e.target.value }))
                            }
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Section Lead Description
                          </label>
                          <textarea
                            rows={3}
                            value={getSection("trust_stewardship")?.description || "At Seva India Foundation, trust isn't a promise—it's a practice. Your donation is 100% safe with us, and we ensure it reaches the ground where it is needed most, with 100% updates sent to you via WhatsApp and email."}
                            onChange={(e) =>
                              updateSection("trust_stewardship", () => ({ description: e.target.value }))
                            }
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
                                value={getSection("trust_stewardship")?.extra?.programSupportPercent || "90%"}
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
                                value={getSection("trust_stewardship")?.extra?.programSupportTitle || "DIRECT PROGRAM SUPPORT"}
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
                              value={getSection("trust_stewardship")?.extra?.programSupportDesc || "Goes directly to funding our on-the-ground projects, resources, and beneficiary aid."}
                              onChange={(e) =>
                                updateSection("trust_stewardship", (sec) => ({
                                  extra: { ...sec.extra, programSupportDesc: e.target.value },
                                }))
                              }
                              placeholder="Description..."
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>

                          {/* Admin & Fundraising */}
                          <div className="p-3.5 bg-white dark:bg-panel rounded-xl border border-gray-200 dark:border-border space-y-2">
                            <span className="text-[11px] font-bold text-[#0f2347] dark:text-text-primary uppercase">Right Card (Admin &amp; Fundraising)</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={getSection("trust_stewardship")?.extra?.adminPercent || "10%"}
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
                                value={getSection("trust_stewardship")?.extra?.adminTitle || "ADMIN & FUNDRAISING"}
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
                              value={getSection("trust_stewardship")?.extra?.adminDesc || "Essential operations, technology, and compliance to ensure radical transparency."}
                              onChange={(e) =>
                                updateSection("trust_stewardship", (sec) => ({
                                  extra: { ...sec.extra, adminDesc: e.target.value },
                                }))
                              }
                              placeholder="Description..."
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 6: Awards & Recognition (Screenshot 4) */}
                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-100 dark:border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider flex items-center gap-2">
                          <Award size={14} className="text-[#E8542A]" />
                          6. Awards &amp; Recognition
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Key: awards_recognition</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={getSection("awards_recognition")?.title || "Awards & Recognition"}
                            onChange={(e) =>
                              updateSection("awards_recognition", () => ({ title: e.target.value }))
                            }
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

                    {/* Section 7: Allies in Impact (Screenshot 5) */}
                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-100 dark:border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider flex items-center gap-2">
                          <HeartHandshake size={14} className="text-[#E8542A]" />
                          7. Allies in Impact (Dev Bhoomi Samiti &amp; Core Strength)
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Key: allies_in_impact</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={getSection("allies_in_impact")?.title || "ALLIES IN IMPACT"}
                            onChange={(e) =>
                              updateSection("allies_in_impact", () => ({ title: e.target.value }))
                            }
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Section Subtitle
                          </label>
                          <input
                            type="text"
                            value={getSection("allies_in_impact")?.subtitle || "Powered by organizations that prioritize direct, ground-level action over corporate lip-service."}
                            onChange={(e) =>
                              updateSection("allies_in_impact", () => ({ subtitle: e.target.value }))
                            }
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
                              value={getSection("allies_in_impact")?.extra?.partnerName || "DEV BHOOMI SAMITI"}
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
                              value={getSection("allies_in_impact")?.extra?.partnerPillar || "Strategic Pillar: The immense contribution of Dev Bhoomi Samiti is what makes our mission possible. As our principal patron, they provide the visionary leadership and total support that fuels every project, every camp, and every life we touch."}
                              onChange={(e) =>
                                updateSection("allies_in_impact", (sec) => ({
                                  extra: { ...sec.extra, partnerPillar: e.target.value },
                                }))
                              }
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Official Website Link</label>
                            <input
                              type="text"
                              value={getSection("allies_in_impact")?.extra?.partnerWebsiteUrl || "https://devbhoomisamiti.org"}
                              onChange={(e) =>
                                updateSection("allies_in_impact", (sec) => ({
                                  extra: { ...sec.extra, partnerWebsiteUrl: e.target.value },
                                }))
                              }
                              placeholder="https://..."
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
                              value={getSection("allies_in_impact")?.extra?.coreStrengthTitle || "FOUNDATION'S CORE STRENGTH"}
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
                              value={getSection("allies_in_impact")?.extra?.coreStrengthDesc || "Our operational model is built on the immense contribution and full visionary backing of Dev Bhoomi Samiti. This unique alliance allows us to focus 100% of our energy on ground-level implementation, ensuring that every resource is utilized for maximum social impact."}
                              onChange={(e) =>
                                updateSection("allies_in_impact", (sec) => ({
                                  extra: { ...sec.extra, coreStrengthDesc: e.target.value },
                                }))
                              }
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none leading-relaxed"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status Label</label>
                              <input
                                type="text"
                                value={getSection("allies_in_impact")?.extra?.partnershipStatusLabel || "PARTNERSHIP STATUS"}
                                onChange={(e) =>
                                  updateSection("allies_in_impact", (sec) => ({
                                    extra: { ...sec.extra, partnershipStatusLabel: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs text-[#0f2347] dark:text-text-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status Value</label>
                              <input
                                type="text"
                                value={getSection("allies_in_impact")?.extra?.partnershipStatusValue || "CORE STRATEGIC ALLIANCE"}
                                onChange={(e) =>
                                  updateSection("allies_in_impact", (sec) => ({
                                    extra: { ...sec.extra, partnershipStatusValue: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-border text-xs font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 8: 100% Transparency & Governance Compliance */}
                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-bg border border-gray-100 dark:border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0f2347] dark:text-text-primary uppercase tracking-wider flex items-center gap-2">
                          <ShieldCheck size={14} className="text-[#E8542A]" />
                          8. 100% Transparency &amp; Governance Compliance Box
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Key: transparency</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Section Headline
                          </label>
                          <input
                            type="text"
                            value={getSection("transparency")?.title || "100% TRANSPARENT & ACCOUNTABLE"}
                            onChange={(e) =>
                              updateSection("transparency", () => ({ title: e.target.value }))
                            }
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs text-[#0f2347] dark:text-text-primary focus:outline-none font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-muted mb-1">
                            Section Description
                          </label>
                          <textarea
                            rows={2}
                            value={getSection("transparency")?.description || "At Seva India Foundation, trust isn't a promise—it's a practice. As a registered Section 8 NGO, we protect your trust through meticulous accountability and radical transparency."}
                            onChange={(e) =>
                              updateSection("transparency", () => ({ description: e.target.value }))
                            }
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
                            value={getSection("transparency")?.extra?.darpanId || "UK/2026/0993905"}
                            onChange={(e) =>
                              updateSection("transparency", (sec) => ({
                                extra: { ...sec.extra, darpanId: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs font-mono font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                            CIN Number (Auto word-wrap fixed)
                          </label>
                          <input
                            type="text"
                            value={getSection("transparency")?.extra?.cin || "U88900UT2026NPL020825"}
                            onChange={(e) =>
                              updateSection("transparency", (sec) => ({
                                extra: { ...sec.extra, cin: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs font-mono font-bold text-[#0f2347] dark:text-text-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                            Tax Exemption
                          </label>
                          <input
                            type="text"
                            value={getSection("transparency")?.extra?.taxExemption || "80G & 12A"}
                            onChange={(e) =>
                              updateSection("transparency", (sec) => ({
                                extra: { ...sec.extra, taxExemption: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs font-semibold text-[#0f2347] dark:text-text-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                            Legal Status
                          </label>
                          <input
                            type="text"
                            value={getSection("transparency")?.extra?.legalStatus || "Section 8 Company"}
                            onChange={(e) =>
                              updateSection("transparency", (sec) => ({
                                extra: { ...sec.extra, legalStatus: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-panel text-xs font-semibold text-[#0f2347] dark:text-text-primary focus:outline-none"
                          />
                        </div>
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            policyViewMode === "edit"
                              ? "bg-white dark:bg-panel text-[#0f2347] dark:text-text-primary shadow-xs"
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          Rich Text Editor
                        </button>
                        <button
                          type="button"
                          onClick={() => setPolicyViewMode("preview")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            policyViewMode === "preview"
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
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
