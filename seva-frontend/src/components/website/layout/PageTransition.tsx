"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

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
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const observeTargets = () => {
      const targets = document.querySelectorAll(
        ".scroll-reveal:not(.is-revealed), .scroll-reveal-fade:not(.is-revealed), .scroll-reveal-left:not(.is-revealed), .scroll-reveal-right:not(.is-revealed), .scroll-reveal-scale:not(.is-revealed)"
      );
      targets.forEach((el) => observer.observe(el));
    };

    // Run immediately and after slight render tick
    observeTargets();
    const timer = setTimeout(observeTargets, 120);

    // Watch for dynamically rendered items
    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(() => {
        observeTargets();
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [pathname]);

  return (
    <div key={pathname} className="website-page-transition flex-1 flex flex-col">
      {children}
    </div>
  );
}

