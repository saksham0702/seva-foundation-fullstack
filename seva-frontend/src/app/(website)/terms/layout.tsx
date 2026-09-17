import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export const metadata: Metadata = constructMetadata({
  title: "Terms & Conditions",
  description:
    "Read the terms and conditions for using the Seva India Foundation website, making donations, and accessing our services. Your agreement to these terms ensures transparency.",
  keywords: ["Terms Conditions NGO", "Donation Terms India", "Seva India Foundation Terms"],
  canonicalPath: "/terms",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
