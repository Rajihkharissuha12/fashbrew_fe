"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  Package,
  Tag,
  Image as ImageIcon,
  Link as LinkIcon,
  Banknote,
  ShoppingBag,
} from "lucide-react";
import { ProductWithPlatformsRow } from "@/app/dashboards/component/DashboardProductClient";

// ===== TYPE DEFINITIONS =====
export type PlatformType = "tiktok" | "shopee" | "tokopedia" | "other";

type PlatformUI = {
  id?: string;
  platform: PlatformType;
  price: string;
  link: string;
  _isNew?: boolean;
  _isModified?: boolean;
  _isDeleted?: boolean;
};

export interface ProductPlatformInput {
  platform: PlatformType;
  price?: string | number;
  link?: string;
}

export interface ProductInput {
  userId?: string;
  influencerId?: string;
  name: string;
  description?: string;
  price?: string | number;
  category?: string;
  tags?: string[];
  image?: string;
  affiliateLink?: string;
  platforms?: ProductPlatformInput[];
}

export interface ProductDTO extends Omit<ProductInput, "platforms"> {
  id: string;
  platforms: Array<{
    id?: string;
    platform: PlatformType;
    price?: string | number | null;
    link?: string | null;
  }>;
  clicks: number;
  lastUpdated?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type Mode = "create" | "update";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  mode?: Mode;
  initialData?: ProductWithPlatformsRow | null;
  userId?: string;
  onSuccess?: (result: any) => void;
  apiBaseUrl?: string;
}

// ===== CONSTANTS =====
const PLATFORM_OPTIONS: Array<{
  value: PlatformType;
  label: string;
}> = [
  { value: "tiktok", label: "TikTok" },
  { value: "shopee", label: "Shopee" },
  { value: "tokopedia", label: "Tokopedia" },
  { value: "other", label: "Lainnya" },
];

// ===== UTILITY FUNCTIONS =====
function normalizePrice(val?: string | number): string | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "number") return String(val);
  if (typeof val === "string") {
    const cleaned = val.replace(/[, ]/g, "");
    if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return "__INVALID__";
    return cleaned;
  }
  return "__INVALID__";
}

function parseTagsToArray(text: string): string[] | undefined | "__INVALID__" {
  if (!text || !text.trim()) return undefined;
  const parts = text
    .split(/[, \n\r]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.some((t) => t.length === 0)) return "__INVALID__";
  return parts;
}

// ===== API ERROR HANDLER =====
async function handleApiResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  // Cek apakah response adalah HTML (404 page)
  if (contentType?.includes("text/html")) {
    throw new Error(
      `API endpoint tidak ditemukan (${response.status}). Pastikan route API sudah benar.`,
    );
  }

  // Cek status code
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;

    try {
      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = text.substring(0, 200); // Limit error text
      }
    } catch (e) {
      // Jika gagal parse error, gunakan status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  // Parse JSON response
  try {
    return await response.json();
  } catch (e) {
    throw new Error("Response bukan format JSON yang valid");
  }
}

