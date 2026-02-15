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
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { ProductWithPlatformsRow } from "@/app/dashboards/component/DashboardProductClient";

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

const PLATFORM_OPTIONS: Array<{
  value: PlatformType;
  label: string;
}> = [
  { value: "tiktok", label: "TikTok" },
  { value: "shopee", label: "Shopee" },
  { value: "tokopedia", label: "Tokopedia" },
  { value: "other", label: "Lainnya" },
];

// Utils
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

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  onClose,
  mode = "create",
  initialData = null,
  userId = "",
  onSuccess,
  apiBaseUrl,
}) => {
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

  // Track original data for comparison
  const [originalPlatforms, setOriginalPlatforms] = useState<PlatformUI[]>([]);

  const isUpdate = mode === "update";

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
    setOriginalPlatforms(JSON.parse(JSON.stringify(platformsData)));
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
    setOriginalPlatforms([]);
    setDeletedPlatformIds([]);
    setError("");
  }

  useEffect(() => {
    if (!open) return;
    if (initialData) initFromInitialData(initialData);
    else resetForm();
  }, [open, initialData, mode]);

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
    value: PlatformUI[T]
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
      })
    );
  }

  function getModifiedPlatforms(): Array<{
    id: string;
    platform: PlatformType;
    price?: string;
    link?: string;
  }> {
    return platforms
      .filter((p) => p.id && p._isModified && !p._isNew)
      .map((p) => {
        const normPrice = normalizePrice(p.price);
        return {
          id: p.id!,
          platform: p.platform,
          price: normPrice === "__INVALID__" ? undefined : normPrice,
          link: p.link || undefined,
        };
      });
  }

  function getNewPlatforms(): ProductPlatformInput[] {
    return platforms
      .filter((p) => !p.id || p._isNew)
      .map((p) => {
        const normPrice = normalizePrice(p.price);
        return {
          platform: p.platform,
          price: normPrice === "__INVALID__" ? undefined : normPrice,
          link: p.link || undefined,
        };
      });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!name.trim()) {
      setError("Nama produk wajib diisi");
      return;
    }

    const tagsArr = parseTagsToArray(tagsRaw);
    if (tagsArr === "__INVALID__") {
      setError("Format tags tidak valid");
      return;
    }

    const normPrice = normalizePrice(price);
    if (normPrice === "__INVALID__") {
      setError("Format harga tidak valid");
      return;
    }

    for (const p of platforms) {
      if (p.price && p.price.trim()) {
        const np = normalizePrice(p.price);
        if (np === "__INVALID__") {
          setError(`Format harga platform ${p.platform} tidak valid`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      const base = apiBaseUrl || "";

      if (isUpdate && initialData?.id) {
        const productPayload: ProductInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          price: normPrice,
          category: category.trim() || undefined,
          tags: tagsArr,
          image: image.trim() || undefined,
          affiliateLink: affiliateLink.trim() || undefined,
        };

        const productRes = await fetch(
          `${base}/api/products/${initialData.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productPayload),
          }
        );

        if (!productRes.ok) {
          const msg = await productRes.text();
          setError(`Gagal update produk: ${msg}`);
          return;
        }

        const modifiedPlatforms = getModifiedPlatforms();

        for (const platform of modifiedPlatforms) {
          const platformRes = await fetch(
            `${base}/api/products/${platform.id}/platforms`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                platform: platform.platform,
                price: platform.price,
                link: platform.link,
              }),
            }
          );

          if (!platformRes.ok) {
            console.error(`Failed to update platform ${platform.id}`);
          }
        }

        for (const platformId of deletedPlatformIds) {
          await fetch(`${base}/api/products/${platformId}/platforms`, {
            method: "DELETE",
          });
        }

        const newPlatforms = getNewPlatforms();
        if (newPlatforms.length > 0) {
          await fetch(`${base}/api/products/${initialData.id}/platforms`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platforms: newPlatforms }),
          });
        }

        onSuccess?.({ id: initialData.id });
      } else {
        const payload: ProductInput = {
          userId: userId || undefined,
          name: name.trim(),
          description: description.trim() || undefined,
          price: normPrice,
          category: category.trim() || undefined,
          tags: tagsArr,
          image: image.trim() || undefined,
          affiliateLink: affiliateLink.trim() || undefined,
          platforms: getNewPlatforms(),
        };

        const res = await fetch(`${base}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const msg = await res.text();
          setError(`Gagal membuat produk: ${msg}`);
          return;
        }

        const data = await res.json();
        onSuccess?.(data);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Terjadi kesalahan saat menyimpan produk");
    } finally {
      setLoading(false);
    }
  }

  const hasChanges =
    isUpdate &&
    (platforms.some((p) => p._isModified || p._isNew) ||
      deletedPlatformIds.length > 0 ||
      name !== (initialData?.name || "") ||
      price !== String(initialData?.price || ""));

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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

        {/* Scrollable Content */}
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
            {/* Basic Information */}
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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

            {/* Platforms Section */}
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            value={p.platform}
                            onChange={(e) =>
                              updatePlatform(
                                idx,
                                "platform",
                                e.target.value as PlatformType
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            value={p.price}
                            onChange={(e) =>
                              updatePlatform(idx, "price", e.target.value)
                            }
                            placeholder="125000"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Link
                          </label>
                          <input
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono"
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

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            {isUpdate && hasChanges && (
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                Ada perubahan yang belum disimpan
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
