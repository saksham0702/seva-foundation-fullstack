"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

type NavChild = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  href: string;
  /** Populate this later to enable the dropdown for that nav item. */
  children?: NavChild[];
};

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

export const DEFAULT_OUR_WORK_ITEMS: NavChild[] = [
  { label: "VIDHYA (EDUCATION)", href: "/our-work/vidhya" },
  { label: "AROGYA (HEALTHCARE)", href: "/our-work/arogya" },
  { label: "SAMMAAN (ELDERLY CARE)", href: "/our-work/sammaan" },
  { label: "SHAKTI (WOMEN)", href: "/our-work/shakti" },
  { label: "ANNAPURNA (HUNGER)", href: "/our-work/annapurna" },
  { label: "GRAMODAYA (RURAL)", href: "/our-work/gramodaya" },
  { label: "RAKSHAK (DISASTER)", href: "/our-work/rakshak" },
];

export const DEFAULT_GET_INVOLVED_ITEMS: NavChild[] = [
  { label: "VOLUNTEER APPLICATION", href: "/get-involved?tab=volunteer" },
  { label: "CORPORATE & CSR", href: "/get-involved?tab=corporate" },
  { label: "CAREERS & JOBS", href: "/get-involved?tab=career" },
  { label: "WAYS TO GIVE", href: "/get-involved?tab=support" },
  { label: "VERIFY CERTIFICATE", href: "/verify" },
  { label: "DONOR PORTAL", href: "/donations" },
];

