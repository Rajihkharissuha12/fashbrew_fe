"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, ExternalLink } from "lucide-react";

interface ProductPlatform {
  platform: string;
  price: string;
  link: string | null;
}

interface Product {
  name: string;
  image: string;
  platforms: ProductPlatform[];
  position: { top: string; left: string };
  note: string | null;
}

interface Influencer {
  name: string;
  handle: string;
}

interface OOTDCardProps {
  id: string;
  image?: string;
  video?: string;
  title: string;
  description: string | null;
  mood: string[];
  influencer: Influencer;
  products?: Product[];
  urlPostInstagram?: string;
  number: number;
}

export default function OOTDCard({
  id,
  image = "",
  video,
  title,
  mood,
  number,
  influencer,
  products = [],
  urlPostInstagram,
}: OOTDCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const influencerUsername = influencer.handle.replace("@", "");

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.includes("cloudinary")) {
      return imageUrl;
    }
    return imageUrl;
  };

  // Generate short ID untuk display (8 karakter pertama)

  const handleCardClick = () => {
    router.push(`/${influencerUsername}/look/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
    >
      {/* Main Image - Aspect Ratio 4:5 (Instagram portrait style) */}
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        {video ? (
          <video
            src={video}
            poster={getImageUrl(image)}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={getImageUrl(image)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}

        {/* Gradient Overlay - Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Right Corner - ID Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
          <p className="text-white text-xs font-mono font-semibold tracking-wider">
            #{number}
          </p>
        </div>

        {/* Mood Tags - Top Left (only on hover) */}
        {mood && mood.length > 0 && (
          <div
            className={`absolute top-3 left-3 flex flex-col gap-1.5 transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            }`}
          >
            {mood.slice(0, 2).map((m, idx) => (
              <span
                key={idx}
                className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-800 capitalize shadow-lg"
              >
                {m}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Overlay Content - Shown on Hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-5 transition-all duration-300 ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {/* Title */}
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 leading-tight drop-shadow-lg">
            {title}
          </h3>

          {/* Influencer Info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/50">
              {influencer?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate drop-shadow">
                {influencer?.name}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCardClick}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/95 hover:bg-white text-gray-900 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl"
            >
              <Eye className="w-4 h-4" />
              View OOTD
            </button>

            {urlPostInstagram && (
              <a
                href={urlPostInstagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2.5 bg-white/95 hover:bg-white text-gray-900 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                title="View on Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.011 4.85.07 3.252.148 4.771 1.691 4.919 4.919.059 1.266.07 1.646.07 4.85s-.011 3.585-.07 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.059-1.645.07-4.85.07-3.204 0-3.584-.011-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.059-1.265-.07-1.644-.07-4.849 0-3.204.011-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Products Count Badge - Bottom Left Corner */}
        {products && products.length > 0 && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 text-white"
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
            <span className="text-white text-xs font-semibold">
              {products.length}
            </span>
          </div>
        )}

        {/* Video Play Icon */}
        {video && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        )}
      </div>

      {/* Compact Info Strip - Always Visible (Below Image) */}
      <div className="p-3 bg-white lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              by {influencer?.name}
            </p>
          </div>

          {/* Quick Action Icon */}
          <div className="ml-2 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
            <Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
