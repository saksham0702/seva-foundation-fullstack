import React from "react";
import CampaignsSection from "@/components/website/home/CampaignSection";
import HeroSection from "@/components/website/home/HeroSection";
import InitiativesHomeSection from "@/components/website/home/InitiativesHomeSection";
import GalleryHomeSection from "@/components/website/home/GalleryHomeSection";
import RecentStoriesHomeSection from "@/components/website/home/RecentStoriesHomeSection";
import FeaturedInMarquee from "@/components/website/home/FeaturedInMarquee";
import HomePatronSection from "@/components/website/home/HomePatronSection";
import HomeExcellenceSection from "@/components/website/home/HomeExcellenceSection";
import HomeIntegritySection from "@/components/website/home/HomeIntegritySection";
import JsonLd from "@/components/common/JsonLd";
import { constructMetadata, getOrganizationSchema } from "@/lib/seo";
import {
  getServerCmsPage,
  getServerRecentBlogs,
  getServerGalleryImages,
  getServerCampaigns,
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

  const [homeCms, ourWorkCms, galleryImages, recentStories, campaigns] = await Promise.all([
    getServerCmsPage("home"),
    getServerCmsPage("our-work"),
    getServerGalleryImages(6),
    getServerRecentBlogs(3),
    getServerCampaigns(),
  ]);

  const initiatives = (ourWorkCms?.sections as InitiativeData[]) || [];

  const featuredInSection = homeCms?.sections?.find((s) => s.key === "featured_in");
  const patronSection = homeCms?.sections?.find((s) => s.key === "patron_samiti");
  const excellenceSection = homeCms?.sections?.find((s) => s.key === "excellence_awards");
  const integritySection = homeCms?.sections?.find((s) => s.key === "integrity_compliance");

  return (
    <>
      <JsonLd data={orgSchema} />
      <HeroSection />

      {/* 1. Featured In Marquee */}
      <FeaturedInMarquee section={featuredInSection} />

      {/* 2. Urgent Campaigns */}
      <CampaignsSection initialCampaigns={campaigns} />

      {/* 3. Core Initiatives */}
      <InitiativesHomeSection initiatives={initiatives} />

      {/* 4. Principal Patron (Dev Bhoomi Samiti) & About Tease */}
      <HomePatronSection section={patronSection} />

      {/* 5. Honors & Global Recognition (Excellence in Human Service) */}
      <HomeExcellenceSection section={excellenceSection} />

      {/* 6. Integrity & Compliance (90% Program Support, CIN, Office) */}
      <HomeIntegritySection section={integritySection} />

      {/* 7. Impact Gallery */}
      <GalleryHomeSection images={galleryImages} />

      {/* 8. Recent Stories & Field Dispatches */}
      <RecentStoriesHomeSection items={recentStories} />
    </>
  );
}
