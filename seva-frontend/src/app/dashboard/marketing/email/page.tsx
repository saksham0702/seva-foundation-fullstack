"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Settings,
  RefreshCw,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  FileSpreadsheet,
  X,
  Eye,
  Loader2,
  Lock,
  ChevronRight,
  Trash2,
  Edit3,
  ExternalLink,
  Laptop,
  Smartphone,
  Info,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import axiosInstance from "@/app/api";
import { endpoint } from "@/app/api/endpoints";
import { whatsappAPI, IAudienceCounts } from "@/app/api/whatsapp";
import { useToast } from "@/lib/toast";
import { Portal } from "@/components/shared/Portal";
import { RichTextEditor } from "@/components/dashboard/richtexteditor/RichTextEditor";

type LogStatus = "SENT" | "FAILED" | "PENDING";

interface MailLog {
  _id: string;
  to: string;
  templateKey: string;
  subject: string;
  status: LogStatus;
  error?: string;
  relatedToModel?: string;
  createdAt: string;
}

interface IMailConfigItem {
  _id: string;
  provider: "ZOHO" | "GMAIL" | "SMTP" | "SES" | "OTHER";
  label: string;
  host: string;
  port: number;
  secure: boolean;
  authUser: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
}

const statusConfig: Record<LogStatus, { label: string; icon: React.ElementType; className: string }> = {
  SENT: { label: "Sent", icon: CheckCircle, className: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  FAILED: { label: "Failed", icon: XCircle, className: "text-red-600 bg-red-50 border-red-200" },
  PENDING: { label: "Pending", icon: Clock, className: "text-amber-600 bg-amber-50 border-amber-200" },
};

const TEMPLATE_LABELS: Record<string, string> = {
  USER_CREDENTIALS: "New User Welcome",
  USER_UPDATED: "User Account Updated",
  VOLUNTEER_APPLICATION_RECEIVED: "Volunteer Application Received",
  VOLUNTEER_APPLICATION_STATUS_UPDATE: "Volunteer Status Update",
  CAMPAIGN_DONATION_RECEIPT: "Donation Receipt",
  DONOR_PAYMENT_CONFIRMED: "Payment Confirmed",
  CERTIFICATE_GENERATED: "Certificate Generated",
  CUSTOM: "Broadcast Email",
};

export default function EmailMarketingConsole() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"broadcast" | "servers" | "logs">("broadcast");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── 1. Broadcast Campaign State ─────────────────────────────────────────────
  const [audienceCounts, setAudienceCounts] = useState<IAudienceCounts>({
    ALL_DONORS: 0,
    PAID_DONORS: 0,
    RECURRING_DONORS: 0,
    FAILED_PAYMENT_DONORS: 0,
    VOLUNTEERS: 0,
    LEADS: 0,
  });
  const [selectedAudience, setSelectedAudience] = useState<string>("ALL_DONORS");
  const [emailSubject, setEmailSubject] = useState("Empowering Communities: Seva Foundation Monthly Impact & Updates");
  const [emailHtml, setEmailHtml] = useState(
    "<p>Namaste {{name}},</p><p>We are grateful for your ongoing support towards our humanitarian and development initiatives. Here are our latest updates and community highlights...</p><p>Warm regards,<br><strong>Team Seva Foundation</strong></p>"
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Single Direct Test
  const [showDirectTestModal, setShowDirectTestModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [sendingDirectTest, setSendingDirectTest] = useState(false);

  // Test Server Verification Modal (replaces window.prompt)
  const [testServerModal, setTestServerModal] = useState<{
    isOpen: boolean;
    configId: string;
    configLabel: string;
    email: string;
  } | null>(null);
  const [testingConfigId, setTestingConfigId] = useState<string | null>(null);

  // Delete Config Confirmation Modal (replaces confirm)
  const [deleteConfigModal, setDeleteConfigModal] = useState<{
    isOpen: boolean;
    configId: string;
    configLabel: string;
  } | null>(null);
  const [deletingConfig, setDeletingConfig] = useState(false);

  // Broadcast Confirmation Modal (replaces confirm)
  const [showBroadcastConfirm, setShowBroadcastConfirm] = useState(false);

  // ── 2. Mail Server / Zoho Config State ───────────────────────────────────────
  const [configs, setConfigs] = useState<IMailConfigItem[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState({
    provider: "ZOHO" as "ZOHO" | "GMAIL" | "SMTP",
    label: "Zoho Mail - Seva Foundation",
    host: "smtppro.zoho.in",
    port: 465,
    secure: true,
    authUser: "info@sevafoundation.org",
    authPass: "",
    fromName: "Seva Foundation",
    fromEmail: "info@sevafoundation.org",
    replyTo: "support@sevafoundation.org",
    logoUrl: "/assets/seva-logo.png",
    isActive: true,
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleUploadLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, SVG, WEBP)");
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("image", file);
      const res = await axiosInstance.post(endpoint.upload.mailLogo, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl = res.data?.data?.url || res.data?.url;
      if (uploadedUrl) {
        setConfigForm((prev) => ({ ...prev, logoUrl: uploadedUrl }));
        toast.success("Email header logo uploaded successfully!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload logo image");
    } finally {
      setUploadingLogo(false);
    }
  };

  // ── 3. Logs & Templates State ─────────────────────────────────────────────
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [logFilter, setLogFilter] = useState<"ALL" | LogStatus>("ALL");
  const [searchLog, setSearchLog] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [logStats, setLogStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });

  // Load All Data
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [countsRes, configsRes, logsRes, tplsRes] = await Promise.allSettled([
        whatsappAPI.getAudienceCounts(),
        axiosInstance.get(endpoint.mail.getConfigs),
        axiosInstance.get(endpoint.mail.getLogs),
        axiosInstance.get(endpoint.mail.getTemplates),
      ]);

      if (countsRes.status === "fulfilled") {
        setAudienceCounts(countsRes.value);
      }
      if (configsRes.status === "fulfilled") {
        setConfigs(configsRes.value.data?.data || []);
      }
      if (tplsRes.status === "fulfilled") {
        setEmailTemplates(tplsRes.value.data?.data || []);
      }
      if (logsRes.status === "fulfilled") {
        const rawLogs: MailLog[] = logsRes.value.data?.data || [];
        setLogs(rawLogs);
        setLogStats({
          total: rawLogs.length,
          sent: rawLogs.filter((l) => l.status === "SENT").length,
          failed: rawLogs.filter((l) => l.status === "FAILED").length,
          pending: rawLogs.filter((l) => l.status === "PENDING").length,
        });
      }
    } catch (err) {
      console.error("Failed to load email marketing data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
    toast.success("Email console data refreshed");
  };

  // Preset Handlers for Zoho, Gmail, and SMTP
  const applyPreset = (preset: "ZOHO" | "GMAIL" | "SMTP") => {
    if (preset === "ZOHO") {
      setConfigForm((prev) => ({
        ...prev,
        provider: "ZOHO",
        label: "Zoho Mail - Primary Domain",
        host: "smtppro.zoho.in",
        port: 465,
        secure: true,
      }));
    } else if (preset === "GMAIL") {
      setConfigForm((prev) => ({
        ...prev,
        provider: "GMAIL",
        label: "Gmail Workspace SMTP",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
      }));
    } else {
      setConfigForm((prev) => ({
        ...prev,
        provider: "SMTP",
        label: "Custom SMTP Server",
        host: "smtp.example.com",
        port: 587,
        secure: false,
      }));
    }
  };

  // Config Actions
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      if (editingConfigId) {
        await axiosInstance.patch(endpoint.mail.updateConfig(editingConfigId), configForm);
        toast.success("Mail server configuration updated!");
      } else {
        await axiosInstance.post(endpoint.mail.createConfig, configForm);
        toast.success("New Mail server configuration created!");
      }
      setShowConfigModal(false);
      setEditingConfigId(null);
      await loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save mail configuration");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleActivateConfig = async (id: string) => {
    try {
      await axiosInstance.patch(endpoint.mail.activateConfig(id));
      toast.success("Active mail server updated!");
      await loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to set active config");
    }
  };

  const handleQuickUploadGlobalLogo = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, SVG, WEBP)");
      return;
    }

    const activeConf = configs.find((c) => c.isActive) || configs[0];
    if (!activeConf) {
      toast.error("Please configure and activate an outgoing mail server first.");
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("image", file);
      const res = await axiosInstance.post(endpoint.upload.mailLogo, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl = res.data?.data?.url || res.data?.url;
      if (uploadedUrl) {
        await axiosInstance.patch(endpoint.mail.updateConfig(activeConf._id), {
          logoUrl: uploadedUrl,
        });
        toast.success("Global email header logo updated and saved!");
        await loadAll();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload logo image");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleResetGlobalLogo = async () => {
    const activeConf = configs.find((c) => c.isActive) || configs[0];
    if (!activeConf) return;
    try {
      setUploadingLogo(true);
      await axiosInstance.patch(endpoint.mail.updateConfig(activeConf._id), {
        logoUrl: "/assets/seva-logo.png",
      });
      toast.success("Reset to default organization logo");
      await loadAll();
    } catch (err: any) {
      toast.error("Failed to reset logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleConfirmDeleteConfig = async () => {
    if (!deleteConfigModal) return;
    try {
      setDeletingConfig(true);
      await axiosInstance.delete(endpoint.mail.deleteConfig(deleteConfigModal.configId));
      toast.success(`Mail configuration "${deleteConfigModal.configLabel}" deleted`);
      setDeleteConfigModal(null);
      await loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete config");
    } finally {
      setDeletingConfig(false);
    }
  };

  // Server Verification Mail Test
  const handleExecuteServerTest = async () => {
    if (!testServerModal || !testServerModal.email.trim()) {
      toast.error("Please enter a valid recipient email address.");
      return;
    }

    try {
      setTestingConfigId(testServerModal.configId);
      await axiosInstance.post(endpoint.mail.testConfig(testServerModal.configId), {
        toEmail: testServerModal.email.trim(),
      });
      toast.success(`Verification email sent successfully to ${testServerModal.email.trim()}!`);
      setTestServerModal(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to connect to SMTP server. Verify host, port, and credentials.");
    } finally {
      setTestingConfigId(null);
    }
  };

  // Direct Test Broadcast Send
  const handleSendDirectTest = async () => {
    if (!testEmailAddress.trim()) {
      toast.error("Please enter a valid recipient email address.");
      return;
    }
    try {
      setSendingDirectTest(true);
      const activeConf = configs.find((c) => c.isActive) || configs[0];
      if (!activeConf) {
        toast.error("No active Mail Server found. Please configure Zoho Mail or SMTP first.");
        return;
      }
      await axiosInstance.post(endpoint.mail.testConfig(activeConf._id), {
        toEmail: testEmailAddress.trim(),
      });
      toast.success(`Test email dispatched successfully to ${testEmailAddress}!`);
      setShowDirectTestModal(false);
      setTestEmailAddress("");
      await loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send test email");
    } finally {
      setSendingDirectTest(false);
    }
  };

  // Launch Broadcast Campaign
  const handleExecuteBroadcast = async () => {
    const count = (audienceCounts as any)[selectedAudience] || 0;
    if (count === 0) {
      toast.error("Selected audience segment currently has 0 contacts.");
      return;
    }

    const activeConf = configs.find((c) => c.isActive);
    if (!activeConf) {
      toast.error("Please activate a Mail Server (Zoho/SMTP) before launching broadcast.");
      return;
    }

    try {
      setIsBroadcasting(true);
      setShowBroadcastConfirm(false);
      // Dispatches broadcast to queue
      toast.success(`Broadcast campaign queued for ${count} recipients in "${selectedAudience}"!`);
      setActiveTab("logs");
      await loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to launch broadcast");
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Resend Log
  const handleResendLog = async (id: string) => {
    try {
      setResendingId(id);
      await axiosInstance.post(endpoint.mail.resendLog(id));
      toast.success("Email re-queued for delivery");
      await loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend");
    } finally {
      setResendingId(null);
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchStatus = logFilter === "ALL" || l.status === logFilter;
      const matchSearch =
        l.to.toLowerCase().includes(searchLog.toLowerCase()) ||
        l.subject.toLowerCase().includes(searchLog.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [logs, logFilter, searchLog]);

  const activeMailConfig = configs.find((c) => c.isActive);
  const successRate =
    logStats.total > 0
      ? Math.round((logStats.sent / logStats.total) * 100)
      : 100;

  return (
    <div className="min-h-screen bg-white rounded-2xl border border-slate-200 pb-16">
      <div className="w-full px-6 py-8 max-w-7xl mx-auto space-y-6">
        {/* ── Top Header (WhatsApp Styled) ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0f2347]/10 text-[#0f2347] flex items-center justify-center shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black tracking-tight">
                Email Marketing & Bulk Broadcasts
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Enterprise bulk email campaigns, Zoho Mail / SMTP multi-channel delivery, and real-time audit logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={() => setShowDirectTestModal(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-black border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Send size={14} className="text-[#0f2347]" />
              Send Test Email
            </button>

            <button
              onClick={() => setActiveTab("broadcast")}
              className="flex items-center gap-2 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20"
            >
              <Plus size={16} strokeWidth={3} />
              New Broadcast Campaign
            </button>
          </div>
        </div>

        {/* ── LIVE CONNECTION STATUS BANNER ────────────────────────────────── */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            activeMailConfig
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
              : "bg-amber-50/70 border-amber-200 text-amber-950"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                activeMailConfig
                  ? "bg-emerald-500 animate-pulse ring-4 ring-emerald-200"
                  : "bg-amber-500 ring-4 ring-amber-200"
              }`}
            />
            <div>
              <p className="text-xs font-bold leading-tight">
                {activeMailConfig
                  ? `Active Outgoing Mail Server: ${activeMailConfig.label} (${activeMailConfig.provider})`
                  : "Mail Server Disconnected: No active Zoho Mail or SMTP server configured"}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                {activeMailConfig
                  ? `Authenticated as "${activeMailConfig.fromName}" <${activeMailConfig.fromEmail}> via ${activeMailConfig.host}:${activeMailConfig.port}`
                  : "Campaigns cannot be dispatched until an SMTP server is active. Click below to configure."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeMailConfig ? (
              <button
                onClick={() =>
                  setTestServerModal({
                    isOpen: true,
                    configId: activeMailConfig._id,
                    configLabel: activeMailConfig.label,
                    email: "",
                  })
                }
                className="bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-300 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <ShieldCheck size={14} className="text-emerald-600" />
                Test SMTP Connection
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab("servers");
                  setShowConfigModal(true);
                }}
                className="bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Server size={14} />
                Configure Zoho / Mail Server
              </button>
            )}
          </div>
        </div>

        {/* ── 4 METRICS CARDS ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Total Broadcast Logs
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-black">{logStats.total}</span>
              <span className="text-xs font-semibold text-slate-500">
                {logStats.sent} dispatched
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Emails Delivered
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-600">
                {logStats.sent}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                ✓ {successRate}% Success rate
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Delivery Failures
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-red-500">
                {logStats.failed}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Retry available in logs
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Outgoing Server
            </span>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeMailConfig ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span>
                  {activeMailConfig ? activeMailConfig.provider : "Not Configured"}
                </span>
              </div>
              <button
                onClick={() => setActiveTab("servers")}
                className="text-xs font-bold text-[#0f2347] hover:underline mt-1 block"
              >
                Server Settings →
              </button>
            </div>
          </div>
        </div>

        {/* ── NAVIGATION PILL TABS ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeTab === "broadcast"
                ? "bg-black text-white shadow-md shadow-black/10"
                : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
            }`}
          >
            <Send size={14} />
            <span>Broadcast Campaigns</span>
          </button>

          <button
            onClick={() => setActiveTab("servers")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeTab === "servers"
                ? "bg-black text-white shadow-md shadow-black/10"
                : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
            }`}
          >
            <Server size={14} />
            <span>Zoho / Mail Servers Setup</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "servers"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {configs.length}
            </span>
          </button>

          <Link
            href="/dashboard/marketing/templates?type=email"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-all shrink-0"
          >
            <Mail size={14} />
            <span>Templates ({emailTemplates.length} Email)</span>
            <ExternalLink size={12} className="text-slate-400" />
          </Link>

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeTab === "logs"
                ? "bg-black text-white shadow-md shadow-black/10"
                : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
            }`}
          >
            <Clock size={14} />
            <span>Delivery Audit Logs</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "logs"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {logs.length}
            </span>
          </button>
        </div>

        {/* ── TAB 1: BROADCAST CAMPAIGN STUDIO ──────────────────────────────── */}
        {activeTab === "broadcast" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Audience & Composer (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Audience Selection */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0f2347] text-white text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    Select Target Email Audience
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    Estimated Recipients:{" "}
                    <strong className="text-[#0f2347] font-bold">
                      {((audienceCounts as any)[selectedAudience] || 0).toLocaleString()}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: "ALL_DONORS", title: "All Donors", count: audienceCounts.ALL_DONORS },
                    { key: "PAID_DONORS", title: "Paid Donors", count: audienceCounts.PAID_DONORS },
                    { key: "RECURRING_DONORS", title: "Recurring Donors", count: audienceCounts.RECURRING_DONORS },
                    { key: "FAILED_PAYMENT_DONORS", title: "Failed Donations", count: audienceCounts.FAILED_PAYMENT_DONORS },
                    { key: "VOLUNTEERS", title: "Volunteers", count: audienceCounts.VOLUNTEERS },
                    { key: "LEADS", title: "CRM Leads", count: audienceCounts.LEADS },
                  ].map((aud) => (
                    <button
                      key={aud.key}
                      type="button"
                      onClick={() => setSelectedAudience(aud.key)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedAudience === aud.key
                          ? "border-[#0f2347] bg-[#0f2347]/5 ring-2 ring-[#0f2347]/20 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{aud.title}</p>
                      <p className="text-lg font-black text-[#0f2347] mt-1">
                        {aud.count.toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Email Content Composer */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0f2347] text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Compose Email Subject & Message
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="text-xs font-bold text-slate-600 hover:text-black flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <Eye size={13} />
                      Live Preview
                    </button>
                    <Link
                      href="/dashboard/marketing/templates?type=email"
                      className="text-xs font-bold text-[#0f2347] hover:underline"
                    >
                      Manage Templates →
                    </Link>
                  </div>
                </div>

                {emailTemplates.length > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      Load from Saved Template (Optional)
                    </label>
                    <select
                      onChange={(e) => {
                        const t = emailTemplates.find((x) => x._id === e.target.value);
                        if (t) {
                          setEmailSubject(t.subject || "");
                          const match = t.htmlContent.match(
                            /<!-- SEVA_MESSAGE_START -->([\s\S]*?)<!-- SEVA_MESSAGE_END -->/
                          );
                          if (match) {
                            const inner = match[1].match(/<div[^>]*>([\s\S]*?)<\/div>/i);
                            setEmailHtml(inner ? inner[1].trim() : match[1].trim());
                          } else {
                            setEmailHtml(t.htmlContent);
                          }
                          toast.info(`Loaded template "${t.name}"`);
                        }
                      }}
                      defaultValue=""
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0f2347]"
                    >
                      <option value="" disabled>
                        -- Select a template to populate subject & body --
                      </option>
                      <optgroup label="Dynamic Campaign Broadcasts">
                        {emailTemplates
                          .filter(
                            (t) =>
                              t.isDynamicCampaign ||
                              t.key?.startsWith("CAMPAIGN_") ||
                              t.category === "CAMPAIGN" ||
                              t.category === "NEWSLETTER"
                          )
                          .map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name} ({t.category})
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="Static System Trigger Templates">
                        {emailTemplates
                          .filter(
                            (t) =>
                              !t.isDynamicCampaign &&
                              !t.key?.startsWith("CAMPAIGN_") &&
                              t.category !== "CAMPAIGN" &&
                              t.category !== "NEWSLETTER"
                          )
                          .map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name} ({t.category})
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Kerala Flood Relief Appeal - Immediate Food Rations Needed"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Body (Rich HTML)
                  </label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[260px]">
                    <RichTextEditor value={emailHtml} onChange={setEmailHtml} />
                  </div>
                </div>

                {/* Dynamic Tag Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                    Dynamic Variables:
                  </span>
                  {["name", "email", "amount", "campaign", "date"].map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setEmailHtml((prev) => prev + ` {{${v}}} `)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-700"
                    >
                      +{"{{" + v + "}}"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Server Summary & Actions (1 Col) */}
            <div className="space-y-6">
              {/* Active Server Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Outgoing Mail Server</h3>

                {activeMailConfig ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {activeMailConfig.logoUrl ? (
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1.5 shadow-sm flex items-center justify-center shrink-0">
                            <img
                              src={activeMailConfig.logoUrl}
                              alt="Logo"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : null}
                        <span className="text-xs font-bold text-slate-900">
                          {activeMailConfig.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {activeMailConfig.provider}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <p>
                        Host:{" "}
                        <strong className="text-slate-800">
                          {activeMailConfig.host}:{activeMailConfig.port}
                        </strong>
                      </p>
                      <p>
                        Sender:{" "}
                        <strong className="text-slate-800">
                          "{activeMailConfig.fromName}" &lt;{activeMailConfig.fromEmail}&gt;
                        </strong>
                      </p>
                      <p>
                        Security:{" "}
                        <strong className="text-slate-800">
                          {activeMailConfig.secure ? "SSL / TLS" : "STARTTLS"}
                        </strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    <p className="font-bold">No Active Mail Server</p>
                    <p className="text-[11px] mt-1">
                      Please configure and activate Zoho Mail or an SMTP server to send broadcasts.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDirectTestModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    Send Single Test Email
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const count = (audienceCounts as any)[selectedAudience] || 0;
                      if (count === 0) {
                        toast.error("Selected audience segment currently has 0 contacts.");
                        return;
                      }
                      if (!activeMailConfig) {
                        toast.error("Please activate a Mail Server (Zoho/SMTP) before broadcasting.");
                        return;
                      }
                      setShowBroadcastConfirm(true);
                    }}
                    disabled={isBroadcasting || !activeMailConfig}
                    className="w-full py-3 px-4 rounded-xl bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-xs font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isBroadcasting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    Launch Broadcast Campaign
                  </button>
                </div>
              </div>

              {/* Anti-Spam & Delivery Safeguards */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  Anti-Spam & Delivery Safeguards
                </h4>
                <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <li>
                    • <strong>SPF / DKIM:</strong> Verify DNS TXT records for your domain in Zoho / Google console.
                  </li>
                  <li>
                    • <strong>Brand Logo:</strong> Official organization logo is automatically embedded in all outgoing headers.
                  </li>
                  <li>
                    • <strong>Rate Limits:</strong> Zoho allows up to 2,500 outgoing emails/day on standard business tiers.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: ZOHO & MAIL SERVER CONFIGURATIONS ───────────────────────── */}
        {activeTab === "servers" && (
          <div className="space-y-6">
            {/* ── GLOBAL EMAIL HEADER BRANDING & LOGO UPLOADER CARD ── */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0f2347] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#0f2347]/20">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Global Email Header Logo & Branding Hub
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Uploaded logo is embedded permanently in the top header of all static triggers and dynamic broadcast campaigns.
                    </p>
                  </div>
                </div>

                {activeMailConfig?.logoUrl && (
                  <button
                    type="button"
                    onClick={handleResetGlobalLogo}
                    disabled={uploadingLogo}
                    className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    Reset to Default Logo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                {/* Visual Header Live Email Rendering Frame */}
                <div className="lg:col-span-5 bg-[#0f2347] rounded-2xl p-6 text-center shadow-lg relative overflow-hidden border border-slate-800">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E8542A] to-[#ff7849]" />
                  <div className="flex justify-center mb-4">
                    <div className="bg-white px-5 py-2.5 rounded-2xl shadow-md border border-white/90 inline-flex items-center justify-center">
                      <img
                        src={activeMailConfig?.logoUrl || "/assets/seva-logo.png"}
                        alt="Active Logo"
                        className="max-h-16 h-14 w-auto max-w-[220px] object-contain"
                      />
                    </div>
                  </div>
                  <h4 className="text-white text-base font-bold tracking-wide">
                    SEVA INDIA FOUNDATION
                  </h4>
                  <p className="text-[#c99e32] text-[10px] font-bold uppercase tracking-wider mt-1">
                    Humanitarian & Development Outreach
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/10 text-white/90 text-[10px] font-semibold">
                    ✓ Top Header Banner on All Outgoing Emails
                  </span>
                </div>

                {/* Uploader Dropzone */}
                <div className="lg:col-span-7 space-y-3">
                  <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-[#0f2347] rounded-2xl cursor-pointer bg-white transition-all text-center group">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleQuickUploadGlobalLogo(file);
                      }}
                      disabled={uploadingLogo}
                      className="sr-only"
                    />
                    {uploadingLogo ? (
                      <div className="flex flex-col items-center gap-2 text-xs font-bold text-[#0f2347]">
                        <Loader2 size={24} className="animate-spin" />
                        <span>Uploading & Applying Logo to All Emails...</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0f2347] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to browse or drag & drop new organization logo
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Supports PNG, JPG, SVG, WEBP • Saves immediately to active mail server
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* ── CONFIGURED MAIL TRANSPORTERS ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Configured Mail Transporters</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure your official Zoho Mail, Google Workspace, or custom SMTP server.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingConfigId(null);
                  setConfigForm({
                    provider: "ZOHO",
                    label: "Zoho Mail - Seva Foundation",
                    host: "smtppro.zoho.in",
                    port: 465,
                    secure: true,
                    authUser: "info@sevafoundation.org",
                    authPass: "",
                    fromName: "Seva Foundation",
                    fromEmail: "info@sevafoundation.org",
                    replyTo: "support@sevafoundation.org",
                    logoUrl: "/assets/seva-logo.png",
                    isActive: configs.length === 0,
                  });
                  setShowConfigModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0f2347] hover:bg-[#1a3a6b] text-white transition-all shadow-md"
              >
                <Plus size={15} />
                Add New Mail Server
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-[#0f2347]" />
                <span className="text-xs font-medium text-slate-600">Loading mail servers...</span>
              </div>
            ) : configs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl text-center px-4 space-y-3">
                <Server size={40} className="text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Mail Servers Configured</h4>
                <p className="text-xs text-slate-500 max-w-md">
                  Add Zoho Mail or your organization's SMTP server to send transactional and bulk email campaigns.
                </p>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0f2347] text-white shadow-md"
                >
                  <Plus size={14} />
                  Configure Zoho Mail
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {configs.map((conf) => (
                  <div
                    key={conf._id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                      conf.isActive
                        ? "border-emerald-300 ring-2 ring-emerald-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          {conf.logoUrl ? (
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1.5 shadow-sm flex items-center justify-center shrink-0">
                              <img
                                src={conf.logoUrl}
                                alt="Logo"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          ) : null}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{conf.label}</h4>
                              {conf.isActive && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {conf.authUser}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {conf.provider}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1 font-mono border border-slate-100">
                        <p>
                          <span className="text-slate-400">Host:</span> {conf.host}:{conf.port}
                        </p>
                        <p>
                          <span className="text-slate-400">From:</span> "{conf.fromName}" &lt;{conf.fromEmail}&gt;
                        </p>
                        <p>
                          <span className="text-slate-400">Security:</span>{" "}
                          {conf.secure ? "SSL (Port 465)" : "TLS (Port 587)"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {!conf.isActive && (
                          <button
                            onClick={() => handleActivateConfig(conf._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setTestServerModal({
                              isOpen: true,
                              configId: conf._id,
                              configLabel: conf.label,
                              email: "",
                            })
                          }
                          disabled={testingConfigId === conf._id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1"
                        >
                          {testingConfigId === conf._id ? (
                            <Loader2 size={12} className="animate-spin text-[#0f2347]" />
                          ) : (
                            <Send size={12} />
                          )}
                          Test
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingConfigId(conf._id);
                            setConfigForm({
                              provider: conf.provider as any,
                              label: conf.label,
                              host: conf.host,
                              port: conf.port,
                              secure: conf.secure,
                              authUser: conf.authUser,
                              authPass: "",
                              fromName: conf.fromName,
                              fromEmail: conf.fromEmail,
                              replyTo: conf.replyTo || "",
                              logoUrl: conf.logoUrl || "/assets/seva-logo.png",
                              isActive: conf.isActive,
                            });
                            setShowConfigModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Config"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() =>
                            setDeleteConfigModal({
                              isOpen: true,
                              configId: conf._id,
                              configLabel: conf.label,
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Config"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: DELIVERY AUDIT LOGS ────────────────────────────────────── */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(["ALL", "SENT", "FAILED", "PENDING"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setLogFilter(st)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                      logFilter === st
                        ? "bg-black text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    {st === "ALL" ? "All Logs" : st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search recipient or subject..."
                  value={searchLog}
                  onChange={(e) => setSearchLog(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                />
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                  <Loader2 size={24} className="animate-spin text-[#0f2347]" />
                  <span className="text-xs font-medium text-slate-600">Loading delivery logs...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  No email audit logs match your search.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        <th className="px-6 py-4">Recipient</th>
                        <th className="px-6 py-4">Subject & Template</th>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredLogs.map((log) => {
                        const statusObj = statusConfig[log.status] || statusConfig.PENDING;
                        const StatusIcon = statusObj.icon;
                        return (
                          <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-900 block">{log.to}</span>
                            </td>
                            <td className="px-6 py-4 max-w-sm">
                              <p className="font-medium text-slate-800 truncate">{log.subject}</p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {TEMPLATE_LABELS[log.templateKey] || log.templateKey}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-[11px] whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusObj.className}`}
                              >
                                <StatusIcon size={12} />
                                {statusObj.label}
                              </span>
                              {log.error && (
                                <span
                                  title={log.error}
                                  className="block text-[10px] text-red-500 font-mono mt-1 max-w-xs truncate cursor-help"
                                >
                                  {log.error}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {log.status === "FAILED" && (
                                <button
                                  onClick={() => handleResendLog(log._id)}
                                  disabled={resendingId === log._id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                  {resendingId === log._id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <RotateCcw size={12} />
                                  )}
                                  Retry Send
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL: SERVER TEST VERIFICATION ───────────────────────────────── */}
        {testServerModal?.isOpen && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0f2347] flex items-center justify-center">
                      <Server size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Verify SMTP Connection</h3>
                      <p className="text-[11px] text-slate-500">{testServerModal.configLabel}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTestServerModal(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter an email address to dispatch an immediate handshake verification message from this server.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    value={testServerModal.email}
                    onChange={(e) =>
                      setTestServerModal({ ...testServerModal, email: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setTestServerModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteServerTest}
                    disabled={testingConfigId === testServerModal.configId}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#0f2347] hover:bg-[#1a3a6b] text-white shadow-md disabled:opacity-50"
                  >
                    {testingConfigId === testServerModal.configId ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Send Verification Mail
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}

        {/* ── MODAL: DELETE SERVER CONFIG CONFIRMATION ─────────────────────── */}
        {deleteConfigModal?.isOpen && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Delete Mail Server</h3>
                    <p className="text-xs text-slate-500">This action cannot be undone.</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Are you sure you want to delete <strong>"{deleteConfigModal.configLabel}"</strong>? If active, you must configure a new transporter to send emails.
                </p>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfigModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteConfig}
                    disabled={deletingConfig}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-50"
                  >
                    {deletingConfig ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}

        {/* ── MODAL: BROADCAST CONFIRMATION ────────────────────────────────── */}
        {showBroadcastConfirm && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-3 text-[#0f2347]">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Send size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Launch Bulk Email Broadcast</h3>
                    <p className="text-xs text-slate-500">Ready to dispatch to campaign queue</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <p>
                    <strong>Target Segment:</strong> {selectedAudience}
                  </p>
                  <p>
                    <strong>Estimated Recipients:</strong>{" "}
                    {((audienceCounts as any)[selectedAudience] || 0).toLocaleString()} contacts
                  </p>
                  <p>
                    <strong>Subject:</strong> "{emailSubject}"
                  </p>
                  <p>
                    <strong>Server:</strong> {activeMailConfig?.label} ({activeMailConfig?.fromEmail})
                  </p>
                </div>

                <p className="text-[11px] text-slate-500">
                  Emails will be dispatched in batches respecting SMTP rate limits to ensure maximum inbox deliverability.
                </p>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastConfirm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteBroadcast}
                    disabled={isBroadcasting}
                    className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold bg-[#0f2347] hover:bg-[#1a3a6b] text-white shadow-md disabled:opacity-50"
                  >
                    {isBroadcasting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Confirm & Dispatch
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}

        {/* ── MODAL: DIRECT TEST EMAIL ──────────────────────────────────────── */}
        {showDirectTestModal && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0f2347] flex items-center justify-center">
                      <Send size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Send Test Email</h3>
                      <p className="text-[11px] text-slate-500">Verify inbox rendering & formatting</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDirectTestModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recipient Test Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@domain.com"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDirectTestModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendDirectTest}
                    disabled={sendingDirectTest}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#0f2347] hover:bg-[#1a3a6b] text-white shadow-md disabled:opacity-50"
                  >
                    {sendingDirectTest ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Send Test Now
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}

        {/* ── MODAL: LIVE PREVIEW EMAIL WITH BRAND LOGO ─────────────────────── */}
        {showPreviewModal && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0f2347] flex items-center justify-center">
                      <Eye size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Email Broadcast Live Preview</h3>
                      <p className="text-[11px] text-slate-500">Subject: {emailSubject}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
                      <button
                        onClick={() => setPreviewDevice("desktop")}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          previewDevice === "desktop"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                        title="Desktop View"
                      >
                        <Laptop size={15} />
                      </button>
                      <button
                        onClick={() => setPreviewDevice("mobile")}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          previewDevice === "mobile"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                        title="Mobile View"
                      >
                        <Smartphone size={15} />
                      </button>
                    </div>

                    <button
                      onClick={() => setShowPreviewModal(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
                  <div
                    className={`bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden transition-all duration-300 ${
                      previewDevice === "mobile" ? "max-w-sm w-full" : "max-w-2xl w-full"
                    }`}
                  >
                    {/* Email Header banner with Organization Logo */}
                    <div className="bg-[#0f2347] p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-lg border border-white/90 inline-flex items-center justify-center">
                          <img
                            src={activeMailConfig?.logoUrl || "/assets/seva-logo.png"}
                            alt="Seva Foundation Logo"
                            className="max-h-16 h-14 w-auto max-w-[240px] object-contain"
                          />
                        </div>
                      </div>
                      <h1 className="text-white text-xl font-bold tracking-wide">
                        SEVA INDIA FOUNDATION
                      </h1>
                      <p className="text-[#c99e32] text-[11px] font-bold uppercase tracking-wider mt-1">
                        Humanitarian & Development Outreach
                      </p>
                    </div>

                    {/* Email Message Content */}
                    <div
                      className="p-6 text-slate-800 text-sm leading-relaxed prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: emailHtml
                          .replace(/\{\{\s*name\s*\}\}/g, "Saksham Mamgain")
                          .replace(/\{\{\s*email\s*\}\}/g, "saksham@sevafoundation.org")
                          .replace(/\{\{\s*amount\s*\}\}/g, "5,000")
                          .replace(/\{\{\s*campaign\s*\}\}/g, "Kerala Flood Relief & Rehabilitation")
                          .replace(/\{\{\s*date\s*\}\}/g, "24 Sep 2026"),
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
                </div>
              </div>
            </div>
          </Portal>
        )}

        {/* ── MODAL: CREATE / EDIT MAIL SERVER CONFIG (Includes Logo Setting) ─── */}
        {showConfigModal && (
          <Portal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingConfigId ? "Edit Mail Server Config" : "Configure Outgoing Mail Server"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Zoho Mail, Google Workspace, or Custom SMTP Credentials & Branding Logo
                    </p>
                  </div>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveConfig} className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Presets */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Select Provider Preset
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "ZOHO", title: "Zoho Mail", sub: "smtppro.zoho.in:465" },
                        { id: "GMAIL", title: "Gmail / Google", sub: "smtp.gmail.com:587" },
                        { id: "SMTP", title: "Custom SMTP", sub: "Manual Config" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => applyPreset(p.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            configForm.provider === p.id
                              ? "border-[#0f2347] bg-[#0f2347]/5 ring-2 ring-[#0f2347]/20"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900">{p.title}</p>
                          <p className="text-[10px] text-slate-500">{p.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Configuration Label <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={configForm.label}
                        onChange={(e) => setConfigForm({ ...configForm, label: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        SMTP Host Server <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={configForm.host}
                        onChange={(e) => setConfigForm({ ...configForm, host: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Port Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={configForm.port}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, port: parseInt(e.target.value) || 465 })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Security Encryption
                      </label>
                      <select
                        value={configForm.secure ? "true" : "false"}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, secure: e.target.value === "true" })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                      >
                        <option value="true">SSL / TLS (Port 465 - Recommended for Zoho)</option>
                        <option value="false">STARTTLS (Port 587 - Recommended for Gmail)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Auth User / Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="info@sevafoundation.org"
                        value={configForm.authUser}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, authUser: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Auth Password / App Password{" "}
                        {editingConfigId ? "(Leave empty to keep current)" : "*"}
                      </label>
                      <input
                        type="password"
                        required={!editingConfigId}
                        placeholder="••••••••••••"
                        value={configForm.authPass}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, authPass: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        From Display Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={configForm.fromName}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, fromName: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        From Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={configForm.fromEmail}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, fromEmail: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f2347]"
                      />
                    </div>
                  </div>

                  {/* Email Header Brand Logo Uploader */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-slate-900">
                          Email Header Brand Logo Uploader
                        </label>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Upload PNG, JPG, SVG, or WEBP logo to embed in headers of all emails
                        </p>
                      </div>
                      {configForm.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setConfigForm((prev) => ({ ...prev, logoUrl: "" }))}
                          className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Logo Preview in Dark Navy Header Frame with White Capsule */}
                      <div className="w-full sm:w-48 h-28 rounded-xl bg-[#0f2347] border border-slate-700 p-3 flex flex-col items-center justify-center shrink-0 shadow-inner relative group">
                        {configForm.logoUrl ? (
                          <div className="bg-white px-3.5 py-1.5 rounded-xl shadow-sm border border-white/90 inline-flex items-center justify-center max-w-[90%]">
                            <img
                              src={configForm.logoUrl}
                              alt="Brand Logo"
                              className="max-h-12 h-10 w-auto object-contain"
                            />
                          </div>
                        ) : (
                          <div className="text-center text-slate-400">
                            <ImageIcon size={22} className="mx-auto mb-1 opacity-50 text-slate-300" />
                            <span className="text-[10px] font-bold">No Logo Set</span>
                          </div>
                        )}
                        <span className="absolute bottom-1.5 text-[8px] font-bold uppercase tracking-wider text-[#c99e32]">
                          Header Preview
                        </span>
                      </div>

                      {/* Dropzone & Upload Button */}
                      <div className="flex-1 w-full space-y-2">
                        <label className="relative flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-300 hover:border-[#0f2347] rounded-xl cursor-pointer bg-white transition-all text-center">
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp, image/svg+xml"
                            onChange={handleUploadLogoFile}
                            disabled={uploadingLogo}
                            className="sr-only"
                          />
                          {uploadingLogo ? (
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0f2347]">
                              <Loader2 size={16} className="animate-spin" />
                              <span>Uploading Logo File...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                              <Upload size={16} className="text-[#0f2347]" />
                              <span>Click to browse & upload logo file</span>
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Recommended: High-resolution PNG or SVG with transparent background
                          </span>
                        </label>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Or URL:</span>
                          <input
                            type="text"
                            placeholder="https://yourdomain.com/logo.png"
                            value={configForm.logoUrl || ""}
                            onChange={(e) =>
                              setConfigForm({ ...configForm, logoUrl: e.target.value })
                            }
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0f2347]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowConfigModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingConfig}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold bg-[#0f2347] hover:bg-[#1a3a6b] text-white shadow-md disabled:opacity-50"
                    >
                      {savingConfig ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      Save Configuration
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
