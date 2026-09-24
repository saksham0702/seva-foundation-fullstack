"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Heart, Award, Users, Sparkles } from "lucide-react";
import PageHeader from "@/components/dashboard/certificates/PageHeader";
import {
  createCertificate,
  RecipientType,
  CertificateType,
} from "@/app/api/certificate";
import { getCampaignOptions, CampaignOption } from "@/app/api/campaign";

// ─── Types & Constants ────────────────────────────────────────────────────────

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

const INITIATIVE_OPTIONS = [
  { id: "vidhya", name: "Vidhya — Child Education Initiative", short: "Child Education (Vidhya)" },
  { id: "arogya", name: "Arogya — Rural Healthcare & Mobile Medical Vans", short: "Healthcare (Arogya)" },
  { id: "poshan", name: "Poshan — Food Security & Nutrition Relief", short: "Nutrition (Poshan)" },
  { id: "vridh-care", name: "Vridh Care — Elder Care & Pension Support", short: "Elder Care (Vridh Care)" },
  { id: "swachh-bharat", name: "Swachh Bharat — Clean Water & Sanitation", short: "Clean Water & Sanitation" },
  { id: "disaster-relief", name: "Disaster Relief & Emergency Rehabilitation", short: "Disaster Relief" },
  { id: "animal-welfare", name: "Pashu Seva — Animal Rescue & Care", short: "Animal Welfare" },
  { id: "women-empowerment", name: "Naari Shakti — Women Skill & Livelihood", short: "Women Empowerment" },
];

