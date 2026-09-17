import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export const metadata: Metadata = constructMetadata({
  title: "Events",
  description:
    "Stay updated on upcoming events, charity drives, medical camps, and fundraising events hosted by Seva India Foundation across India.",
  keywords: [
    "NGO Events India",
    "Charity Events",
    "Medical Camp Events",
    "Fundraising Events India",
    "Social Events NGO",
  ],
  canonicalPath: "/events",
});

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
