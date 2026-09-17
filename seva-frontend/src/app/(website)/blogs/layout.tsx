import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export const metadata: Metadata = constructMetadata({
  title: "Stories & Impact",
  description:
    "Read inspiring stories, field reports, and impact updates from Seva India Foundation's humanitarian work across healthcare, education, and disaster relief in India.",
  keywords: [
    "NGO Blog India",
    "Social Impact Stories",
    "Seva India Foundation News",
    "Humanitarian Work India",
    "Field Reports NGO",
    "Charity Blog",
  ],
  canonicalPath: "/blogs",
});

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