const defaultNavLinks: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/our-work", children: DEFAULT_OUR_WORK_ITEMS },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Get Involved", href: "/get-involved", children: DEFAULT_GET_INVOLVED_ITEMS },
  {
    label: "Media Center",
    href: "/blogs",
    children: [
      { label: "Blogs & Stories", href: "/blogs" },
      { label: "News & Media", href: "/news" },
      { label: "Events & Camps", href: "/events" },
    ],
  },
  { label: "Gallery", href: "/gallery" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg
        className="w-3.5 h-3.5"
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
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

const HeaderContent = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null
  );
  const [scrolled, setScrolled] = useState(false);
  const [cmsSettings, setCmsSettings] = useState<any>(null);
  const [ourWorkItems, setOurWorkItems] = useState<NavChild[]>(DEFAULT_OUR_WORK_ITEMS);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine if any link (parent or child) is actively selected
  const isLinkActive = (targetHref: string): boolean => {
    if (!targetHref) return false;
    if (targetHref === "/") return pathname === "/";

    const [targetPath, targetQuery] = targetHref.split("?");

    // Check if target has query params (e.g. ?tab=corporate)
    if (targetQuery) {
      if (pathname !== targetPath) return false;
      const targetParams = new URLSearchParams(targetQuery);
      for (const [key, val] of targetParams.entries()) {
        const currentVal = searchParams?.get(key);
        if (currentVal !== val) return false;
      }
      return true;
    }

    // Target has no query params
    if (pathname === targetPath) {
      // If user is on /get-involved but has ?tab=... and targetHref is base /get-involved without tab
      if (targetPath === "/get-involved" && searchParams && (searchParams.get("tab") || searchParams.get("type"))) {
        return false;
      }
      return true;
    }

    // Check subpath
    return targetPath !== "/" && pathname.startsWith(targetPath + "/");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCmsData = async () => {
      try {
        const { getCmsPageBySlug } = await import("@/app/api/cms");
        const [hfRes, ourWorkRes] = await Promise.allSettled([
          getCmsPageBySlug("header-footer"),
          getCmsPageBySlug("our-work"),
        ]);

        if (hfRes.status === "fulfilled" && hfRes.value?.settings) {
          setCmsSettings(hfRes.value.settings);
        }

        if (
          ourWorkRes.status === "fulfilled" &&
          ourWorkRes.value?.sections &&
          ourWorkRes.value.sections.length > 0
        ) {
          const items: NavChild[] = ourWorkRes.value.sections.map((s: any) => ({
            label: s.name || s.title || s.key.toUpperCase(),
            href: `/our-work/${s.key}`,
          }));
          setOurWorkItems(items);
        }
      } catch (e) {
        // Fallback silently to defaults
      }
    };
    fetchCmsData();
  }, []);

  const phone = cmsSettings?.phone || "+91 94565 17577";
  const email = cmsSettings?.email || "info@sevaindiafoundation.org";

  const navLinks: NavItem[] = defaultNavLinks.map((item) => {
    if (item.href === "/our-work") {
      return { ...item, children: ourWorkItems };
    }
    return item;
  });

  return (
    <header className="bg-white sticky top-0 z-50">
      {/* ============================================================ */}
      {/*  SECTION 1 — UTILITY TOP BAR (phone / email / socials)        */}
      {/* ============================================================ */}
      <div className="bg-[#0A1A2F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 text-[12px] text-white/90">
            {/* Contact details */}
            <div className="flex items-center gap-5">
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-1.5 font-medium hover:text-[#F5A623] transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
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
                {phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="hidden sm:flex items-center gap-1.5 font-medium hover:text-[#F5A623] transition-colors uppercase"
              >
                <svg
                  className="w-3.5 h-3.5"
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
                {email}
              </a>
            </div>

            {/* Follow us + social icons */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-white/50 text-[11px] uppercase tracking-widest">
                Follow Us:
              </span>
              <div className="flex items-center gap-1.5">
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
                      className="w-6 h-6 rounded-full bg-white/10 hover:bg-[#F5A623] flex items-center justify-center text-white transition-colors"
                    >
                      {s.icon}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SECTION 2 — MAIN HEADER (logo / nav / actions)                */}
      {/* ============================================================ */}
      <div
        className={`border-b transition-shadow duration-300 ${scrolled ? "border-gray-200 shadow-sm" : "border-gray-100"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-6">
            {/* --- Logo lockup --- */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <Image
                src="/assets/seva-logo.png"
                alt="Seva India Foundation"
                width={500}
                height={500}
                className="object-cover h-25 w-50 "
                priority
              />
            </Link>

            {/* --- Desktop nav --- */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isParentActive =
                  isLinkActive(link.href) ||
                  (link.children && link.children.some((child) => isLinkActive(child.href)));
                const hasChildren = !!link.children?.length;

                return (
                  <div key={link.href} className="relative group">
                    <Link
                      href={link.href}
                      className={`flex items-center gap-0.5 px-2.5 py-2 text-[13.5px] font-semibold uppercase tracking-wide transition-colors whitespace-nowrap ${isParentActive
                        ? "text-[#F5A623]"
                        : "text-slate-700 hover:text-[#F5A623]"
                        }`}
                    >
                      {link.label}
                      {hasChildren && (
                        <svg
                          className="w-2.5 h-2.5 ml-0.5 mt-[1px] transition-transform group-hover:rotate-180 opacity-60"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </Link>

                    {/* Active-state underline */}
                    {isParentActive && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-[#F5A623] rounded-full" />
                    )}

                    {/* Dropdown panel */}
                    {hasChildren && (
                      <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[240px] animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="h-1 bg-gradient-to-r from-[#F5A623] to-[#e8542a]" />
                          <div className="py-2">
                            {link.children!.map((child) => {
                              const isChildActive = isLinkActive(child.href);
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wider transition-all group/item ${isChildActive
                                    ? "text-[#F5A623] bg-orange-50 font-bold"
                                    : "text-slate-700 hover:text-[#F5A623] hover:bg-orange-50/60"
                                    }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isChildActive
                                      ? "bg-[#F5A623] ring-2 ring-orange-200"
                                      : "bg-slate-300 group-hover/item:bg-[#F5A623]"
                                      }`}
                                  />
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* --- Right-side actions --- */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <Link
                href="/donations"
                className="bg-[#F5A623] hover:bg-[#e0951a] text-white text-[12.5px] rounded-lg font-semibold uppercase tracking-wider px-5 py-2 transition-colors shadow-sm whitespace-nowrap"
              >
                Donate Now
              </Link>
            </div>

            {/* --- Mobile toggle --- */}
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 text-[#16233F]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SECTION 3 — MOBILE MENU                                       */}
      {/* ============================================================ */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 max-h-[80vh] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="space-y-0">
              {navLinks.map((link) => {
                const isParentActive =
                  isLinkActive(link.href) ||
                  (link.children && link.children.some((child) => isLinkActive(child.href)));
                const hasChildren = !!link.children?.length;
                const isDropdownOpen = openMobileDropdown === link.href;

                return (
                  <div
                    key={link.href}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex-1 block py-3 text-[13px] font-semibold uppercase tracking-wide transition-colors ${isParentActive ? "text-[#F5A623] font-bold" : "text-slate-700 hover:text-[#F5A623]"
                          }`}
                      >
                        {link.label}
                      </Link>
                      {hasChildren && (
                        <button
                          aria-label={`Toggle ${link.label} submenu`}
                          onClick={() =>
                            setOpenMobileDropdown(
                              isDropdownOpen ? null : link.href
                            )
                          }
                          className="p-3 text-slate-400"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180 text-[#F5A623]" : ""
                              }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {hasChildren && isDropdownOpen && (
                      <div className="pl-4 pb-2 space-y-1">
                        {link.children!.map((child) => {
                          const isChildActive = isLinkActive(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMenuOpen(false)}
                              className={`flex items-center gap-2 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors ${isChildActive
                                ? "text-[#F5A623] font-bold"
                                : "text-slate-600 hover:text-[#F5A623]"
                                }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isChildActive
                                  ? "bg-[#F5A623]"
                                  : "bg-slate-300"
                                  }`}
                              />
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-4">
                <Link
                  href="/donations"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center bg-[#F5A623] text-white text-[13px] font-semibold uppercase tracking-wider py-3 rounded-lg"
                >
                  Donate Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const Header = () => {
  return (
    <React.Suspense fallback={<header className="bg-white sticky top-0 z-50 min-h-[80px]" />}>
      <HeaderContent />
    </React.Suspense>
  );
};

export default Header;