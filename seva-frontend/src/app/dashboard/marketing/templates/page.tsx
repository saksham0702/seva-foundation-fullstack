"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Mail,
  Plus,
  Search,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  FileText,
  Tag,
  X,
  Loader2,
  Send,
  Code,
  Lock,
  Layers,
  Zap,
  Laptop,
  Smartphone,
  Info,
  ShieldCheck,
} from "lucide-react";
import axiosInstance from "@/app/api";
import { endpoint } from "@/app/api/endpoints";
import { whatsappAPI, IWhatsAppTemplate } from "@/app/api/whatsapp";
import { useToast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";
import { Portal } from "@/components/shared/Portal";
import { RichTextEditor } from "@/components/dashboard/richtexteditor/RichTextEditor";

interface MailTemplate {
  _id: string;
  key: string;
  name: string;
  category: string;
  subject: string;
  htmlContent: string;
  isActive: boolean;
  isDynamicCampaign?: boolean;
  availableVariables: string[];
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  AUTH: "bg-blue-50 text-blue-700 border-blue-200",
  DONOR: "bg-emerald-50 text-emerald-700 border-emerald-200",
  VOLUNTEER: "bg-amber-50 text-amber-700 border-amber-200",
  CERTIFICATE: "bg-purple-50 text-purple-700 border-purple-200",
  PARTNERSHIP: "bg-pink-50 text-pink-700 border-pink-200",
  GENERAL: "bg-slate-50 text-slate-700 border-slate-200",
  DONATION: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CAMPAIGN: "bg-blue-50 text-blue-700 border-blue-200",
  NEWSLETTER: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const MOCK_VARIABLES: Record<string, string> = {
  name: "Saksham Mamgain",
  email: "saksham@sevafoundation.org",
  password: "Seva@2026#Secure",
  amount: "5,000",
  campaignName: "Kerala Flood Relief & Rehabilitation",
  campaign: "Kerala Flood Relief & Rehabilitation",
  donatedOn: "24 Sep 2026",
  date: "24 Sep 2026",
  category: "Disaster Relief & Healthcare",
  availability: "Weekends (10 Hours / Week)",
  certificateNo: "SIF-2026-CERT-0192",
  programName: "Disaster Emergency & Relief Initiative",
  status: "Approved & Active",
  loginUrl: "http://localhost:3000/login",
  verifyUrl: "http://localhost:3000/verify/SIF-2026-CERT-0192",
  siteUrl: "http://localhost:3000",
  logoUrl: "/assets/seva-logo.png",
  currentYear: "2026",
};

function renderPreviewHtml(html: string): string {
  if (!html) return "";
  let rendered = html;
  for (const [key, val] of Object.entries(MOCK_VARIABLES)) {
    const reg = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    rendered = rendered.replace(reg, val);
  }
  rendered = rendered.replace(/\{\{\s*([\w.]+)\s*\}\}/g, "[$1]");
  return rendered;
}

function extractMessage(html: string): string {
  if (!html) return "";
  const match = html.match(/<!-- SEVA_MESSAGE_START -->([\s\S]*?)<!-- SEVA_MESSAGE_END -->/);
  if (match) {
    const innerMatch = match[1].match(/<div[^>]*>([\s\S]*?)<\/div>/i);
    return innerMatch ? innerMatch[1].trim() : match[1].trim();
  }
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : html;
}

function injectMessage(fullHtml: string, newMessageHtml: string): string {
  if (fullHtml.includes("<!-- SEVA_MESSAGE_START -->") && fullHtml.includes("<!-- SEVA_MESSAGE_END -->")) {
    return fullHtml.replace(
      /<!-- SEVA_MESSAGE_START -->[\s\S]*?<!-- SEVA_MESSAGE_END -->/,
      `<!-- SEVA_MESSAGE_START -->\n              <div style="color: #334155; font-size: 15px; line-height: 1.65; margin: 0 0 16px 0;">\n                ${newMessageHtml}\n              </div>\n              <!-- SEVA_MESSAGE_END -->`
    );
  }
  return newMessageHtml;
}

function TemplatesContent() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const { user, hasPermission } = useAuth();

  const canEdit = useMemo(() => {
    if (!user) return false;
    return user.role === "admin" || hasPermission("marketing");
  }, [user, hasPermission]);

  const initialTab = (searchParams.get("type") as "whatsapp" | "email") || "whatsapp";
  const [activeTab, setActiveTab] = useState<"whatsapp" | "email">(initialTab);
  const [loading, setLoading] = useState(true);

  // ── WhatsApp State ────────────────────────────────────────────────────────
  const [waTemplates, setWaTemplates] = useState<IWhatsAppTemplate[]>([]);
  const [waSearch, setWaSearch] = useState("");
  const [waCategory, setWaCategory] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // WhatsApp Modal State
  const [showWaModal, setShowWaModal] = useState(false);
  const [editingWaTemplate, setEditingWaTemplate] = useState<IWhatsAppTemplate | null>(null);
  const [waForm, setWaForm] = useState<{
    name: string;
    category: "DONATION" | "VOLUNTEER" | "CAMPAIGN" | "NEWSLETTER" | "GENERAL";
    body: string;
  }>({
    name: "",
    category: "DONATION",
    body: "",
  });
  const [isSavingWa, setIsSavingWa] = useState(false);

  // ── Email State: Dynamic Campaign Mails vs Static System Mails ────────────
  const [emailTemplates, setEmailTemplates] = useState<MailTemplate[]>([]);
  const [emailSubTab, setEmailSubTab] = useState<"campaigns" | "system">("campaigns");
  const [emailSearch, setEmailSearch] = useState("");
  const [emailCategory, setEmailCategory] = useState("ALL");

  // Email Create Custom Template Modal
  const [showCreateEmailModal, setShowCreateEmailModal] = useState(false);
  const [creatingEmail, setCreatingEmail] = useState(false);
  const [newEmailForm, setNewEmailForm] = useState({
    name: "",
    category: "CAMPAIGN",
    subject: "",
    message: "<p>Namaste {{name}},</p><p>We are reaching out with an update on our latest relief programs...</p>",
  });

  // Email Edit Modal (for both dynamic and static)
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<MailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Live Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<{
    type: "whatsapp" | "email";
    title: string;
    subject?: string;
    body: string;
    variables?: string[];
  } | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Custom Delete Confirmation Modal (NO window.confirm!)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "whatsapp" | "email";
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [waRes, emailRes] = await Promise.allSettled([
        whatsappAPI.getTemplates(),
        axiosInstance.get(endpoint.mail.getTemplates),
      ]);

      if (waRes.status === "fulfilled") {
        setWaTemplates(waRes.value || []);
      }
      if (emailRes.status === "fulfilled") {
        setEmailTemplates(emailRes.value.data?.data || []);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // WhatsApp Handlers
  const handleSeedWhatsApp = async () => {
    try {
      setLoading(true);
      await whatsappAPI.seedTemplates();
      await loadData();
      toast.success("Default WhatsApp templates seeded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to seed WhatsApp templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWaTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waForm.name.trim() || !waForm.body.trim()) {
      toast.error("Please provide both a template name and message body.");
      return;
    }

    try {
      setIsSavingWa(true);
      const payload = {
        name: waForm.name.trim(),
        category: waForm.category,
        body: waForm.body.trim(),
      };
      if (editingWaTemplate?._id) {
        await whatsappAPI.updateTemplate(editingWaTemplate._id, payload);
        toast.success("WhatsApp template updated successfully!");
      } else {
        await whatsappAPI.createTemplate(payload);
        toast.success("WhatsApp template created successfully!");
      }
      setShowWaModal(false);
      setEditingWaTemplate(null);
      setWaForm({ name: "", category: "DONATION", body: "" });
      await loadData();
    } catch (err: any) {
      console.error("Failed to save WhatsApp template:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to save template");
    } finally {
      setIsSavingWa(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setIsDeleting(true);
      if (deleteConfirm.type === "whatsapp") {
        await whatsappAPI.deleteTemplate(deleteConfirm.id);
        toast.success(`WhatsApp template "${deleteConfirm.name}" deleted successfully!`);
      } else {
        await axiosInstance.delete(endpoint.mail.deleteTemplate(deleteConfirm.id));
        toast.success(`Email campaign template "${deleteConfirm.name}" deleted successfully!`);
      }
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Template content copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Email Handlers
  const handleCreateEmailTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailForm.name.trim() || !newEmailForm.subject.trim() || !newEmailForm.message.trim()) {
      toast.error("Please fill in template name, subject line, and content.");
      return;
    }

    try {
      setCreatingEmail(true);
      await axiosInstance.post(endpoint.mail.createTemplate, {
        name: newEmailForm.name.trim(),
        category: newEmailForm.category,
        subject: newEmailForm.subject.trim(),
        htmlContent: newEmailForm.message,
        isDynamicCampaign: true,
      });
      toast.success(`Custom email campaign template "${newEmailForm.name}" created!`);
      setShowCreateEmailModal(false);
      setNewEmailForm({
        name: "",
        category: "CAMPAIGN",
        subject: "",
        message: "<p>Namaste {{name}},</p><p>We are reaching out with an update on our programs...</p>",
      });
      setEmailSubTab("campaigns");
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create email template");
    } finally {
      setCreatingEmail(false);
    }
  };

  const handleOpenEmailEditor = (tpl: MailTemplate) => {
    if (!canEdit) {
      toast.error("You need marketing permissions to edit email templates.");
      return;
    }
    setEditingEmailTemplate(tpl);
    setEditSubject(tpl.subject || "");
    setEditMessage(extractMessage(tpl.htmlContent));
  };

  const handleSaveEmailTemplate = async () => {
    if (!editingEmailTemplate) return;
    try {
      setIsSavingEmail(true);
      const newFullHtml = injectMessage(editingEmailTemplate.htmlContent, editMessage);
      const payload = {
        subject: editSubject,
        htmlContent: newFullHtml,
      };
      try {
        await axiosInstance.patch(endpoint.mail.updateTemplate(editingEmailTemplate._id), payload);
      } catch (patchErr) {
        // Fallback to PUT if PATCH fails
        await axiosInstance.put(endpoint.mail.updateTemplate(editingEmailTemplate._id), payload);
      }
      toast.success("Email template saved successfully!");
      setEditingEmailTemplate(null);
      await loadData();
    } catch (err: any) {
      console.error("Failed to save email template:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save email template");
    } finally {
      setIsSavingEmail(false);
    }
  };

  // Filtered WhatsApp Templates
  const filteredWaTemplates = waTemplates.filter((t) => {
    const matchCategory = waCategory === "ALL" || t.category === waCategory;
    const matchSearch =
      t.name.toLowerCase().includes(waSearch.toLowerCase()) ||
      t.body.toLowerCase().includes(waSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Filtered Email Templates (Dynamic Campaign vs Static System)
  const dynamicEmailTemplates = useMemo(() => {
    return emailTemplates.filter((t) => {
      const isDynamic =
        t.isDynamicCampaign ||
        t.key?.startsWith("CAMPAIGN_") ||
        t.category === "CAMPAIGN" ||
        t.category === "NEWSLETTER";
      const matchCategory = emailCategory === "ALL" || t.category === emailCategory;
      const matchSearch =
        t.name.toLowerCase().includes(emailSearch.toLowerCase()) ||
        t.subject.toLowerCase().includes(emailSearch.toLowerCase());
      return isDynamic && matchCategory && matchSearch;
    });
  }, [emailTemplates, emailCategory, emailSearch]);

  const staticSystemEmailTemplates = useMemo(() => {
    return emailTemplates.filter((t) => {
      const isDynamic =
        t.isDynamicCampaign ||
        t.key?.startsWith("CAMPAIGN_") ||
        t.category === "CAMPAIGN" ||
        t.category === "NEWSLETTER";
      const matchCategory = emailCategory === "ALL" || t.category === emailCategory;
      const matchSearch =
        t.name.toLowerCase().includes(emailSearch.toLowerCase()) ||
        t.subject.toLowerCase().includes(emailSearch.toLowerCase());
      return !isDynamic && matchCategory && matchSearch;
    });
  }, [emailTemplates, emailCategory, emailSearch]);

  return (
    <div className="min-h-screen bg-white rounded-2xl border border-slate-200 pb-16">
      <div className="w-full px-6 py-8 max-w-7xl mx-auto space-y-6">
        {/* ── Top Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black tracking-tight">
                Outreach Templates Hub
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized message studio for WhatsApp broadcasts, dynamic email campaigns, and static system triggers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            {activeTab === "whatsapp" ? (
              <button
                onClick={() => {
                  setEditingWaTemplate(null);
                  setWaForm({ name: "", category: "DONATION", body: "" });
                  setShowWaModal(true);
                }}
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-green-500/20"
              >
                <Plus size={16} strokeWidth={3} />
                New WhatsApp Template
              </button>
            ) : (
              <button
                onClick={() => setShowCreateEmailModal(true)}
                className="flex items-center gap-2 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-900/20"
              >
                <Plus size={16} strokeWidth={3} />
                New Campaign Template
              </button>
            )}
          </div>
        </div>

        {/* ── Channel Switcher Navigation Pills ─────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${activeTab === "whatsapp"
                ? "bg-black text-white shadow-md shadow-black/10"
                : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
              }`}
          >
            <MessageSquare size={14} className={activeTab === "whatsapp" ? "text-[#25D366]" : ""} />
            <span>WhatsApp Templates</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === "whatsapp" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
            >
              {waTemplates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("email")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${activeTab === "email"
                ? "bg-black text-white shadow-md shadow-black/10"
                : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
              }`}
          >
            <Mail size={14} className={activeTab === "email" ? "text-blue-400" : ""} />
            <span>Email Templates</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === "email" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
            >
              {emailTemplates.length}
            </span>
          </button>
        </div>

        {/* ── TAB 1: WHATSAPP TEMPLATES ────────────────────────────────────────── */}
        {activeTab === "whatsapp" && (
          <div className="space-y-6">
            {/* Filter & Seed Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["ALL", "DONATION", "CAMPAIGN", "VOLUNTEER", "NEWSLETTER", "GENERAL"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setWaCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${waCategory === cat
                        ? "bg-black text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                  >
                    {cat === "ALL" ? "All Categories" : cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={waSearch}
                    onChange={(e) => setWaSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-[#25D366]"
                  />
                </div>

                {waTemplates.length === 0 && (
                  <button
                    onClick={handleSeedWhatsApp}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
                  >
                    <Sparkles size={13} className="text-[#25D366]" />
                    Seed Defaults
                  </button>
                )}
              </div>
            </div>

            {/* Templates Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-[#25D366]" />
                <span className="text-xs font-medium text-slate-600">Loading WhatsApp templates...</span>
              </div>
            ) : filteredWaTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl text-center px-4 space-y-3">
                <MessageSquare size={40} className="text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No WhatsApp Templates Found</h4>
                <p className="text-xs text-slate-500 max-w-md">
                  Create custom broadcast templates or click Seed Defaults to load standard NGO templates.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSeedWhatsApp}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    <Sparkles size={14} className="text-[#25D366]" />
                    Seed Defaults
                  </button>
                  <button
                    onClick={() => {
                      setEditingWaTemplate(null);
                      setWaForm({ name: "", category: "DONATION", body: "" });
                      setShowWaModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#25D366] text-white shadow-md shadow-green-500/20"
                  >
                    <Plus size={14} />
                    New Template
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredWaTemplates.map((tpl) => (
                  <div
                    key={tpl._id || tpl.name}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#25D366]/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#25D366] transition-colors line-clamp-1">
                            {tpl.name}
                          </h3>
                          <span
                            className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border mt-1 ${CATEGORY_COLORS[tpl.category] || "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                          >
                            {tpl.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              setPreviewTemplate({
                                type: "whatsapp",
                                title: tpl.name,
                                body: tpl.body,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Preview Template"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingWaTemplate(tpl);
                              setWaForm({
                                name: tpl.name,
                                category: tpl.category,
                                body: tpl.body,
                              });
                              setShowWaModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Template"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                type: "whatsapp",
                                id: tpl._id || "",
                                name: tpl.name,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Template"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Body Text Box (WhatsApp Style) */}
                      <div className="bg-[#EFEAE2]/30 rounded-xl p-3.5 border border-slate-100 font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto mb-4">
                        {tpl.body}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">
                        {tpl.isSystem ? "Default Preset" : "Custom Asset"}
                      </span>

                      <button
                        onClick={() => handleCopyText(tpl.body, tpl._id || tpl.name)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-black py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        {copiedId === (tpl._id || tpl.name) ? (
                          <>
                            <Check size={12} className="text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: EMAIL TEMPLATES (Dynamic Campaigns vs Static System) ───────── */}
        {activeTab === "email" && (
          <div className="space-y-6">
            {/* Sub-Tabs Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setEmailSubTab("campaigns")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${emailSubTab === "campaigns"
                      ? "bg-[#0f2347] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Zap size={14} className="text-amber-400" />
                  <span>Dynamic Campaign Templates</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                    {dynamicEmailTemplates.length}
                  </span>
                </button>

                <button
                  onClick={() => setEmailSubTab("system")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${emailSubTab === "system"
                      ? "bg-[#0f2347] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Layers size={14} />
                  <span>Static System Triggers</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                    {staticSystemEmailTemplates.length}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowCreateEmailModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0f2347] hover:bg-[#1a3a6b] text-white transition-all shadow-md"
                >
                  <Plus size={15} />
                  Create Campaign Template
                </button>

                <Link
                  href="/dashboard/marketing/email"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Send size={14} />
                  Broadcast Studio
                </Link>
              </div>
            </div>

            {/* Sub-Tab 1: Dynamic Campaign Broadcast Templates */}
            {emailSubTab === "campaigns" && (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 gap-2">
                    <Loader2 size={24} className="animate-spin text-[#0f2347]" />
                    <span className="text-xs font-medium text-slate-600">Loading campaign templates...</span>
                  </div>
                ) : dynamicEmailTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl text-center px-4 space-y-3">
                    <Mail size={40} className="text-slate-300 mx-auto" />
                    <h4 className="text-base font-bold text-slate-800">No Dynamic Campaign Templates Yet</h4>
                    <p className="text-xs text-slate-500 max-w-md">
                      Create reusable campaign email templates with full edit, preview, and delete capabilities.
                    </p>
                    <button
                      onClick={() => setShowCreateEmailModal(true)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0f2347] text-white shadow-md"
                    >
                      <Plus size={14} />
                      Create First Campaign Template
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {dynamicEmailTemplates.map((t) => (
                      <div
                        key={t._id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#0f2347]/40 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0f2347] transition-colors line-clamp-1">
                                {t.name}
                              </h3>
                              <span
                                className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border mt-1 ${CATEGORY_COLORS[t.category] || "bg-slate-50 text-slate-600 border-slate-200"
                                  }`}
                              >
                                {t.category}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() =>
                                  setPreviewTemplate({
                                    type: "email",
                                    title: t.name,
                                    subject: t.subject,
                                    body: t.htmlContent,
                                    variables: t.availableVariables,
                                  })
                                }
                                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Live Preview"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => handleOpenEmailEditor(t)}
                                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Template"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: "email",
                                    id: t._id,
                                    name: t.name,
                                  })
                                }
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Template"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1 my-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="font-semibold text-slate-800 truncate">
                              <strong>Subject:</strong> {t.subject}
                            </p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {t.availableVariables?.slice(0, 4).map((v) => (
                                <code
                                  key={v}
                                  className="bg-white px-1.5 py-0.5 rounded border text-[9px] font-mono text-slate-600"
                                >
                                  {"{{" + v + "}}"}
                                </code>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">
                            Dynamic Campaign Asset
                          </span>
                          <button
                            onClick={() => handleOpenEmailEditor(t)}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#0f2347] hover:underline"
                          >
                            <Edit3 size={13} />
                            Edit & Design
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 2: Static System Triggers Table */}
            {emailSubTab === "system" && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        <th className="px-6 py-4">Trigger Name</th>
                        <th className="px-6 py-4 hidden md:table-cell">Default Subject Line</th>
                        <th className="px-6 py-4 hidden lg:table-cell">Available Tokens</th>
                        <th className="px-6 py-4">Protection Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {staticSystemEmailTemplates.map((t) => (
                        <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                            <span
                              className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border mt-1 ${CATEGORY_COLORS[t.category] || "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                            >
                              {t.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell max-w-xs truncate text-slate-600 font-medium">
                            {t.subject}
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {t.availableVariables?.slice(0, 3).map((v) => (
                                <code
                                  key={v}
                                  className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono"
                                >
                                  {"{{" + v + "}}"}
                                </code>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              <Lock size={11} className="text-slate-500" />
                              Protected System Trigger
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() =>
                                  setPreviewTemplate({
                                    type: "email",
                                    title: t.name,
                                    subject: t.subject,
                                    body: t.htmlContent,
                                    variables: t.availableVariables,
                                  })
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                title="Live Preview"
                              >
                                <Eye size={13} />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => handleOpenEmailEditor(t)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f2347] text-white font-bold hover:bg-[#1a3a6b] transition-colors"
                              >
                                <Edit3 size={13} />
                                <span>Edit Message</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MODAL: CUSTOM DELETION CONFIRMATION (Replaces window.confirm) ───── */}
        {deleteConfirm?.isOpen && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Delete Template</h3>
                    <p className="text-xs text-slate-500">
                      {deleteConfirm.type === "whatsapp" ? "WhatsApp Template" : "Email Campaign Template"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Are you sure you want to permanently delete template <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
                </p>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}

        {/* ── MODAL: LIVE PREVIEW VIEWER (Email & WhatsApp) ──────────────────── */}
        {previewTemplate && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0f2347] flex items-center justify-center">
                      <Eye size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{previewTemplate.title}</h3>
                      {previewTemplate.subject && (
                        <p className="text-[11px] text-slate-500">Subject: {previewTemplate.subject}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {previewTemplate.type === "email" && (
                      <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
                        <button
                          onClick={() => setPreviewDevice("desktop")}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${previewDevice === "desktop"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-900"
                            }`}
                          title="Desktop View"
                        >
                          <Laptop size={15} />
                        </button>
                        <button
                          onClick={() => setPreviewDevice("mobile")}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${previewDevice === "mobile"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-900"
                            }`}
                          title="Mobile View"
                        >
                          <Smartphone size={15} />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setPreviewTemplate(null)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
                  {previewTemplate.type === "email" ? (
                    <div
                      className={`bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden transition-all duration-300 ${previewDevice === "mobile" ? "max-w-sm w-full" : "max-w-2xl w-full"
                        }`}
                    >
                      {/* Email Header banner with Logo */}
                      <div className="bg-[#0f2347] p-6 text-center">
                        <div className="flex justify-center mb-3">
                          <img
                            src="/assets/seva-logo.png"
                            alt="Seva Foundation Logo"
                            className="max-h-12 max-w-[180px] object-contain"
                          />
                        </div>
                        <h1 className="text-white text-lg font-bold tracking-wide">
                          SEVA INDIA FOUNDATION
                        </h1>
                        <p className="text-[#c99e32] text-[10px] font-bold uppercase tracking-wider mt-0.5">
                          Humanitarian & Development Outreach
                        </p>
                      </div>

                      {/* Email Message Content */}
                      <div
                        className="p-6 text-slate-800 text-sm leading-relaxed prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: renderPreviewHtml(previewTemplate.body),
                        }}
                      />

                      {/* Email Footer */}
                      <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
                        <p className="font-semibold text-slate-700">
                          Seva India Foundation • Registered Section 8 NGO
                        </p>
                        <p className="text-[10px]">
                          80G Tax Exemption Available on all contributions.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-md w-full bg-[#E5DDD5] p-5 rounded-2xl shadow-md space-y-3">
                      <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm text-xs text-slate-900 whitespace-pre-wrap leading-relaxed">
                        {previewTemplate.body
                          .replace(/\{\{\s*name\s*\}\}/g, "Saksham Sharma")
                          .replace(/\{\{\s*amount\s*\}\}/g, "₹5,000")
                          .replace(/\{\{\s*campaign\s*\}\}/g, "Kerala Flood Relief")}
                        <div className="text-[10px] text-slate-400 text-right mt-2">12:30 PM ✓✓</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Portal>
        )}

        {/* ── MODAL: CREATE NEW DYNAMIC EMAIL TEMPLATE ─────────────────────────── */}
        {showCreateEmailModal && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Create Dynamic Email Template</h3>
                    <p className="text-xs text-slate-500">Design a reusable email broadcast asset for campaigns.</p>
                  </div>
                  <button onClick={() => setShowCreateEmailModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateEmailTemplate} className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Template Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kerala Flood Emergency Appeal"
                        value={newEmailForm.name}
                        onChange={(e) => setNewEmailForm({ ...newEmailForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={newEmailForm.category}
                        onChange={(e) => setNewEmailForm({ ...newEmailForm, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f2347]"
                      >
                        <option value="CAMPAIGN">Campaign & Appeal</option>
                        <option value="NEWSLETTER">Newsletter & Reports</option>
                        <option value="DONATION">Donor Updates</option>
                        <option value="VOLUNTEER">Volunteer Outreach</option>
                        <option value="GENERAL">General & Celebrations</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Subject Line <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Urgent Relief Needed for Families in Need"
                      value={newEmailForm.subject}
                      onChange={(e) => setNewEmailForm({ ...newEmailForm, subject: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message Body (Rich Text) <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[240px]">
                      <RichTextEditor
                        value={newEmailForm.message}
                        onChange={(msg) => setNewEmailForm({ ...newEmailForm, message: msg })}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                        Dynamic Variables:
                      </span>
                      {["name", "email", "amount", "campaign", "date"].map((v) => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => setNewEmailForm({ ...newEmailForm, message: newEmailForm.message + ` {{${v}}} ` })}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-700"
                        >
                          +{"{{" + v + "}}"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateEmailModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingEmail}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold bg-[#0f2347] hover:bg-[#1a3a6b] text-white shadow-md transition-all disabled:opacity-50"
                    >
                      {creatingEmail ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Save Campaign Template
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Portal>
        )}

        {/* ── MODAL: EDIT EMAIL TEMPLATE (Dynamic or Static) ─────────────────── */}
        {editingEmailTemplate && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Edit Email Template: {editingEmailTemplate.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {editingEmailTemplate.isDynamicCampaign ? "Dynamic Campaign Template" : "Protected System Trigger Message"}
                    </p>
                  </div>
                  <button onClick={() => setEditingEmailTemplate(null)} className="text-slate-400 hover:text-slate-700 p-1">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message Content (Rich Text)
                    </label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[260px]">
                      <RichTextEditor value={editMessage} onChange={setEditMessage} />
                    </div>
                  </div>

                  {/* Variables */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                      Available Tokens:
                    </span>
                    {(editingEmailTemplate.availableVariables || ["name", "email", "amount", "campaign", "date"]).map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setEditMessage((prev) => prev + ` {{${v}}} `)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-700"
                      >
                        +{"{{" + v + "}}"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setEditingEmailTemplate(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEmailTemplate}
                    disabled={isSavingEmail}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold bg-[#0f2347] hover:bg-[#1a3a6b] text-white shadow-md transition-all disabled:opacity-50"
                  >
                    {isSavingEmail ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}

        {/* ── MODAL: CREATE / EDIT WHATSAPP TEMPLATE ──────────────────────────── */}
        {showWaModal && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingWaTemplate ? "Edit WhatsApp Template" : "New WhatsApp Template"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard dynamic variables supported: {"{{name}}"}, {"{{amount}}"}, {"{{campaign}}"}
                    </p>
                  </div>
                  <button onClick={() => setShowWaModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveWaTemplate} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kerala Flood Urgent Appeal"
                      value={waForm.name}
                      onChange={(e) => setWaForm({ ...waForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#25D366]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={waForm.category}
                      onChange={(e) => setWaForm({ ...waForm, category: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#25D366]"
                    >
                      <option value="DONATION">Donation & Receipts</option>
                      <option value="CAMPAIGN">Campaign & Appeal</option>
                      <option value="VOLUNTEER">Volunteer Outreach</option>
                      <option value="NEWSLETTER">Newsletter & Reports</option>
                      <option value="GENERAL">General Updates</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message Body <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Namaste {{name}}, we are reaching out with an urgent appeal..."
                      value={waForm.body}
                      onChange={(e) => setWaForm({ ...waForm, body: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#25D366] font-sans"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                        Dynamic Variables:
                      </span>
                      {["name", "amount", "campaign", "date"].map((v) => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => setWaForm({ ...waForm, body: waForm.body + ` {{${v}}} ` })}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-700"
                        >
                          +{"{{" + v + "}}"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowWaModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingWa}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-md shadow-green-500/20 disabled:opacity-50 transition-all"
                    >
                      {isSavingWa ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      Save Template
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </div>
  );
}

export default function OutreachTemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <TemplatesContent />
    </Suspense>
  );
}
