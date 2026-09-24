"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Edit3,
  Eye,
  Copy,
  Check,
  Code,
  FileText,
  Smartphone,
  Monitor,
  Sparkles,
  RotateCcw,
  X,
  Lock,
  Mail,
  MessageCircle,
} from "lucide-react";
import axiosInstance from "@/app/api";
import { endpoint } from "@/app/api/endpoints";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/lib/toast";
import { RichTextEditor } from "@/components/dashboard/richtexteditor/RichTextEditor";
import { Portal } from "@/components/shared/Portal";

interface MailTemplate {
  _id: string;
  key: string;
  name: string;
  category: string;
  subject: string;
  htmlContent: string;
  isActive: boolean;
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
};

const MOCK_VARIABLES: Record<string, string> = {
  name: "Saksham Sharma",
  email: "saksham@sevafoundation.org",
  password: "Seva@2026#Secure",
  amount: "5,000",
  campaignName: "Kerala Flood Relief & Rehabilitation",
  donatedOn: "22 Sep 2026",
  category: "Disaster Relief & Healthcare",
  availability: "Weekends (10 Hours / Week)",
  certificateNo: "SIF-2026-CERT-0192",
  programName: "Disaster Emergency & Relief Initiative",
  status: "Approved & Active",
  loginUrl: "http://187.126.112.144:3000/login",
  verifyUrl: "http://187.126.112.144:3000/verify/SIF-2026-CERT-0192",
  siteUrl: "http://187.126.112.144:3000",
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
  // Replace any leftover {{variable}} with placeholder
  rendered = rendered.replace(/\{\{\s*([\w.]+)\s*\}\}/g, "[$1]");
  // Remove logo images for now to prevent broken image displays
  rendered = rendered.replace(/<img[^>]*alt=["']Seva Foundation["'][^>]*\/?>/gi, "");
  rendered = rendered.replace(/<img[^>]*src=["'][^"']*logo[^"']*["'][^>]*\/?>/gi, "");
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

export default function MailTemplatesPage() {
  const { user, hasPermission } = useAuth();
  const toast = useToast();

  const canEdit = useMemo(() => {
    if (!user) return false;
    return user.role === "admin" || hasPermission("marketing");
  }, [user, hasPermission]);

  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor Modal State
  const [editingTemplate, setEditingTemplate] = useState<MailTemplate | null>(null);
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editHtml, setEditHtml] = useState("");
  const [activeTab, setActiveTab] = useState<"visual" | "html" | "preview">("visual");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Quick Preview Modal State (read-only)
  const [previewOnlyTemplate, setPreviewOnlyTemplate] = useState<MailTemplate | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(endpoint.mail.getTemplates);
      setTemplates(res.data?.data || []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    if (!canEdit) {
      toast.error("Permission denied: Admin or Marketing permission required.");
      return;
    }
    try {
      await axiosInstance.patch(endpoint.mail.updateTemplate(id), { isActive: !current });
      setTemplates((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isActive: !current } : t))
      );
      toast.success(`Template ${!current ? "activated" : "disabled"}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const openEditor = (template: MailTemplate) => {
    if (!canEdit) {
      toast.error("Permission denied: You need admin or marketing permissions to edit templates.");
      return;
    }
    setEditingTemplate(template);
    setEditName(template.name);
    setEditSubject(template.subject);
    const html = template.htmlContent || "";
    setEditHtml(html);
    setEditMessage(extractMessage(html));
    setActiveTab("visual");
  };

  const closeEditor = () => {
    setEditingTemplate(null);
    setIsSaving(false);
  };

  const handleMessageChange = (newMsg: string) => {
    setEditMessage(newMsg);
    setEditHtml((prev) => injectMessage(prev, newMsg));
  };

  const handleHtmlChange = (newHtml: string) => {
    setEditHtml(newHtml);
    setEditMessage(extractMessage(newHtml));
  };

  const copyVariable = (varName: string) => {
    const textToCopy = `{{${varName}}}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedVar(varName);
    toast.success(`Copied ${textToCopy}`);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const insertVariableToSubject = (varName: string) => {
    setEditSubject((prev) => `${prev} {{${varName}}}`);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    setIsSaving(true);
    try {
      const payload = {
        name: editName.trim(),
        subject: editSubject.trim(),
        htmlContent: editHtml,
      };
      const res = await axiosInstance.patch(
        endpoint.mail.updateTemplate(editingTemplate._id),
        payload
      );
      const updated = res.data?.data;
      setTemplates((prev) =>
        prev.map((t) => (t._id === editingTemplate._id ? { ...t, ...updated } : t))
      );
      toast.success("Email template saved successfully!");
      closeEditor();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save template changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Tab Switcher: Email Templates vs WhatsApp Templates */}
      <div className="flex items-center gap-3 p-1.5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/15 w-fit mb-6 shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-navy font-bold text-xs shadow-md">
          <Mail size={15} className="text-[#E8542A]" />
          <span>Email Templates</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold">
            {templates.length}
          </span>
        </div>

        <Link
          href="/dashboard/marketing/whatsapp?tab=templates"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 font-semibold text-xs transition-all"
        >
          <MessageCircle size={15} className="text-[#25D366]" />
          <span>WhatsApp Templates</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-extrabold">
            Active
          </span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Email Templates</h1>
            <span className="bg-[#E8542A]/20 text-[#E8542A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E8542A]/30">
              Seva Branded
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Customizable HTML notifications for all system workflows. Unified with the official Seva Foundation logo and bold layout.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTemplates}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/20 shadow-sm backdrop-blur-sm transition-all cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Permission Notice */}
      {!canEdit && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
          <Lock size={16} className="text-amber-400 shrink-0" />
          <p>
            <strong>Read-only access:</strong> You are currently viewing templates in read-only mode. Only administrators and users with marketing permissions can edit email templates.
          </p>
        </div>
      )}

      {/* Templates Table Card */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-400 gap-3">
          <RefreshCw size={24} className="animate-spin text-[#E8542A]" />
          <span className="text-sm font-medium text-slate-600">Loading email templates...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">Template</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 hidden md:table-cell">Subject</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 hidden lg:table-cell">Variables</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templates.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4.5">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-[#E8542A] transition-colors">
                        {t.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[t.category] || CATEGORY_COLORS.GENERAL}`}>
                          {t.category}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {t.key}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 hidden md:table-cell max-w-xs">
                      <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed" title={t.subject}>
                        {t.subject}
                      </p>
                    </td>
                    <td className="px-6 py-4.5 hidden lg:table-cell max-w-sm">
                      <div className="flex flex-wrap gap-1.5">
                        {(t.availableVariables || []).map((v) => (
                          <button
                            key={v}
                            onClick={() => copyVariable(v)}
                            className="text-[10px] font-mono bg-slate-100 text-slate-700 hover:bg-[#E8542A]/10 hover:text-[#E8542A] hover:border-[#E8542A]/30 px-2 py-0.5 rounded border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                            title="Click to copy variable"
                          >
                            {`{{${v}}}`}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(t._id, t.isActive)}
                        disabled={!canEdit}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${
                          canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-75"
                        } ${
                          t.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                        }`}
                        title={canEdit ? (t.isActive ? "Click to disable" : "Click to enable") : "Read only"}
                      >
                        {t.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {t.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-6 py-4.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewOnlyTemplate(t)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                          title="Quick Live Preview"
                        >
                          <Eye size={13} />
                          Preview
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => openEditor(t)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#E8542A] hover:bg-[#c9431d] rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                            title="Edit this email template"
                          >
                            <Edit3 size={13} />
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            {templates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Sparkles size={32} className="text-slate-300 mb-2" />
                <p className="text-base font-semibold text-slate-700">No email templates found</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                  Templates are auto-seeded on server start or via backend seed script.
                </p>
              </div>
            )}
          </div>
        )}


      {/* ========================================================================= */}
      {/* FULL TEMPLATE EDITOR MODAL                                                */}
      {/* ========================================================================= */}
      {editingTemplate && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8542A]/10 border border-[#E8542A]/20 flex items-center justify-center text-[#E8542A]">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                        Edit Template: {editingTemplate.name}
                      </h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[editingTemplate.category] || CATEGORY_COLORS.GENERAL}`}>
                        {editingTemplate.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Key: {editingTemplate.key}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeEditor}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Variables Quick Bar */}
              <div className="px-6 py-2.5 bg-slate-100/75 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="font-semibold text-slate-600 shrink-0">Available Variables:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(editingTemplate.availableVariables || []).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => copyVariable(v)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono bg-white hover:bg-[#E8542A] hover:text-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 shadow-2xs transition-all cursor-pointer"
                      title="Click to copy placeholder to clipboard"
                    >
                      {copiedVar === v ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs Bar */}
              <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("visual")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                      activeTab === "visual"
                        ? "border-[#E8542A] text-[#E8542A]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <FileText size={15} />
                    Message Content (Basic Editor)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("html")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                      activeTab === "html"
                        ? "border-[#E8542A] text-[#E8542A]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Code size={15} />
                    HTML Source
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                      activeTab === "preview"
                        ? "border-[#E8542A] text-[#E8542A]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Eye size={15} />
                    Live Preview
                  </button>
                </div>

                {activeTab === "preview" && (
                  <div className="flex items-center gap-1 pb-2">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                        previewDevice === "desktop"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                      title="Desktop Preview"
                    >
                      <Monitor size={14} />
                      <span className="hidden sm:inline">Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                        previewDevice === "mobile"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                      title="Mobile Preview"
                    >
                      <Smartphone size={14} />
                      <span className="hidden sm:inline">Mobile</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Body */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/40 space-y-5">
                {/* Template Name & Subject Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Template Display Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#E8542A] focus:ring-2 focus:ring-[#E8542A]/20 transition-all"
                      placeholder="e.g. New User Credentials"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Email Subject Line
                      </label>
                      <span className="text-[11px] text-slate-400">Supports variables</span>
                    </div>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#E8542A] focus:ring-2 focus:ring-[#E8542A]/20 transition-all font-mono"
                      placeholder="Subject with {{name}} or other variables..."
                    />
                  </div>
                </div>

                {/* TAB 1: Visual / Message Editor */}
                {activeTab === "visual" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Email Message Body (Rich Text)
                        </label>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Customize the text and formatting. The official Seva Foundation header, logo, brand styling, and footer are preserved automatically.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-2xs">
                      <RichTextEditor
                        value={editMessage}
                        onChange={handleMessageChange}
                        placeholder="Write your email body message here... You can use bold, lists, links, and variables like {{name}}."
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: HTML Source */}
                {activeTab === "html" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Full HTML Template
                      </label>
                      <span className="text-xs text-slate-400 font-mono">
                        {editHtml.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={16}
                      value={editHtml}
                      onChange={(e) => handleHtmlChange(e.target.value)}
                      className="w-full p-4 text-xs font-mono bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-[#E8542A] focus:ring-1 focus:ring-[#E8542A] leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* TAB 3: Live Preview */}
                {activeTab === "preview" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-800">
                      <p>
                        <strong>Previewing:</strong> &ldquo;{renderPreviewHtml(editSubject)}&rdquo; — Variables are rendered with realistic sample data.
                      </p>
                      <span className="font-mono text-[10px] bg-blue-100 px-2 py-0.5 rounded text-blue-700">
                        Seva Branded
                      </span>
                    </div>

                    <div className="flex justify-center bg-slate-200/80 p-4 sm:p-6 rounded-2xl border border-slate-300">
                      <div
                        className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                          previewDevice === "desktop" ? "w-full max-w-[620px]" : "w-[375px]"
                        }`}
                      >
                        <iframe
                          title="Email Preview"
                          srcDoc={renderPreviewHtml(editHtml)}
                          className="w-full min-h-[580px] border-0"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#E8542A] hover:bg-[#c9431d] disabled:opacity-50 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    {isSaving ? "Saving Template..." : "Save Template Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* QUICK PREVIEW ONLY MODAL                                                  */}
      {/* ========================================================================= */}
      {previewOnlyTemplate && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden my-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {previewOnlyTemplate.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    Subject: {renderPreviewHtml(previewOnlyTemplate.subject)}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewOnlyTemplate(null)}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 p-4 bg-slate-100 overflow-y-auto flex justify-center">
                <div className="w-full max-w-[600px] bg-white rounded-xl shadow-md overflow-hidden">
                  <iframe
                    title="Template Preview"
                    srcDoc={renderPreviewHtml(previewOnlyTemplate.htmlContent)}
                    className="w-full min-h-[580px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white">
                <span className="text-xs text-slate-400">
                  Official Seva Foundation Email Layout
                </span>
                <button
                  onClick={() => setPreviewOnlyTemplate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
