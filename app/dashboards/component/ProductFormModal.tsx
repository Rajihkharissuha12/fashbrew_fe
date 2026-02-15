"use client";

import React, { useEffect, useState } from "react";
import { ProductWithPlatformsRow } from "./DashboardProductClient";
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  Package,
  Tag,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";

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
  color: string;
}> = [
  { value: "tiktok", label: "TikTok", color: "bg-black" },
  { value: "shopee", label: "Shopee", color: "bg-orange-500" },
  { value: "tokopedia", label: "Tokopedia", color: "bg-green-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
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
      ? p.platforms.map((pl) => ({
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

  if (!open) return null;

  const hasChanges =
    isUpdate &&
    (platforms.some((p) => p._isModified || p._isNew) ||
      deletedPlatformIds.length > 0 ||
      name !== (initialData?.name || "") ||
      price !== String(initialData?.price || ""));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* ✅ Fixed: Added max height and proper flex structure */}
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] dark:bg-zinc-900 dark:border dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ Header - Fixed position, no scroll */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isUpdate ? "Edit Produk" : "Tambah Produk Baru"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isUpdate
                  ? "Perbarui informasi produk"
                  : "Lengkapi detail produk affiliate"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* ✅ Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Error Alert */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 dark:text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Error
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-600 hover:text-red-800 dark:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 dark:text-white">
                <Package className="w-4 h-4" />
                Informasi Dasar
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="contoh: Jaket Denim Oversized"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Harga (Rp)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="129000"
                  />
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                    Tanpa titik atau koma
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Kategori
                  </label>
                  <input
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="contoh: Fashion, Accessories"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Deskripsi
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi singkat tentang produk..."
                  />
                </div>
              </div>
            </div>

            {/* Media & Links Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 dark:text-white">
                <ImageIcon className="w-4 h-4" />
                Media & Link
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    URL Gambar
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Link Affiliate
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                      value={affiliateLink}
                      onChange={(e) => setAffiliateLink(e.target.value)}
                      placeholder="https://affiliate.link/..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tags
                </label>
                <input
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  placeholder="casual, outerwear, denim"
                />
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  Pisahkan dengan koma
                </p>
              </div>
            </div>

            {/* Platforms Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Platform Affiliate
                </h4>
                <button
                  type="button"
                  onClick={addPlatform}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20 dark:text-blue-400"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Platform
                </button>
              </div>

              {platforms.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg dark:border-zinc-700 dark:text-gray-400">
                  Belum ada platform. Klik &quot;Tambah Platform&quot; untuk
                  menambahkan.
                </div>
              ) : (
                <div className="space-y-3">
                  {platforms.map((p, idx) => {
                    const platformConfig = PLATFORM_OPTIONS.find(
                      (opt) => opt.value === p.platform
                    );
                    return (
                      <div
                        key={p.id || `new-${idx}`}
                        className={`p-4 border rounded-xl space-y-3 transition-all ${
                          p._isNew
                            ? "border-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-800"
                            : p._isModified
                            ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800"
                            : "border-gray-200 bg-gray-50 dark:bg-zinc-800/50 dark:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${platformConfig?.color}`}
                            ></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Platform {idx + 1}
                              {p._isNew && (
                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                  (Baru)
                                </span>
                              )}
                              {p._isModified && !p._isNew && (
                                <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                                  (Modified)
                                </span>
                              )}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePlatform(idx)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                            title="Hapus platform"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5 dark:text-gray-400">
                              Platform
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
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
                            <label className="block text-xs font-medium text-gray-600 mb-1.5 dark:text-gray-400">
                              Harga (Rp)
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                              value={p.price}
                              onChange={(e) =>
                                updatePlatform(idx, "price", e.target.value)
                              }
                              placeholder="125000"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5 dark:text-gray-400">
                              Link Affiliate
                            </label>
                            <input
                              type="url"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                              value={p.link}
                              onChange={(e) =>
                                updatePlatform(idx, "link", e.target.value)
                              }
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ✅ Footer - Fixed at bottom, no scroll */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl dark:bg-zinc-800/50 dark:border-zinc-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isUpdate && hasChanges && "Ada perubahan yang belum disimpan"}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors disabled:opacity-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-900"
            >
              Batal
            </button>
            <button
              type="submit"
              onClick={(e: any) => {
                e.preventDefault();
                const modal =
                  e.target.closest('[role="dialog"]') ||
                  e.target.closest(".max-w-3xl");
                const form = modal?.querySelector("form");
                form?.requestSubmit();
              }}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>{isUpdate ? "Simpan Produk" : "Simpan Produk"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;
