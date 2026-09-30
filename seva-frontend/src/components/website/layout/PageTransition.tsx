"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // When pathname or search params change, route navigation is complete
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    setMounted(true);

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      // Ignore external links, downloads, hash links, or modifier clicks
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        targetAttr === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      try {
        const targetUrl = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (targetUrl.origin === currentUrl.origin) {
          // If it's the exact same page path and search, don't trigger loader
          if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
            return;
          }
          // Internal route change triggered! Show full screen loading screen immediately
          setIsNavigating(true);
        }
      } catch {
        // Invalid URL, ignore
      }
    };

    const handlePopState = () => {
      setIsNavigating(true);
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Safety fallback: if navigation takes longer than 8s, reset
  useEffect(() => {
    if (!isNavigating) return;
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isNavigating]);

  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      document
        .querySelectorAll(
          ".reveal-left, .reveal-right, .reveal-up, .reveal-fade, .reveal-card, .reveal-scale, .scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-reveal-fade"
        )
        .forEach((el) => {
          el.classList.add("is-revealed");
        });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll(
          ".reveal-left, .reveal-right, .reveal-up, .reveal-fade, .reveal-card, .reveal-scale, .scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-reveal-fade"
        )
        .forEach((el) => {
          el.classList.add("is-revealed");
        });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.02,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    const observeAll = () => {
      const targets = document.querySelectorAll(
        ".reveal-left:not(.is-revealed), .reveal-right:not(.is-revealed), .reveal-up:not(.is-revealed), .reveal-fade:not(.is-revealed), .reveal-card:not(.is-revealed), .reveal-scale:not(.is-revealed), .scroll-reveal:not(.is-revealed), .scroll-reveal-left:not(.is-revealed), .scroll-reveal-right:not(.is-revealed), .scroll-reveal-scale:not(.is-revealed), .scroll-reveal-fade:not(.is-revealed)"
      );
      targets.forEach((el) => observer.observe(el));
    };

    // Scan initially and after asynchronous data rendering
    const t0 = setTimeout(observeAll, 60);
    const t1 = setTimeout(observeAll, 300);
    const t2 = setTimeout(observeAll, 800);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, [pathname, mounted]);

  return (
    <>
      {/* Full-screen Standalone Route Loader (covers entire viewport including header & footer) */}
      {isNavigating && (
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999999] flex flex-col items-center justify-center bg-white pointer-events-auto select-none">
          {/* Top progress bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden">
            <div
              className="h-full bg-[#E8542A] rounded-full animate-website-progress"
              style={{ width: "100%" }}
            />
          </div>

          {/* Logo + pulse ring */}
          <div className="relative flex items-center justify-center mb-6">
            <span className="absolute inline-flex h-28 w-28 rounded-full bg-[#E8542A]/10 animate-ping" />
            <span className="relative inline-flex h-24 w-24 rounded-full border-2 border-[#E8542A]/20 items-center justify-center bg-white shadow-xl shadow-orange-100 p-3">
              <Image
                src="/assets/seva-logo.png"
                alt="Seva India Foundation"
                width={64}
                height={64}
                priority
                className="h-16 w-auto object-contain"
              />
            </span>
          </div>

          {/* Brand name */}
          <p className="text-[#0f2347] font-bold text-base tracking-wide mb-1">
            Seva India Foundation
          </p>
          <p className="text-gray-400 text-xs tracking-widest uppercase animate-pulse">
            Loading…
          </p>

          <style>{`
            @keyframes website-progress {
              0%   { transform: translateX(-100%); }
              60%  { transform: translateX(0%); }
              100% { transform: translateX(0%); }
            }
            .animate-website-progress {
              animation: website-progress 1.4s ease-in-out infinite;
            }
          `}</style>
        </div>
      )}

      <div
        key={pathname}
        className={`website-page-transition flex-1 flex flex-col ${
          mounted ? "js-anim" : ""
        }`}
      >
        {children}
      </div>
    </>
  );
}

