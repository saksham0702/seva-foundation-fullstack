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
} from "lucide-react";
import { getCmsPages, getCmsPageBySlug, saveCmsPage, CmsPage, CmsSection } from "@/app/api/cms";
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

  // Sync loaded pageData into formData
  React.useEffect(() => {
    if (pageData) {
      setFormData(pageData);
    }
  }, [pageData]);

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
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isActive
                      ? "bg-[#0f2347] text-white border-[#0f2347] shadow-md shadow-[#0f2347]/10"
                      : "bg-white dark:bg-panel border-gray-100 dark:border-border text-gray-700 dark:text-text-primary hover:border-gray-200 hover:bg-gray-50/50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "bg-gray-100 dark:bg-bg text-gray-600 dark:text-muted"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-snug">{p.name}</h4>
                    <p
                      className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                        isActive ? "text-gray-300" : "text-gray-400 dark:text-muted"
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
