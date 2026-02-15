"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import MoodFilter from "./components/MoodFilter";
import OOTDCard from "./components/OOTDCard";
import CoffeeFooter from "@/app/footer/page";
import { MoodFilterSkeleton, OOTDGridSkeleton } from "./components/Skeleton";

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

interface OOTD {
  id: string;
  title: string;
  mood: string[];
  urlPostInstagram?: string;
  number: number;
  media: {
    type: "image" | "video";
    url: string;
    urlpublicid: string;
    isPrimary: boolean;
  }[];
  _count: {
    ootdProducts: number;
  };
}

export interface SocialLinks {
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  website?: string | null;
  [key: string]: string | null | undefined;
}

export interface UserAccount {
  id: string;
  authUserId: string;
  role: "admin" | "user" | "creator" | string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
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
  createdAt: string;
  updatedAt: string;
  user: UserAccount;
}

type ApiResponse<T> = {
  data?: T;
  moods?: string[];
};

type Status = "idle" | "loading" | "success" | "error";

export default function LookbookPage() {
  const params = useParams();
  const username = (params?.username as string) || "";

  const [ootdData, setOotdData] = useState<OOTD[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allMoods, setAllMoods] = useState<string[]>(["all"]);
  const [activeFilter, setActiveFilter] = useState("all");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // Kalau username belum ada, jangan bikin empty/error state
    if (!username) {
      setStatus("idle");
      return;
    }

    if (!base) {
      setError("NEXT_PUBLIC_API_BASE_URL belum diset");
      setStatus("error");
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const run = async () => {
      try {
        setStatus("loading");
        setError(null);

        // reset data biar tidak ke-render state lama saat pindah username
        setUser(null);
        setOotdData([]);
        setAllMoods(["all"]);
        setActiveFilter("all");

        const [responseUser, responseOOTD, responseMoods] = await Promise.all([
          fetch(`${base}/api/users/username/${username}`, { signal }),
          fetch(`${base}/api/ootds/${username}`, { signal }),
          fetch(`${base}/api/ootds/mood/${username}`, { signal }),
        ]);

        if (!responseUser.ok)
          throw new Error(`Failed to fetch user: ${responseUser.statusText}`);
        if (!responseOOTD.ok)
          throw new Error(`Failed to fetch OOTD: ${responseOOTD.statusText}`);
        if (!responseMoods.ok)
          throw new Error(`Failed to fetch moods: ${responseMoods.statusText}`);

        const [userJson, ootdJson, moodsJson] = await Promise.all([
          responseUser.json() as Promise<ApiResponse<UserProfile>>,
          responseOOTD.json() as Promise<ApiResponse<OOTD[]>>,
          responseMoods.json() as Promise<ApiResponse<string[]>>,
        ]);

        setUser(userJson.data || null);
        setOotdData(ootdJson.data || []);

        const moodsArr =
          (moodsJson as any)?.moods ||
          (moodsJson as any)?.data ||
          (Array.isArray(moodsJson) ? (moodsJson as any) : []);

        setAllMoods(["all", ...(moodsArr || [])]);

        setStatus("success");
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "An error occurred");
        setStatus("error");
      }
    };

    run();
    return () => controller.abort();
  }, [username, base]);

  const filteredOOTDs = useMemo(() => {
    return ootdData.filter(
      (ootd) => activeFilter === "all" || ootd.mood.includes(activeFilter),
    );
  }, [ootdData, activeFilter]);

  const handleFilterChange = (moodId: string) => {
    setActiveFilter(moodId);
  };

  const bannerSrc =
    user?.banner ||
    "https://res.cloudinary.com/dvuza2lpc/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1762877959/ootd/annie-spratt-YN9zG6nGvFI-unsplash_wk1ldx.jpg";

  const avatarSrc =
    user?.avatar ||
    "https://res.cloudinary.com/dvuza2lpc/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1762877846/ootd/54b19ada-d53e-4ee9-8882-9dfed1bf1396_ldepm9.jpg";

  const isLoading = status === "idle" || status === "loading";

  return (
    <>
      <div className="min-h-screen bg-neutral-50">
        <section className="relative bg-white dark:bg-zinc-950">
          <div className="h-40 sm:h-56 w-full relative">
            <img
              src={bannerSrc}
              alt={`${username || "user"}'s banner`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="max-w-md mx-auto px-4 -mt-12 sm:-mt-16 relative z-10 text-center">
            <div className="flex justify-center mb-3">
              <img
                src={avatarSrc}
                alt={username || "user"}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-lg"
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-white mb-1">
              @{username || "loading"}
            </h2>

            <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed mb-4">
              {user?.bio ||
                "Fashion enthusiast | Sharing my favorite outfits, trends, and daily style inspiration ✨"}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {user?.socialLinks?.instagram && (
                <a
                  href={user.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800 transition-all"
                >
                  Instagram
                </a>
              )}
              {user?.socialLinks?.tiktok && (
                <a
                  href={user.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800 transition-all"
                >
                  TikTok
                </a>
              )}
              {user?.socialLinks?.youtube && (
                <a
                  href={user.socialLinks.youtube}
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

        {/* Mood Filter */}
        {isLoading ? (
          <MoodFilterSkeleton />
        ) : status === "success" ? (
          <MoodFilter
            moods={allMoods}
            onFilterChange={handleFilterChange}
            activeFilter={activeFilter}
          />
        ) : null}

        <main className="max-w-7xl mx-auto px-4 py-6">
          {isLoading && <OOTDGridSkeleton />}

          {status === "error" && (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">Error: {error}</p>
            </div>
          )}

          {status === "success" && filteredOOTDs.length === 0 && (
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

          {status === "success" && filteredOOTDs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOOTDs.map((ootd) => {
                const primaryImage =
                  ootd.media.find(
                    (item) => item.isPrimary && item.type === "image",
                  )?.url ||
                  ootd.media.find((item) => item.type === "image")?.url ||
                  "";

                const primaryVideo =
                  ootd.media.find(
                    (item) => item.isPrimary && item.type === "video",
                  )?.url ||
                  ootd.media.find((item) => item.type === "video")?.url ||
                  "";

                return (
                  <OOTDCard
                    key={ootd.id}
                    id={ootd.id}
                    image={primaryImage}
                    video={primaryVideo}
                    number={ootd.number}
                    title={ootd.title}
                    mood={ootd.mood}
                    influencer={{
                      name: user?.name || "",
                      handle: user?.handle || "",
                    }}
                    productscount={ootd._count?.ootdProducts || 0}
                    urlPostInstagram={ootd.urlPostInstagram}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
