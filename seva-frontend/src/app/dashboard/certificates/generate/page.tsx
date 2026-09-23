"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/dashboard/certificates/PageHeader";
import {
  createCertificate,
  RecipientType,
  CertificateType,
} from "@/app/api/certificate";
import { getCampaignOptions, CampaignOption } from "@/app/api/campaign";

// ─── Types ────────────────────────────────────────────────────────────────────

const RECIPIENT_TYPES: RecipientType[] = [
  "DONOR",
  "VOLUNTEER",
  "BENEFICIARY",
  "INTERN",
  "STAFF",
  "OTHER",
];

const CERT_TYPES: CertificateType[] = [
  "APPRECIATION",
  "COMPLETION",
  "PARTICIPATION",
  "DONATION_ACKNOWLEDGEMENT",
  "TRAINING",
  "OTHER",
];

const CERT_TYPE_LABELS: Record<CertificateType, string> = {
  APPRECIATION: "Certificate of Appreciation",
  COMPLETION: "Certificate of Completion",
  PARTICIPATION: "Certificate of Participation",
  DONATION_ACKNOWLEDGEMENT: "Certificate of Donation",
  TRAINING: "Certificate of Training",
  OTHER: "Certificate",
};

// ─── Field component ─────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label-eyebrow block mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-faint focus:outline-none focus:border-blueaccent disabled:opacity-50 transition-colors";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GenerateCertificatePage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);

  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    recipientType: "DONOR" as RecipientType,
    certificateType: "APPRECIATION" as CertificateType,
    programName: "",
    projectName: "",
    campaign: "",
    body: "",
    issueDate: new Date().toISOString().slice(0, 10),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCampaignOptions()
      .then(setCampaigns)
      .catch(() => {});
  }, []);

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createCertificate({
        recipientName: form.recipientName,
        recipientEmail: form.recipientEmail || undefined,
        recipientPhone: form.recipientPhone || undefined,
        recipientType: form.recipientType,
        certificateType: form.certificateType,
        programName: form.programName,
        projectName: form.projectName || undefined,
        campaign: form.campaign || undefined,
        body: form.body,
        issueDate: form.issueDate || undefined,
      });
      // Redirect directly to Manage Certificates page
      router.push("/dashboard/certificates/manage");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to generate certificate"
      );
      setLoading(false);
    }
  };

  const handleReset = () => {
    setError(null);
    setForm({
      recipientName: "",
      recipientEmail: "",
      recipientPhone: "",
      recipientType: "DONOR",
      certificateType: "APPRECIATION",
      programName: "",
      projectName: "",
      campaign: "",
      body: "",
      issueDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div>
      <PageHeader
        title="Generate Certificate"
        subtitle="Issue a new certificate to a beneficiary"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-6">
          {/* Left — form */}
          <div className="col-span-2 panel p-6">
            <p className="label-eyebrow mb-5">Recipient Details</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Full Name" required>
                <input
                  value={form.recipientName}
                  onChange={set("recipientName")}
                  required
                  placeholder="e.g. Ananya Sharma"
                  className={inputCls}
                />
              </Field>

              <Field label="Recipient Type" required>
                <select
                  value={form.recipientType}
                  onChange={set("recipientType")}
                  className={inputCls}
                >
                  {RECIPIENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={form.recipientEmail}
                  onChange={set("recipientEmail")}
                  placeholder="recipient@email.com"
                  className={inputCls}
                />
              </Field>

              <Field label="Phone">
                <input
                  value={form.recipientPhone}
                  onChange={set("recipientPhone")}
                  placeholder="+91 9876543210"
                  className={inputCls}
                />
              </Field>

              <Field label="Certificate Type" required>
                <select
                  value={form.certificateType}
                  onChange={set("certificateType")}
                  className={inputCls}
                >
                  {CERT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {CERT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Campaign">
                <select
                  value={form.campaign}
                  onChange={set("campaign")}
                  className={inputCls}
                >
                  <option value="">— None —</option>
                  {campaigns.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Program / Project Name" required>
                <input
                  value={form.programName}
                  onChange={set("programName")}
                  required
                  placeholder="e.g. Volunteer Training 2026"
                  className={inputCls}
                />
              </Field>

              <Field label="Issue Date">
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={set("issueDate")}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Certificate Body Text" required>
              <textarea
                value={form.body}
                onChange={set("body")}
                required
                rows={4}
                placeholder="In recognition of your outstanding contribution towards…"
                className={`${inputCls} resize-none`}
              />
            </Field>

            {error && (
              <p className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blueaccent text-white text-sm font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Generate Certificate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="border border-border text-sm text-muted px-5 py-2.5 rounded-lg"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right — live preview */}
          <div className="panel p-6 flex flex-col items-center">
            <p className="label-eyebrow mb-5 self-start">Live Preview</p>
            <div className="w-full aspect-[4/3] rounded-lg border border-border bg-bg flex flex-col items-center justify-center gap-2 text-center px-5 relative overflow-hidden">
              <div className="absolute inset-2 border border-gold/30 rounded-md pointer-events-none" />
              <p className="font-display text-gold text-[11px] tracking-widest uppercase font-semibold">
                Seva India Foundation
              </p>
              <p className="font-display text-lg font-bold leading-tight mt-1">
                {form.certificateType
                  ? CERT_TYPE_LABELS[form.certificateType]
                  : "Certificate"}
              </p>
              <p className="text-[10px] text-muted italic">
                This certificate is proudly presented to
              </p>
              <p className="font-display text-xl font-bold text-text-primary tracking-wide">
                {form.recipientName ? form.recipientName.toUpperCase() : "RECIPIENT NAME"}
              </p>
              {form.programName && (
                <p className="text-[10px] text-muted mt-1">{form.programName}</p>
              )}
              <p className="text-[9px] text-faint mt-3 font-mono">
                {form.issueDate
                  ? new Date(form.issueDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Issue Date"}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
