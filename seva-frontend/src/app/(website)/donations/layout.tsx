import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export const metadata: Metadata = constructMetadata({
  title: "Donate Online",
  description:
    "Make a secure online donation to Seva India Foundation. Support healthcare, education, and disaster relief across India. 80G tax exemption available on all donations.",
  keywords: [
    "Donate Online India",
    "Online Donation NGO",
    "80G Tax Exemption Donation",
    "Charity Donation India",
    "Razorpay Donation",
    "Secure Giving",
  ],
  canonicalPath: "/donations",
});

export default function DonationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
