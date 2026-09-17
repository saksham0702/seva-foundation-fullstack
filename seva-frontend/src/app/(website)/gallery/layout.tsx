import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export const metadata: Metadata = constructMetadata({
  title: "Gallery — Our Impact in Pictures",
  description:
    "Browse photos and videos from Seva India Foundation's field activities — medical camps, educational programs, disaster relief operations, and community events across India.",
  keywords: [
    "NGO Gallery India",
    "Seva India Photos",
    "Charity Impact Pictures",
    "Medical Camp Photos",
    "Social Work Gallery",
    "Humanitarian Field Photos",
  ],
  canonicalPath: "/gallery",
});

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
