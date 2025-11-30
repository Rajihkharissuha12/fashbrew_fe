"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MoodFilter from "./components/MoodFilter";
import OOTDCard from "./components/OOTDCard";
import CoffeeFooter from "@/app/footer/page";
import {
  HeroSkeleton,
  MoodFilterSkeleton,
  OOTDGridSkeleton,
} from "./components/Skeleton";
// Types dari API - Sesuai dengan response API
type ProductPlatform = {
  id: string;
  productId: string;
  platform: string;
  price: string | null;
  link: string | null;
  clicks: number;
  lastUpdated: string;
};

type Product = {
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
  product: Product;
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

type OotdRow = {
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
  number: number;
};

// Transform type untuk component
interface TransformedProduct {
  name: string;
  image: string;
  platforms: Array<{
    platform: string;
    price: string;
    link: string | null;
  }>;
  position: { top: string; left: string };
  note: string | null;
}

interface TransformedInfluencer {
  name: string;
  handle: string;
}

interface OOTD {
  id: string;
  image?: string;
  video?: string;
  title: string;
  description: string;
  mood: string[];
  influencer: TransformedInfluencer;
  products: TransformedProduct[];
  urlPostInstagram?: string;
  number: number;
}

interface ApiResponse {
  data: OotdRow[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  handle: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  socialLinks: SocialLinks | null;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  user: UserAccount;
}

export interface SocialLinks {
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  website?: string | null;
  [key: string]: string | null | undefined; // fleksibel untuk sosial lainnya
}

export interface UserAccount {
  id: string;
  authUserId: string;
  role: "admin" | "user" | "creator" | string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}
export default function LookbookPage() {
  const params = useParams();
  const username = params?.username as string;
  console.log("USERNAME", username);

  const [ootdData, setOotdData] = useState<OOTD[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Transform OotdRow ke format component
  const transformOotdData = (rawData: OotdRow[]): OOTD[] => {
    return rawData.map((ootd) => {
      // Get primary image dan video dari media
      const primaryMedia = ootd.media.find((m) => m.isPrimary);
      const allImages = ootd.media.filter((m) => m.type === "image");
      const videoMedia = ootd.media.find((m) => m.type === "video");

      // Gunakan primary image, jika tidak ada gunakan image pertama
      const image =
        primaryMedia?.type === "image"
          ? primaryMedia.url
          : allImages.length > 0
          ? allImages[0].url
          : undefined;

      const video = videoMedia?.url;

      // Transform products dengan filter dan mapping
      const products: TransformedProduct[] = ootd.ootdProducts
        .filter((op) => op.product && op.product.platforms.length > 0)
        .map((op) => {
          const product = op.product;
          return {
            name: product.name,
            image: product.image,
            platforms: product.platforms
              .filter((p) => p.link && p.link !== "ajsdasda") // Filter link yang valid
              .map((p) => ({
                platform: p.platform,
                price: p.price
                  ? `Rp ${parseInt(p.price).toLocaleString("id-ID")}`
                  : "N/A",
                link: p.link,
              })),
            position: {
              top: op.position ? `${Math.min(op.position * 10, 100)}%` : "50%",
              left: "50%",
            },
            note: op.note && op.note.trim() ? op.note : null,
          };
        })
        .filter((p) => p.platforms.length > 0); // Filter product tanpa platform yang valid

      // Mood array dari API
      const moodArray = Array.isArray(ootd.mood) ? ootd.mood : ["all"];
      const number = ootd.number || 0;

      return {
        id: ootd.id,
        image: image,
        video: video,
        title: ootd.title,
        description: ootd.description,
        mood: moodArray.length > 0 ? moodArray : ["all"],
        influencer: {
          name: ootd.influencer.name || username || "Unknown",
          handle: `@${ootd.influencer.handle || username}`,
        },
        products,
        urlPostInstagram: ootd.urlPostInstagram,
        number,
      };
    });
  };

  // Fetch data dari API
  useEffect(() => {
    if (!username) return;

    const fetchOOTD = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ootds/${username}`
        );

        console.log("Response Status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch OOTD: ${response.statusText}`);
        }

        const apiData: ApiResponse = await response.json();
        console.log("Raw API Data:", apiData);

        // Transform data sesuai struktur API
        const transformedData = transformOotdData(apiData.data || []);
        console.log("Transformed Data:", transformedData);
        setOotdData(transformedData);

        const responseUser = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/username/${username}`
        );

        if (!responseUser.ok) {
          throw new Error(`Failed to fetch user: ${responseUser.statusText}`);
        }

        const data = await responseUser.json(); // ubah response ke JSON

        setUser(data.data);

        setError(null);
      } catch (err) {
        console.error("Error fetching OOTD:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setOotdData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOOTD();
  }, [username]);

  // Filter OOTD berdasarkan mood
  const filteredOOTDs = ootdData.filter(
    (ootd) => activeFilter === "all" || ootd.mood.includes(activeFilter)
  );

  // Extract semua mood yang unik untuk filter
  const allMoods = Array.from(new Set(ootdData.flatMap((ootd) => ootd.mood)));

  const handleFilterChange = (moodId: string) => {
    setActiveFilter(moodId);
  };

  return (
    <>
      <div className="min-h-screen bg-neutral-50">
        {/* Hero Section */}
        {loading ? (
          <HeroSkeleton />
        ) : (
          <section className="relative bg-white dark:bg-zinc-950">
            {/* Banner */}
            <div className="h-40 sm:h-56 w-full relative">
              <img
                src={
                  user?.banner ||
                  "https://res.cloudinary.com/dvuza2lpc/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1762877959/ootd/annie-spratt-YN9zG6nGvFI-unsplash_wk1ldx.jpg"
                } // ubah ke user.banner kalau ada
                alt={`${username}'s banner`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Avatar + Info */}
            <div className="max-w-md mx-auto px-4 -mt-12 sm:-mt-16 relative z-10 text-center">
              {/* Avatar */}
              <div className="flex justify-center mb-3">
                <img
                  src={
                    user?.avatar ||
                    "https://res.cloudinary.com/dvuza2lpc/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1762877846/ootd/54b19ada-d53e-4ee9-8882-9dfed1bf1396_ldepm9.jpg"
                  } // ubah ke user.avatar kalau ada
                  alt={username}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-lg"
                />
              </div>

              {/* Username */}
              <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-white mb-1">
                @{username}
              </h2>

              {/* Bio */}
              <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed mb-4">
                {user?.bio ||
                  "Fashion enthusiast | Sharing my favorite outfits, trends, and daily style inspiration ✨"}
              </p>

              {/* Social Links */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {user?.socialLinks?.instagram && (
                  <a
                    href={user?.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800 transition-all"
                  >
                    Instagram
                  </a>
                )}
                {user?.socialLinks?.tiktok && (
                  <a
                    href={user?.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800 transition-all"
                  >
                    TikTok
                  </a>
                )}
                {user?.socialLinks?.youtube && (
                  <a
                    href={user?.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800 transition-all"
                  >
                    Youtube
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Mood Filter - Show Skeleton saat loading */}
        {loading ? (
          <MoodFilterSkeleton />
        ) : (
          !error && (
            <MoodFilter
              moods={allMoods}
              onFilterChange={handleFilterChange}
              activeFilter={activeFilter}
            />
          )
        )}

        {/* OOTD Grid */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Loading State - Show Grid Skeleton */}
          {loading && <OOTDGridSkeleton />}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">Error: {error}</p>
            </div>
          )}

          {!loading && !error && filteredOOTDs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 text-center">
                {username || "User ini"} Belum Menambahkan OOTD
              </h3>

              <p className="text-base sm:text-lg text-gray-600 text-center max-w-md">
                Belum ada outfit yang dibagikan. Cek lagi nanti untuk inspirasi
                fashion terbaru!
              </p>
            </div>
          )}

          {!loading && !error && filteredOOTDs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOOTDs.map((ootd) => (
                <OOTDCard
                  key={ootd.id}
                  id={ootd.id}
                  image={ootd.image || ""}
                  video={ootd.video || ""}
                  number={ootd.number}
                  title={ootd.title}
                  description={ootd.description}
                  mood={ootd.mood}
                  influencer={ootd.influencer}
                  products={ootd.products}
                  urlPostInstagram={ootd.urlPostInstagram}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
