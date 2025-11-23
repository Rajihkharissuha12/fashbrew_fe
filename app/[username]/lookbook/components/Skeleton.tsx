// components/Skeleton.tsx
import React from "react";

// Base Skeleton Component
export const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
};

// Hero Skeleton
export const HeroSkeleton = () => {
  return (
    <section className="relative bg-white dark:bg-zinc-950">
      {/* Banner Skeleton */}
      <Skeleton className="h-40 sm:h-56 w-full rounded-none" />

      {/* Avatar + Info Skeleton */}
      <div className="max-w-md mx-auto px-4 -mt-12 sm:-mt-16 relative z-10 text-center">
        {/* Avatar Skeleton */}
        <div className="flex justify-center mb-3">
          <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white dark:ring-zinc-900" />
        </div>

        {/* Username Skeleton */}
        <Skeleton className="h-8 w-40 mx-auto mb-2" />

        {/* Bio Skeleton */}
        <div className="space-y-2 max-w-sm mx-auto mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>

        {/* Social Links Skeleton */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </section>
  );
};

// Mood Filter Skeleton
export const MoodFilterSkeleton = () => {
  return (
    <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
};

// OOTD Card Skeleton
export const OOTDCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image Skeleton */}
      <Skeleton className="w-full aspect-[3/4] rounded-t-2xl" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Mood Tags */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Influencer Info */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};

// Grid Skeleton (3 cards)
interface OOTDGridSkeletonProps {
  quantity?: number; // optional, default 6
}

export const OOTDGridSkeleton = ({ quantity = 6 }: OOTDGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: quantity }, (_, i) => (
        <OOTDCardSkeleton key={i} />
      ))}
    </div>
  );
};
