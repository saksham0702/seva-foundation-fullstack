import React from "react";
import CampaignsSection from "@/components/website/home/CampaignSection";
import HeroSection from "@/components/website/home/HeroSection";
import InitiativesHomeSection from "@/components/website/home/InitiativesHomeSection";
import GalleryHomeSection from "@/components/website/home/GalleryHomeSection";
import RecentStoriesHomeSection from "@/components/website/home/RecentStoriesHomeSection";
import JsonLd from "@/components/common/JsonLd";
import { constructMetadata, getOrganizationSchema } from "@/lib/seo";
import {
  getServerCmsPage,
  getServerRecentBlogs,
  getServerGalleryImages,
} from "@/lib/server-api";
import { InitiativeData } from "@/components/website/our-work/InitiativeCard";

export const metadata = constructMetadata({
  title: "Home",
  description:
    "Seva India Foundation is dedicated to grassroots initiatives in education, healthcare, nutrition, and disaster relief across India. Donate online with 80G tax benefits.",
  canonicalPath: "/",
});

export default async function LandingPage() {
  const orgSchema = getOrganizationSchema();

  const [ourWorkCms, galleryImages, recentStories] = await Promise.all([
    getServerCmsPage("our-work"),
    getServerGalleryImages(6),
    getServerRecentBlogs(3),
  ]);

  const initiatives = (ourWorkCms?.sections as InitiativeData[]) || [];

  return (
    <>
      <JsonLd data={orgSchema} />
      <HeroSection />
      <CampaignsSection />
      <InitiativesHomeSection initiatives={initiatives} />
      <GalleryHomeSection images={galleryImages} />
      <RecentStoriesHomeSection items={recentStories} />
    </>
  );
}
