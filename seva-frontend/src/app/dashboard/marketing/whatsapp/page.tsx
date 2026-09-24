"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  TrendingUp,
  MessageCircle,
  CheckCheck,
  QrCode,
  Cloud,
  RefreshCw,
  Send,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Smartphone,
  Info,
  Mail,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  whatsappAPI,
  IWhatsAppCampaign,
  IWhatsAppStats,
  IWhatsAppConfigData,
  IWhatsAppTemplate,
} from "@/app/api/whatsapp";
import axiosInstance from "@/app/api";
import { endpoint } from "@/app/api/endpoints";
import { useToast } from "@/lib/toast";

export default function WAMarketingPage() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "campaigns" | "channels" | "templates" | "logs"
  >("campaigns");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "templates" ||
      tabParam === "channels" ||
      tabParam === "logs" ||
      tabParam === "campaigns"
    ) {
      setActiveTab(tabParam as any);
      if (tabParam === "templates") {
        setTemplateType("whatsapp");
      }
    }
  }, [searchParams]);

  // Campaigns State & Pagination
  const [campaigns, setCampaigns] = useState<IWhatsAppCampaign[]>([]);
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [campaignTotalPages, setCampaignTotalPages] = useState(1);
  const campaignLimit = 8;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Stats & Config
  const [stats, setStats] = useState<IWhatsAppStats>({
    totalCampaigns: 0,
    completedCampaigns: 0,
    totalMessagesSent: 0,
    totalMessagesFailed: 0,
    successRate: 100,
  });
  const [configData, setConfigData] = useState<IWhatsAppConfigData | null>(null);

  // Templates State & Pagination
  const [templateType, setTemplateType] = useState<"whatsapp" | "email">(
    "whatsapp"
  );
  const [waTemplates, setWaTemplates] = useState<IWhatsAppTemplate[]>([]);
  const [waTemplatePage, setWaTemplatePage] = useState(1);
  const waTemplateLimit = 6;
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [emailTemplatePage, setEmailTemplatePage] = useState(1);
  const emailTemplateLimit = 6;

  // Logs State & Pagination
  const [logs, setLogs] = useState<any[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const logLimit = 15;
  const [logStatusFilter, setLogStatusFilter] = useState("ALL");
  const [logSearchQuery, setLogSearchQuery] = useState("");

  // Direct Test Message Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testProvider, setTestProvider] = useState<"BAILEYS" | "OFFICIAL_API">(
    "BAILEYS"
  );
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState(
    "Namaste! This is a test broadcast message from Seva Foundation WhatsApp Engine."
  );
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    msg: string;
  } | null>(null);

  // QR Code Quick Scan Modal
  const [showQrModal, setShowQrModal] = useState(false);

  // Official API Config Form
  const [officialCreds, setOfficialCreds] = useState({
    phoneNumberId: "",
    businessAccountId: "",
    accessToken: "",
    apiVersion: "v20.0",
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingOfficial, setTestingOfficial] = useState(false);

  // New Template Modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "DONATION" as any,
    body: "",
  });

  // Load Campaigns with pagination
  const loadCampaigns = useCallback(async () => {
    try {
      const res = await whatsappAPI.getCampaigns({
        page: campaignPage,
        limit: campaignLimit,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setCampaigns(res.campaigns || []);
      setCampaignTotal(res.total || 0);
      setCampaignTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    }
  }, [campaignPage, statusFilter, searchQuery]);

  // Load Logs with pagination
  const loadLogs = useCallback(async () => {
    try {
      const res = await whatsappAPI.getLogs({
        page: logPage,
        limit: logLimit,
        status: logStatusFilter !== "ALL" ? logStatusFilter : undefined,
        search: logSearchQuery.trim() || undefined,
      });
      setLogs(res.logs || []);
      setLogTotal(res.total || 0);
      setLogTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to load logs:", err);
    }
  }, [logPage, logStatusFilter, logSearchQuery]);

  // Load Templates & Config
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, confRes, tplsRes, emailTplsRes] =
        await Promise.allSettled([
          whatsappAPI.getStats(),
          whatsappAPI.getConfig(),
          whatsappAPI.getTemplates(),
          axiosInstance.get(endpoint.mail.getTemplates),
        ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (confRes.status === "fulfilled") {
        setConfigData(confRes.value);
        if (confRes.value.config?.officialApi) {
          setOfficialCreds({
            phoneNumberId: confRes.value.config.officialApi.phoneNumberId || "",
            businessAccountId:
              confRes.value.config.officialApi.businessAccountId || "",
            accessToken: confRes.value.config.officialApi.accessToken || "",
            apiVersion:
              confRes.value.config.officialApi.apiVersion || "v20.0",
          });
        }
      }
      if (tplsRes.status === "fulfilled") setWaTemplates(tplsRes.value);
      if (emailTplsRes.status === "fulfilled") {
        setEmailTemplates(emailTplsRes.value.data?.data || []);
      }

      await Promise.all([loadCampaigns(), loadLogs()]);
    } catch (err) {
      console.error("Failed to load WhatsApp data:", err);
    } finally {
      setLoading(false);
    }
  }, [loadCampaigns, loadLogs]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }

  async function handleBaileysReconnect() {
    try {
      setRefreshing(true);
      await whatsappAPI.reconnectBaileys();
      await loadAllData();
      setShowQrModal(true);
      toast.info("WhatsApp QR code generated. Scan with WhatsApp to link.");
    } catch (err: any) {
      toast.error(err.message || "Failed to restart Baileys session");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleBaileysDisconnect() {
    try {
      setRefreshing(true);
      await whatsappAPI.disconnectBaileys();
      await loadAllData();
      toast.success("WhatsApp session disconnected successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to disconnect");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSaveOfficialConfig() {
    try {
      setSavingConfig(true);
      await whatsappAPI.updateConfig({ officialApi: officialCreds });
      await loadAllData();
      toast.success("Official WhatsApp Cloud API settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSavingConfig(false);
    }
  }

  async function handleTestOfficialConnection() {
    try {
      setTestingOfficial(true);
      await whatsappAPI.testOfficialApi(officialCreds);
      toast.success("✓ WhatsApp Cloud API Verified! Connected to Meta Graph API.");
    } catch (err: any) {
      toast.error(
        "Verification Failed: " +
          (err?.response?.data?.message || err.message)
      );
    } finally {
      setTestingOfficial(false);
    }
  }

  async function handleSendDirectTest() {
    if (!testPhone.trim() || !testMessage.trim()) return;
    try {
      setSendingTest(true);
      setTestResult(null);
      await whatsappAPI.sendTestMessage({
        provider: testProvider,
        phone: testPhone,
        message: testMessage,
      });
      setTestResult({
        success: true,
        msg: `Test message delivered successfully to ${testPhone}`,
      });
      toast.success(`Test message delivered successfully to ${testPhone}`);
      await loadAllData();
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to send test message. Check that WhatsApp is connected.";
      setTestResult({
        success: false,
        msg: errMsg,
      });
      toast.error(errMsg);
    } finally {
      setSendingTest(false);
    }
  }

  async function handleStartCampaign(id: string) {
    try {
      await whatsappAPI.startCampaign(id);
      toast.success("Campaign broadcast initiated!");
      await loadCampaigns();
    } catch (err: any) {
      toast.error(err.message || "Failed to start campaign");
    }
  }

  async function handlePauseCampaign(id: string) {
    try {
      await whatsappAPI.pauseCampaign(id);
      toast.info("Campaign paused");
      await loadCampaigns();
    } catch (err: any) {
      toast.error(err.message || "Failed to pause campaign");
    }
  }

  async function handleResumeCampaign(id: string) {
    try {
      await whatsappAPI.resumeCampaign(id);
      toast.success("Campaign broadcast resumed");
      await loadCampaigns();
    } catch (err: any) {
      toast.error(err.message || "Failed to resume campaign");
    }
  }

  async function handleRetryFailed(id: string) {
    try {
      await whatsappAPI.retryFailed(id);
      await loadCampaigns();
      toast.success("Re-queued failed recipients for delivery!");
    } catch (err: any) {
      toast.error(err.message || "Failed to retry");
    }
  }

  async function handleDeleteCampaign(id: string) {
    try {
      await whatsappAPI.deleteCampaign(id);
      toast.success("Campaign deleted successfully");
      await loadCampaigns();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  }

  async function handleSeedTemplates() {
    try {
      await whatsappAPI.seedTemplates();
      await loadAllData();
      toast.success("Default WhatsApp templates seeded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to seed templates");
    }
  }

  async function handleCreateTemplate() {
    if (!newTemplate.name || !newTemplate.body) return;
    try {
      await whatsappAPI.createTemplate(newTemplate);
      setShowTemplateModal(false);
      setNewTemplate({ name: "", category: "DONATION", body: "" });
      toast.success("WhatsApp template created successfully!");
      await loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create template");
    }
  }

  const baileysLive = configData?.baileysLive;
  const isBaileysConnected = baileysLive?.isConnected;

  // Paginated templates slice
  const paginatedWaTemplates = waTemplates.slice(
    (waTemplatePage - 1) * waTemplateLimit,
    waTemplatePage * waTemplateLimit
  );
  const totalWaTemplatePages = Math.ceil(waTemplates.length / waTemplateLimit) || 1;

  const paginatedEmailTemplates = emailTemplates.slice(
    (emailTemplatePage - 1) * emailTemplateLimit,
    emailTemplatePage * emailTemplateLimit
  );
  const totalEmailTemplatePages =
    Math.ceil(emailTemplates.length / emailTemplateLimit) || 1;

  return (
    <div className="min-h-screen bg-white rounded-2xl border border-slate-200 pb-16">
      <div className="w-full px-6 py-8 max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
              <MessageCircle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black tracking-tight">
                WhatsApp Marketing & Bulk Broadcasts
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Dual-channel bulk messaging with Baileys Web QR and Meta Cloud API with Anti-Ban Protection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={() => {
                setTestResult(null);
                setShowTestModal(true);
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-black border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Send size={14} className="text-[#25D366]" />
              Send Test Message
            </button>

            <Link
              href="/dashboard/marketing/whatsapp/create"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-500/20"
            >
              <Plus size={16} strokeWidth={3} />
              New Broadcast Campaign
            </Link>
          </div>
        </div>

        {/* ── LIVE CONNECTION STATUS BANNER ── */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            isBaileysConnected
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
              : "bg-amber-50/70 border-amber-200 text-amber-950"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                isBaileysConnected
                  ? "bg-emerald-500 animate-pulse ring-4 ring-emerald-200"
                  : "bg-amber-500 ring-4 ring-amber-200"
              }`}
            />
            <div>
              <p className="text-xs font-bold text-black flex items-center gap-2">
                {isBaileysConnected ? (
                  <>
                    <span className="text-emerald-700">● WhatsApp Connected:</span> +{baileysLive?.phoneNumber} ({baileysLive?.userName || "Admin"})
                  </>
                ) : (
                  <>
                    <span className="text-amber-700">● WhatsApp Disconnected:</span> Scan QR code to enable WhatsApp broadcast campaigns
                  </>
                )}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isBaileysConnected
                  ? "Multi-device session is active and authenticated. Ready to send broadcasts."
                  : "Campaigns cannot be dispatched until WhatsApp is linked. Click below to pair."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isBaileysConnected ? (
              <button
                onClick={handleBaileysDisconnect}
                className="text-xs font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl transition-all"
              >
                Disconnect Session
              </button>
            ) : (
              <button
                onClick={() => {
                  if (baileysLive?.qrCode) {
                    setShowQrModal(true);
                  } else {
                    handleBaileysReconnect();
                  }
                }}
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <QrCode size={14} />
                {baileysLive?.qrCode ? "View & Scan QR Code" : "Generate Login QR Code"}
              </button>
            )}
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
              Total Broadcasts
            </p>
            <p className="text-2xl font-bold text-black font-mono">
              {stats.totalCampaigns}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">
              {stats.completedCampaigns} completed
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
              Messages Delivered
            </p>
            <p className="text-2xl font-bold text-emerald-600 font-mono">
              {stats.totalMessagesSent.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-flex items-center gap-1">
              <CheckCheck size={13} /> {stats.successRate}% Success rate
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
              Delivery Failures
            </p>
            <p className="text-2xl font-bold text-red-500 font-mono">
              {stats.totalMessagesFailed.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              Retry available in logs
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
                Channel Provider
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isBaileysConnected
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-amber-500"
                  }`}
                />
                <span className="text-xs font-bold text-black">
                  {isBaileysConnected ? "Baileys Web Active" : "Pairing Required"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("channels")}
              className="text-[11px] font-bold text-[#25D366] hover:underline text-left mt-2"
            >
              Channel Settings →
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            {
              id: "campaigns",
              label: `Broadcast Campaigns (${campaignTotal})`,
              icon: TrendingUp,
            },
            {
              id: "channels",
              label: "Channels & Anti-Ban Setup",
              icon: QrCode,
            },
            {
              id: "templates",
              label: `Templates (${waTemplates.length} WhatsApp / ${emailTemplates.length} Email)`,
              icon: FileText,
            },
            {
              id: "logs",
              label: `Delivery Audit Logs (${logTotal})`,
              icon: CheckCheck,
            },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-black"
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: CAMPAIGNS (WITH PAGINATION) ── */}
        {activeTab === "campaigns" && (
          <div className="space-y-4">
            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: "ALL", label: "All" },
                  { id: "IN_PROGRESS", label: "Running" },
                  { id: "QUEUED", label: "Queued" },
                  { id: "COMPLETED", label: "Completed" },
                  { id: "PAUSED", label: "Paused" },
                  { id: "DRAFT", label: "Draft" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setStatusFilter(f.id);
                      setCampaignPage(1);
                    }}
                    className={`text-xs font-bold px-4 py-1.5 rounded-xl border transition-all shrink-0 ${
                      statusFilter === f.id
                        ? "bg-black text-white border-black"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search campaigns by name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCampaignPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
                />
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs">
                  <Loader2 size={24} className="animate-spin text-[#25D366] mb-2" />
                  Loading broadcast campaigns...
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                    <MessageCircle size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-black">
                    No Broadcast Campaigns Found
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Create your first bulk WhatsApp campaign to reach donors, volunteers, or imported contact lists.
                  </p>
                  <Link
                    href="/dashboard/marketing/whatsapp/create"
                    className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm mt-4"
                  >
                    <Plus size={14} /> Create New Broadcast
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-4">Campaign Name</th>
                        <th className="px-6 py-4">Channel</th>
                        <th className="px-6 py-4">Audience</th>
                        <th className="px-6 py-4">Progress / Sent</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Created</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {campaigns.map((c) => {
                        const total = c.stats?.total || 1;
                        const sent = c.stats?.sent || 0;
                        const failed = c.stats?.failed || 0;
                        const progress = Math.min(
                          100,
                          Math.round(((sent + failed) / total) * 100)
                        );

                        return (
                          <tr
                            key={c._id}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <Link
                                href={`/dashboard/marketing/whatsapp/${c._id}`}
                                className="font-bold text-black hover:text-[#25D366] flex items-center gap-2 group"
                              >
                                {c.name}
                                <ExternalLink
                                  size={12}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity"
                                />
                              </Link>
                              {c.description && (
                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                  {c.description}
                                </p>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                  c.provider === "BAILEYS"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-blue-50 text-blue-800 border-blue-200"
                                }`}
                              >
                                {c.provider === "BAILEYS" ? (
                                  <>
                                    <QrCode size={11} /> Baileys Web
                                  </>
                                ) : (
                                  <>
                                    <Cloud size={11} /> Official API
                                  </>
                                )}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px]">
                                {c.audienceType.replace(/_/g, " ")}
                              </span>
                            </td>

                            <td className="px-6 py-4 min-w-[170px]">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="font-bold text-slate-700">
                                    {sent} / {total}
                                  </span>
                                  <span className="text-slate-400">
                                    {progress}%
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      failed > 0
                                        ? "bg-amber-500"
                                        : "bg-[#25D366]"
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                {failed > 0 && (
                                  <span className="text-[10px] text-red-500 font-semibold">
                                    {failed} failed
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                  c.status === "COMPLETED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : c.status === "IN_PROGRESS"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse"
                                    : c.status === "PAUSED"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : c.status === "FAILED"
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-[11px] text-slate-500">
                              {new Date(c.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {c.status === "PAUSED" && (
                                  <button
                                    onClick={() => handleResumeCampaign(c._id)}
                                    title="Resume Campaign"
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                  >
                                    <Play size={13} />
                                  </button>
                                )}
                                {c.status === "IN_PROGRESS" && (
                                  <button
                                    onClick={() => handlePauseCampaign(c._id)}
                                    title="Pause Campaign"
                                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                                  >
                                    <Pause size={13} />
                                  </button>
                                )}
                                {c.status === "QUEUED" && (
                                  <button
                                    onClick={() => handleStartCampaign(c._id)}
                                    title="Start Campaign"
                                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                                  >
                                    <Play size={13} />
                                  </button>
                                )}
                                {c.stats?.failed > 0 && (
                                  <button
                                    onClick={() => handleRetryFailed(c._id)}
                                    title="Retry Failed Recipients"
                                    className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                                  >
                                    <RotateCcw size={13} />
                                  </button>
                                )}
                                <Link
                                  href={`/dashboard/marketing/whatsapp/${c._id}`}
                                  className="text-[11px] font-bold text-black hover:text-[#25D366] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                  View Logs →
                                </Link>
                                <button
                                  onClick={() => handleDeleteCampaign(c._id)}
                                  title="Delete Campaign"
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Campaigns Pagination Footer */}
              {campaignTotal > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <p>
                    Showing {(campaignPage - 1) * campaignLimit + 1} to{" "}
                    {Math.min(campaignPage * campaignLimit, campaignTotal)} of{" "}
                    <strong>{campaignTotal}</strong> campaigns
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={campaignPage <= 1}
                      onClick={() => setCampaignPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <span className="font-bold text-black px-2">
                      Page {campaignPage} of {campaignTotalPages}
                    </span>

                    <button
                      disabled={campaignPage >= campaignTotalPages}
                      onClick={() =>
                        setCampaignPage((p) => Math.min(campaignTotalPages, p + 1))
                      }
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: CHANNELS & ANTI-BAN SETTINGS ── */}
        {activeTab === "channels" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* 1. Baileys Multi-Device Web QR Connection */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                    <QrCode size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-black">
                      WhatsApp Web (Baileys)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Multi-device persistent socket session. No template approval needed.
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    isBaileysConnected
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : baileysLive?.status === "SCAN_QR"
                      ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {baileysLive?.status || "DISCONNECTED"}
                </span>
              </div>

              {isBaileysConnected ? (
                /* Connected State */
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">
                        Active WhatsApp Connected
                      </p>
                      <p className="text-xs font-mono font-bold text-emerald-800">
                        +{baileysLive?.phoneNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Connected as {baileysLive?.userName || "Admin"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleBaileysReconnect}
                      className="text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      Re-generate QR / Switch Account
                    </button>
                    <button
                      onClick={handleBaileysDisconnect}
                      className="text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 px-4 py-2 rounded-xl transition-all"
                    >
                      Disconnect Device
                    </button>
                  </div>
                </div>
              ) : (
                /* Disconnected or Scan QR State */
                <div className="space-y-4">
                  {baileysLive?.qrCode ? (
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-4">
                      <div className="p-3 bg-white border-2 border-[#25D366] rounded-2xl shadow-md">
                        <img
                          src={baileysLive.qrCode}
                          alt="WhatsApp Scan QR"
                          className="w-52 h-52 object-contain"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-black">
                          Scan QR with WhatsApp on your phone
                        </p>
                        <p className="text-[11px] text-slate-500 max-w-xs">
                          Open WhatsApp → Settings / Three Dots → Linked Devices → Link a Device
                        </p>
                      </div>
                      <button
                        onClick={handleBaileysReconnect}
                        className="flex items-center gap-1.5 text-xs font-bold bg-black text-white px-4 py-2 rounded-xl"
                      >
                        <RefreshCw size={13} /> Refresh QR Code
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                      <Smartphone size={32} className="text-slate-400 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-black">
                          WhatsApp Session Disconnected
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Click below to start Baileys socket and generate a QR code.
                        </p>
                      </div>
                      <button
                        onClick={handleBaileysReconnect}
                        className="bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all"
                      >
                        Start Session & Generate QR
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Meta WhatsApp Official Cloud API Configuration */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Cloud size={22} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-black">
                    Meta WhatsApp Official Cloud API
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official Meta Graph API setup for verified enterprise numbers.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={officialCreds.phoneNumberId}
                    onChange={(e) =>
                      setOfficialCreds({
                        ...officialCreds,
                        phoneNumberId: e.target.value,
                      })
                    }
                    placeholder="e.g. 104829104810294"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono font-medium text-black focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    WhatsApp Business Account ID
                  </label>
                  <input
                    type="text"
                    value={officialCreds.businessAccountId}
                    onChange={(e) =>
                      setOfficialCreds({
                        ...officialCreds,
                        businessAccountId: e.target.value,
                      })
                    }
                    placeholder="e.g. 984710394819203"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono font-medium text-black focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Permanent System User Access Token
                  </label>
                  <input
                    type="password"
                    value={officialCreds.accessToken}
                    onChange={(e) =>
                      setOfficialCreds({
                        ...officialCreds,
                        accessToken: e.target.value,
                      })
                    }
                    placeholder="EAABw..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono font-medium text-black focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    API Version
                  </label>
                  <input
                    type="text"
                    value={officialCreds.apiVersion}
                    onChange={(e) =>
                      setOfficialCreds({
                        ...officialCreds,
                        apiVersion: e.target.value,
                      })
                    }
                    placeholder="v20.0"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono font-medium text-black focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveOfficialConfig}
                  disabled={savingConfig}
                  className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  {savingConfig ? "Saving..." : "Save Meta Config"}
                </button>
                <button
                  onClick={handleTestOfficialConnection}
                  disabled={testingOfficial || !officialCreds.accessToken}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                >
                  {testingOfficial ? "Verifying..." : "Verify Connection"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: SEPARATED TEMPLATES (WHATSAPP VS EMAIL BY TABS) ── */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            {/* Sub Tabs: WhatsApp Templates vs Email Templates */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTemplateType("whatsapp")}
                  className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                    templateType === "whatsapp"
                      ? "bg-[#25D366] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <MessageCircle size={14} />
                  WhatsApp Templates ({waTemplates.length})
                </button>
                <button
                  onClick={() => setTemplateType("email")}
                  className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                    templateType === "email"
                      ? "bg-black text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Mail size={14} />
                  Email Templates ({emailTemplates.length})
                </button>
              </div>

              {templateType === "whatsapp" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSeedTemplates}
                    className="text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition-all"
                  >
                    Seed Default Templates
                  </button>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
                  >
                    <Plus size={14} /> Create WhatsApp Template
                  </button>
                </div>
              ) : (
                <Link
                  href="/dashboard/marketing/email/templates"
                  className="flex items-center gap-1.5 bg-black hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  <ExternalLink size={13} /> Manage Email Templates Module
                </Link>
              )}
            </div>

            {/* WhatsApp Templates List & Pagination */}
            {templateType === "whatsapp" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedWaTemplates.map((tpl) => (
                    <div
                      key={tpl._id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-sm font-bold text-black">{tpl.name}</h3>
                          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {tpl.category}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                            {tpl.body}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400 font-medium">
                          {tpl.isSystem ? "System Default" : "Custom Template"}
                        </span>
                        <button
                          onClick={async () => {
                            try {
                              await whatsappAPI.deleteTemplate(tpl._id!);
                              toast.success("Template deleted successfully");
                              await loadAllData();
                            } catch (err: any) {
                              toast.error(err?.message || "Failed to delete template");
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp Templates Pagination */}
                {waTemplates.length > waTemplateLimit && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <p>
                      Showing {(waTemplatePage - 1) * waTemplateLimit + 1} to{" "}
                      {Math.min(waTemplatePage * waTemplateLimit, waTemplates.length)} of{" "}
                      <strong>{waTemplates.length}</strong> WhatsApp templates
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={waTemplatePage <= 1}
                        onClick={() => setWaTemplatePage((p) => Math.max(1, p - 1))}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="font-bold text-black px-2">
                        Page {waTemplatePage} of {totalWaTemplatePages}
                      </span>
                      <button
                        disabled={waTemplatePage >= totalWaTemplatePages}
                        onClick={() =>
                          setWaTemplatePage((p) =>
                            Math.min(totalWaTemplatePages, p + 1)
                          )
                        }
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Email Templates List & Pagination */}
            {templateType === "email" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedEmailTemplates.map((tpl: any) => (
                    <div
                      key={tpl._id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-sm font-bold text-black truncate">
                            {tpl.name}
                          </h3>
                          <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            {tpl.category}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mb-1">
                          Subject: {tpl.subject}
                        </p>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-32 overflow-hidden text-[11px] text-slate-500 font-mono">
                          {tpl.htmlContent ? tpl.htmlContent.replace(/<[^>]*>?/gm, '').slice(0, 150) + "..." : "No HTML body"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400 font-mono text-[10px]">
                          Key: {tpl.key}
                        </span>
                        <Link
                          href={`/dashboard/marketing/email/templates`}
                          className="text-blue-600 hover:underline font-bold"
                        >
                          Edit in Mail Module →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Email Templates Pagination */}
                {emailTemplates.length > emailTemplateLimit && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <p>
                      Showing {(emailTemplatePage - 1) * emailTemplateLimit + 1} to{" "}
                      {Math.min(
                        emailTemplatePage * emailTemplateLimit,
                        emailTemplates.length
                      )}{" "}
                      of <strong>{emailTemplates.length}</strong> Email templates
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={emailTemplatePage <= 1}
                        onClick={() =>
                          setEmailTemplatePage((p) => Math.max(1, p - 1))
                        }
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="font-bold text-black px-2">
                        Page {emailTemplatePage} of {totalEmailTemplatePages}
                      </span>
                      <button
                        disabled={emailTemplatePage >= totalEmailTemplatePages}
                        onClick={() =>
                          setEmailTemplatePage((p) =>
                            Math.min(totalEmailTemplatePages, p + 1)
                          )
                        }
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: DELIVERY AUDIT LOGS (WITH PAGINATION) ── */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-black">
                    Delivery Audit Records ({logTotal})
                  </span>
                  <div className="flex items-center gap-1">
                    {["ALL", "SENT", "FAILED"].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setLogStatusFilter(st);
                          setLogPage(1);
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          logStatusFilter === st
                            ? "bg-black text-white border-black"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search phone or name..."
                    value={logSearchQuery}
                    onChange={(e) => {
                      setLogSearchQuery(e.target.value);
                      setLogPage(1);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-black focus:outline-none focus:ring-1 focus:ring-[#25D366]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-5 py-3">Recipient</th>
                      <th className="px-5 py-3">Channel</th>
                      <th className="px-5 py-3">Campaign</th>
                      <th className="px-5 py-3">Message Snippet</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Delivery Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          No delivery log records found.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log: any) => (
                        <tr key={log._id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3">
                            <p className="font-bold text-black">
                              {log.recipientName || "Supporter"}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500">
                              +{log.recipientPhone}
                            </p>
                          </td>

                          <td className="px-5 py-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {log.provider}
                            </span>
                          </td>

                          <td className="px-5 py-3">
                            <span className="font-semibold text-slate-700">
                              {log.campaignId?.name || "Direct Test"}
                            </span>
                          </td>

                          <td className="px-5 py-3 max-w-xs">
                            <p className="text-slate-600 truncate">
                              {log.messageBody}
                            </p>
                          </td>

                          <td className="px-5 py-3">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                log.status === "SENT"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {log.status}
                            </span>
                            {log.errorReason && (
                              <p className="text-[10px] text-red-500 mt-0.5 truncate max-w-xs">
                                {log.errorReason}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-3 text-slate-400 text-[11px]">
                            {new Date(log.sentAt).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Logs Pagination Footer */}
              {logTotal > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <p>
                    Showing {(logPage - 1) * logLimit + 1} to{" "}
                    {Math.min(logPage * logLimit, logTotal)} of{" "}
                    <strong>{logTotal}</strong> delivery logs
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={logPage <= 1}
                      onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <span className="font-bold text-black px-2">
                      Page {logPage} of {logTotalPages}
                    </span>

                    <button
                      disabled={logPage >= logTotalPages}
                      onClick={() =>
                        setLogPage((p) => Math.min(logTotalPages, p + 1))
                      }
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: QR SCAN POPUP ── */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <QrCode size={18} className="text-[#25D366]" /> Link WhatsApp Device
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            {baileysLive?.qrCode ? (
              <div className="space-y-3">
                <div className="p-3 bg-white border-2 border-[#25D366] rounded-2xl shadow-inner inline-block">
                  <img
                    src={baileysLive.qrCode}
                    alt="WhatsApp QR Code"
                    className="w-56 h-56 object-contain mx-auto"
                  />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-black">
                    1. Open WhatsApp on your phone
                  </p>
                  <p className="text-[11px] text-slate-500">
                    2. Tap Settings / Menu &rarr; Linked Devices &rarr; Link a Device
                  </p>
                  <p className="text-[11px] text-slate-500">
                    3. Point your phone at this QR code
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 space-y-2">
                <Loader2 size={28} className="text-[#25D366] animate-spin mx-auto" />
                <p className="text-xs font-bold text-black">
                  Starting WhatsApp session and generating QR...
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={handleBaileysReconnect}
                className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-all"
              >
                <RefreshCw size={12} /> Regenerate QR
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-xs font-bold bg-black text-white px-5 py-2 rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DIRECT TEST MESSAGE ── */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Send size={16} className="text-[#25D366]" /> Send Direct WhatsApp Test
              </h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testResult.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <XCircle size={16} />
                )}
                <span>{testResult.msg}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestProvider("BAILEYS")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      testProvider === "BAILEYS"
                        ? "border-[#25D366] bg-[#25D366]/10 text-emerald-800"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    Baileys Web QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestProvider("OFFICIAL_API")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      testProvider === "OFFICIAL_API"
                        ? "border-blue-600 bg-blue-50 text-blue-800"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    Meta Official API
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Recipient Mobile Number (with or without +91)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210 or 919876543210"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#25D366]/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Message Text
                </label>
                <textarea
                  rows={4}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-sans text-black focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="text-xs font-bold text-slate-500 px-4 py-2.5 hover:text-black"
              >
                Close
              </button>
              <button
                type="button"
                disabled={sendingTest || !testPhone}
                onClick={handleSendDirectTest}
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe57] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all"
              >
                {sendingTest ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE TEMPLATE ── */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-black">
                Create New WhatsApp Template
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-slate-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diwali Greetings Appeal"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#25D366]/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Category
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#25D366]/40"
                >
                  <option value="DONATION">DONATION</option>
                  <option value="VOLUNTEER">VOLUNTEER</option>
                  <option value="CAMPAIGN">CAMPAIGN</option>
                  <option value="NEWSLETTER">NEWSLETTER</option>
                  <option value="GENERAL">GENERAL</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Message Content (use `{"{{name}}"}` or `{"{{amount}}"}` for variables)
                </label>
                <textarea
                  rows={5}
                  placeholder="Type WhatsApp template content..."
                  value={newTemplate.body}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, body: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-sans text-black focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="text-xs font-bold text-slate-500 px-4 py-2 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newTemplate.name || !newTemplate.body}
                onClick={handleCreateTemplate}
                className="bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold px-6 py-2 rounded-xl shadow-sm"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
