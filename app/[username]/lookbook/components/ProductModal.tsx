"use client";

import React from "react";
import { X } from "lucide-react";

interface ProductPlatform {
  platform: string;
  price: string | null;
  link: string | null;
}

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  platforms: ProductPlatform[];
}

interface Props {
  product: Product;
  onClose: () => void;
}

const platformLabels: Record<string, string> = {
  shopee: "Shopee",
  tokopedia: "Tokopedia",
  tiktok: "TikTok",
  instagram: "Instagram",
};

const platformColors: Record<
  string,
  { bg: string; text: string; hover: string }
> = {
  shopee: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    hover: "hover:bg-orange-100",
  },
  tokopedia: {
    bg: "bg-green-50",
    text: "text-green-700",
    hover: "hover:bg-green-100",
  },
  tiktok: {
    bg: "bg-black bg-opacity-5",
    text: "text-neutral-900",
    hover: "hover:bg-neutral-100",
  },
  instagram: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    hover: "hover:bg-pink-100",
  },
};

const platformLogos: Record<string, string> = {
  shopee: "🛒",
  tokopedia: "🛍️",
  tiktok: "🎵",
  instagram: "📷",
};

const ProductModal = ({ product, onClose }: Props) => {
  // Handle escape key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Get platform color config, fallback to neutral
  const getPlatformStyle = (platform: string) => {
    return (
      platformColors[platform] || {
        bg: "bg-neutral-50",
        text: "text-neutral-700",
        hover: "hover:bg-neutral-100",
      }
    );
  };

  // Format platform name
  const formatPlatformName = (platform: string): string => {
    return (
      platformLabels[platform] ||
      platform.charAt(0).toUpperCase() + platform.slice(1)
    );
  };

  const validPlatforms = product.platforms.filter(
    (p) => p.link && p.link.trim()
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-neutral-700 shadow-md flex items-center justify-center hover:bg-neutral-100 transition-all duration-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex flex-col flex-1">
          {/* Product Image - Auto Height */}
          <div className="relative w-full bg-neutral-100 flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Product Details */}
          <div className="p-6">
            {/* Product Name */}
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2 leading-tight">
              {product.name}
            </h2>

            {/* Product Price */}
            <p className="text-xl font-bold text-neutral-900 mb-4">
              {product.price}
            </p>

            {/* Product Description */}
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Platforms Section */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Beli di
              </p>

              {validPlatforms.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {validPlatforms.map((platform, idx) => {
                    const style = getPlatformStyle(platform.platform);
                    const displayName = formatPlatformName(platform.platform);
                    const icon = platformLogos[platform.platform] || "🔗";

                    return (
                      <a
                        key={idx}
                        href={platform.link || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${style.bg} ${style.text} ${style.hover} hover:shadow-md border border-current border-opacity-10`}
                        title={
                          platform.price
                            ? `${displayName} - ${platform.price}`
                            : displayName
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <span>{displayName}</span>
                        </div>
                        {platform.price && (
                          <span className="text-xs font-semibold opacity-80">
                            {platform.price}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-neutral-50 rounded-lg p-4 text-center text-sm text-neutral-500">
                  Tidak ada platform yang tersedia untuk produk ini
                </div>
              )}
            </div>

            {/* Buy Button - Alternative CTA */}
            {validPlatforms.length > 0 && (
              <button
                onClick={() => {
                  // Buka platform pertama
                  if (validPlatforms[0].link) {
                    window.open(validPlatforms[0].link, "_blank");
                  }
                }}
                className="w-full mt-6 px-4 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-all duration-200 hover:shadow-lg"
              >
                Lihat Semua Penawaran
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
