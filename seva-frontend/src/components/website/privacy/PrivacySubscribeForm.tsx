"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { subscribeNewsletter } from "@/app/api/leads";

export default function PrivacySubscribeForm() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribing(true);
    setSubscribeStatus(null);
    try {
      const res = await subscribeNewsletter(
        email.trim(),
        "Privacy Page Subscriber"
      );
      setSubscribeStatus({
        type: "success",
        message:
          res.message ||
          "Thank you for subscribing to Seva Foundation transparency updates!",
      });
      setEmail("");
    } catch (err: any) {
      setSubscribeStatus({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to subscribe. Please try again.",
      });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="bg-[#0A1A2F] rounded-2xl p-6 sm:p-8 text-white mt-8">
      <div className="flex items-center gap-3 mb-2">
        <Mail className="text-[#F5A623]" size={20} />
        <h3 className="text-base font-semibold">
          Subscribe to Data &amp; Impact Transparency Reports
        </h3>
      </div>
      <p className="text-xs text-white/70 mb-4 max-w-xl">
        We periodically release audited transparency reports. Enter your email to receive updates directly.
      </p>
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A623] flex-1"
        />
        <button
          type="submit"
          disabled={subscribing}
          className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e0951a] text-black font-semibold text-xs transition-colors shrink-0 disabled:opacity-50"
        >
          {subscribing ? <Loader2 size={14} className="animate-spin" /> : "Subscribe"}
        </button>
      </form>
      {subscribeStatus && (
        <div
          className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
            subscribeStatus.type === "success"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          }`}
        >
          {subscribeStatus.type === "success" && <CheckCircle2 size={14} />}
          <span>{subscribeStatus.message}</span>
        </div>
      )}
    </div>
  );
}
