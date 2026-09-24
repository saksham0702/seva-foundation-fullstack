"use client";

import React, { useEffect, useState } from "react";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";
import {
  initiatePaymentOrder,
  verifyPayment,
  recordPaymentFailed,
  type Donation,
} from "@/app/api/donation";
import type { Donor } from "@/app/api/donor";

interface PaymentStepProps {
  donor: Donor;
  campaignId: string;
  amount: number;
  onResult: (donation: Donation, certificate?: any) => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function PaymentStep({
  donor,
  campaignId,
  amount: initialAmount,
  onResult,
}: PaymentStepProps) {
  const [amount, setAmount] = useState<number>(initialAmount || 500);
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    // Load Razorpay checkout script
    if (typeof window !== "undefined") {
      if (window.Razorpay) {
        setRazorpayReady(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayReady(true);
      script.onerror = () => console.warn("Razorpay script failed to load, falling back to simulated mode.");
      document.body.appendChild(script);
    }
  }, []);

  const handleRazorpayPayment = async () => {
    if (!amount || amount <= 0) {
      setError("Please enter a valid donation amount.");
      return;
    }
    setError(null);
    setProcessing(true);

    try {
      const orderData = await initiatePaymentOrder({
        campaignId,
        amount,
        frequency,
        targetType: "CAMPAIGN",
        donationType: "MONEY",
        donorInfo: {
          donorId: donor._id,
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          pan: donor.pan,
        },
      });

      // If simulated order or Razorpay SDK is not loaded
      if (orderData.order?.isMock || !window.Razorpay) {
        // Direct simulated verification
        const verified = await verifyPayment({
          razorpayOrderId: orderData.order.id,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: "mock_signature",
          donorId: donor._id,
          campaignId,
          amount,
          frequency,
          targetType: "CAMPAIGN",
          donationType: "MONEY",
        });
        onResult(verified.donation, verified.certificate);
        return;
      }

      // Open Real Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "Seva Foundation",
        description: `${frequency === "MONTHLY" ? "Monthly" : "One-Time"} Donation for Campaign`,
        order_id: orderData.order.id,
        prefill: {
          name: donor.name || "",
          email: donor.email || "",
          contact: donor.phone || "",
        },
        theme: {
          color: "#E8542A",
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setProcessing(true);
            const verified = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              donorId: donor._id,
              campaignId,
              frequency,
              targetType: "CAMPAIGN",
              amount,
              donationType: "MONEY",
            });
            onResult(verified.donation, verified.certificate);
          } catch (err: any) {
            setError(err.message || "Payment verification failed. Please contact support.");
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: async () => {
            setProcessing(false);
            try {
              await recordPaymentFailed({
                donorId: donor._id,
                campaignId,
                reason: "User closed payment window",
              });
            } catch {}
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response: any) => {
        setProcessing(false);
        setError(response.error?.description || "Payment failed");
        try {
          await recordPaymentFailed({
            donorId: donor._id,
            campaignId,
            reason: response.error?.description,
          });
        } catch {}
      });
      rzp.open();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Could not initiate payment. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
      <h1 className="text-xl font-bold text-[#0f2347] mb-1">Select Payment Method</h1>
      <p className="text-sm text-gray-500 mb-6">
        Hi <strong className="text-[#0f2347]">{donor.name || "Donor"}</strong>, confirm your contribution amount below.
      </p>

      {/* Frequency Toggle */}
      <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1 mb-5 border border-slate-200">
        <button
          type="button"
          onClick={() => setFrequency("ONE_TIME")}
          className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            frequency === "ONE_TIME"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          ONE-TIME
        </button>
        <button
          type="button"
          onClick={() => setFrequency("MONTHLY")}
          className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            frequency === "MONTHLY"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>MONTHLY</span>
          <span className="bg-[#E8542A] text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
            REC
          </span>
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Donation Amount (₹)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
            ₹
          </span>
          <input
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-base font-bold text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 mb-5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Razorpay Checkout Button */}
      <button
        onClick={handleRazorpayPayment}
        disabled={processing}
        className="w-full flex items-center justify-center gap-2 bg-[#E8542A] hover:bg-[#c9431d] disabled:opacity-60 text-white font-bold py-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-orange-200"
      >
        {processing ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <CreditCard size={18} />
        )}
        {processing ? "Processing…" : `Pay ₹${amount.toLocaleString("en-IN")} via Razorpay`}
      </button>

      <p className="text-[11px] text-center text-gray-400 mt-5 flex items-center justify-center gap-1.5">
        <ShieldCheck size={14} className="text-emerald-500" />
        256-bit encrypted secure checkout. Instant 80G tax receipt.
      </p>
    </div>
  );
}