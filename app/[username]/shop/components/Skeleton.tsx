// components/ProductSkeleton.tsx

import React from "react";

// Base Skeleton Component
export const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
};

// Hero Section Skeleton
export const ProductHeroSkeleton = () => {
  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-8 sm:py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Title Skeleton */}
        <div className="mb-4 space-y-3">
          <Skeleton className="h-8 sm:h-10 md:h-12 w-3/4 mx-auto" />
          <Skeleton className="h-8 sm:h-10 md:h-12 w-2/3 mx-auto" />
        </div>

        {/* Description Skeleton */}
        <div className="mb-6 sm:mb-8 max-w-2xl mx-auto space-y-2">
          <Skeleton className="h-5 sm:h-6 w-full" />
          <Skeleton className="h-5 sm:h-6 w-4/5 mx-auto" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="relative max-w-2xl mx-auto">
          <Skeleton className="h-12 sm:h-16 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-52 sm:h-60 md:h-64 lg:h-72 rounded-t-2xl" />

      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 sm:h-6 w-full" />
          <Skeleton className="h-5 sm:h-6 w-3/4" />
        </div>

        {/* Price Skeleton */}
        <Skeleton className="h-7 sm:h-8 w-32" />

        {/* Category Badge Skeleton */}
        <Skeleton className="h-6 w-20 rounded-full" />

        {/* Button Skeleton */}
        <Skeleton className="h-10 sm:h-11 w-full rounded-xl" />
      </div>
    </div>
  );
};

// Product Grid Skeleton
interface ProductGridSkeletonProps {
  quantity?: number;
}

export const ProductGridSkeleton = ({
  quantity = 6,
}: ProductGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: quantity }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Header Results Skeleton (Optional - jika uncomment di code)
export const ProductHeaderSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 sm:h-8 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-10 w-40 sm:w-44 rounded-lg" />
    </div>
  );
};

// Search Bar Skeleton (Standalone)
export const SearchBarSkeleton = () => {
  return (
    <div className="relative max-w-2xl mx-auto">
      <Skeleton className="h-12 sm:h-16 w-full rounded-2xl" />
    </div>
  );
};

// Filter Dropdown Skeleton (Optional)
export const FilterDropdownSkeleton = () => {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-6 z-40">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Skeleton
export const ProductModalSkeleton = () => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[92vw] sm:w-auto max-w-sm sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-6 sm:h-7 w-40" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-5 w-full" />
        </div>

        {/* Platform Options */}
        <div className="p-4 sm:p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 sm:h-20 w-full rounded-xl" />
          ))}

          {/* Product Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};
