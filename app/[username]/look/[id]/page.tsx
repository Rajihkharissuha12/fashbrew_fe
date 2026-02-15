"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import ProductList from "@/app/[username]/lookbook/components/ProductList";
import ProductModal from "@/app/[username]/lookbook/components/ProductModal";

// Types dari API
type ProductPlatform = {
  id: string;
  productId: string;
  platform: string;
  price: string | null;
  link: string | null;
  clicks: number;
  lastUpdated: string;
};

type ApiProduct = {
  id: string;
  influencerId: string;
  name: string;
  description: string;
  price: string;
  category: string;
  tags: string[];
  image: string;
  affiliateLink: string;
  clicks: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  platforms: ProductPlatform[];
};

type OotdProduct = {
  id: string;
  ootdId: string;
  productId: string;
  note: string;
  position: number;
  createdAt: string;
  product: ApiProduct;
};

type OotdMedia = {
  id: string;
  ootdId: string;
  type: "image" | "video";
  url: string;
  urlpublicid: string;
  isPrimary: boolean;
  originalSize: number;
  optimizedSize: number;
  createdAt: string;
  updatedAt: string;
};

type Influencer = {
  id: string;
  userId: string;
  name: string;
  handle: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  socialLinks: unknown | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiOotdDetail = {
  id: string;
  influencerId: string;
  title: string;
  description: string;
  urlPostInstagram: string;
  mood: string[];
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  media: OotdMedia[];
  ootdProducts: OotdProduct[];
  influencer: Influencer;
  analytics: unknown[];
};

// Transform types untuk component
interface TransformedProductPlatform {
  platform: string;
  price: string;
  link: string | null;
}

interface TransformedProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  platforms: TransformedProductPlatform[];
}

interface OOTDDetail {
  id: string;
  images: string[];
  title: string;
  description: string;
  mood: string[];
  influencer: {
    id: string;
    name: string;
    handle: string;
  };
  products: TransformedProduct[];
  urlPostInstagram: string;
  viewCount: number;
  likeCount: number;
}

interface Props {
  params: Promise<{
    username: string;
    id: string;
  }>;
}

// Image Carousel Component
interface ImageCarouselProps {
  images: string[];
  title: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
  const safeImages = images.filter(
    (u) => typeof u === "string" && u.trim() !== "",
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [safeImages.length]);

