import React from "react";
import { Metadata } from "next";
import GalleryClient from "./GalleryClient";
import { GalleryItem, GalleryMeta } from "@/app/api/gallery";

import { constructMetadata, getGallerySchema } from "@/lib/seo";
import SeoHead from "@/components/common/SeoHead";
import { getServerGalleryPaginated } from "@/lib/server-api";

export const metadata: Metadata = constructMetadata({
  title: "Impact Photo Gallery",
  description:
    "Explore field photos and moments of impact across Uttarakhand — education drives, community kitchens, medical camps, and relief operations with Seva India Foundation.",
  canonicalPath: "/gallery",
  keywords: [
    "NGO Photo Gallery",
    "Field Impact Photos",
    "Charity Work Images India",
    "Seva Foundation Gallery",
  ],
});

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, Number(resolvedParams?.page) || 1);

  const { data: initialImages, meta: initialMeta, message: backendMessage } =
    await getServerGalleryPaginated(page, 20);

  const gallerySchema = getGallerySchema(initialImages?.length || 0);

  return (
    <>
      <SeoHead
        title="Impact Photo Gallery"
        description="Explore field photos and moments of impact across Uttarakhand — education drives, community kitchens, medical camps, and relief operations with Seva India Foundation."
        canonicalPath="/gallery"
        jsonLd={gallerySchema}
      />
      <React.Suspense fallback={<div className="min-h-screen py-24 text-center text-slate-400">Loading gallery...</div>}>
        <div className="scroll-reveal">
          <GalleryClient
            initialImages={initialImages}
            initialMeta={initialMeta}
            backendMessage={backendMessage || ""}
            initialPage={page}
          />
        </div>
      </React.Suspense>
    </>
  );
}

