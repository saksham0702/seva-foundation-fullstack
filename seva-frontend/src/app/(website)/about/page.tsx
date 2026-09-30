import React from "react";
import { Metadata } from "next";
import { getCmsPageServer } from "@/lib/cms-server";
import { SectionRenderer } from "@/components/website/cms/SectionRegistry";
import HeroSection from "@/components/website/cms/sections/Hero";
import GalleryHomeSection from "@/components/website/home/GalleryHomeSection";
import { getServerGalleryImages } from "@/lib/server-api";
import { constructMetadata, getAboutPageSchema } from "@/lib/seo";
import { getImageUrl } from "@/lib/image";
import SeoHead from "@/components/common/SeoHead";

export async function generateMetadata(): Promise<Metadata> {
  const cmsData = await getCmsPageServer("about");
  const title = cmsData?.seo?.metaTitle || cmsData?.pageName || "About Us";
  const description =
    cmsData?.seo?.metaDescription ||
    cmsData?.subtitle ||
    "Learn about Seva India Foundation's history, mission, vision, and team.";

  const bannerImg = cmsData?.bannerImage
    ? getImageUrl(cmsData.bannerImage)
    : undefined;

  return constructMetadata({
    title,
    description,
    canonicalPath: "/about",
    ogImage: bannerImg,
    keywords: [
      "About Seva India Foundation",
      "NGO Mission and Vision",
      "Section 8 Non Profit",
      "Uttarakhand Charity Leadership",
      "Community Development Team",
    ],
  });
}

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [cmsData, galleryImages] = await Promise.all([
    getCmsPageServer("about"),
    getServerGalleryImages(6),
  ]);

  const pageTitle = cmsData?.seo?.metaTitle || cmsData?.pageName || "About Us";
  const pageDescription =
    cmsData?.seo?.metaDescription ||
    cmsData?.subtitle ||
    "Learn about Seva India Foundation's history, mission, vision, and team.";
  const aboutSchema = getAboutPageSchema(pageDescription);

  return (
    <main className="min-h-screen bg-white">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        canonicalPath="/about"
        jsonLd={aboutSchema}
      />
      <HeroSection data={cmsData} />
      {cmsData?.sections && cmsData.sections.length > 0 && (
        <SectionRenderer sections={cmsData.sections} />
      )}
      {galleryImages && galleryImages.length > 0 && (
        <GalleryHomeSection images={galleryImages} />
      )}
    </main>
  );
}