const VOLUNTEER_PROGRAMS = [
  "Community Food Distribution Drive",
  "Free Eye & Medical Health Camp Volunteer",
  "Slum Teaching & Remedial Education Drive",
  "Tree Plantation & Eco-Swaraj Drive",
  "Winter Warmth & Blanket Distribution",
  "Emergency Flood & Disaster Relief Volunteer",
  "Youth Leadership & Outreach Volunteer Program",
];

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+1", country: "CA", flag: "🇨🇦" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
];

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

  // Association Target Type: CAMPAIGN | INITIATIVE | VOLUNTEER | CUSTOM
  const [targetType, setTargetType] = useState<"CAMPAIGN" | "INITIATIVE" | "VOLUNTEER" | "CUSTOM">("CAMPAIGN");

  // Country Code & Phone
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientType: "DONOR" as RecipientType,
    certificateType: "APPRECIATION" as CertificateType,
    programName: "",
    projectName: "",
    campaign: "",
    initiative: INITIATIVE_OPTIONS[0].name,
    volunteerProgram: VOLUNTEER_PROGRAMS[0],
    body: "In recognition of your outstanding and dedicated contribution towards our humanitarian initiatives.",
    issueDate: new Date().toISOString().slice(0, 10),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCampaignOptions()
      .then((camps) => {
        setCampaigns(camps);
        if (camps.length > 0 && targetType === "CAMPAIGN" && !form.campaign) {
          setForm((f) => ({
            ...f,
            campaign: camps[0]._id,
            programName: camps[0].name,
            body: `In deep appreciation for your generous and heartfelt support towards the "${camps[0].name}" campaign.`,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleTargetTypeChange = (type: "CAMPAIGN" | "INITIATIVE" | "VOLUNTEER" | "CUSTOM") => {
    setTargetType(type);
    if (type === "CAMPAIGN") {
      const selectedCamp = campaigns.find((c) => c._id === form.campaign) || campaigns[0];
      const campName = selectedCamp ? selectedCamp.name : "Grassroots Campaign";
      setForm((f) => ({
        ...f,
        recipientType: "DONOR",
        certificateType: "APPRECIATION",
        campaign: selectedCamp ? selectedCamp._id : "",
        programName: campName,
        projectName: campName,
        body: `In deep appreciation for your generous and heartfelt support towards the "${campName}" campaign.`,
      }));
    } else if (type === "INITIATIVE") {
      const initName = form.initiative || INITIATIVE_OPTIONS[0].name;
      setForm((f) => ({
        ...f,
        recipientType: "DONOR",
        certificateType: "APPRECIATION",
        campaign: "",
        programName: initName,
        projectName: initName,
        body: `In sincere appreciation for your invaluable contribution and support towards our "${initName}".`,
      }));
    } else if (type === "VOLUNTEER") {
      const volProg = form.volunteerProgram || VOLUNTEER_PROGRAMS[0];
      setForm((f) => ({
        ...f,
        recipientType: "VOLUNTEER",
        certificateType: "APPRECIATION",
        campaign: "",
        programName: volProg,
        projectName: volProg,
        body: `In heartfelt recognition of your selfless service, commitment, and dedicated volunteer contribution towards the "${volProg}".`,
      }));
    } else {
      setForm((f) => ({
        ...f,
        campaign: "",
        programName: "",
        projectName: "",
        body: "In recognition of your outstanding and dedicated contribution towards our humanitarian initiatives.",
      }));
    }
  };

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    setForm((f) => {
      const updated = { ...f, [field]: val };
      if (field === "campaign") {
        const camp = campaigns.find((c) => c._id === val);
        if (camp) {
          updated.programName = camp.name;
          updated.projectName = camp.name;
          updated.body = `In deep appreciation for your generous and heartfelt support towards the "${camp.name}" campaign.`;
        }
      } else if (field === "initiative") {
        updated.programName = val;
        updated.projectName = val;
        updated.body = `In sincere appreciation for your invaluable contribution and support towards our "${val}".`;
      } else if (field === "volunteerProgram") {
        updated.programName = val;
        updated.projectName = val;
        updated.body = `In heartfelt recognition of your selfless service, commitment, and dedicated volunteer contribution towards the "${val}".`;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "").trim();
    if (cleanPhone) {
      if (countryCode === "+91" && cleanPhone.length !== 10) {
        setError("Please enter a valid 10-digit Indian mobile number");
        return;
      }
    }

    setLoading(true);
    try {
      const fullPhone = cleanPhone ? `${countryCode} ${cleanPhone}` : undefined;
      await createCertificate({
        recipientName: form.recipientName.trim(),
        recipientEmail: form.recipientEmail?.trim() || undefined,
        recipientPhone: fullPhone,
        recipientType: form.recipientType,
        certificateType: form.certificateType,
        programName: form.programName.trim(),
        projectName: form.projectName?.trim() || form.programName.trim() || undefined,
        campaign: targetType === "CAMPAIGN" && form.campaign ? form.campaign : undefined,
        body: form.body.trim(),
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
    setPhoneNumber("");
    setCountryCode("+91");
    setTargetType("CAMPAIGN");
    setForm({
      recipientName: "",
      recipientEmail: "",
      recipientType: "DONOR",
      certificateType: "APPRECIATION",
      programName: campaigns[0]?.name || "",
      projectName: campaigns[0]?.name || "",
      campaign: campaigns[0]?._id || "",
      initiative: INITIATIVE_OPTIONS[0].name,
      volunteerProgram: VOLUNTEER_PROGRAMS[0],
      body: "In recognition of your outstanding and dedicated contribution towards our humanitarian initiatives.",
      issueDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div>
      <PageHeader
        title="Generate Certificate"
        subtitle="Issue and verify a certificate for donors, volunteers, and initiatives"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — form */}
          <div className="lg:col-span-2 panel p-6 space-y-6">
            {/* Category / Initiative / Campaign / Volunteer Mode Selector */}
            <div>
              <p className="label-eyebrow mb-2.5">Associated Cause / Initiative</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "CAMPAIGN", label: "Campaign", icon: Heart },
                  { id: "INITIATIVE", label: "Initiative", icon: Award },
                  { id: "VOLUNTEER", label: "Volunteer Drive", icon: Users },
                  { id: "CUSTOM", label: "Custom Program", icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = targetType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTargetTypeChange(item.id as any)}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        active
                          ? "bg-[#0f2347] text-white border-[#0f2347] shadow-sm"
                          : "bg-bg text-muted border-border hover:border-blueaccent/60 hover:text-text-primary"
                      }`}
                    >
                      <Icon size={14} className={active ? "text-gold" : "text-muted"} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipient Details */}
            <div>
              <p className="label-eyebrow mb-4">Recipient &amp; Certificate Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <input
                    value={form.recipientName}
                    onChange={set("recipientName")}
                    required
                    placeholder="e.g. Ananya Sharma"
                    className={inputCls}
                  />
                </Field>

                <Field label="Recipient Role" required>
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

                <Field label="Email Address">
                  <input
                    type="email"
                    value={form.recipientEmail}
                    onChange={set("recipientEmail")}
                    placeholder="recipient@email.com"
                    className={inputCls}
                  />
                </Field>

                {/* Phone number with Country Code Selector */}
                <div>
                  <label className="label-eyebrow block mb-2">Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-bg border border-border rounded-lg px-2.5 py-2 text-xs text-text-primary focus:outline-none focus:border-blueaccent shrink-0 font-medium"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={`${c.country}-${c.code}`} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        const maxL = countryCode === "+91" ? 10 : 15;
                        if (val.length <= maxL) {
                          setPhoneNumber(val);
                        }
                      }}
                      placeholder={
                        countryCode === "+91" ? "9876543210 (10 digits)" : "Phone number"
                      }
                      maxLength={countryCode === "+91" ? 10 : 15}
                      className={inputCls}
                    />
                  </div>
                  {countryCode === "+91" && phoneNumber && phoneNumber.length > 0 && phoneNumber.length < 10 && (
                    <p className="text-[11px] text-amber-500 mt-1">
                      Please enter {10 - phoneNumber.length} more digits
                    </p>
                  )}
                </div>

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

                {/* Conditional Association Selector */}
                {targetType === "CAMPAIGN" && (
                  <Field label="Select Campaign" required>
                    <select
                      value={form.campaign}
                      onChange={set("campaign")}
                      className={inputCls}
                    >
                      {campaigns.length === 0 ? (
                        <option value="">No active campaigns</option>
                      ) : (
                        campaigns.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))
                      )}
                    </select>
                  </Field>
                )}

                {targetType === "INITIATIVE" && (
                  <Field label="Select Foundation Initiative" required>
                    <select
                      value={form.initiative}
                      onChange={set("initiative")}
                      className={inputCls}
                    >
                      {INITIATIVE_OPTIONS.map((init) => (
                        <option key={init.id} value={init.name}>
                          {init.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {targetType === "VOLUNTEER" && (
                  <Field label="Select Volunteer Drive / Program" required>
                    <select
                      value={form.volunteerProgram}
                      onChange={set("volunteerProgram")}
                      className={inputCls}
                    >
                      {VOLUNTEER_PROGRAMS.map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {targetType === "CUSTOM" && (
                  <Field label="Program / Project Name" required>
                    <input
                      value={form.programName}
                      onChange={set("programName")}
                      required
                      placeholder="e.g. Annual Community Service 2026"
                      className={inputCls}
                    />
                  </Field>
                )}

                <Field label="Issue Date">
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={set("issueDate")}
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>

            {/* Body */}
            <Field label="Certificate Citation / Body Text" required>
              <textarea
                value={form.body}
                onChange={set("body")}
                required
                rows={4}
                placeholder="In recognition of your outstanding and dedicated contribution towards…"
                className={`${inputCls} resize-none`}
              />
            </Field>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blueaccent hover:bg-blue-dark text-white text-sm font-semibold px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all shadow-sm"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Generate Certificate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="border border-border text-sm text-muted hover:text-text-primary px-5 py-2.5 rounded-xl transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right — live preview */}
          <div className="panel p-6 flex flex-col items-center">
            <p className="label-eyebrow mb-4 self-start">Live Certificate Preview</p>
            <div className="w-full aspect-[4/3] rounded-2xl border border-border bg-bg flex flex-col items-center justify-center gap-1.5 text-center p-6 relative overflow-hidden shadow-xs">
              <div className="absolute inset-2.5 border border-gold/30 rounded-xl pointer-events-none" />
              
              <span className="text-gold text-[10px] tracking-[0.2em] uppercase font-bold">
                SEVA INDIA FOUNDATION
              </span>
              
              <h3 className="font-display text-base font-bold text-text-primary leading-tight mt-0.5">
                {form.certificateType
                  ? CERT_TYPE_LABELS[form.certificateType]
                  : "Certificate"}
              </h3>
              
              <p className="text-[10px] text-muted italic">
                This certificate is proudly presented to
              </p>
              
              <p className="font-display text-lg font-bold text-gold tracking-wide">
                {form.recipientName ? form.recipientName.toUpperCase() : "RECIPIENT NAME"}
              </p>
              
              {form.programName && (
                <p className="text-[10.5px] text-text-primary font-medium max-w-[240px] truncate">
                  {form.programName}
                </p>
              )}

              <p className="text-[9.5px] text-muted leading-relaxed line-clamp-2 max-w-[230px] px-2 italic">
                &ldquo;{form.body}&rdquo;
              </p>
              
              <div className="flex items-center justify-between w-full px-4 mt-2 text-[9px] text-faint font-mono border-t border-border/50 pt-1.5">
                <span>SEVA-CERT-{new Date().getFullYear()}</span>
                <span>
                  {form.issueDate
                    ? new Date(form.issueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Issue Date"}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-bg border border-border rounded-xl w-full text-xs text-muted space-y-1">
              <div className="flex justify-between">
                <span>Recipient Role:</span>
                <strong className="text-text-primary capitalize">{form.recipientType.toLowerCase()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Associated Cause:</span>
                <strong className="text-text-primary truncate max-w-[150px]">{form.programName || "General"}</strong>
              </div>
              {phoneNumber && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <strong className="text-text-primary">{countryCode} {phoneNumber}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
