"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  MessageSquare,
  Heart,
  Utensils,
  Activity,
  Home,
  Building2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { initiatePaymentOrder, verifyPayment, getDonations, Donation } from "@/app/api/donation";
import { getCmsPageBySlug } from "@/app/api/cms";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface InitiativeDonationSectionProps {
  initialInitiative?: string;
  campaignId?: string;
  className?: string;
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];

export default function InitiativeDonationSection({
  initialInitiative,
  campaignId,
  className = "",
}: InitiativeDonationSectionProps) {
  // Step tracking: 1 = Amount & Purpose, 2 = Donor Details, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [amount, setAmount] = useState<number>(1000);
  const [customAmountStr, setCustomAmountStr] = useState<string>("1000");
  const [selectedPurpose, setSelectedPurpose] = useState<string>(
    initialInitiative || "General Support"
  );

  // Dynamic initiatives and live donations loaded from backend
  const [initiativeOptions, setInitiativeOptions] = useState<{ label: string; value: string }[]>([
    { label: "General Support", value: "General Support" },
  ]);
  const [liveDonations, setLiveDonations] = useState<{ name: string; amount: string; time: string }[]>([]);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Donor form fields
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorPan, setDonorPan] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  const [tribute, setTribute] = useState("No Tribute");
  const [message, setMessage] = useState("");

  // Payment processing state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null);
  const [completedReceipt, setCompletedReceipt] = useState<string | null>(null);

  // Fetch dynamic initiatives and real donations from backend
  useEffect(() => {
    let active = true;

    // 1. Fetch CMS our-work initiatives
    getCmsPageBySlug("our-work")
      .then((data) => {
        if (!active || !data?.sections || data.sections.length === 0) return;
        const dynamicOpts = [
          { label: "General Support", value: "General Support" },
          ...data.sections.map((s: any) => ({
            label: s.title || s.name || s.key,
            value: s.title || s.name || s.key,
          })),
        ];
        setInitiativeOptions(dynamicOpts);
      })
      .catch((err) => console.warn("Could not fetch CMS initiatives dynamically:", err));

    // 2. Fetch real successful donations from backend for live ticker
    getDonations({ status: "SUCCESS" })
      .then((data) => {
        if (!active || !data || data.length === 0) return;
        const parsed = data.slice(0, 10).map((d) => {
          const donorObj = typeof d.donor === "object" ? d.donor : null;
          let formattedName = "Supporter";
          if (donorObj?.name) {
            const parts = donorObj.name.trim().split(" ");
            formattedName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
          }
          const diffMs = Math.max(0, Date.now() - new Date(d.createdAt || Date.now()).getTime());
          const diffMins = Math.floor(diffMs / (1000 * 60));
          const time =
            diffMins < 2
              ? "just now"
              : diffMins < 60
              ? `${diffMins}m ago`
              : diffMins < 1440
              ? `${Math.floor(diffMins / 60)}h ago`
              : `${Math.floor(diffMins / 1440)}d ago`;

          return {
            name: formattedName,
            amount: `₹${(d.amount || 0).toLocaleString("en-IN")}`,
            time,
          };
        });
        if (parsed.length > 0) {
          setLiveDonations(parsed);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Live ticker rotation
  useEffect(() => {
    if (liveDonations.length <= 1) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveDonations.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [liveDonations]);

  // Update selected purpose if initialInitiative prop changes
  useEffect(() => {
    if (initialInitiative) {
      const match = initiativeOptions.find(
        (opt) =>
          opt.value.toLowerCase().includes(initialInitiative.toLowerCase()) ||
          initialInitiative.toLowerCase().includes(opt.value.toLowerCase())
      );
      setSelectedPurpose(match ? match.value : initialInitiative);
    }
  }, [initialInitiative, initiativeOptions]);

  // Load Razorpay checkout script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePresetSelect = (val: number) => {
    setAmount(val);
    setCustomAmountStr(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCustomAmountStr(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    } else {
      setAmount(0);
    }
  };

  // Dynamic impact calculation based on selected amount
  const estimatedImpact = useMemo(() => {
    if (amount >= 25000) {
      return `Sponsors comprehensive medical relief camps and educates 12 rural children for an entire academic year.`;
    }
    if (amount >= 15000) {
      return `Sponsors a life-changing surgery or specialized treatment for a leprosy patient, including rehabilitation.`;
    }
    if (amount >= 5000) {
      return `Provides full holistic support (food, shelter, medical, clothing) for one elder for a month.`;
    }
    if (amount >= 2500) {
      return `Supports critical medical care, diagnostics, and medicines for two elderly patients.`;
    }
    if (amount >= 1000) {
      return `Feeds 10 abandoned elders for a whole day with nutritious, warm meals and supplements.`;
    }
    return `Feeds 5 abandoned elders for a whole day with nutritious, warm meals.`;
  }, [amount]);

  const validateStep2 = () => {
    if (!donorName.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    if (!donorEmail.trim() || !donorEmail.includes("@")) {
      setError("Please enter a valid email address for your 80G tax receipt.");
      return false;
    }
    if (!donorPhone.trim() || donorPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleProceedToPayment = async () => {
    if (!validateStep2()) return;
    if (amount <= 0) {
      setError("Please select or enter a valid donation amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create order on backend
      const orderPayload = {
        campaignId: campaignId || undefined,
        initiative: selectedPurpose,
        targetType: (campaignId ? "CAMPAIGN" : "INITIATIVE") as "CAMPAIGN" | "INITIATIVE",
        frequency,
        tribute,
        message,
        amount,
        donorInfo: {
          name: donorName,
          email: donorEmail,
          phone: donorPhone,
          pan: donorPan,
          address: donorAddress,
        },
      };

      const orderData = await initiatePaymentOrder(orderPayload);

      // If Razorpay SDK is available and order is real
      if (window.Razorpay && !orderData.order?.isMock) {
        const options = {
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: orderData.order.currency || "INR",
          name: "Seva India Foundation",
          description: `${frequency === "MONTHLY" ? "Monthly" : "One-Time"} Donation - ${selectedPurpose}`,
          order_id: orderData.order.id,
          prefill: {
            name: donorName,
            email: donorEmail,
            contact: donorPhone,
          },
          theme: {
            color: "#0A1A2F",
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verified = await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                donorId: orderData.donorId,
                campaignId: campaignId || undefined,
                initiative: selectedPurpose,
                targetType: (campaignId ? "CAMPAIGN" : "INITIATIVE") as "CAMPAIGN" | "INITIATIVE",
                frequency,
                tribute,
                message,
                amount,
              });

              setCompletedDonation(verified.donation);
              setCompletedReceipt(verified.receiptNumber || `REC-${Date.now().toString(36).toUpperCase()}`);
              setStep(3);
            } catch (err: any) {
              setError(err?.response?.data?.message || err?.message || "Payment verification failed.");
            } finally {
              setLoading(false);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Mock / fallback simulated verification
        const verified = await verifyPayment({
          razorpayOrderId: orderData.order.id,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: "mock_signature",
          donorId: orderData.donorId,
          campaignId: campaignId || undefined,
          initiative: selectedPurpose,
          targetType: (campaignId ? "CAMPAIGN" : "INITIATIVE") as "CAMPAIGN" | "INITIATIVE",
          frequency,
          tribute,
          message,
          amount,
        });

        setCompletedDonation(verified.donation);
        setCompletedReceipt(verified.receiptNumber || `REC-${Date.now().toString(36).toUpperCase()}`);
        setStep(3);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Donation initiation error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to initiate donation payment. Please check your connection and try again."
      );
      setLoading(false);
    }
  };

  const activeDonorTicker =
    liveDonations.length > 0 ? liveDonations[tickerIndex] : null;

  return (
    <section className={`py-12 sm:py-16 bg-[#FDFBF7] text-slate-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* ── 1. Top Trust Badges Bar ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center shrink-0 border border-amber-100">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-900 uppercase">
                DON&apos;T WORRY. YOUR DONATION IS SAFE WITH US.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-900 uppercase">
                GET 100% UPDATES ON WHATSAPP AND EMAIL.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center shrink-0 border border-amber-100">
              <Heart size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-900 uppercase">
                AT SEVA INDIA FOUNDATION, TRUST ISN&apos;T A PROMISE. IT&apos;S A PRACTICE.
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. "Double Your Impact" Green Banner ── */}
        <div className="bg-gradient-to-r from-[#007A50] via-[#00875A] to-[#009E69] text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row sm:items-center gap-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none blur-2xl" />
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            <Heart size={26} fill="white" className="text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-serif font-semibold tracking-wide text-white">
              DOUBLE YOUR IMPACT
            </h3>
            <p className="text-xs sm:text-sm text-emerald-50 mt-1 leading-relaxed">
              All donations made this month are being matched 1:1 by our corporate partners. ₹1,000 becomes ₹2,000.
            </p>
          </div>
        </div>

        {/* ── 3. Main Grid: Left Column & Right Donation Box ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ── LEFT COLUMN: Support narrative, trust cards, Impact Tiers ── */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#0A1A2F] tracking-tight leading-tight">
                WHY YOUR <br className="hidden sm:inline" />
                <span className="text-[#2F54EB]">SUPPORT MATTERS</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                At Seva India Foundation, trust isn&apos;t a promise—it&apos;s a practice. Don&apos;t worry,
                your donation is 100% safe with us. We ensure that every rupee goes directly to on-ground
                programs, and you&apos;ll receive 100% updates on our work via WhatsApp and email.
              </p>
            </div>

            {/* Feature cards: 80G Tax Benefit & Secure & Direct */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <h4 className="text-sm font-serif font-semibold uppercase tracking-wider text-[#0A1A2F]">
                  80G TAX BENEFIT
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Save on taxes while saving lives. All donations are eligible for 50% tax deduction under Section 80G.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2F54EB] flex items-center justify-center">
                  <Building2 size={22} />
                </div>
                <h4 className="text-sm font-serif font-semibold uppercase tracking-wider text-[#0A1A2F]">
                  SECURE & DIRECT
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our platform uses Razorpay for 100% secure transactions. Your donation is safe, and your trust is our highest priority.
                </p>
              </div>
            </div>

            {/* Dark Navy IMPACT TIERS Card */}
            <div className="bg-[#0A1628] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5A623] text-[#0A1628] flex items-center justify-center font-bold">
                  <Heart size={18} fill="currentColor" />
                </div>
                <h3 className="text-xl font-serif font-semibold uppercase tracking-wider text-white">
                  IMPACT TIERS
                </h3>
              </div>

              <div className="divide-y divide-white/10">
                {/* Tier 1 */}
                <div className="py-4 first:pt-0 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#F5A623]">
                    <Utensils size={20} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-serif font-semibold text-white">₹500</span>
                      <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-widest">
                        IMPACT LEVEL
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Feeds 5 abandoned elders for a whole day with nutritious, warm meals.
                    </p>
                  </div>
                </div>

                {/* Tier 2 */}
                <div className="py-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#F5A623]">
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-serif font-semibold text-white">₹2,500</span>
                      <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-widest">
                        IMPACT LEVEL
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Supports critical medical care, diagnostics, and medicines for two elderly patients.
                    </p>
                  </div>
                </div>

                {/* Tier 3 */}
                <div className="py-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#F5A623]">
                    <Home size={20} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-serif font-semibold text-white">₹5,000</span>
                      <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-widest">
                        IMPACT LEVEL
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Provides full holistic support (food, shelter, medical, clothing) for one elder for a month.
                    </p>
                  </div>
                </div>

                {/* Tier 4 */}
                <div className="py-4 last:pb-0 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#F5A623]">
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-serif font-semibold text-white">₹15,000</span>
                      <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-widest">
                        IMPACT LEVEL
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Sponsors a life-changing surgery or specialized treatment for a leprosy patient.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: High-Converting 2-Step Donation Widget ── */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Live recent donor notification badge or trust badge */}
            <div className="flex justify-end">
              {activeDonorTicker ? (
                <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-md border border-slate-200/80 text-xs font-semibold text-slate-700 transition-all">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-[#F5A623] flex items-center justify-center">
                    <Heart size={12} fill="currentColor" />
                  </span>
                  <span>
                    <strong className="text-slate-900">{activeDonorTicker.name}</strong> donated{" "}
                    <span className="text-emerald-700 font-bold">{activeDonorTicker.amount}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">({activeDonorTicker.time})</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-md border border-slate-200/80 text-xs font-semibold text-slate-700 transition-all">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck size={13} />
                  </span>
                  <span>
                    <strong className="text-slate-900">Seva India Foundation</strong> •{" "}
                    <span className="text-emerald-700 font-bold">100% Verified & Tax Deductible (80G)</span>
                  </span>
                </div>
              )}
            </div>

            {/* Donation Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative">
              
              {/* Card Title & Stepper */}
              <div className="text-center space-y-3 mb-6">
                <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-[#0A1A2F] tracking-tight uppercase">
                  MAKE A DONATION
                </h3>

                {/* 3-Step Indicator */}
                <div className="flex items-center justify-center gap-3">
                  {/* Step 1 */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= 1
                        ? "bg-[#F5A623] text-white shadow-md shadow-amber-500/20"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Heart size={14} fill="currentColor" />
                  </div>

                  <div
                    className={`w-8 h-[2px] transition-all ${
                      step >= 2 ? "bg-[#F5A623]" : "bg-slate-200"
                    }`}
                  />

                  {/* Step 2 */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= 2
                        ? "bg-[#2F54EB] text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <ShieldCheck size={16} />
                  </div>

                  <div
                    className={`w-8 h-[2px] transition-all ${
                      step >= 3 ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />

                  {/* Step 3 */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= 3
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <CreditCard size={15} />
                  </div>
                </div>
              </div>

              {/* ── STEP 1: Amount & Purpose Selection ── */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* ONE-TIME vs MONTHLY Toggle */}
                  <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 gap-1 border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setFrequency("ONE_TIME")}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        frequency === "ONE_TIME"
                          ? "bg-white text-[#0A1A2F] shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ONE-TIME
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequency("MONTHLY")}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        frequency === "MONTHLY"
                          ? "bg-white text-[#0A1A2F] shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>MONTHLY</span>
                      <span className="bg-[#F5A623] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                        RECOMMENDED
                      </span>
                    </button>
                  </div>

                  {/* Immediate Compassion Impact blue box */}
                  <div className="bg-[#EEF4FF] rounded-2xl p-4 border border-[#D0E2FF] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2F54EB] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Heart size={14} fill="currentColor" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#2F54EB]">
                        IMMEDIATE COMPASSION IMPACT
                      </h5>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Directly funds active medical camps, community kitchens, and immediate shelter care. Generates an instant 80G tax receipt for 100% tax exemption.
                      </p>
                    </div>
                  </div>

                  {/* SELECT AMOUNT (INR) */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                      SELECT AMOUNT (INR)
                    </label>

                    {/* Amount Pills Grid */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {PRESET_AMOUNTS.map((val) => {
                        const isSelected = amount === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handlePresetSelect(val)}
                            className={`py-3 px-2 rounded-2xl text-base font-serif font-semibold border transition-all ${
                              isSelected
                                ? "border-[#2F54EB] bg-[#EEF4FF] text-[#2F54EB] shadow-sm scale-[1.02]"
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-800"
                            }`}
                          >
                            ₹{val.toLocaleString("en-IN")}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Amount Input */}
                    <div className="relative mt-2">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-serif font-bold text-lg">
                        ₹
                      </span>
                      <input
                        type="text"
                        value={customAmountStr}
                        onChange={handleCustomAmountChange}
                        placeholder="Enter custom amount"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-9 pr-4 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F54EB] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Estimated Impact green box */}
                  <div className="bg-[#EBFBF3] rounded-2xl p-4 border border-[#C2F5DB] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00875A] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={15} />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#00875A]">
                        YOUR ESTIMATED IMPACT
                      </h5>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {estimatedImpact}
                      </p>
                    </div>
                  </div>

                  {/* SELECT PURPOSE */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                      SELECT PURPOSE
                    </label>
                    <select
                      value={selectedPurpose}
                      onChange={(e) => setSelectedPurpose(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F54EB] focus:border-transparent transition-all"
                    >
                      {initiativeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                      {error}
                    </p>
                  )}

                  {/* Continue Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (amount <= 0) {
                        setError("Please enter a valid donation amount.");
                        return;
                      }
                      setError(null);
                      setStep(2);
                    }}
                    className="w-full bg-[#0A1A2F] hover:bg-[#152a4a] text-white font-semibold py-4 px-6 rounded-2xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <span>CONTINUE TO DETAILS</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ── STEP 2: Donor Details Form ── */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Selected summary strip */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">
                        ₹{amount.toLocaleString("en-IN")}
                      </span>{" "}
                      <span className="text-slate-500">
                        ({frequency === "MONTHLY" ? "Monthly Recurring" : "One-Time"})
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                        {selectedPurpose}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-[#2F54EB] hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Form inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F54EB]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          EMAIL ADDRESS *
                        </label>
                        <input
                          type="email"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          placeholder="Email address for receipt"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F54EB]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          PHONE NUMBER *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                            IN +91
                          </span>
                          <input
                            type="tel"
                            value={donorPhone}
                            onChange={(e) => setDonorPhone(e.target.value)}
                            placeholder="Phone number"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-16 pr-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F54EB]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                        PAN CARD NUMBER (FOR 80G TAX DEDUCTION)
                      </label>
                      <input
                        type="text"
                        value={donorPan}
                        onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                        placeholder="PAN CARD NUMBER (e.g. ABCDE1234F)"
                        maxLength={10}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#2F54EB]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                        ADDRESS
                      </label>
                      <input
                        type="text"
                        value={donorAddress}
                        onChange={(e) => setDonorAddress(e.target.value)}
                        placeholder="Complete address for tax receipt"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F54EB]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                        DEDICATE THIS DONATION (OPTIONAL)
                      </label>
                      <select
                        value={tribute}
                        onChange={(e) => setTribute(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F54EB]"
                      >
                        <option value="No Tribute">No Tribute</option>
                        <option value="In Honor of Someone">In Honor of Someone</option>
                        <option value="In Memory of Someone">In Memory of Someone</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                        MESSAGE (OPTIONAL)
                      </label>
                      <textarea
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Leave a message of hope (Optional)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F54EB]"
                      />
                    </div>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                      {error}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                    >
                      <ArrowLeft size={14} />
                      <span>BACK</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      disabled={loading}
                      className="w-full bg-[#0A1A2F] hover:bg-[#152a4a] text-white font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>PROCESSING...</span>
                        </>
                      ) : (
                        <>
                          <span>PROCEED TO PAYMENT</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Security Footer */}
                  <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      Razorpay 100% Encrypted
                    </span>
                    <span>•</span>
                    <span className="font-medium">Instant 80G Receipt</span>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Success Confirmation Screen ── */}
              {step === 3 && (
                <div className="text-center py-6 space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={36} />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xl font-serif font-semibold text-[#0A1A2F]">
                      Thank You, {donorName || "Supporter"}!
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                      Your generous {frequency === "MONTHLY" ? "monthly" : "one-time"} donation of{" "}
                      <strong className="text-slate-900">₹{amount.toLocaleString("en-IN")}</strong> towards{" "}
                      <strong className="text-slate-900">{selectedPurpose}</strong> has been received with deep gratitude.
                    </p>
                  </div>

                  {/* Receipt & tax summary box */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Receipt Number:</span>
                      <span className="font-bold text-slate-900">{completedReceipt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Payment Frequency:</span>
                      <span className="font-bold text-slate-900">
                        {frequency === "MONTHLY" ? "Monthly Recurring" : "One-Time"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Tax Exemption:</span>
                      <span className="font-bold text-emerald-700">Eligible under Section 80G</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Confirmation Sent To:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[180px]">
                        {donorEmail}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setCompletedDonation(null);
                      }}
                      className="flex-1 bg-[#0A1A2F] hover:bg-[#152a4a] text-white font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all"
                    >
                      Make Another Donation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
