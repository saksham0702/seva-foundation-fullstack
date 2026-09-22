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

export default async function GalleryPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, Number(resolvedParams?.page) || 1);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() || "http://backend:5000/api";

  let initialImages: GalleryItem[] = [];
  let initialMeta: GalleryMeta = {
    page,
    limit: 50,
    total: 0,
    totalPage: 1,
  };
  let backendMessage: string = "";

  try {
    const url = new URL(`${apiUrl}/gallery`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "50");

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      initialImages = data?.data || [];
      if (data?.meta) {
        initialMeta = data.meta;
      }
      backendMessage = data?.message || "";
    } else {
      backendMessage = "No images found in gallery";
    }
  } catch (error) {
    console.error("Error SSR fetching gallery images:", error);
    backendMessage = "Failed to load gallery images from server";
  }

  return (
    <GalleryClient
      initialImages={initialImages}
      initialMeta={initialMeta}
      backendMessage={backendMessage}
      initialPage={page}
    />
  );
}
