"use client";

import React, { useState } from "react";
import { Loader2, Shield, FileText } from "lucide-react";
import { createDonor, type Donor } from "@/app/api/donor";

interface DonorFormProps {
  campaignId: string;
  amount?: number;
  onCreated: (donor: Donor) => void;
}

const COUNTRY_CODES = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA / Canada" },
  { code: "+44", country: "UK" },
  { code: "+971", country: "UAE" },
  { code: "+61", country: "Australia" },
  { code: "+65", country: "Singapore" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
];

export default function DonorForm({ campaignId, amount, onCreated }: DonorFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [pan, setPan] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showTaxDetails, setShowTaxDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAnonymous && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
    if (!cleanPhone) {
      setError("Please enter your phone number.");
      return;
    }
    if (countryCode === "+91" && cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      setError("Please enter a valid phone number (between 7 and 15 digits).");
      return;
    }

    try {
      setSubmitting(true);
      const fullPhone = `${countryCode} ${cleanPhone}`;
      const donor = await createDonor({
        campaign: campaignId,
        name: isAnonymous ? "Anonymous Donor" : name.trim(),
        email: email.trim(),
        phone: fullPhone,
        pan: pan.trim() ? pan.trim().toUpperCase() : undefined,
        isAnonymous,
        amount,
      });
      onCreated(donor);
    } catch (err) {
      setError("We couldn't save your details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
      <h1 className="text-xl font-bold text-[#0f2347] mb-1">Donor Details</h1>
      <p className="text-sm text-gray-500 mb-6">
        Please provide your contact information to receive the donation receipt & 80G tax certificate.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isAnonymous && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required={!isAnonymous}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-36 px-3 py-3 border border-gray-200 rounded-xl text-sm font-medium text-[#0f2347] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.country.split(" ")[0]})
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder={countryCode === "+91" ? "9876543210 (10 digits)" : "Phone number"}
              maxLength={countryCode === "+91" ? 10 : 15}
              required
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            />
          </div>
          {countryCode === "+91" && phone && phone.length > 0 && phone.length < 10 && (
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              Mobile number must be 10 digits ({phone.length}/10 entered)
            </p>
          )}
        </div>

        {/* 80G Tax Exemption PAN input toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowTaxDetails(!showTaxDetails)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3a6b] hover:underline"
          >
            <FileText size={14} />
            {showTaxDetails ? "Hide 80G Tax Exemption Details" : "+ Add PAN for 80G Tax Exemption Receipt"}
          </button>

          {showTaxDetails && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                PAN Number (Optional)
              </label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm uppercase text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Required only if you wish to claim 50% tax deduction under Section 80G of IT Act.
              </p>
            </div>
          )}
        </div>

        {/* Anonymous donation checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-[#E8542A] border-gray-300 rounded focus:ring-[#E8542A]"
          />
          <label htmlFor="anonymous" className="text-xs text-gray-600 cursor-pointer">
            Make my donation anonymous on public leaderboards
          </label>
        </div>

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-[#E8542A] hover:bg-[#c9431d] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors duration-200 shadow-lg shadow-orange-200"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Saving details…" : "Proceed to Payment"}
        </button>

        <p className="text-[11px] text-center text-gray-400 flex items-center justify-center gap-1">
          <Shield size={12} />
          Your details are encrypted and securely stored.
        </p>
      </form>
    </div>
  );
}