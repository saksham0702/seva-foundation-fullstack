"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Heart, Sparkles, Building2 } from "lucide-react";
import { Portal } from "@/components/shared/Portal";
import { useDonors } from "../DonorsProvider";
import { getCampaignOptions, CampaignOption } from "@/app/api/campaign";

const INITIATIVE_OPTIONS = [
  "VIDHYA (EDUCATION)",
  "AROGYA (HEALTHCARE)",
  "SAMMAAN (ELDERLY CARE)",
  "SHAKTI (WOMEN)",
  "ANNAPURNA (HUNGER)",
  "GRAMODAYA (RURAL)",
  "RAKSHAK (DISASTER)",
  "General Support",
];

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+977", country: "NP", flag: "🇳🇵" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
];

export function CreateDonorModal() {
  const { createModalOpen, closeCreateModal, createDonor, creating, createError } =
    useDonors();

  const [targetType, setTargetType] = useState<"CAMPAIGN" | "INITIATIVE">("CAMPAIGN");
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [form, setForm] = useState({
    campaign: "",
    initiative: INITIATIVE_OPTIONS[0],
    frequency: "ONE_TIME" as "ONE_TIME" | "MONTHLY",
    name: "",
    email: "",
    pan: "",
    address: "",
    amount: "",
    status: "PAID" as "PAID" | "FILLED_NOT_PAID",
  });

  // Fetch campaigns options when modal is opened
  useEffect(() => {
    if (createModalOpen) {
      const fetchOptions = async () => {
        setLoadingCampaigns(true);
        setCampaignsError(null);
        try {
          const data = await getCampaignOptions();
          setCampaigns(data);
          if (data.length > 0) {
            setForm((prev) => ({ ...prev, campaign: data[0]._id }));
          }
        } catch (err: any) {
          setCampaignsError("Failed to load campaigns list");
        } finally {
          setLoadingCampaigns(false);
        }
      };
      fetchOptions();
    } else {
      // Reset form when modal closes
      setForm({
        campaign: "",
        initiative: INITIATIVE_OPTIONS[0],
        frequency: "ONE_TIME",
        name: "",
        email: "",
        pan: "",
        address: "",
        amount: "",
        status: "PAID",
      });
      setCountryCode("+91");
      setPhoneNumber("");
      setTargetType("CAMPAIGN");
    }
  }, [createModalOpen]);

  if (!createModalOpen) return null;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 15);
    setPhoneNumber(onlyDigits);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (targetType === "CAMPAIGN" && !form.campaign) return;
    if (targetType === "INITIATIVE" && !form.initiative) return;

    const formattedPhone = phoneNumber.trim()
      ? `${countryCode} ${phoneNumber.trim()}`
      : undefined;

    await createDonor({
      campaign: targetType === "CAMPAIGN" ? form.campaign : undefined,
      targetType,
      initiative: targetType === "INITIATIVE" ? form.initiative : undefined,
      frequency: form.frequency,
      name: form.name || undefined,
      email: form.email || undefined,
      phone: formattedPhone,
      pan: form.pan || undefined,
      address: form.address || undefined,
      amount: form.amount ? Number(form.amount) : undefined,
      status: form.status,
    });
  }

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[99998] backdrop-blur-sm"
        onClick={closeCreateModal}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto my-auto max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-black tracking-tight">
                Add Donor Record
              </h2>
              <p className="text-[11px] text-slate-500">
                Record a direct contribution for a campaign or grassroots initiative.
              </p>
            </div>
            <button
              onClick={closeCreateModal}
              className="text-slate-400 hover:text-black transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 overflow-y-auto space-y-4">
            {/* Donation Type Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                Donation Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType("CAMPAIGN")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    targetType === "CAMPAIGN"
                      ? "border-black bg-black text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Campaign</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("INITIATIVE")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    targetType === "INITIATIVE"
                      ? "border-[#F5A623] bg-[#F5A623] text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Heart size={13} />
                  <span>Initiative</span>
                </button>
              </div>
            </div>

            {/* Campaign Select */}
            {targetType === "CAMPAIGN" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Target Campaign <span className="text-rose-500">*</span>
                </label>
                {loadingCampaigns ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-slate-400 font-medium">
                    <Loader2 size={12} className="animate-spin" />
                    Loading campaigns...
                  </div>
                ) : campaignsError ? (
                  <p className="text-xs text-rose-500 font-medium bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">
                    {campaignsError}
                  </p>
                ) : (
                  <select
                    name="campaign"
                    value={form.campaign}
                    onChange={handleChange}
                    required
                    className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-black bg-white focus:outline-none focus:border-black transition-colors"
                  >
                    <option value="" disabled>
                      Select a campaign
                    </option>
                    {campaigns.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Initiative Select */}
            {targetType === "INITIATIVE" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Target Initiative <span className="text-rose-500">*</span>
                </label>
                <select
                  name="initiative"
                  value={form.initiative}
                  onChange={handleChange}
                  required
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-black bg-white focus:outline-none focus:border-black transition-colors"
                >
                  {INITIATIVE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount & Frequency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Donation Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="e.g. 2500"
                  min="1"
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Frequency
                </label>
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-black bg-white focus:outline-none focus:border-black transition-colors"
                >
                  <option value="ONE_TIME">One-Time</option>
                  <option value="MONTHLY">Monthly Support</option>
                </select>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Donor Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Phone Number
                </label>
                <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-black transition-colors bg-white">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-2 py-2 bg-slate-50 border-r border-slate-200 text-xs font-semibold text-black focus:outline-none cursor-pointer shrink-0"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code + c.country} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2 text-xs text-black placeholder:text-slate-300 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Email & PAN */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="donor@example.com"
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  PAN (80G Tax)
                </label>
                <input
                  type="text"
                  name="pan"
                  value={form.pan}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            {/* Status Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Payment Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: "PAID" }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    form.status === "PAID"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  ✓ Payment Completed (PAID)
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: "FILLED_NOT_PAID" }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    form.status === "FILLED_NOT_PAID"
                      ? "border-amber-600 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  ⏳ Pending / Lead
                </button>
              </div>
            </div>

            {/* Error */}
            {createError && (
              <p className="text-xs text-rose-500 font-medium bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
                {createError}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeCreateModal}
                className="flex-1 border border-slate-200 text-black text-xs font-bold px-4 py-2.5 rounded-xl hover:border-black transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || (targetType === "CAMPAIGN" && loadingCampaigns)}
                className="flex-1 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {creating && <Loader2 size={13} className="animate-spin" />}
                {creating ? "Saving…" : "Save Donor Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