  if (safeImages.length === 0) {
    return (
      <div className="aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
        <span className="text-sm text-neutral-500">No image available</span>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % safeImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + safeImages.length) % safeImages.length,
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="relative">
      <div className="aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden mb-4 relative group">
        <img
          src={safeImages[currentImageIndex]}
          alt={`${title} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="eager"
        />

        {safeImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {safeImages.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {safeImages.map((image, index) => (
            <button
              key={image}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                currentImageIndex === index
                  ? "border-neutral-800 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-80"
              }`}
              aria-label={`Go to image ${index + 1}`}
            >
              <img
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {safeImages.length > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          {safeImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                currentImageIndex === index
                  ? "bg-neutral-800"
                  : "bg-neutral-300 hover:bg-neutral-500"
              }`}
              aria-label={`Go to dot ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type ApiResponse<T> = { data?: T };

export default function OotdDetail({ params }: Props) {
  const { username, id } = React.use(params);
  const router = useRouter();

  const [raw, setRaw] = useState<ApiOotdDetail | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<TransformedProduct | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data dari API (dengan cancellation)
  useEffect(() => {
    if (!id) return;

    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) {
      setError("NEXT_PUBLIC_API_BASE_URL belum diset");
      setStatus("error");
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchOOTDDetail = async () => {
      try {
        setStatus("loading");
        setError(null);
        setRaw(null); // penting: reset supaya tidak kebaca sebagai "not found" state lama

        const res = await fetch(`${base}/api/ootds/byid/${id}`, { signal });
        if (!res.ok) throw new Error(`Failed to fetch OOTD: ${res.statusText}`);

        const json = (await res.json()) as { data?: ApiOotdDetail };
        if (!json.data) throw new Error("Look not found");

        setRaw(json.data);
        setStatus("success");
      } catch (e) {
        if ((e as any)?.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "An error occurred");
        setStatus("error");
      }
    };

    fetchOOTDDetail();
    return () => controller.abort();
  }, [id]);

  // Transform API response -> format component (memoized)
  const ootd: OOTDDetail | null = useMemo(() => {
    if (!raw) return null;

    const images = raw.media
      .filter((m) => m.type === "image" && m.url && m.url.trim() !== "")
      .sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      })
      .map((m) => m.url);

    const products: TransformedProduct[] = raw.ootdProducts
      .filter((op) => op.product && Array.isArray(op.product.platforms))
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((op) => {
        const product = op.product;

        const platforms = product.platforms
          .filter((p) => p.link && p.link.trim() !== "")
          .map((p) => ({
            platform: p.platform,
            price: p.price
              ? `Rp ${parseInt(p.price).toLocaleString("id-ID")}`
              : "N/A",
            link: p.link,
          }))
          .filter((p) => p.link);

        return {
          id: product.id,
          name: product.name,
          price: `Rp ${parseInt(product.price).toLocaleString("id-ID")}`,
          image: product.image,
          description: product.description,
          platforms,
        };
      })
      .filter((p) => p.platforms.length > 0);

    return {
      id: raw.id,
      images, // penting: kalau kosong, tetap [] (jangan [""])
      title: raw.title,
      description: raw.description,
      mood: raw.mood || [],
      influencer: {
        id: raw.influencer.id,
        name: raw.influencer.name,
        handle: `@${raw.influencer.handle}`,
      },
      products,
      urlPostInstagram: raw.urlPostInstagram,
      viewCount: raw.viewCount,
      likeCount: raw.likeCount,
    };
  }, [raw]);

  const handleProductClick = (product: TransformedProduct) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 animate-spin [animation-duration:2s]" />
          </div>
          <p className="text-xs tracking-[0.3em] text-neutral-400 uppercase font-light">
            OOTD
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-neutral-900 mb-4">
            {error || "Look not found"}
          </h2>
          <button
            onClick={() => router.push(`/${username}/lookbook`)}
            className="text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Return to looks
          </button>
        </div>
      </div>
    );
  }

  if (!ootd) {
    // fallback guard (harusnya tidak kejadian)
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto lg:px-8 px-4 py-4">
        <button
          onClick={() => router.push(`/${username}/lookbook`)}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-light">Back to Looks</span>
        </button>
      </div>

      <main className="container max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ImageCarousel images={ootd.images} title={ootd.title} />

            <h1 className="text-2xl font-light text-neutral-900 leading-relaxed mt-6">
              {ootd.title}
            </h1>

            <p className="text-neutral-600 leading-relaxed mt-4">
              {ootd.description}
            </p>

            {ootd.mood.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {ootd.mood.map((m, idx) => (
                  <span
                    key={`${m}-${idx}`}
                    className="inline-block bg-neutral-100 text-neutral-700 text-xs px-3 py-1 rounded-full capitalize"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-4 mt-6 text-sm text-neutral-600">
              <div>
                <span className="font-medium text-neutral-900">
                  {ootd.viewCount}
                </span>{" "}
                views
              </div>
              <div>
                <span className="font-medium text-neutral-900">
                  {ootd.likeCount}
                </span>{" "}
                likes
              </div>
            </div>

            <div className="text-sm text-neutral-500 pt-4 border-t mt-6 border-neutral-200">
              Styled by{" "}
              <span className="font-medium text-neutral-700">
                {ootd.influencer.name}
              </span>
              <span className="ml-1 text-neutral-400">
                {ootd.influencer.handle}
              </span>
            </div>

            {ootd.urlPostInstagram && (
              <a
                href={ootd.urlPostInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 mt-4 px-5 py-2.5 rounded-lg text-sm font-medium text-neutral-900 bg-white border-2 border-neutral-200 hover:border-[#dc2743] hover:text-[#dc2743] transition-all duration-200 group"
              >
                <svg
                  className="w-5 h-5 group-hover:fill-[#dc2743] transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                </svg>
                Lihat di Instagram
              </a>
            )}
          </div>

          <div>
            <div className="sticky top-24">
              <h2 className="text-lg font-light text-neutral-900 mb-6">
                Shop This Look
              </h2>

              {ootd.products.length > 0 ? (
                <ProductList
                  products={ootd.products}
                  onProductClick={(product) =>
                    handleProductClick(product as TransformedProduct)
                  }
                />
              ) : (
                <p className="text-neutral-600 text-sm">
                  No products available for this look
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
}
