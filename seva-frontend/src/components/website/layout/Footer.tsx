"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { subscribeNewsletter } from "@/app/api/leads";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/our-work" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Gallery", href: "/gallery" },
];

const legalLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Verify Certificate", href: "/verify" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState("");
  const [cmsSettings, setCmsSettings] = useState<any>(null);

  // Show the scroll-to-top button once the user has scrolled down a bit
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCmsSettings = async () => {
      try {
        const { getCmsPageBySlug } = await import("@/app/api/cms");
        const res = await getCmsPageBySlug("header-footer");
        if (res && res.settings) {
          setCmsSettings(res.settings);
        }
      } catch (e) {
        // Fallback silently to defaults
      }
    };
    fetchCmsSettings();
  }, []);

  const phone = cmsSettings?.phone || "+91 94565 17577";
  const contactEmail = cmsSettings?.email || "info@sevaindiafoundation.org";
  const address = cmsSettings?.address || "20, Sahastradhara Road, Upper Adhoiwala, Dehradun, UK – 248001";
  const darpanId = cmsSettings?.darpanId || "UK/2026/0993905";
  const cin = cmsSettings?.cin || "U88900UT2026NPL020825";
  const taxExemption = cmsSettings?.taxExemption || "80G & 12A REGISTERED";

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

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
      const res = await subscribeNewsletter(email.trim());
      setSubscribeStatus({
        type: "success",
        message: res.message || "Thank you for subscribing to Seva Foundation!",
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
    <footer className="relative bg-[#EEF1F5] pt-12">
      {/* ============================================================ */}
      {/*  SECTION 1 — NEWSLETTER SUBSCRIPTION BANNER                     */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-[#16233F] rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#F5A623]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="max-w-xl text-center md:text-left">
            <span className="text-[#F5A623] text-xs font-semibold uppercase tracking-widest">
              Join Our Impact Community
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-semibold text-white mt-1">
              Subscribe to Seva Foundation Updates
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              Receive quarterly impact disclosures, grassroots stories, and notifications on urgent humanitarian relief initiatives.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:bg-white/15 focus:border-[#F5A623] transition-all w-full sm:w-72"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-3 bg-[#F5A623] hover:bg-[#d98f16] text-[#16233F] text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all whitespace-nowrap disabled:opacity-50"
              >
                {subscribing ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {subscribeStatus && (
              <p
                className={`text-xs mt-2 font-medium text-center md:text-left ${
                  subscribeStatus.type === "success"
                    ? "text-[#F5A623]"
                    : "text-rose-400"
                }`}
              >
                {subscribeStatus.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SECTION 2 — MAIN FOOTER GRID                                  */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* --- Brand column --- */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/assets/seva-logo.png"
                alt="Seva India Foundation"
                width={44}
                height={44}
                className="object-contain h-10 w-10"
              />
              <span className="flex flex-col leading-none">
                <span className="font-serif text-lg font-bold text-[#16233F]">
                  SEVA
                </span>
                <span className="text-[9px] font-semibold tracking-[0.15em] text-[#16233F]">
                  INDIA FOUNDATION
                </span>
              </span>
            </Link>

            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Serving Humanity, Transforming Lives. A registered Section 8
              Company dedicated to social welfare and community development
              across India.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map((s) => {
                let href = s.href;
                if (cmsSettings?.socialLinks) {
                  if (s.label === "Facebook" && cmsSettings.socialLinks.facebook) href = cmsSettings.socialLinks.facebook;
                  if (s.label === "Twitter / X" && cmsSettings.socialLinks.twitter) href = cmsSettings.socialLinks.twitter;
                  if (s.label === "Instagram" && cmsSettings.socialLinks.instagram) href = cmsSettings.socialLinks.instagram;
                  if (s.label === "YouTube" && cmsSettings.socialLinks.youtube) href = cmsSettings.socialLinks.youtube;
                }
                return (
                  <a
                    key={s.label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#16233F] hover:bg-[#F5A623] hover:text-white transition-colors"
                  >
                    {s.icon}
                  </a>
                );
              })}
            </div>
          </div>

          {/* --- Quick Links column --- */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-[#16233F] mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-[#F5A623] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Legal column --- */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-[#16233F] mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-[#F5A623] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Contact Us column --- */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-[#16233F] mb-5">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#F5A623]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm text-slate-600 leading-relaxed">
                  {address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 flex-shrink-0 text-[#F5A623]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-sm text-slate-600 hover:text-[#F5A623] transition-colors"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 flex-shrink-0 text-[#F5A623]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-sm text-slate-600 hover:text-[#F5A623] transition-colors"
                >
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SECTION 3 — BOTTOM LEGAL / REGISTRATION BAR                   */}
      {/* ============================================================ */}
      <div className="border-t border-slate-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left uppercase">
            © {currentYear} SEVA INDIA FOUNDATION. ALL RIGHTS RESERVED.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>NGO DARPAN: {darpanId}</span>
            <span className="opacity-40">|</span>
            <span>CIN: {cin}</span>
            <span className="opacity-40">|</span>
            <span>{taxExemption}</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SECTION 4 — SCROLL TO TOP BUTTON                              */}
      {/* ============================================================ */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 left-6 z-50 w-11 h-11 rounded-full bg-[#0A1A2F] hover:bg-[#16233F] text-white flex items-center justify-center shadow-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </footer>
  );
};

export default Footer;