// ===== MAIN COMPONENT =====
const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  onClose,
  mode = "create",
  initialData = null,
  userId = "",
  onSuccess,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
}) => {
  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Form states
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [affiliateLink, setAffiliateLink] = useState<string>("");
  const [platforms, setPlatforms] = useState<PlatformUI[]>([]);
  const [tagsRaw, setTagsRaw] = useState<string>("");
  const [deletedPlatformIds, setDeletedPlatformIds] = useState<string[]>([]);

  const isUpdate = mode === "update";

  // ===== INITIALIZATION FUNCTIONS =====
  function initFromInitialData(p: ProductWithPlatformsRow) {
    setName(p.name || "");
    setDescription(p.description || "");
    setPrice(p.price != null ? String(p.price) : "");
    setCategory(p.category || "");
    setImage(p.image || "");
    setAffiliateLink(p.affiliateLink || "");

    if (Array.isArray(p.tags)) setTagsRaw((p.tags as string[]).join(", "));
    else setTagsRaw("");

    const platformsData = Array.isArray(p.platforms)
      ? p.platforms.map((pl: any) => ({
          id: pl.id,
          platform: pl.platform as PlatformType,
          price: pl.price != null ? String(pl.price) : "",
          link: pl.link ?? "",
          _isNew: false,
          _isModified: false,
        }))
      : [];

    setPlatforms(platformsData);
    setDeletedPlatformIds([]);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImage("");
    setAffiliateLink("");
    setTagsRaw("");
    setPlatforms([]);
    setDeletedPlatformIds([]);
    setError("");
  }

  useEffect(() => {
    if (!open) return;
    if (initialData && isUpdate) {
      initFromInitialData(initialData);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, mode]);

  // ===== PLATFORM OPERATIONS =====
  function addPlatform() {
    setPlatforms((prev) => [
      ...prev,
      { platform: "shopee", price: "", link: "", _isNew: true },
    ]);
  }

  function removePlatform(idx: number) {
    const platform = platforms[idx];

    if (platform.id && !platform._isNew) {
      setDeletedPlatformIds((prev) => [...prev, platform.id!]);
    }

    setPlatforms((prev) => prev.filter((_, i) => i !== idx));
  }

  function updatePlatform<T extends keyof PlatformUI>(
    idx: number,
    key: T,
    value: PlatformUI[T],
  ) {
    setPlatforms((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;

        const isModified = item.id && !item._isNew;

        return {
          ...item,
          [key]: value,
          _isModified: isModified || item._isModified,
        };
      }),
    );
  }

  // ===== VALIDATION =====
  function validateForm(): { valid: boolean; error?: string } {
    if (!name.trim()) {
      return { valid: false, error: "Nama produk wajib diisi" };
    }

    const tagsArr = parseTagsToArray(tagsRaw);
    if (tagsArr === "__INVALID__") {
      return { valid: false, error: "Format tags tidak valid" };
    }

    const normPrice = normalizePrice(price);
    if (normPrice === "__INVALID__") {
      return { valid: false, error: "Format harga tidak valid" };
    }

    for (const p of platforms) {
      if (p.price && p.price.trim()) {
        const np = normalizePrice(p.price);
        if (np === "__INVALID__") {
          return {
            valid: false,
            error: `Format harga platform ${p.platform} tidak valid`,
          };
        }
      }
    }

    return { valid: true };
  }

  // ===== CREATE PRODUCT =====
  async function handleCreateProduct() {
    const tagsArr = parseTagsToArray(tagsRaw);
    const normPrice = normalizePrice(price);

    const payload: ProductInput = {
      userId: userId || undefined,
      name: name.trim(),
      description: description.trim() || undefined,
      price: normPrice,
      category: category.trim() || undefined,
      tags: tagsArr === "__INVALID__" ? undefined : tagsArr,
      image: image.trim() || undefined,
      affiliateLink: affiliateLink.trim() || undefined,
      platforms: platforms.map((p) => {
        const pPrice = normalizePrice(p.price);
        return {
          platform: p.platform,
          price: pPrice === "__INVALID__" ? undefined : pPrice,
          link: p.link.trim() || undefined,
        };
      }),
    };

    console.log("Creating product with payload:", payload);

    const response = await fetch(`${apiBaseUrl}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await handleApiResponse(response);
  }

  // ===== UPDATE PRODUCT =====
  async function handleUpdateProduct() {
    if (!initialData?.id) {
      throw new Error("Product ID tidak ditemukan untuk update");
    }

    const tagsArr = parseTagsToArray(tagsRaw);
    const normPrice = normalizePrice(price);

    // 1. Update product basic info
    const productPayload: ProductInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: normPrice,
      category: category.trim() || undefined,
      tags: tagsArr === "__INVALID__" ? undefined : tagsArr,
      image: image.trim() || undefined,
      affiliateLink: affiliateLink.trim() || undefined,
    };

    console.log("Updating product:", initialData.id, productPayload);

    const productResponse = await fetch(
      `${apiBaseUrl}/api/products/${initialData.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      },
    );

    await handleApiResponse(productResponse);

    // 2. Handle modified platforms
    const modifiedPlatforms = platforms.filter(
      (p) => p.id && p._isModified && !p._isNew,
    );

    console.log("Modified platforms:", modifiedPlatforms);

    for (const platform of modifiedPlatforms) {
      const pPrice = normalizePrice(platform.price);
      const platformResponse = await fetch(
        `${apiBaseUrl}/api/products/${platform.id}/platforms`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: platform.platform,
            price: pPrice === "__INVALID__" ? undefined : pPrice,
            link: platform.link.trim() || undefined,
          }),
        },
      );

      await handleApiResponse(platformResponse);
    }

    // 3. Delete removed platforms
    console.log("Deleting platforms:", deletedPlatformIds);

    for (const platformId of deletedPlatformIds) {
      const deleteResponse = await fetch(
        `${apiBaseUrl}/api/products/${platformId}/platforms`,
        {
          method: "DELETE",
        },
      );

      await handleApiResponse(deleteResponse);
    }

    // 4. Add new platforms
    const newPlatforms = platforms.filter((p) => !p.id || p._isNew);

    console.log("New platforms:", newPlatforms);

    if (newPlatforms.length > 0) {
      const newPlatformsPayload = newPlatforms.map((p) => {
        const pPrice = normalizePrice(p.price);
        return {
          platform: p.platform,
          price: pPrice === "__INVALID__" ? undefined : pPrice,
          link: p.link.trim() || undefined,
        };
      });

      const addPlatformsResponse = await fetch(
        `${apiBaseUrl}/api/products/${initialData.id}/platforms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platforms: newPlatformsPayload }),
        },
      );

      await handleApiResponse(addPlatformsResponse);
    }

    return { id: initialData.id };
  }

  // ===== MAIN SUBMIT HANDLER =====
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setError("");

    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    try {
      setLoading(true);

      let result;
      if (isUpdate) {
        console.log("=== MODE: UPDATE ===");
        result = await handleUpdateProduct();
      } else {
        console.log("=== MODE: CREATE ===");
        result = await handleCreateProduct();
      }

      console.log("Success result:", result);

      onSuccess?.(result);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError(err?.message || "Terjadi kesalahan saat menyimpan produk");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  // ===== RENDER =====
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== HEADER ===== */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isUpdate ? "Edit Produk" : "Produk Baru"}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {isUpdate ? "Edit Produk" : "Tambah Produk"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isUpdate
                  ? "Perbarui informasi produk affiliate"
                  : "Lengkapi detail produk dan platform affiliate"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ===== BASIC INFORMATION ===== */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gray-900 rounded-full" />
                <h4 className="text-base font-bold text-gray-900">
                  Informasi Produk
                </h4>
              </div>

              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-black"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Jaket Denim Oversized"
                    required
                  />
                </div>

                {/* Price & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Harga (Rp)
                    </label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-black"
                        value={price}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Hanya izinkan angka
                          if (value === "" || /^\d+$/.test(value)) {
                            setPrice(value);
                          }
                        }}
                        placeholder="129000"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tanpa titik atau koma
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Kategori
                    </label>
                    <div className="relative">
                      <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-black"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Fashion, Accessories"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none text-black"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi singkat tentang produk..."
                  />
                </div>

                {/* Image & Affiliate Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      URL Gambar
                    </label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-black"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Link Affiliate
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-black"
                        value={affiliateLink}
                        onChange={(e) => setAffiliateLink(e.target.value)}
                        placeholder="https://affiliate.link/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tags
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-black"
                      value={tagsRaw}
                      onChange={(e) => setTagsRaw(e.target.value)}
                      placeholder="casual, outerwear, denim"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Pisahkan dengan koma
                  </p>
                </div>
              </div>
            </div>

            {/* ===== PLATFORMS SECTION ===== */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gray-900 rounded-full" />
                  <h4 className="text-base font-bold text-gray-900">
                    Platform Affiliate
                  </h4>
                  {platforms.length > 0 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                      {platforms.length}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={addPlatform}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </div>

              {platforms.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    Belum ada platform
                  </p>
                  <p className="text-xs text-gray-400">
                    Klik tombol &quot;Tambah&quot; untuk menambahkan platform
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {platforms.map((p, idx) => (
                    <div
                      key={p.id || `new-${idx}`}
                      className="relative bg-gray-50 border border-gray-200 rounded-xl p-4"
                    >
                      {/* Platform Number Badge */}
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                        {idx + 1}
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {p._isNew && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                              Baru
                            </span>
                          )}
                          {p._isModified && !p._isNew && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                              Diubah
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePlatform(idx)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus platform"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Platform Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Platform
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                            value={p.platform}
                            onChange={(e) =>
                              updatePlatform(
                                idx,
                                "platform",
                                e.target.value as PlatformType,
                              )
                            }
                          >
                            {PLATFORM_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Harga (Rp)
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-black"
                            value={p.price}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Hanya izinkan angka
                              if (value === "" || /^\d+$/.test(value)) {
                                updatePlatform(idx, "price", value);
                              }
                            }}
                            placeholder="125000"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Link
                          </label>
                          <input
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-black"
                            value={p.link}
                            onChange={(e) =>
                              updatePlatform(idx, "link", e.target.value)
                            }
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            {isUpdate && (
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Mode: Update
              </span>
            )}
            {!isUpdate && (
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Mode: Create
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              onClick={(e: any) => {
                e.preventDefault();
                const modal =
                  e.target.closest('[role="dialog"]') ||
                  e.target.closest(".max-w-4xl");
                const form = modal?.querySelector("form");
                form?.requestSubmit();
              }}
              disabled={loading}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>{isUpdate ? "Simpan Perubahan" : "Buat Produk"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;
