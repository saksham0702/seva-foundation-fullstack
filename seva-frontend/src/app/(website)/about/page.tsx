import { getCmsPageServer } from "@/lib/cms-server";
import { SectionRenderer } from "@/components/website/cms/SectionRegistry";
import HeroSection from "@/components/website/cms/sections/Hero";
import GalleryHomeSection from "@/components/website/home/GalleryHomeSection";
import { getServerGalleryImages } from "@/lib/server-api";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const cmsData = await getCmsPageServer("about");
  return {
    title: cmsData?.seo?.metaTitle || `${cmsData?.pageName || "About Us"} | Seva India Foundation`,
    description: cmsData?.seo?.metaDescription || cmsData?.subtitle || "Learn about Seva India Foundation's history, mission, vision, and team.",
  };
}

export default async function AboutPage() {
  const [cmsData, galleryImages] = await Promise.all([
    getCmsPageServer("about"),
    getServerGalleryImages(6),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <HeroSection data={cmsData} />
      <SectionRenderer sections={cmsData?.sections || []} />
      <GalleryHomeSection images={galleryImages} />
    </main>
  );
}