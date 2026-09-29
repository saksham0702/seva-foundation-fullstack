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

import SeoHead from "@/components/common/SeoHead";

export const dynamic = "force-dynamic";

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

  const heroSection = homeCms?.sections?.find((s) => s.key === "hero");
  const featuredInSection = homeCms?.sections?.find((s) => s.key === "featured_in");
  const patronSection = homeCms?.sections?.find((s) => s.key === "patron_samiti");
  const excellenceSection = homeCms?.sections?.find((s) => s.key === "excellence_awards");
  const integritySection = homeCms?.sections?.find((s) => s.key === "integrity_compliance");

  return (
    <>
      <SeoHead
        title="Home"
        description="Seva India Foundation is dedicated to grassroots initiatives in education, healthcare, nutrition, and disaster relief across India. Donate online with 80G tax benefits."
        canonicalPath="/"
        jsonLd={orgSchema}
      />
      <HeroSection section={heroSection} initialCampaigns={campaigns} />

      {/* 1. Featured In Marquee */}
      {featuredInSection && featuredInSection.items && featuredInSection.items.length > 0 && (
        <div className="scroll-reveal">
          <FeaturedInMarquee section={featuredInSection} />
        </div>
      )}

      {/* 2. Urgent Campaigns */}
      {campaigns && campaigns.length > 0 && (
        <div className="scroll-reveal">
          <CampaignsSection initialCampaigns={campaigns} />
        </div>
      )}

      {/* 3. Core Initiatives */}
      {initiatives && initiatives.length > 0 && (
        <div className="scroll-reveal">
          <InitiativesHomeSection initiatives={initiatives} />
        </div>
      )}

      {/* 4. Principal Patron (Dev Bhoomi Samiti) & About Tease */}
      {patronSection && (patronSection.title || patronSection.subtitle) && (
        <div className="scroll-reveal">
          <HomePatronSection section={patronSection} />
        </div>
      )}

      {/* 5. Honors & Global Recognition (Excellence in Human Service) */}
      {excellenceSection && excellenceSection.items && excellenceSection.items.length > 0 && (
        <div className="scroll-reveal">
          <HomeExcellenceSection section={excellenceSection} />
        </div>
      )}

      {/* 6. Integrity & Compliance (90% Program Support, CIN, Office) */}
      {integritySection && (
        <div className="scroll-reveal">
          <HomeIntegritySection section={integritySection} />
        </div>
      )}

      {/* 7. Impact Gallery */}
      {galleryImages && galleryImages.length > 0 && (
        <div className="scroll-reveal">
          <GalleryHomeSection images={galleryImages} />
        </div>
      )}

      {/* 8. Recent Stories & Field Dispatches */}
      {recentStories && recentStories.length > 0 && (
        <div className="scroll-reveal">
          <RecentStoriesHomeSection items={recentStories} />
        </div>
      )}
    </>
  );
}
