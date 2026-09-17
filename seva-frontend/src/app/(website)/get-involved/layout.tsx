import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export const metadata: Metadata = constructMetadata({
  title: "Get Involved — Volunteer & Collaborate",
  description:
    "Join Seva India Foundation as a volunteer, donor, or partner. Apply to volunteer for healthcare camps, educational programs, and disaster relief initiatives across India.",
  keywords: [
    "Volunteer NGO India",
    "NGO Partnership India",
    "Get Involved Charity",
    "Social Work Volunteer",
    "Intern NGO India",
    "Collaborate NGO",
  ],
  canonicalPath: "/get-involved",
});

export default function GetInvolvedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
