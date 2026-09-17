import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export const metadata: Metadata = constructMetadata({
  title: "News & Media",
  description:
    "Read the latest news, press releases, and media coverage about Seva India Foundation's humanitarian initiatives, partnerships, and social impact stories.",
  keywords: [
    "NGO News India",
    "Charity Press Release",
    "Social Impact News",
    "Seva India Foundation Media",
    "NGO Media Coverage",
  ],
  canonicalPath: "/news",
});

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
