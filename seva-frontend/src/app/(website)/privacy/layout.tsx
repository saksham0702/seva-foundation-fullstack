import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export const metadata: Metadata = constructMetadata({
  title: "Privacy Policy",
  description:
    "Read the privacy policy for Seva India Foundation. Learn how we collect, use, and protect your personal information when you donate or interact with our platform.",
  keywords: ["Privacy Policy NGO", "Data Protection Charity India", "Seva India Privacy"],
  canonicalPath: "/privacy",
  noIndex: false,
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
