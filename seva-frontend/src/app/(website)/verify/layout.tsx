import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export const metadata: Metadata = constructMetadata({
  title: "Certificate Verification",
  description:
    "Verify the authenticity of certificates issued by Seva India Foundation. Enter a certificate number to confirm its validity and view digital signatures.",
  keywords: [
    "Certificate Verification NGO",
    "Digital Certificate Seva India",
    "Verify Donation Certificate",
    "80G Certificate Verification",
  ],
  canonicalPath: "/verify",
});

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
