"use client";

import React from "react";

/* Shimmer utility classes */
const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent";

/** Single Campaign Card Skeleton */
export function CampaignCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-xs min-h-[420px] animate-pulse">
      {/* Image Skeleton */}
      <div className={`relative h-52 bg-slate-200 ${shimmer}`}>
        <div className="absolute top-3 left-3 w-16 h-5 rounded-full bg-slate-300" />
        <div className="absolute bottom-3 left-3 w-20 h-5 rounded-full bg-slate-300" />
      </div>

      {/* Body Skeleton */}
      <div className="p-5 flex grow flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-5 bg-slate-200 rounded-md w-11/12" />
          <div className="h-5 bg-slate-200 rounded-md w-3/4" />
        </div>

        {/* Progress Bar Area */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 rounded-md w-24" />
            <div className="h-4 bg-slate-200 rounded-md w-10" />
          </div>
          <div className="h-2 bg-slate-200 rounded-full w-full" />
          <div className="h-3 bg-slate-200 rounded-md w-20" />
        </div>

        {/* Meta Line */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="h-4 bg-slate-200 rounded-md w-20" />
          <div className="h-4 bg-slate-200 rounded-md w-20" />
        </div>

        {/* Button Skeleton */}
        <div className="h-9 bg-slate-200 rounded-lg w-full" />
      </div>
    </div>
  );
}

/** Grid of Campaign Card Skeletons */
export function CampaignGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Single Blog Card Skeleton */
export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 flex flex-col justify-between min-h-[440px] animate-pulse">
      <div>
        <div className={`relative h-52 bg-slate-200 ${shimmer}`}>
          <div className="absolute top-4 left-4 w-16 h-5 rounded-full bg-slate-300" />
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-3.5 bg-slate-200 rounded w-20" />
            <div className="h-3.5 bg-slate-200 rounded w-24" />
          </div>
          <div className="h-5 bg-slate-200 rounded-md w-full" />
          <div className="h-5 bg-slate-200 rounded-md w-4/5" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-11/12" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

/** Grid of Blog Card Skeletons */
export function BlogGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Single Event Card Skeleton */
export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 flex flex-col justify-between min-h-[460px] animate-pulse">
      <div>
        <div className={`relative h-56 bg-slate-200 ${shimmer}`}>
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="w-24 h-5 rounded-full bg-slate-300" />
            <div className="w-20 h-5 rounded-full bg-slate-300" />
          </div>
        </div>
        <div className="p-6 space-y-3">
          <div className="h-7 bg-slate-100 rounded-xl w-48" />
          <div className="h-3.5 bg-slate-200 rounded w-36" />
          <div className="h-5 bg-slate-200 rounded-md w-full" />
          <div className="h-5 bg-slate-200 rounded-md w-3/4" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-4/5" />
          </div>
        </div>
      </div>
      <div className="p-6 pt-0 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="h-4 bg-slate-200 rounded w-24" />
        <div className="h-8 bg-slate-200 rounded-xl w-28" />
      </div>
    </div>
  );
}

/** Grid of Event Card Skeletons */
export function EventGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Single News Card Skeleton */
export function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 flex flex-col justify-between min-h-[440px] animate-pulse">
      <div>
        <div className={`relative h-52 bg-slate-200 ${shimmer}`}>
          <div className="absolute top-4 left-4 w-16 h-5 rounded-full bg-slate-300" />
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-3.5 bg-slate-200 rounded w-20" />
            <div className="h-3.5 bg-slate-200 rounded w-24" />
          </div>
          <div className="h-5 bg-slate-200 rounded-md w-full" />
          <div className="h-5 bg-slate-200 rounded-md w-4/5" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-11/12" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded w-32" />
        </div>
      </div>
    </div>
  );
}

/** Grid of News Card Skeletons */
export function NewsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Full Media Hub Skeleton (Tabs + Search + Grids) */
export function MediaListingSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Category Pills Skeleton */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-7 w-20 bg-slate-200 rounded-full" />
        <div className="h-7 w-24 bg-slate-200 rounded-full" />
        <div className="h-7 w-28 bg-slate-200 rounded-full" />
        <div className="h-7 w-20 bg-slate-200 rounded-full" />
        <div className="h-7 w-32 bg-slate-200 rounded-full" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Campaign Detail Page Skeleton */
export function CampaignDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
          <div className="h-5 bg-slate-100 rounded-lg w-1/2" />
          <div className={`h-[420px] bg-slate-200 rounded-3xl ${shimmer}`} />
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-4 bg-slate-200 rounded w-4/6" />
          </div>
        </div>

        {/* Sidebar Donation Box */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 h-fit">
          <div className="h-6 bg-slate-200 rounded w-1/2" />
          <div className="h-10 bg-slate-200 rounded-xl w-full" />
          <div className="h-2.5 bg-slate-200 rounded-full w-full" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-12 bg-slate-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}

/** Donations Page Skeleton */
export function DonationsPageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8 min-h-[70vh]">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="h-6 w-32 bg-slate-200 rounded-full mx-auto" />
        <div className="h-9 w-3/4 bg-slate-200 rounded-2xl mx-auto" />
        <div className="h-4 w-full bg-slate-100 rounded mx-auto" />
      </div>

      {/* Main card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
            <div className="h-5 w-40 bg-slate-200 rounded pt-2" />
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-5 w-36 bg-slate-200 rounded" />
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
            <div className="h-5 w-28 bg-slate-200 rounded pt-2" />
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>

        <div className="h-14 bg-slate-200 rounded-2xl w-full" />
      </div>
    </div>
  );
}
