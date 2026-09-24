"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Images,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { GalleryItem, GalleryMeta, getPublicGallery } from "@/app/api/gallery";
import { getImageUrl } from "@/lib/image";
import { Portal } from "@/components/shared/Portal";

interface GalleryClientProps {
  initialImages: GalleryItem[];
  initialMeta: GalleryMeta;
  backendMessage?: string;
  initialPage?: number;
}

export default function GalleryClient({
  initialImages,
  initialMeta,
  backendMessage,
  initialPage = 1,
}: GalleryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [images, setImages] = useState<GalleryItem[]>(initialImages);
  const [meta, setMeta] = useState<GalleryMeta>(initialMeta);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sync if SSR props change
  useEffect(() => {
    setImages(initialImages);
    setMeta(initialMeta);
  }, [initialImages, initialMeta]);

  // Load more images (appends 20 more)
  const handleShowMore = async () => {
    if (isLoadingMore || images.length >= meta.total) return;
    setIsLoadingMore(true);
    setLoadError(null);
    try {
      const nextPage = (meta.page || 1) + 1;
      const res = await getPublicGallery({ page: nextPage, limit: 20 });
      if (res.data && res.data.length > 0) {
        setImages((prev) => {
          const existingIds = new Set(prev.map((img) => img._id));
          const newUnique = res.data.filter((img) => !existingIds.has(img._id));
          return [...prev, ...newUnique];
        });
        setMeta(res.meta);
      }
    } catch (err: any) {
      console.error("Failed to load more photos:", err);
      setLoadError("Failed to load more photos. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : images.length - 1
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null && prev < images.length - 1 ? prev + 1 : 0
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, images.length]);

  const currentLightboxImg =
    lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── Top Header (Compact height) ── */}
      <section className="relative pt-20 pb-8 sm:pt-24 sm:pb-10 bg-[#0f2347] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#E8542A] text-[11px] font-semibold uppercase tracking-widest mb-2">
            <Sparkles size={12} className="text-[#E8542A]" />
            <span>Moments That Inspire Us</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-2">
            Gallery
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
            A visual journey of our work, community drives, and relief initiatives across Uttarakhand.
          </p>
        </div>
      </section>

      {/* ── Main Gallery Section ── */}
      <section className="py-10 sm:py-14 bg-[#f8f9fc] text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered Sub-header */}
          <div className="text-center mb-8 pb-4 border-b border-gray-200/80">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#0f2347] tracking-tight">
              Gallery
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Showing {images.length} of {meta.total} photos
            </p>
          </div>

          {/* ── Images Grid ── */}
          {images.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200/80 p-12 sm:p-16 text-center max-w-xl mx-auto shadow-sm my-8">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#E8542A] mx-auto mb-5 flex items-center justify-center">
                <Images size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0f2347] mb-2">
                {backendMessage || "No images found"}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Photos from our ongoing activities will appear here shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {images.map((img, idx) => {
                const resolvedUrl = getImageUrl(img.imageUrl);

                return (
                  <div
                    key={img._id}
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
                  >
                    {/* Next Image */}
                    <Image
                      src={resolvedUrl}
                      alt={img.alt || img.title || "Seva India field photo"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      unoptimized={true}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f2347]/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Bottom Caption / Hover indicator */}
                    <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {img.title && (
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {img.title}
                        </h4>
                      )}
                      {img.caption && (
                        <p className="text-xs text-gray-300 line-clamp-2 mt-0.5">
                          {img.caption}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-[11px] text-gray-300 font-medium">
                        <span>Click to view full photo</span>
                        <ExternalLink size={13} className="text-[#E8542A]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Show More Button & Progress ── */}
          {meta.total > 0 && (
            <div className="mt-12 flex flex-col items-center justify-center gap-3">
              {images.length < meta.total ? (
                <button
                  type="button"
                  onClick={handleShowMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#0f2347] hover:bg-[#1a386e] text-white font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-60 cursor-pointer active:scale-95 group"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Loading more photos...</span>
                    </>
                  ) : (
                    <>
                      <span>Show More Photos</span>
                      <span className="text-xs bg-white/15 px-2 py-0.5 rounded-full text-orange-200">
                        +{Math.min(20, meta.total - images.length)}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center text-xs text-slate-500 py-2 px-5 rounded-full bg-slate-100 border border-slate-200 font-medium">
                  ✓ All {meta.total} photos displayed
                </div>
              )}

              {loadError && (
                <p className="text-xs text-red-500 font-medium mt-1">{loadError}</p>
              )}

              <p className="text-xs text-slate-500 font-medium">
                Showing {images.length} of {meta.total} photos
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Interactive Lightbox Modal ── */}
      {currentLightboxImg && (
        <Portal>
          <div
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
          >
            <X size={24} />
          </button>

          {/* Prev button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null && prev > 0
                    ? prev - 1
                    : images.length - 1
                );
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-20"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null && prev < images.length - 1
                    ? prev + 1
                    : 0
                );
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-20"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Image & Caption Container */}
          <div
            className="max-w-5xl w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[70vh] w-[90vw] max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src={getImageUrl(currentLightboxImg.imageUrl)}
                alt={currentLightboxImg.alt || currentLightboxImg.title || "Gallery photo"}
                fill
                sizes="(max-width: 1024px) 95vw, 1000px"
                className="object-contain"
              />
            </div>

            {/* Caption & Metadata Bar */}
            <div className="mt-4 text-center text-white max-w-2xl px-4">
              <div className="text-xs text-gray-400 mb-1">
                {lightboxIndex! + 1} of {images.length}
              </div>

              {currentLightboxImg.title && (
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {currentLightboxImg.title}
                </h3>
              )}
              {currentLightboxImg.caption && (
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  {currentLightboxImg.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      </Portal>
      )}
    </div>
  );
}
