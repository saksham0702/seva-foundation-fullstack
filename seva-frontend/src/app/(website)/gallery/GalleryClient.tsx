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
import { GalleryItem, GalleryMeta } from "@/app/api/gallery";
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

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Navigate pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/gallery?${params.toString()}`);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : initialImages.length - 1
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null && prev < initialImages.length - 1 ? prev + 1 : 0
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, initialImages.length]);

  const currentLightboxImg =
    lightboxIndex !== null ? initialImages[lightboxIndex] : null;

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
              Showing {initialImages.length} of {initialMeta.total} photos
            </p>
          </div>

          {/* ── Images Grid ── */}
          {initialImages.length === 0 ? (
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
              {initialImages.map((img, idx) => {
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

          {/* ── Pagination ── */}
          {initialMeta.totalPage > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-slate-600 font-medium">
                Showing Page <span className="font-bold text-[#0f2347]">{initialMeta.page}</span> of{" "}
                <span className="font-bold text-[#0f2347]">{initialMeta.totalPage}</span> ({initialMeta.total} total photos)
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(initialMeta.page - 1)}
                  disabled={initialMeta.page <= 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {Array.from({ length: initialMeta.totalPage }).map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === initialMeta.totalPage ||
                    Math.abs(pageNum - initialMeta.page) <= 1
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          initialMeta.page === pageNum
                            ? "bg-[#0f2347] text-white shadow-md shadow-blue-950/20"
                            : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (
                    (pageNum === 2 && initialMeta.page > 3) ||
                    (pageNum === initialMeta.totalPage - 1 &&
                      initialMeta.page < initialMeta.totalPage - 2)
                  ) {
                    return (
                      <span key={pageNum} className="text-xs text-slate-400 px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(initialMeta.page + 1)}
                  disabled={initialMeta.page >= initialMeta.totalPage}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
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
          {initialImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null && prev > 0
                    ? prev - 1
                    : initialImages.length - 1
                );
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-20"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Next button */}
          {initialImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null && prev < initialImages.length - 1
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
            <div className="relative max-h-[78vh] w-auto overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={getImageUrl(currentLightboxImg.imageUrl)}
                alt={currentLightboxImg.alt || currentLightboxImg.title || "Gallery photo"}
                className="max-h-[78vh] max-w-[90vw] object-contain rounded-2xl"
              />
            </div>

            {/* Caption & Metadata Bar */}
            <div className="mt-4 text-center text-white max-w-2xl px-4">
              <div className="text-xs text-gray-400 mb-1">
                {lightboxIndex! + 1} of {initialImages.length}
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
