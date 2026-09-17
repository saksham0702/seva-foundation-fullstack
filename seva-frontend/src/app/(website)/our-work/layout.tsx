import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export const metadata: Metadata = constructMetadata({
  title: "Our Work",
  description:
    "Discover Seva India Foundation's field programs — from free eye camps and healthcare outreach to educational scholarships and disaster relief across India.",
  keywords: [
    "NGO Work India",
    "Eye Camp NGO",
    "Education Scholarship NGO",
    "Healthcare Relief India",
    "Social Work India",
    "Disaster Relief NGO",
  ],
  canonicalPath: "/our-work",
});

export default function OurWorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
