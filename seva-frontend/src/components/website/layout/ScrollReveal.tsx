"use client";

import React, { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "fade" | "scale" | "card";
  delay?: 0 | 50 | 75 | 100 | 150 | 200 | 250 | 300 | 400 | 500 | 600;
  className?: string;
}

/**
 * Reusable ScrollReveal wrapper for explicit directional animations
 * 100% SSR safe, zero SEO impact.
 */
export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const dirClass =
    direction === "left"
      ? "reveal-left"
      : direction === "right"
      ? "reveal-right"
      : direction === "fade"
      ? "reveal-fade"
      : direction === "scale" || direction === "card"
      ? "reveal-card"
      : "reveal-up";

  const delayClass = delay > 0 ? `delay-${delay}` : "";

  return (
    <div className={`${dirClass} ${delayClass} ${className}`}>
      {children}
    </div>
  );
}
