import { getCmsPageServer } from "@/lib/cms-server";
import { SectionRenderer } from "@/components/website/cms/SectionRegistry";
import HeroSection from "@/components/website/cms/sections/Hero";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const cmsData = await getCmsPageServer("about");
  return {
    title: cmsData?.seo?.metaTitle || `${cmsData?.pageName || "About Us"} | Seva India Foundation`,
    description: cmsData?.seo?.metaDescription || cmsData?.subtitle || "Learn about Seva India Foundation's history, mission, vision, and team.",
  };
}

export default async function AboutPage() {
  const cmsData = await getCmsPageServer("about");

  return (
    <main className="min-h-screen bg-white">
      <HeroSection data={cmsData} />
      <SectionRenderer sections={cmsData?.sections || []} />
    </main>
  );
}