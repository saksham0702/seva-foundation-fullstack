import CampaignsSection from "@/components/website/home/CampaignSection";
import HeroSection from "@/components/website/home/HeroSection";
import OurDonorsSection from "@/components/website/home/OurDonorSection";
import JsonLd from "@/components/common/JsonLd";
import { constructMetadata, getOrganizationSchema } from "@/lib/seo";
import React from "react";

export const metadata = constructMetadata({
  title: "Home",
  description:
    "Seva India Foundation is dedicated to education, healthcare, nutrition, and disaster relief across India. Donate online with 80G tax benefits.",
  canonicalPath: "/",
});

export default function LandingPage() {
  const orgSchema = getOrganizationSchema();

  return (
    <>
      <JsonLd data={orgSchema} />
      <HeroSection />
      <CampaignsSection />
      <OurDonorsSection />
    </>
  );
}
