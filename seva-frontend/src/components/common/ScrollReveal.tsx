"use client";

import React, { useRef, useEffect, useState } from "react";

export interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: "fade-up" | "fade" | "fade-left" | "fade-right" | "scale";
  delay?: number;
  className?: string;
  threshold?: number;
  as?: React.ElementType;
}

export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  className = "",
  threshold = 0.1,
  as: Component = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const variantClass =
    variant === "fade"
      ? "scroll-reveal-fade"
      : variant === "fade-left"
      ? "scroll-reveal-left"
      : variant === "fade-right"
      ? "scroll-reveal-right"
      : variant === "scale"
      ? "scroll-reveal-scale"
      : "scroll-reveal";

  return (
    <Component
      ref={ref}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${variantClass} ${revealed ? "is-revealed" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}
