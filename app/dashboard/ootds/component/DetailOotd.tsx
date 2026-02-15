"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OotdFormModal from "@/app/dashboards/component/OotdFormModal";
import EditOotdModal from "./EditOotdModal";

type PlatformType = "tiktok" | "shopee" | "tokopedia" | "other";

type ProductPlatformRow = {
  id: string;
  productId: string;
  platform: PlatformType | string;
  price: number | null;
  link: string | null;
  lastUpdated: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  price: number | null;
  category: string | null;
  platforms: ProductPlatformRow[];
};

type OotdProductRow = {
  id: string;
  productId: string;
  note: string | null;
  position: number | null;
  product: ProductRow;
};

// Updated OotdMediaRow dengan field baru
type OotdMediaRow = {
  id: string;
  ootdId: string;
  type: "image" | "video" | string;
  url: string;
  urlpublicid: string;
  isPrimary: boolean;
  originalSize: number;
  optimizedSize: number;
  originalFilename?: string;
  cloudinaryFormat?: string;
  dimensions?: string;
  createdAt: string;
  updatedAt: string;
};

type InfluencerRow = {
  id: string;
  name: string;
  handle: string;
  avatar: string | null;
  bio: string | null;
};

type OotdDetailRow = {
  id: string;
  influencerId: string;
  title: string;
  description: string | null;
  urlPostInstagram: string | null;
  mood: unknown | null;
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  media: OotdMediaRow[];
  ootdProducts: OotdProductRow[];
  influencer: InfluencerRow;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
// Skeleton Component untuk loading state
const ImageSkeleton = () => (
  <div className="w-full h-full bg-gradient-to-br from-orange-100 via-amber-50 to-orange-100 animate-pulse rounded-3xl relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
  </div>
);

// Optimized Image Component dengan lazy loading
const OptimizedImage = ({
  url,
  alt,
  className = "",
  priority = false,
}: {
  url: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!isLoaded && !hasError && <ImageSkeleton />}

      {!hasError ? (
        <img
          src={url}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`absolute inset-0 w-full h-full ${className} transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-xs text-gray-400 font-bold">Gagal memuat</p>
          </div>
        </div>
      )}
    </div>
  );
};

async function fetchOotdDetail(
  apiBase: string,
  id: string
): Promise<OotdDetailRow> {
  console.log("jalankan fetch");
  const res = await fetch(`${apiBase}/api/ootds/byid/${id}`, {
    cache: "no-store",
  });
  // if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  console.log("hasil data", json);

  const o = json.data;
  const mediaArr: OotdMediaRow[] = Array.isArray(o.media)
    ? o.media.map((m: any) => ({
        id: String(m.id),
        ootdId: String(m.ootdId),
        type: String(m.type),
        url: String(m.url),
        urlpublicid: String(m.urlpublicid),
        isPrimary: Boolean(m.isPrimary),
        originalSize: Number(m.originalSize || 0),
        optimizedSize: Number(m.optimizedSize || 0),
        originalFilename: m.originalFilename || undefined,
        cloudinaryFormat: m.cloudinaryFormat || undefined,
        dimensions: m.dimensions || undefined,
        createdAt: m.createdAt
          ? new Date(m.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: m.updatedAt
          ? new Date(m.updatedAt).toISOString()
          : new Date().toISOString(),
      }))
    : [];

  return {
    id: String(o.id),
    influencerId: String(o.influencerId),
    title: o.title,
    description: o.description ?? null,
    urlPostInstagram: o.urlPostInstagram ?? null,
    mood: o.mood ?? null,
    isPublic: Boolean(o.isPublic),
    viewCount: Number(o.viewCount ?? 0),
    likeCount: Number(o.likeCount ?? 0),
    createdAt: o.createdAt
      ? new Date(o.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: o.updatedAt
      ? new Date(o.updatedAt).toISOString()
      : new Date().toISOString(),
    media: mediaArr,
    ootdProducts: Array.isArray(o.ootdProducts)
      ? o.ootdProducts.map((op: any) => ({
          id: String(op.id),
          productId: String(op.productId),
          note: op.note ?? null,
          position: op.position != null ? Number(op.position) : null,
          product: {
            id: String(op.product?.id ?? ""),
            name: String(op.product?.name ?? ""),
            description: op.product?.description ?? null,
            image: op.product?.image ?? null,
            price: op.product?.price != null ? Number(op.product.price) : null,
            category: op.product?.category ?? null,
            platforms: Array.isArray(op.product?.platforms)
              ? op.product.platforms.map((pl: any) => ({
                  id: String(pl.id),
                  productId: String(pl.productId),
                  platform: String(pl.platform),
                  price: pl.price != null ? Number(pl.price) : null,
                  link: pl.link ?? null,
                  lastUpdated: pl.lastUpdated
                    ? new Date(pl.lastUpdated).toISOString()
                    : null,
                }))
              : [],
          },
        }))
      : [],
    influencer: {
      id: String(o.influencer?.id ?? ""),
      name: String(o.influencer?.name ?? ""),
      handle: String(o.influencer?.handle ?? ""),
      avatar: o.influencer?.avatar ?? null,
      bio: o.influencer?.bio ?? null,
    },
  };
}

async function deleteOotd(apiBase: string, id: string) {
  const res = await fetch(`${apiBase}/api/ootds/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function OotdDetail({
  ootdId,
  apiBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
}: {
  ootdId: string;
  apiBaseUrl?: string;
}) {
  const router = useRouter();
  const [ootd, setOotd] = useState<OotdDetailRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<OotdMediaRow | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const loadOotdDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOotdDetail(apiBaseUrl, ootdId);
      console.log("data", data);
      setOotd(data);
      const primary = data.media.find((m) => m.isPrimary) || data.media[0];
      setSelectedMedia(primary || null);
    } catch (err: any) {
      console.log(err);
      setError(err?.message || "Gagal memuat detail OOTD");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOotdDetail();
  }, []);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentMediaIndex]);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!ootd) return;

    const confirmed = window.confirm(
      `Yakin ingin menghapus OOTD "${ootd.title}"? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteOotd(apiBaseUrl, ootd.id);
      router.push("/dashboard/ootd");
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus OOTD");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    await loadOotdDetail();
  };

  // Navigation handlers
  const handleNext = () => {
    if (ootd && currentMediaIndex < ootd.media.length - 1) {
      const nextIndex = currentMediaIndex + 1;
      setCurrentMediaIndex(nextIndex);
      setSelectedMedia(ootd.media[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentMediaIndex > 0) {
      const prevIndex = currentMediaIndex - 1;
      setCurrentMediaIndex(prevIndex);
      setSelectedMedia(ootd?.media[prevIndex] ?? null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left skeleton */}
            <div className="lg:col-span-8 space-y-6">
              <div className="aspect-[4/5] bg-gradient-to-br from-orange-100 via-amber-50 to-orange-100 rounded-3xl animate-pulse" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            </div>
            {/* Right skeleton */}
            <div className="lg:col-span-4 space-y-6">
              <div className="h-16 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl animate-pulse" />
              <div className="h-32 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl animate-pulse" />
              <div className="h-64 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ootd) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
        <div className="text-center space-y-4 p-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-400 to-pink-400 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-red-600 font-semibold">
            {error || "OOTD tidak ditemukan"}
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:scale-105 transition-all"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  const sortedProducts = [...ootd.ootdProducts].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-amber-50/10">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b-2 border-orange-100/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-all hover:scale-105 group"
            >
              <div className="p-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl group-hover:shadow-lg transition-all">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
              <span className="font-bold text-sm sm:text-base">Kembali</span>
            </button>

            <div className="flex items-center gap-3">
              {!ootd.isPublic && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-2 rounded-2xl border-2 border-red-200">
                  <span className="text-lg">🔒</span>
                  <span className="text-xs sm:text-sm font-bold text-red-600">
                    Private
                  </span>
                </div>
              )}
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT: MEDIA GALLERY */}
          <div className="lg:col-span-8 space-y-6">
            {/* Main Image Container - FIXED STRUCTURE */}
            <div className="relative aspect-[4/5] bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10 group">
              {selectedMedia ? (
                selectedMedia.type === "video" ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full h-full object-cover"
                    poster="/video-placeholder.jpg"
                  />
                ) : (
                  <OptimizedImage
                    url={selectedMedia.url}
                    alt={ootd.title}
                    className="w-full h-full object-cover"
                    priority={currentMediaIndex === 0}
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center shadow-2xl">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400 font-bold">
                      Belum ada media
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {ootd.media.length > 1 && selectedMedia && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md hover:bg-white text-gray-900 p-3 rounded-2xl shadow-2xl shadow-orange-500/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed z-10"
                    disabled={currentMediaIndex === 0}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md hover:bg-white text-gray-900 p-3 rounded-2xl shadow-2xl shadow-orange-500/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed z-10"
                    disabled={currentMediaIndex === ootd.media.length - 1}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2 rounded-2xl text-sm font-black backdrop-blur-sm shadow-xl z-10">
                    {currentMediaIndex + 1} / {ootd.media.length}
                  </div>
                </>
              )}

              {/* Decorative elements */}
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            </div>

            {/* Thumbnails - FIXED: Removed inline style */}
            {ootd.media.length > 1 && (
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-50 hover:scrollbar-thumb-orange-400">
                  {ootd.media.map((m, index) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMedia(m);
                        setCurrentMediaIndex(index);
                      }}
                      className={`shrink-0 rounded-2xl overflow-hidden transition-all duration-300 relative group/thumb w-24 h-24 ${
                        selectedMedia?.id === m.id
                          ? "ring-4 ring-orange-500 scale-105 shadow-2xl shadow-orange-500/30"
                          : "ring-2 ring-gray-200 hover:ring-4 hover:ring-orange-300 hover:scale-105 hover:shadow-xl"
                      }`}
                    >
                      <div className="w-full h-full relative">
                        {m.type === "video" ? (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center">
                            <svg
                              className="w-10 h-10"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold">
                              VIDEO
                            </div>
                          </div>
                        ) : (
                          <>
                            <OptimizedImage
                              url={m.url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white drop-shadow-lg"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                                />
                              </svg>
                            </div>
                          </>
                        )}
                      </div>

                      {selectedMedia?.id === m.id && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg z-10">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT CONTENT - tetap sama seperti file asli kamu */}
          <div className="lg:col-span-4 space-y-8">
            {/* Influencer card dengan gradient */}
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl border-2 border-orange-100">
              {ootd.influencer.avatar ? (
                <img
                  src={ootd.influencer.avatar}
                  alt={ootd.influencer.name}
                  loading="lazy"
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {ootd.influencer.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-black text-gray-900 text-lg">
                  {ootd.influencer.name}
                </h3>
                <p className="text-sm text-gray-600 font-semibold">
                  @{ootd.influencer.handle}
                </p>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                {ootd.title}
              </h1>
              {ootd.description && (
                <p className="text-gray-700 leading-relaxed font-medium text-base">
                  {ootd.description}
                </p>
              )}
            </div>

            {/* Mood Tags - More playful */}
            {Array.isArray(ootd.mood) && (ootd.mood as any[]).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(ootd.mood as any[]).map((m, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-sm font-bold border-2 border-orange-200 hover:scale-105 transition-transform"
                  >
                    #{String(m)}
                  </span>
                ))}
              </div>
            )}

            {/* Stats dengan icon lebih playful */}
            <div className="flex items-center gap-6 py-6 border-y-2 border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <span className="text-base font-black text-gray-900">
                  {ootd.viewCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-red-100 to-pink-200 rounded-xl">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-base font-black text-gray-900">
                  {ootd.likeCount}
                </span>
              </div>
              <div className="ml-auto text-sm font-bold text-gray-500">
                {new Date(ootd.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Instagram Link - More attractive */}
            {ootd.urlPostInstagram && (
              <a
                href={ootd.urlPostInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white py-4 rounded-3xl font-black text-base hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all group"
              >
                <svg
                  className="w-6 h-6 group-hover:rotate-12 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Lihat di Instagram ✨
              </a>
            )}

            {/* Products - Simplified card */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black text-gray-900">Produk</h2>
                <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-sm font-black">
                  {sortedProducts.length}
                </span>
              </div>

              {sortedProducts.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-bold">Belum ada produk</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProducts.map((op, index) => (
                    <div
                      key={op.id}
                      className="group border-2 border-gray-100 rounded-3xl p-5 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 transition-all bg-white"
                    >
                      <div className="flex gap-4">
                        {op.product.image ? (
                          <div className="relative shrink-0">
                            <img
                              src={op.product.image}
                              alt={op.product.name}
                              className="w-24 h-24 rounded-2xl object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                            <svg
                              className="w-10 h-10 text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            </svg>
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-2">
                          <h3 className="font-black text-gray-900 text-base leading-snug">
                            {op.product.name}
                          </h3>
                          {op.note && (
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">
                              {op.note}
                            </p>
                          )}
                          {op.product.price != null && (
                            <p className="text-xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                              Rp {op.product.price.toLocaleString("id-ID")}
                            </p>
                          )}

                          {op.product.platforms.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              {op.product.platforms.map((pl) => (
                                <a
                                  key={pl.id}
                                  href={pl.link || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    pl.link
                                      ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:shadow-lg hover:shadow-gray-900/30 hover:scale-105 active:scale-95"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  }`}
                                  onClick={(e) => {
                                    if (!pl.link) e.preventDefault();
                                  }}
                                >
                                  {pl.platform}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {ootd && (
        <EditOotdModal
          open={!!showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            handleEditSuccess();
          }}
          userId={ootd.influencerId}
          ootdData={
            {
              id: ootd.id,
              influencerId: ootd.influencerId,
              title: ootd.title,
              description: ootd.description,
              urlPostInstagram: ootd.urlPostInstagram,
              mood: ootd.mood,
              isPublic: ootd.isPublic,
              viewCount: ootd.viewCount,
              likeCount: ootd.likeCount,
              createdAt: ootd.createdAt,
              updatedAt: ootd.updatedAt,
              media: ootd.media,
              coverImage: ootd.media.find((m) => m.isPrimary)?.url || null,
              ootdProducts: ootd.ootdProducts,
            } as any
          }
          apiBaseUrl={API_BASE}
        />
      )}
    </div>
  );
}
