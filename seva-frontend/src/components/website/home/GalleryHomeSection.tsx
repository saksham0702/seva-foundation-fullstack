"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Camera,
  Eye,
  Sparkles,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { GalleryItem } from "@/app/api/gallery";
import { getImageUrl } from "@/lib/image";
import { Portal } from "@/components/shared/Portal";

interface GalleryHomeSectionProps {
  images?: GalleryItem[];
}

const DEFAULT_GALLERY_IMAGES = [
  {
    _id: "def-1",
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
    title: "Rural Bridge School Classes - Education Initiative",
    category: "Education",
    alt: "Children in bridge schools studying with smile",
  },
  {
    _id: "def-2",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
    title: "Mobile Health Camp & Diagnostics in Mountain Hamlets",
    category: "Healthcare",
    alt: "Medical team examining patient",
  },
  {
    _id: "def-3",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80",
    title: "Daily Nutritious Meal Distribution & Community Kitchens",
    category: "Hunger Relief",
    alt: "Warm meals served to children and families",
  },
  {
    _id: "def-4",
    imageUrl: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&auto=format&fit=crop&q=80",
    title: "Elderly Care Visits & Essential Dignity Kits",
    category: "Elderly Care",
    alt: "Volunteers sharing smiles with elderly beneficiaries",
  },
  {
    _id: "def-5",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    title: "Free Eye Checkup & Vision Aid Camp",
    category: "Healthcare",
    alt: "Doctor providing eye care glasses",
  },
  {
    _id: "def-6",
    imageUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80",
    title: "Rapid Disaster Relief & Essential Food Packet Supply",
    category: "Disaster Relief",
    alt: "Relief supplies distributed during emergencies",
  },
];

export default function GalleryHomeSection({
  images,
}: GalleryHomeSectionProps) {
  const displayImages =
    images && images.length > 0 ? images.slice(0, 6) : (DEFAULT_GALLERY_IMAGES as any[]);

  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  const activeImage =
    activeModalIndex !== null ? displayImages[activeModalIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeModalIndex !== null) {
      setActiveModalIndex(
        (activeModalIndex - 1 + displayImages.length) % displayImages.length
      );
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeModalIndex !== null) {
      setActiveModalIndex((activeModalIndex + 1) % displayImages.length);
    }
  };

  return (
    <section className="bg-[#FAF7F2] py-16 sm:py-24 border-y border-stone-200/60 relative overflow-hidden">
      {/* Subtle background ambient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5A623]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8542A] mb-3">
              <Camera size={13} className="text-[#E8542A]" />
              Moments of Impact · Field Photobank
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#0A1A2F] leading-tight">
              Glimpses of hope, dignity &amp;{" "}
              <span className="text-[#F5A623] italic">compassion</span>
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Every photograph captures our volunteers, doctors, and educators in action — bringing essential aid, smiles, and dignity to thousands across India.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0A1A2F] hover:text-[#E8542A] bg-white border border-slate-300 hover:border-[#E8542A] px-5 py-3 rounded-xl transition-all shadow-sm group"
            >
              <span>Explore Complete Gallery</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 6-Photo Bento / Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayImages.map((img: any, idx: number) => {
            const resolvedSrc = getImageUrl(img.imageUrl);
            const title =
              img.title ||
              img.alt ||
              `Seva Foundation Field Work - Moment ${idx + 1}`;
            const category = img.category || "Grassroots Action";

            return (
              <div
                key={img._id || idx}
                onClick={() => setActiveModalIndex(idx)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <Image
                  src={resolvedSrc}
                  alt={img.alt || title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

                {/* Top Category Tag */}
                <div className="absolute top-3.5 left-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/95 text-[#0A1A2F] backdrop-blur-md shadow-sm border border-white/20">
                    {category}
                  </span>
                </div>

                {/* Top Right Zoom Icon */}
                <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#0A1A2F] shadow-sm hover:bg-[#F5A623] hover:text-white transition-colors">
                    <Maximize2 size={13} />
                  </div>
                </div>

                {/* Bottom Title & Meta */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 space-y-1 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-sm sm:text-base font-serif font-bold text-white leading-snug line-clamp-2">
                    {title}
                  </h3>
                  {img.caption && (
                    <p className="text-[11px] text-slate-300 line-clamp-1">
                      {img.caption}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F5A623] pt-0.5">
                    <span>Click to expand</span>
                    <Eye size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 text-center">
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Want to see more moments from our bridge schools, hunger relief kitchens, and mountain clinics?
          </p>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#0A1A2F] hover:bg-[#1a3a6b] text-white text-xs sm:text-sm font-bold transition-all shadow-md"
          >
            <span>View All Field Photos ({displayImages.length}+)</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {activeImage && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/90 z-[99998] backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setActiveModalIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalIndex(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-[99999] cursor-pointer"
              title="Close Preview"
            >
              <X size={20} />
            </button>

            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-[99999] cursor-pointer"
              title="Previous Photo"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-[99999] cursor-pointer"
              title="Next Photo"
            >
              <ChevronRight size={24} />
            </button>

            {/* Modal Body */}
            <div
              className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full max-w-4xl h-[65vh] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={getImageUrl(activeImage.imageUrl)}
                  alt={activeImage.alt || activeImage.title || "Gallery Preview"}
                  fill
                  sizes="(max-width: 1024px) 95vw, 1000px"
                  className="object-contain"
                />
              </div>

              <div className="mt-4 text-center text-white max-w-2xl px-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623] block">
                  {activeImage.category || "Seva Field Work"}
                </span>
                <h4 className="text-base sm:text-lg font-serif font-bold">
                  {activeImage.title || activeImage.alt || "Seva India Foundation"}
                </h4>
                {activeImage.caption && (
                  <p className="text-xs text-slate-300">
                    {activeImage.caption}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </section>
  );
}
