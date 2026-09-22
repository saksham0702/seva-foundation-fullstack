"use client";

import { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  ShieldOff,
  Trash2,
  FileText,
  X,
  AlertTriangle,
  Download,
  Eye,
} from "lucide-react";
import {
  CertificatesProvider,
  useCertificates,
  Certificate,
} from "../CertificatesProvider";
import PageHeader from "@/components/dashboard/certificates/PageHeader";
import { generatePdf } from "@/app/api/certificate";
import { getImageUrl } from "@/lib/image";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  "ACTIVE" | "REVOKED",
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-400/10 text-green-400 border border-green-400/20",
  },
  REVOKED: {
    label: "Revoked",
    className: "bg-red-400/10 text-red-400 border border-red-400/20",
  },
};

const TYPE_LABELS: Record<string, string> = {
  APPRECIATION: "Appreciation",
  COMPLETION: "Completion",
  PARTICIPATION: "Participation",
  DONATION_ACKNOWLEDGEMENT: "Donation",
  TRAINING: "Training",
  OTHER: "Other",
};

// ─── Detail Drawer ─────────────────────────────────────────────────────────────

function CertificateDrawer({
  cert,
  onClose,
}: {
  cert: Certificate;
  onClose: () => void;
}) {
  const { revokeCert, reactivateCert, deleteCert, actionLoading, actionError } =
    useCertificates();
  const [revokeReason, setRevokeReason] = useState("");
  const [showRevokeInput, setShowRevokeInput] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(cert.pdfUrl || null);

  const cfg = STATUS_CONFIG[cert.status];
  const campaignName =
    typeof cert.campaign === "object" ? cert.campaign?.name : cert.campaign;

  const handleRevoke = async () => {
    if (!revokeReason.trim()) return;
    await revokeCert(cert._id, revokeReason.trim());
  };

  const handleGeneratePdf = async () => {
    setPdfLoading(true);
    try {
      const updated = await generatePdf(cert._id);
      setPdfUrl(updated.pdfUrl || null);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0e1528] border-l border-border z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="font-semibold text-text-primary">{cert.recipientName}</p>
            <p className="font-mono text-[11px] text-faint">{cert.certificateNo}</p>
          </div>
          <button
            onClick={onClose}
            className="text-faint hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full ${cfg.className}`}
            >
              {cfg.label}
            </span>
            <span className="text-xs text-muted">
              {TYPE_LABELS[cert.certificateType] || cert.certificateType}
            </span>
          </div>

          {/* Details */}
          <div>
            <p className="label-eyebrow mb-2">Certificate Details</p>
            <div className="bg-bg border border-border rounded-xl divide-y divide-border">
              {[
                { label: "Recipient Type", value: cert.recipientType },
                { label: "Program", value: cert.programName },
                { label: "Campaign", value: campaignName || "—" },
                {
                  label: "Issue Date",
                  value: new Date(cert.issueDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                },
                { label: "Email", value: cert.recipientEmail || "—" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-[11px] font-semibold text-faint uppercase tracking-wider">
                    {label}
                  </span>
                  <span className="text-sm text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Body text */}
          {cert.body && (
            <div>
              <p className="label-eyebrow mb-2">Body Text</p>
              <p className="text-xs text-muted leading-relaxed bg-bg border border-border rounded-xl px-4 py-3">
                {cert.body}
              </p>
            </div>
          )}

          {/* Visual Certificate Preview Card */}
          <div className="bg-white rounded-xl border-2 border-amber-500/40 p-5 text-gray-900 shadow-lg relative overflow-hidden">
            {/* Watermark / Seal background */}
            {cert.signatures?.seal?.imageUrl && (
              <img
                src={getImageUrl(cert.signatures.seal.imageUrl)}
                alt="Seal"
                className="absolute inset-0 m-auto w-32 h-32 object-contain opacity-10 pointer-events-none"
              />
            )}

            <div className="text-center border-b border-gray-200 pb-3 mb-3">
              <p className="text-[10px] uppercase font-bold tracking-widest text-amber-600">
                Seva India Foundation
              </p>
              <h4 className="text-base font-extrabold text-[#0B2C6B] mt-0.5 font-serif">
                {TYPE_LABELS[cert.certificateType] || "Certificate"}
              </h4>
              <p className="text-[10px] text-gray-400 italic">This is proudly presented to</p>
              <h3 className="text-lg font-black text-gray-900 mt-1 font-serif">
                {cert.recipientName}
              </h3>
              <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 px-2">
                {cert.body || `For exemplary participation and dedication to ${cert.programName}.`}
              </p>
            </div>

            {/* Program info & QR */}
            <div className="flex items-center justify-between text-[11px] text-gray-600 mb-4 px-1">
              <div>
                <span className="font-semibold text-gray-800">Program:</span> {cert.programName}
                <div className="text-[10px] text-gray-400">No: {cert.certificateNo}</div>
              </div>
              {cert.qrCodeImage && (
                <div className="text-center">
                  <img
                    src={cert.qrCodeImage}
                    alt="QR Verify"
                    className="w-12 h-12 border border-gray-200 rounded p-0.5 mx-auto"
                  />
                  <span className="text-[9px] text-gray-400 block mt-0.5">Verified</span>
                </div>
              )}
            </div>

            {/* Digital Signatures Display */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
              {/* Secretary */}
              <div className="text-center flex flex-col items-center">
                <div className="h-10 flex items-center justify-center">
                  {cert.signatures?.secretary?.imageUrl ? (
                    <img
                      src={getImageUrl(cert.signatures.secretary.imageUrl)}
                      alt="Secretary Signature"
                      className="max-h-9 max-w-[100px] object-contain"
                    />
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-700 italic border border-dashed border-emerald-300 px-2 py-0.5 rounded bg-emerald-50">
                      ✓ Digitally Signed
                    </span>
                  )}
                </div>
                <div className="w-24 border-t border-gray-400 mt-1"></div>
                <p className="text-[10px] font-bold text-gray-800 mt-0.5">
                  {cert.signatures?.secretary?.signatoryName || "General Secretary"}
                </p>
                <p className="text-[9px] text-gray-400">
                  {cert.signatures?.secretary?.label || "Secretary"}
                </p>
              </div>

              {/* President */}
              <div className="text-center flex flex-col items-center">
                <div className="h-10 flex items-center justify-center">
                  {cert.signatures?.president?.imageUrl ? (
                    <img
                      src={getImageUrl(cert.signatures.president.imageUrl)}
                      alt="President Signature"
                      className="max-h-9 max-w-[100px] object-contain"
                    />
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-700 italic border border-dashed border-emerald-300 px-2 py-0.5 rounded bg-emerald-50">
                      ✓ Digitally Signed
                    </span>
                  )}
                </div>
                <div className="w-24 border-t border-gray-400 mt-1"></div>
                <p className="text-[10px] font-bold text-gray-800 mt-0.5">
                  {cert.signatures?.president?.signatoryName || "President"}
                </p>
                <p className="text-[9px] text-gray-400">
                  {cert.signatures?.president?.label || "President / Trustee"}
                </p>
              </div>
            </div>
          </div>

          {/* Revoke reason (if revoked) */}
          {cert.status === "REVOKED" && cert.revokedReason && (
            <div>
              <p className="label-eyebrow mb-2">Revoke Reason</p>
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {cert.revokedReason}
              </p>
            </div>
          )}

          {/* Action error */}
          {actionError && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {actionError}
            </p>
          )}

          {/* Revoke input */}
          {showRevokeInput && cert.status === "ACTIVE" && (
            <div className="bg-bg border border-border rounded-xl p-4">
              <p className="label-eyebrow mb-2">Reason for Revocation</p>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows={3}
                placeholder="Briefly describe the reason…"
                className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-faint focus:outline-none resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleRevoke}
                  disabled={actionLoading || !revokeReason.trim()}
                  className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {actionLoading && <Loader2 size={12} className="animate-spin" />}
                  Confirm Revoke
                </button>
                <button
                  onClick={() => setShowRevokeInput(false)}
                  className="border border-border text-xs text-muted px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border flex flex-col gap-2">
          {/* PDF */}
          <div className="flex gap-2">
            <button
              onClick={handleGeneratePdf}
              disabled={pdfLoading}
              className="flex-1 flex items-center justify-center gap-2 border border-border text-sm text-muted px-3 py-2.5 rounded-lg hover:text-text-primary transition-colors"
            >
              {pdfLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileText size={14} />
              )}
              Generate PDF
            </button>
            {pdfUrl && (
              <a
                href={getImageUrl(pdfUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blueaccent/15 text-blueaccent text-sm font-semibold px-3 py-2.5 rounded-lg border border-blueaccent/30"
              >
                Download
              </a>
            )}
          </div>

          {/* Revoke / Reactivate */}
          {cert.status === "ACTIVE" ? (
            <button
              onClick={() => setShowRevokeInput((v) => !v)}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 border border-red-400/30 text-red-400 text-sm px-3 py-2.5 rounded-lg hover:bg-red-400/10 transition-colors"
            >
              <ShieldOff size={14} /> Revoke Certificate
            </button>
          ) : (
            <button
              onClick={() => reactivateCert(cert._id)}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 border border-green-400/30 text-green-400 text-sm px-3 py-2.5 rounded-lg hover:bg-green-400/10 transition-colors"
            >
              {actionLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShieldCheck size={14} />
              )}
              Reactivate Certificate
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => {
              if (
                confirm(
                  "Permanently soft-delete this certificate? It will be hidden from all views."
                )
              )
                deleteCert(cert._id);
            }}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 text-red-500/60 text-xs px-3 py-2 rounded-lg hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} /> Delete Record
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Filters bar ───────────────────────────────────────────────────────────────

function FiltersBar() {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    recipientTypeFilter,
    setRecipientTypeFilter,
  } = useCertificates();

  const inputCls =
    "bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-faint focus:outline-none focus:border-blueaccent transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <div className="flex items-center gap-2 flex-1 min-w-[200px] panel px-3 py-2">
        <Search size={14} className="text-faint shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, cert number, program…"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-faint focus:outline-none"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className={inputCls}
      >
        <option value="All">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="REVOKED">Revoked</option>
      </select>
      <select
        value={recipientTypeFilter}
        onChange={(e) => setRecipientTypeFilter(e.target.value)}
        className={inputCls}
      >
        <option value="All">All Types</option>
        {["DONOR", "VOLUNTEER", "BENEFICIARY", "INTERN", "STAFF", "OTHER"].map(
          (t) => (
            <option key={t} value={t}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </option>
          )
        )}
      </select>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

function CertificatesTable() {
  const {
    paginated,
    filtered,
    page,
    setPage,
    totalPages,
    PAGE_SIZE,
    selectedCert,
    setSelectedCert,
    loading,
    error,
    refetch,
  } = useCertificates();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadPdf = async (cert: Certificate) => {
    if (cert.pdfUrl) {
      window.open(getImageUrl(cert.pdfUrl), "_blank");
      return;
    }
    setDownloadingId(cert._id);
    try {
      const updated = await generatePdf(cert._id);
      if (updated?.pdfUrl) {
        window.open(getImageUrl(updated.pdfUrl), "_blank");
        refetch();
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-faint">
        <Loader2 size={22} className="animate-spin" />
        <p className="text-sm">Loading certificates…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle size={24} className="text-red-400" />
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={refetch}
          className="text-xs font-semibold border border-border px-4 py-2 rounded-xl hover:border-blueaccent transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="label-eyebrow font-normal text-left px-5 py-3">
                  Certificate No
                </th>
                <th className="label-eyebrow font-normal text-left px-5 py-3">
                  Recipient
                </th>
                <th className="label-eyebrow font-normal text-left px-5 py-3 hidden md:table-cell">
                  Program
                </th>
                <th className="label-eyebrow font-normal text-left px-5 py-3 hidden lg:table-cell">
                  Type
                </th>
                <th className="label-eyebrow font-normal text-left px-5 py-3 hidden sm:table-cell">
                  Issue Date
                </th>
                <th className="label-eyebrow font-normal text-left px-5 py-3">
                  Status
                </th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-sm text-faint"
                  >
                    No certificates match your search.
                  </td>
                </tr>
              ) : (
                paginated.map((cert) => {
                  const cfg = STATUS_CONFIG[cert.status];
                  return (
                    <tr
                      key={cert._id}
                      onClick={() => setSelectedCert(cert)}
                      className="border-b border-border last:border-0 hover:bg-panel/60 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-muted">
                        {cert.certificateNo}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-text-primary">
                          {cert.recipientName}
                        </p>
                        {cert.recipientEmail && (
                          <p className="text-[11px] text-faint">
                            {cert.recipientEmail}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-muted hidden md:table-cell truncate max-w-[180px]">
                        {cert.programName}
                      </td>
                      <td className="px-5 py-3.5 text-muted hidden lg:table-cell">
                        {TYPE_LABELS[cert.certificateType] ||
                          cert.certificateType}
                      </td>
                      <td className="px-5 py-3.5 text-muted hidden sm:table-cell text-xs">
                        {new Date(cert.issueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${cfg.className}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCert(cert)}
                            className="flex items-center gap-1.5 text-xs font-semibold border border-border px-3 py-1.5 rounded-lg text-text-primary hover:bg-panel transition-colors"
                          >
                            <Eye size={13} /> View
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(cert)}
                            disabled={downloadingId === cert._id}
                            className="flex items-center gap-1.5 text-xs font-semibold bg-blueaccent text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            {downloadingId === cert._id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Download size={13} />
                            )}
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <p className="text-[11px] text-faint">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length} certificates
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-faint hover:border-blueaccent hover:text-blueaccent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                    page === p
                      ? "bg-blueaccent text-white border-blueaccent"
                      : "border-border text-faint hover:border-blueaccent hover:text-blueaccent"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-faint hover:border-blueaccent hover:text-blueaccent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedCert && (
        <CertificateDrawer
          cert={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </>
  );
}

// ─── Stats strip ─────────────────────────────────────────────────────────────

function StatsStrip() {
  const { stats, statsLoading } = useCertificates();

  if (statsLoading || !stats) return null;

  const items = [
    { label: "Total", value: stats.totalCertificates },
    { label: "Active", value: stats.activeCertificates },
    { label: "Revoked", value: stats.revokedCertificates },
    { label: "Today", value: stats.generatedToday },
    { label: "This Month", value: stats.generatedThisMonth },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {items.map(({ label, value }) => (
        <div key={label} className="panel px-4 py-3 text-center">
          <p className="font-display text-2xl font-bold text-text-primary">
            {value.toLocaleString("en-IN")}
          </p>
          <p className="label-eyebrow mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Page inner ────────────────────────────────────────────────────────────────

function ManagePageInner() {
  return (
    <div>
      <PageHeader
        title="Manage Certificates"
        subtitle="View, revoke, reactivate and download all issued certificates"
      />
      <StatsStrip />
      <FiltersBar />
      <CertificatesTable />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManageCertificatesPage() {
  return (
    <CertificatesProvider>
      <ManagePageInner />
    </CertificatesProvider>
  );
}
