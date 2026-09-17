"use client";

import { useState, FormEvent } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  QrCode,
  Shield,
} from "lucide-react";
import PageHeader from "@/components/dashboard/certificates/PageHeader";
import { verifyCertificate, Certificate } from "@/app/api/certificate";

// ─── Result card ──────────────────────────────────────────────────────────────

function CertificateResult({
  valid,
  certificate,
}: {
  valid: boolean;
  certificate: Certificate;
}) {
  const campaignName =
    typeof certificate.campaign === "object"
      ? certificate.campaign?.name
      : certificate.campaign;

  return (
    <div
      className={`panel p-6 mt-5 border-l-4 ${
        valid ? "border-l-green-400" : "border-l-red-400"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              valid ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
            }`}
          >
            {valid ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          </div>
          <div>
            <p className="font-semibold text-text-primary">
              {valid ? "Certificate Valid" : "Certificate Revoked"}
            </p>
            <p className="text-xs text-muted">
              {valid
                ? "This certificate is authentic and active."
                : certificate.revokedReason
                ? `Revoked: ${certificate.revokedReason}`
                : "This certificate has been revoked."}
            </p>
          </div>
        </div>
        <span className="font-mono text-xs text-faint bg-bg border border-border px-2.5 py-1 rounded-lg">
          {certificate.certificateNo}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        {[
          { label: "Recipient", value: certificate.recipientName },
          {
            label: "Certificate Type",
            value: certificate.certificateType.replace(/_/g, " "),
          },
          { label: "Program", value: certificate.programName },
          { label: "Campaign", value: campaignName || "—" },
          {
            label: "Issue Date",
            value: new Date(certificate.issueDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          },
          {
            label: "Recipient Type",
            value: certificate.recipientType,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-bg border border-border rounded-lg px-3 py-2.5"
          >
            <p className="label-eyebrow mb-1">{label}</p>
            <p className="text-text-primary font-medium truncate">{value}</p>
          </div>
        ))}
      </div>

      {certificate.qrCodeImage && (
        <div className="mt-4 flex items-center gap-3 bg-bg border border-border rounded-lg px-3 py-2">
          <QrCode size={16} className="text-blueaccent shrink-0" />
          <p className="text-xs text-muted break-all">{certificate.verifyUrl}</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerificationRegistryPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    valid: boolean;
    certificate: Certificate | null;
  } | null>(null);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    const certNo = query.trim();
    if (!certNo) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await verifyCertificate(certNo);
      setResult(res);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Certificate not found";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Verification Registry"
        subtitle="Look up and confirm certificate authenticity by certificate number"
      />

      {/* Search bar */}
      <form
        onSubmit={handleVerify}
        className="panel p-4 mb-2 flex items-center gap-3"
      >
        <Search size={16} className="text-faint shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Certificate Number (e.g. SIF-CER-2026-123456)…"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-faint focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 bg-blueaccent text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          Verify
        </button>
      </form>

      <p className="text-xs text-faint mb-5 px-1">
        Tip: Certificate numbers follow the format <span className="font-mono">SIF-CER-YYYY-XXXXXX</span>
      </p>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 panel p-4 border-l-4 border-l-red-400">
          <XCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && result.certificate && (
        <CertificateResult
          valid={result.valid}
          certificate={result.certificate}
        />
      )}

      {/* Empty state */}
      {!loading && !error && !result && (
        <div className="panel p-10 text-center">
          <Shield size={32} className="text-faint mx-auto mb-3" />
          <p className="text-sm text-muted">
            Enter a certificate number above to verify its authenticity.
          </p>
        </div>
      )}
    </div>
  );
}
