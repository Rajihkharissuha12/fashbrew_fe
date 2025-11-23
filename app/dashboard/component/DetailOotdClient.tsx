"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OotdFormModal from "../component/OotdFormModal";

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

// Utility function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function getCompressionRatio(
  originalSize: number,
  optimizedSize: number
): number {
  if (!originalSize || !optimizedSize) return 0;
  const ratio = ((originalSize - optimizedSize) / originalSize) * 100;
  return Math.round(ratio * 100) / 100;
}

// Responsive Image Component
// Responsive Image Component
const ResponsiveImage = ({
  url,
  alt,
  title,
  className = "",
}: {
  url: string;
  alt: string;
  title?: string;
  className?: string;
}) => {
  // Generate responsive URLs dengan berbagai format
  const baseUrl = url.split("/upload/")[0] + "/upload";
  const publicId = url.split("/upload/")[1];

  return (
    <picture>
      {/* AVIF - Format terbaik */}
      {/* <source
        srcSet={`
          ${baseUrl}/w_540,c_fit,q_70,f_avif/${publicId} 540w,
          ${baseUrl}/w_768,c_fit,q_75,f_avif/${publicId} 768w,
          ${baseUrl}/w_1080,c_fit,q_80,f_avif/${publicId} 1080w
        `}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
        type="image/avif"
      /> */}

      {/* WebP - Fallback */}
      {/* <source
        srcSet={`
          ${baseUrl}/w_540,c_fit,q_70,f_webp/${publicId} 540w,
          ${baseUrl}/w_768,c_fit,q_75,f_webp/${publicId} 768w,
          ${baseUrl}/w_1080,c_fit,q_80,f_webp/${publicId} 1080w
        `}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
        type="image/webp"
      /> */}

      {/* JPG - Final fallback */}
      <img
        src={url}
        alt={alt}
        title={title}
        loading="lazy"
        decoding="async"
        className={`w-full h-auto object-contain ${className}`}
        style={{ maxWidth: "100%", height: "auto" }}
        onError={(e) => {
          e.currentTarget.src = "/placeholder-image.png";
        }}
      />
    </picture>
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

export default function OotdDetailClient({
  ootdId,
  apiBaseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
}: {
  ootdId: string;
  apiBaseUrl?: string;
}) {
  console.log("ootd id", ootdId);
  const router = useRouter();
  const [ootd, setOotd] = useState<OotdDetailRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<OotdMediaRow | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showMediaInfo, setShowMediaInfo] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat detail...</p>
        </div>
      </div>
    );
  }

  if (error || !ootd) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "OOTD tidak ditemukan"}</p>
          <button
            onClick={() => router.back()}
            className="text-gray-900 dark:text-white hover:underline"
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
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* ===== STICKY HEADER ===== */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 dark:bg-zinc-900/80 dark:border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium text-sm sm:text-base">Kembali</span>
            </button>

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {!ootd.isPublic && (
                <span className="bg-red-50 text-red-700 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold dark:bg-red-900/20 dark:text-red-400">
                  🔒 Private
                </span>
              )}
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-800 transition-all hover:shadow-md dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
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
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium hover:bg-red-100 transition-all disabled:opacity-50 dark:bg-red-900/20 dark:hover:bg-red-900/30"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
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
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          {/* ===== LEFT: MEDIA GALLERY (8 cols) ===== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Main Image / Video with Navigation */}
            <div className="relative aspect-[4/5] bg-gray-50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg dark:bg-zinc-900 group">
              {selectedMedia ? (
                selectedMedia.type === "video" ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ResponsiveImage
                    url={selectedMedia.url}
                    alt={ootd.title}
                    title={selectedMedia.originalFilename}
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    className="w-16 h-16 sm:w-24 sm:h-24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* Navigation Buttons - Only show if more than 1 media */}
              {ootd.media.length > 1 && selectedMedia && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevious}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 sm:p-3 rounded-full shadow-xl backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-zinc-800/90 dark:text-white dark:hover:bg-zinc-800"
                    aria-label="Previous media"
                    disabled={currentMediaIndex === 0}
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
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
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={handleNext}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 sm:p-3 rounded-full shadow-xl backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-zinc-800/90 dark:text-white dark:hover:bg-zinc-800"
                    aria-label="Next media"
                    disabled={currentMediaIndex === ootd.media.length - 1}
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Media Counter */}
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
                    {currentMediaIndex + 1} / {ootd.media.length}
                  </div>
                </>
              )}

              {/* Info Toggle */}
              {selectedMedia && (
                <button
                  onClick={() => setShowMediaInfo(!showMediaInfo)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 hover:bg-white text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg backdrop-blur-sm transition-all dark:bg-zinc-800/90 dark:text-white dark:hover:bg-zinc-800"
                >
                  {showMediaInfo ? "✕ Tutup Info" : "ℹ️ File Info"}
                </button>
              )}
            </div>

            {/* Info Panel */}
            {showMediaInfo && selectedMedia && (
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 space-y-4 dark:bg-zinc-900">
                {/* ... (isi tetap) */}
              </div>
            )}

            {/* Thumbnails */}
            {ootd.media.length > 1 && (
              <div className="flex gap-3 overflow-x-auto p-3 scrollbar-hide scroll-smooth">
                {ootd.media.map((m, index) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMedia(m);
                      setCurrentMediaIndex(index);
                    }}
                    className={`shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${
                      selectedMedia?.id === m.id
                        ? "ring-4 ring-orange-500 scale-105 shadow-xl dark:ring-orange-400"
                        : "ring-2 ring-gray-200 hover:ring-gray-400 hover:scale-105 hover:shadow-lg dark:ring-zinc-700 dark:hover:ring-zinc-500"
                    }`}
                  >
                    {m.type === "video" ? (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black text-white flex items-center justify-center">
                        <svg
                          className="w-8 h-8 sm:w-10 sm:h-10"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={m.url}
                        alt=""
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover"
                        loading="lazy"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== RIGHT: CONTENT (4 cols) ===== */}
          <div className="lg:col-span-4 space-y-8">
            {/* Influencer */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-zinc-800">
              {ootd.influencer.avatar ? (
                <img
                  src={ootd.influencer.avatar}
                  alt={ootd.influencer.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100 dark:ring-zinc-800"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg font-bold dark:bg-zinc-800">
                  {ootd.influencer.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {ootd.influencer.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{ootd.influencer.handle}
                </p>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight dark:text-white">
                {ootd.title}
              </h1>
              {ootd.description && (
                <p className="text-gray-600 leading-relaxed dark:text-gray-400">
                  {ootd.description}
                </p>
              )}
            </div>

            {/* Mood Tags */}
            {Array.isArray(ootd.mood) && (ootd.mood as any[]).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(ootd.mood as any[]).map((m, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium dark:bg-zinc-800 dark:text-gray-300"
                  >
                    #{String(m)}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 py-6 border-y border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {ootd.viewCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {ootd.likeCount}
                </span>
              </div>
              <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                {new Date(ootd.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Instagram Link */}
            {ootd.urlPostInstagram && (
              <a
                href={ootd.urlPostInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold hover:shadow-xl transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Lihat di Instagram
              </a>
            )}

            {/* Products */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 dark:text-white">
                Produk ({sortedProducts.length})
              </h2>

              {sortedProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm dark:text-gray-400">
                  Belum ada produk terkait
                </p>
              ) : (
                <div className="space-y-4">
                  {sortedProducts.map((op) => (
                    <div
                      key={op.id}
                      className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all dark:border-zinc-800"
                    >
                      <div className="flex gap-4">
                        {op.product.image ? (
                          <img
                            src={op.product.image}
                            alt={op.product.name}
                            className="w-20 h-20 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 shrink-0 dark:bg-zinc-800">
                            <svg
                              className="w-8 h-8"
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

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 dark:text-white">
                            {op.product.name}
                          </h3>
                          {op.note && (
                            <p className="text-sm text-gray-600 mb-2 dark:text-gray-400">
                              {op.note}
                            </p>
                          )}
                          {op.product.price != null && (
                            <p className="text-lg font-bold text-gray-900 mb-3 dark:text-white">
                              Rp {op.product.price.toLocaleString("id-ID")}
                            </p>
                          )}

                          {op.product.platforms.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {op.product.platforms.map((pl) => (
                                <a
                                  key={pl.id}
                                  href={pl.link || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    pl.link
                                      ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                                      : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-zinc-800"
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
        <OotdFormModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          mode="update"
          initialData={
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
          defaultInfluencerId={ootd.influencerId}
          onSuccess={handleEditSuccess}
          apiBaseUrl={apiBaseUrl}
        />
      )}
    </div>
  );
}
