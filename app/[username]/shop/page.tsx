"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Filter, ExternalLink, Heart, Share2, Tag } from "lucide-react";
import CoffeeFooter from "../../footer/page";
import { useParams } from "next/navigation";
import {
  ProductGridSkeleton,
  ProductHeroSkeleton,
} from "./components/Skeleton";

interface ApiPlatform {
  id: string;
  productId: string;
  platform: string; // "tiktok" | "shopee" | "tokopedia" | dll
  price: string; // string dari API
  link: string;
  clicks: number;
  lastUpdated: string; // ISO
}

interface ApiProduct {
  id: string;
  influencerId: string;
  name: string;
  description: string;
  price: string; // string dari API
  category: string;
  tags: string[];
  image: string;
  affiliateLink: string | null;
  clicks: number;
  lastUpdated: string; // ISO
  createdAt: string;
  updatedAt: string;
  platforms: ApiPlatform[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  category: string;
  tags: string[];
  image: string;
  affiliateLink?: string | null;
  commission?: number;
  clicks: number;
  lastUpdated: string; // ISO
  featured?: boolean;
  platforms: { platform: string; link: string; price?: number }[];
}

export default function ProductCatalog() {
  const params = useParams();
  const username = params?.username as string;
  console.log("USERNAME", username);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPrice, setFilterPrice] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set<string>());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "All",
    "Electronics",
    "Fashion",
    "Home & Living",
    "Beauty",
    "Sports",
    "Toys",
    "Automotive",
  ];
  const priceRanges = [
    "All",
    "Under 200k",
    "200k - 500k",
    "500k - 1M",
    "Above 1M",
  ];

  useEffect(() => {
    let aborted = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:4000/api/products/username/${username}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }
        );
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        const json: { success: boolean; data: ApiProduct[] } = await res.json();

        if (!json.success || !Array.isArray(json.data)) {
          throw new Error("Invalid API response shape");
        }

        const normalized: Product[] = json.data.map((p) => {
          const parsedPrice = Number(p.price);
          const platforms = (p.platforms || []).map((pl) => ({
            platform: pl.platform,
            link: pl.link,
            price: pl.price ? Number(pl.price) : undefined,
          }));

          return {
            id: p.id,
            name: p.name,
            description: p.description ?? "",
            price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
            category: p.category ?? "Others",
            tags: Array.isArray(p.tags) ? p.tags : [],
            image: p.image,
            affiliateLink: p.affiliateLink ?? null,
            clicks: p.clicks ?? 0,
            lastUpdated: p.lastUpdated ?? p.updatedAt ?? p.createdAt,
            featured: true, // opsional: bisa diturunkan dari rule sendiri
            rating: 4.5, // opsional placeholder jika API belum sediakan
            reviewCount: 0, // opsional placeholder
            platforms,
          };
        });

        if (!aborted) setProducts(normalized);
      } catch (e: any) {
        if (!aborted) setError(e?.message || "Unknown error");
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    load();
    return () => {
      aborted = true;
    };
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const handleShare = (product: Product) => {
    const shareData = {
      title: `${product.name} - Recommended Product`,
      text: `Check out this amazing product: ${product.description}`,
      url: product.affiliateLink || (product.platforms[0]?.link ?? ""),
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        // fallback clipboard
        navigator.clipboard
          .writeText(shareData.url)
          .then(() => alert("Product link copied to clipboard!"))
          .catch(() => alert("Failed to copy link."));
      });
    } else {
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => alert("Product link copied to clipboard!"))
        .catch(() => alert("Failed to copy link."));
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setShowModal(false);
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.tags.some((tag) => tag.toLowerCase().includes(term));

      const matchesCategory =
        filterCategory === "All" || product.category === filterCategory;

      const price = product.price;
      const matchesPrice =
        filterPrice === "All" ||
        (filterPrice === "Under 200k" && price < 200000) ||
        (filterPrice === "200k - 500k" && price >= 200000 && price < 500000) ||
        (filterPrice === "500k - 1M" && price >= 500000 && price < 1000000) ||
        (filterPrice === "Above 1M" && price >= 1000000);

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, filterCategory, filterPrice]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case "featured":
        return arr.sort((a, b) => (b.featured ? 1 : -1));
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      case "rating":
        return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case "newest":
        return arr.sort(
          (a, b) =>
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
        );
      default:
        return arr;
    }
  }, [filteredProducts, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bagian Hero */}
      {loading ? (
        <ProductHeroSkeleton />
      ) : (
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Produk Afiliasi
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent block">
                Pilihan Terbaik untuk Anda
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Jelajahi produk afiliasi terbaik dari berbagai kategori –
              elektronik, fashion, rumah tangga, dan banyak lagi.
            </p>

            {/* Kolom Pencarian */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Cari produk, merek, atau kategori..."
                  className="w-full pl-12 pr-16 py-3 sm:py-4 text-black rounded-2xl border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-base sm:text-lg bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* <button
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-xl transition-colors ${
                  showFilters
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                aria-label="Toggle filter"
              >
                <Filter className="h-5 w-5" />
              </button> */}
              </div>

              {/* Dropdown Filter */}
              {/* {showFilters && (
              <div className="absolute top-full left-0 right-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-6 z-40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Kategori
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setFilterCategory(category)}
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-all ${
                            filterCategory === category
                              ? "bg-amber-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-amber-100"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Rentang Harga
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {priceRanges.map((range) => (
                        <button
                          key={range}
                          onClick={() => setFilterPrice(range)}
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-all ${
                            filterPrice === range
                              ? "bg-orange-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )} */}
            </div>
          </div>
        </div>
      )}

      {/* Bagian Hasil */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Hasil */}
        {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {loading
                ? "Memuat..."
                : `${sortedProducts.length} Produk Ditemukan`}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchTerm && `Hasil untuk "${searchTerm}"`}
              {filterCategory !== "All" && ` di ${filterCategory}`}
              {filterPrice !== "All" && ` • ${filterPrice}`}
            </p>
          </div>

          <select
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm sm:text-base text-gray-600 min-w-[160px] sm:min-w-[180px]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            disabled={loading}
          >
            <option value="featured">Unggulan</option>
            <option value="newest">Terbaru</option>
            <option value="price-low">Harga: Rendah ke Tinggi</option>
            <option value="price-high">Harga: Tinggi ke Rendah</option>
            <option value="rating">Rating Tertinggi</option>
          </select>
        </div> */}

        {/* Status Error */}
        {error && (
          <div className="text-center py-8 text-red-600 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Loading State - Show Grid Skeleton */}
        {loading && <ProductGridSkeleton />}

        {/* Grid Produk */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {sortedProducts.map((product) => (
              <div key={product.id} className="group relative">
                {/* Tombol Aksi */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex space-x-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className={`p-2 sm:p-2.5 rounded-full backdrop-blur-sm transition-all ${
                      favorites.has(product.id)
                        ? "bg-red-500 text-white"
                        : "bg-white/80 text-gray-600 hover:bg-white"
                    }`}
                    aria-label="Favorit"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favorites.has(product.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(product);
                    }}
                    className="p-2 sm:p-2.5 rounded-full bg-white/80 text-gray-600 hover:bg-white transition-all backdrop-blur-sm"
                    aria-label="Bagikan"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-52 sm:h-60 md:h-64 lg:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2 mb-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </div>

                    <button
                      onClick={() => openModal(product)}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 px-4 rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center space-x-2 group"
                    >
                      <span>Belanja Sekarang</span>
                      <ExternalLink
                        size={16}
                        className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tidak Ada Hasil */}
        {!loading && !error && sortedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mb-6 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <Tag className="h-10 w-10 sm:h-12 sm:w-12 text-orange-400" />
            </div>

            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 text-center">
              Produk Tidak Ditemukan
            </h3>

            <p className="text-base sm:text-lg text-gray-600 text-center max-w-md mb-6">
              Tidak ada produk yang cocok dengan pencarian atau filter Anda.
              Coba ubah kata kunci atau hapus filter untuk melihat lebih banyak
              produk.
            </p>

            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("All");
                setFilterPrice("All");
                setShowFilters(false);
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-sm hover:shadow-md"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Hapus Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12">
        <CoffeeFooter />
      </div>

      {/* Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overscroll-contain flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[92vw] sm:w-auto max-w-sm sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto transform transition-all duration-300">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Pilih Platform
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Tutup"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Pilih platform untuk membeli{" "}
                <span className="font-medium">{selectedProduct.name}</span>
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {selectedProduct.platforms.map((platform) => (
                  <button
                    key={platform.platform}
                    className="w-full group relative overflow-hidden bg-gradient-to-r hover:shadow-lg transition-all duration-200 rounded-xl border-2 border-gray-100 hover:border-transparent"
                    onClick={() => {
                      window.open(platform.link, "_blank");
                    }}
                    data-platform={platform.platform}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        platform.platform === "tiktok"
                          ? "from-black to-gray-800"
                          : platform.platform === "shopee"
                          ? "from-orange-500 to-red-500"
                          : "from-green-500 to-green-600"
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                    />
                    <div className="relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 group-hover:text-white transition-colors">
                      <div className="text-xl sm:text-2xl">
                        {platform.platform === "tiktok"
                          ? "🎵"
                          : platform.platform === "shopee"
                          ? "🛍️"
                          : "🛒"}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-base sm:text-lg text-black group-hover:text-white capitalize">
                          {platform.platform}
                        </div>
                        {typeof platform.price === "number" && (
                          <div className="text-xs sm:text-sm opacity-75 group-hover:opacity-90">
                            {formatCurrency(platform.price)}
                          </div>
                        )}
                      </div>
                      <div className="text-gray-400 group-hover:text-white/80">
                        <svg
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-amber-600 font-bold">
                      {formatCurrency(selectedProduct.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <button
                className="w-full text-center text-gray-500 hover:text-gray-700 transition-colors py-2 text-sm"
                onClick={closeModal}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
