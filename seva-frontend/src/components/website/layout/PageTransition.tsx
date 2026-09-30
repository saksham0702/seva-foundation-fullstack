"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div
      key={pathname}
      className={`website-page-transition flex-1 flex flex-col overflow-x-clip ${
        mounted ? "js-anim" : ""
      }`}
    >
      {children}
    </div>
  );
}
