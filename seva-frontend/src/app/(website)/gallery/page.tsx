import React from "react";
import { Metadata } from "next";
import GalleryClient from "./GalleryClient";
import { GalleryItem, GalleryMeta } from "@/app/api/gallery";

export const metadata: Metadata = {
  title: "Gallery | Seva India Foundation",
  description:
    "Explore field photos and moments of impact across Uttarakhand — education drives, community kitchens, medical camps, and relief operations with Seva India Foundation.",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

import { getServerGalleryPaginated } from "@/lib/server-api";

export default async function GalleryPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, Number(resolvedParams?.page) || 1);

  const { data: initialImages, meta: initialMeta, message: backendMessage } =
    await getServerGalleryPaginated(page, 20);

  return (
    <React.Suspense fallback={<div className="min-h-screen py-24 text-center text-slate-400">Loading gallery...</div>}>
      <GalleryClient
        initialImages={initialImages}
        initialMeta={initialMeta}
        backendMessage={backendMessage || ""}
        initialPage={page}
      />
    </React.Suspense>
  );
}
