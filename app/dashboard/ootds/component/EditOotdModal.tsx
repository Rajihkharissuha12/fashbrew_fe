"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import TagInput from "./TagInput";
import { useDebounce } from "@/app/hooks/useDebounce";
import ConfirmDialog from "@/app/dashboards/component/ConfirmDialog";
import { OotdRow } from "../ootdclient";

interface Product {
  id: string;
  name: string;
  image?: string;
}

interface ProductPick {
  id: string;
  name: string;
  note: string;
  position: number;
}

interface MediaItem {
  id?: string;
  type: "image" | "video";
  url: string;
  urlpublicid?: string;
  isPrimary: boolean;
  isDeleted?: boolean;
}

export interface OotdData {
  id: string;
  title: string;
  description?: string;
  mood?: string[];
  isPublic: boolean;
  media: MediaItem[];
  ootdProducts?: Array<{
    id: string;
    productId: string;
    note?: string;
    position?: number;
    product?: { id: string; name: string };
  }>;
}

interface EditOotdModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId: string;
  ootdData: OotdRow | null;
  apiBaseUrl?: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function EditOotdModal({
  open,
  onClose,
  onSuccess,
  userId,
  ootdData,
  apiBaseUrl = API_BASE,
}: EditOotdModalProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  // Media state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteMediaId, setDeleteMediaId] = useState<string>("");

  // Product selection
  const [productOptions, setProductOptions] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductPick[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const debouncedSearch = useDebounce(productSearch, 300);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  // ✅ Load initial data
  useEffect(() => {
    if (!open || !ootdData) return;

    setTitle(ootdData.title || "");
    setDescription(ootdData.description || "");
    setMoodTags(Array.isArray(ootdData.mood) ? ootdData.mood : []);
    setIsPublic(ootdData.isPublic ?? true);

    // ✅ FIXED: Type assertion untuk media.type
    setMediaItems(
      ootdData.media.map((m) => ({
        id: m.id,
        type: m.type as "image" | "video", // ✅ Type assertion
        url: m.url,
        urlpublicid: m.urlpublicid,
        isPrimary: m.isPrimary,
        isDeleted: false,
      }))
    );

    // Load products
    setSelectedProducts(
      Array.isArray(ootdData.ootdProducts)
        ? ootdData.ootdProducts
            .map((op) => ({
              id: op.productId,
              name: op.product?.name || "",
              note: op.note || "",
              position: op.position || 0,
            }))
            .sort((a, b) => a.position - b.position)
        : []
    );
  }, [open, ootdData]);

  // ✅ Reset on close
  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setMoodTags([]);
      setIsPublic(true);
      setMediaItems([]);
      setSelectedFiles([]);
      setSelectedProducts([]);
      setProductSearch("");
      setShowProductDropdown(false);
      setEditingNoteId(null);
      setUploadProgress(0);
    }
  }, [open]);

  // ✅ Fetch products
  const fetchProducts = useCallback(
    async (searchQuery: string = "") => {
      if (!userId) return;

      setProductsLoading(true);
      try {
        const qs = new URLSearchParams({
          userId,
          page: "1",
          pageSize: "100",
        });

        if (searchQuery.trim()) {
          qs.set("q", searchQuery.trim());
        }

        const res = await fetch(`${apiBaseUrl}/api/products?${qs}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Gagal memuat produk");

        const json = await res.json();
        const list = (json.items || json.data || []).map((p: any) => ({
          id: String(p.id),
          name: String(p.name),
          image: p.image || undefined,
        }));

        setProductOptions(list);
      } catch (e) {
        console.error(e);
        setProductOptions([]);
      } finally {
        setProductsLoading(false);
      }
    },
    [userId, apiBaseUrl]
  );

  useEffect(() => {
    if (open) fetchProducts("");
  }, [open, fetchProducts]);

  useEffect(() => {
    if (open) fetchProducts(debouncedSearch);
  }, [debouncedSearch, open, fetchProducts]);

  // ✅ File selection
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const activeMedia = mediaItems.filter((m) => !m.isDeleted).length;
    const totalAfter = activeMedia + selectedFiles.length + files.length;

    if (totalAfter > 4) {
      alert(
        `Maksimal 4 media. Saat ini: ${activeMedia} uploaded + ${selectedFiles.length} pending + ${files.length} baru = ${totalAfter}`
      );
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        alert(`${file.name} bukan image/video`);
        continue;
      }

      const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`${file.name} terlalu besar (max ${isImage ? "10MB" : "50MB"})`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    e.target.value = "";
  }

  // ✅ Upload files
  async function uploadFiles() {
    if (!ootdData?.id || selectedFiles.length === 0) return;

    try {
      setUploadingFiles(true);
      setUploadProgress(0);

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });
      formData.append("type", "media");
      formData.append("isPrimary", "false");

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      });

      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid response"));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.ontimeout = () => reject(new Error("Timeout"));

        xhr.open("POST", `${apiBaseUrl}/api/ootds/${ootdData.id}/media`);
        xhr.timeout = 120000;
        xhr.send(formData);
      });

      const result = await uploadPromise;
      const uploadData = result.data || result;

      if (uploadData?.uploaded && Array.isArray(uploadData.uploaded)) {
        const newMedia = uploadData.uploaded.map((m: any) => ({
          id: m.id,
          type: m.type as "image" | "video",
          url: m.url,
          urlpublicid: m.urlpublicid,
          isPrimary: m.isPrimary || false,
          isDeleted: false,
        }));

        setMediaItems((prev) => [...prev, ...newMedia]);
      }

      setSelectedFiles([]);
      setUploadProgress(0);
      alert(
        `${uploadData?.count || selectedFiles.length} file berhasil diupload!`
      );
    } catch (err: any) {
      console.error(err);
      alert(`Gagal upload: ${err.message}`);
    } finally {
      setUploadingFiles(false);
      setUploadProgress(0);
    }
  }

  // ✅ Set cover image
  // ✅ Set banner (ganti cover primary)
  async function setBannerCover(newMediaId: string) {
    if (!ootdData?.id || !newMediaId) return;

    try {
      // Cari media yang saat ini jadi primary
      const currentPrimary = mediaItems.find(
        (m) => m.isPrimary && !m.isDeleted
      );

      if (!currentPrimary?.id) {
        alert("Cover lama tidak ditemukan");
        return;
      }

      if (currentPrimary.id === newMediaId) {
        alert("Media ini sudah menjadi cover");
        return;
      }

      const payload = {
        idmediaold: currentPrimary.id,
        idmedianew: newMediaId,
      };

      const res = await fetch(`${apiBaseUrl}/api/ootds/banner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Gagal mengubah banner");
      }

      const result = await res.json();
      console.log("Banner updated:", result);

      // Update state lokal
      setMediaItems((prev) =>
        prev.map((item) => ({
          ...item,
          isPrimary: item.id === newMediaId,
        }))
      );

      alert("✅ Cover banner berhasil diubah!");
    } catch (err: any) {
      console.error(err);
      alert(`❌ Gagal mengubah banner: ${err.message}`);
    }
  }

  // ✅ Mark for deletion
  function markForDelete(index: number) {
    setMediaItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, isDeleted: true } : item))
    );
  }

  // ✅ Restore deleted
  function restoreMedia(index: number) {
    setMediaItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isDeleted: false } : item
      )
    );
  }

  // ✅ Delete permanently
  async function deleteMediaPermanent(mediaId: string) {
    try {
      const res = await fetch(`${apiBaseUrl}/api/ootds/media/${mediaId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus media");

      setMediaItems((prev) => prev.filter((m) => m.id !== mediaId));
      alert("Media berhasil dihapus");
    } catch (err: any) {
      alert(err.message);
    }
  }

  // ✅ Product management
  const availableProducts = productOptions.filter(
    (p) => !selectedProducts.some((sp) => sp.id === p.id)
  );

  function handleAddProduct(productId: string) {
    if (selectedProducts.some((p) => p.id === productId)) {
      alert("Produk sudah ada");
      return;
    }

    const product = productOptions.find((p) => p.id === productId);
    if (!product) return;

    const newPosition =
      selectedProducts.length > 0
        ? Math.max(...selectedProducts.map((p) => p.position)) + 1
        : 1;

    setSelectedProducts((prev) => [
      ...prev,
      {
        id: product.id,
        name: product.name,
        note: "",
        position: newPosition,
      },
    ]);

    setProductSearch("");
    setShowProductDropdown(false);
  }

  function handleRemoveProduct(id: string) {
    setSelectedProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, idx) => ({ ...p, position: idx + 1 }));
    });
  }

  function moveProduct(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedProducts.length) return;

    const newList = [...selectedProducts];
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];

    const reordered = newList.map((p, idx) => ({ ...p, position: idx + 1 }));
    setSelectedProducts(reordered);
  }

  function startEditNote(id: string, currentNote: string) {
    setEditingNoteId(id);
    setEditingNoteValue(currentNote);
  }

  function saveNote(id: string) {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, note: editingNoteValue.trim() } : p
      )
    );
    setEditingNoteId(null);
    setEditingNoteValue("");
  }

  // ✅ Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!ootdData?.id) {
      alert("OOTD ID tidak ditemukan");
      return;
    }

    if (!title.trim()) {
      alert("Judul wajib diisi");
      return;
    }

    if (selectedFiles.length > 0) {
      alert("Upload file terlebih dahulu sebelum menyimpan");
      return;
    }

    const activeMedia = mediaItems.filter((m) => !m.isDeleted);
    if (activeMedia.length === 0) {
      alert("Minimal 1 media harus ada");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      mood: moodTags.length > 0 ? moodTags : undefined,
      isPublic,
      products: selectedProducts.map((p) => ({
        id: p.id,
        note: p.note || undefined,
        position: p.position,
      })),
      media: activeMedia.map((m) => ({
        type: m.type,
        url: m.url,
        isPrimary: m.isPrimary,
      })),
      deleteMediaIds: mediaItems
        .filter((m) => m.isDeleted && m.id)
        .map((m) => m.id!),
    };

    try {
      setLoading(true);

      const res = await fetch(`${apiBaseUrl}/api/ootds/${ootdData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gagal update OOTD");
      }

      const result = await res.json();
      console.log("OOTD updated:", result);

      alert("OOTD berhasil diupdate!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(`Gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!open || !ootdData) return null;

  const activeMediaCount = mediaItems.filter((m) => !m.isDeleted).length;
  const deletedCount = mediaItems.filter((m) => m.isDeleted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">EDIT OOTD</h2>
            <p className="text-sm text-gray-500 mt-1">
              Update informasi dan media OOTD
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* JUDUL */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              JUDUL <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Summer Vibes OOTD 2025"
              className="text-black w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* DESKRIPSI */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              DESKRIPSI
            </label>
            <textarea
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan tentang OOTD ini..."
              rows={4}
              className="text-black w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            />
          </div>

          {/* MEDIA MANAGEMENT */}
          <div className="border-t-2 border-gray-200 pt-6">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              MEDIA FOTO/VIDEO ({activeMediaCount}/4)
            </label>

            {/* File Upload */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={
                  uploadingFiles || activeMediaCount + selectedFiles.length >= 4
                }
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  uploadingFiles || activeMediaCount + selectedFiles.length >= 4
                }
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 48 48"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-600">
                  <span className="text-orange-600">Klik untuk pilih file</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP, MP4 (max 10MB gambar, 50MB video)
                </p>
              </button>
            </div>

            {/* Pending Upload */}
            {selectedFiles.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-blue-900">
                    📁 {selectedFiles.length} file siap diupload
                  </p>
                  <button
                    type="button"
                    onClick={uploadFiles}
                    disabled={uploadingFiles}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-bold"
                  >
                    {uploadingFiles
                      ? `Uploading... ${uploadProgress}%`
                      : "📤 Upload Files"}
                  </button>
                </div>

                {uploadingFiles && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm flex items-center gap-2"
                    >
                      <span className="font-medium truncate max-w-[150px]">
                        {file.name}
                      </span>
                      {!uploadingFiles && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedFiles((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Grid */}
            {mediaItems.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                <p className="text-gray-600 font-bold">Belum ada media</p>
                <p className="text-sm text-gray-500 mt-1">
                  Upload media di atas
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mediaItems.map((media, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border-2 ${
                      media.isDeleted
                        ? "border-red-300 opacity-50"
                        : media.isPrimary
                        ? "border-orange-500 ring-2 ring-orange-300"
                        : "border-gray-200"
                    } hover:shadow-lg transition-all`}
                  >
                    {/* Preview */}
                    <div className="aspect-square bg-gray-100">
                      {media.type === "video" ? (
                        <div className="w-full h-full flex items-center justify-center bg-black text-white">
                          <svg
                            className="w-12 h-12"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      ) : (
                        <img
                          src={media.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Badges */}
                    {media.isPrimary && !media.isDeleted && (
                      <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                        ⭐ COVER
                      </div>
                    )}

                    {media.isDeleted && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        🗑️ HAPUS
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      {media.isDeleted ? (
                        <button
                          type="button"
                          onClick={() => restoreMedia(idx)}
                          className="w-full px-2 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-bold"
                        >
                          ↺ RESTORE
                        </button>
                      ) : (
                        <div className="flex gap-1">
                          {!media.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setBannerCover(media.id || "")}
                              className="flex-1 px-2 py-1.5 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 font-bold"
                              title="Jadikan cover"
                            >
                              ⭐ COVER
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (media.id) {
                                setDeleteMediaId(media.id);
                                setDeleteConfirm(true);
                              } else {
                                markForDelete(idx);
                              }
                            }}
                            className="flex-1 px-2 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-bold"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {deletedCount > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                ⚠️ {deletedCount} media akan dihapus permanen saat menyimpan
              </div>
            )}
          </div>

          {/* MOOD TAGS - sama seperti Create */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              MOOD TAGS
            </label>
            <TagInput
              tags={moodTags}
              onChange={setMoodTags}
              placeholder="Ketik mood lalu tekan Enter"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              STATUS PUBLIKASI
            </label>
            <select
              value={String(isPublic)}
              onChange={(e) => setIsPublic(e.target.value === "true")}
              className="text-black w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="true">Publik (Terlihat semua orang)</option>
              <option value="false">Private (Hanya kamu)</option>
            </select>
          </div>

          {/* PRODUK - sama seperti Create, copy dari CreateOotdModal */}
          <div className="border-t-2 border-gray-200 pt-6">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              PRODUK YANG DIGUNAKAN ({selectedProducts.length})
            </label>

            {/* Search & Dropdown - sama persis seperti Create */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Cari dan pilih produk..."
                  className="w-full border-2 border-gray-300 rounded-xl pl-11 pr-4 py-3 text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                {productsLoading && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                  </div>
                )}
              </div>

              {showProductDropdown && (
                <div className="relative">
                  <div className="absolute z-20 w-full bg-white border-2 border-gray-300 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {productsLoading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                        <p className="text-sm font-medium text-gray-500">
                          Memuat produk...
                        </p>
                      </div>
                    ) : availableProducts.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-gray-600 font-medium">
                          {productSearch
                            ? `Tidak ditemukan "${productSearch}"`
                            : "Semua produk sudah dipilih"}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-700 uppercase">
                            {availableProducts.length} Produk Tersedia
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowProductDropdown(false);
                              setProductSearch("");
                            }}
                            className="text-gray-400 hover:text-gray-600"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="divide-y divide-gray-100">
                          {availableProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleAddProduct(product.id)}
                              className="w-full px-4 py-3.5 text-left hover:bg-orange-50 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors overflow-hidden">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <svg
                                      className="w-6 h-6 text-orange-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500 group-hover:text-orange-500 transition-colors">
                                    Klik untuk menambahkan
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  <svg
                                    className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all"
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
                      </>
                    )}
                  </div>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setShowProductDropdown(false);
                      setProductSearch("");
                    }}
                  />
                </div>
              )}
            </div>

            {/* Product List - sama seperti Create */}
            {selectedProducts.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                <p className="text-gray-600 font-bold">Belum ada produk</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedProducts.map((product, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
                    className="border-2 border-gray-200 rounded-xl p-4 bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center">
                          {product.position}
                        </div>
                        <button
                          type="button"
                          onClick={() => moveProduct(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-orange-600 disabled:opacity-30"
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
                              strokeWidth={3}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProduct(idx, "down")}
                          disabled={idx === selectedProducts.length - 1}
                          className="p-1 text-gray-400 hover:text-orange-600 disabled:opacity-30"
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
                              strokeWidth={3}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-2">
                          {product.name}
                        </h4>
                        {editingNoteId === product.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingNoteValue}
                              onChange={(e) =>
                                setEditingNoteValue(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveNote(product.id);
                                if (e.key === "Escape") setEditingNoteId(null);
                              }}
                              className="flex-1 border-2 border-orange-500 rounded-lg px-3 py-2 text-sm"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveNote(product.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold"
                            >
                              SIMPAN
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              startEditNote(product.id, product.note)
                            }
                            className="text-sm cursor-pointer hover:bg-orange-50 p-2.5 rounded-lg border-2 border-transparent hover:border-orange-300"
                          >
                            {product.note ? (
                              <span className="font-medium">
                                💬 {product.note}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">
                                + Tambah catatan
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <svg
                          className="w-6 h-6"
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
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 pt-6 border-t-2 border-gray-200 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              BATAL
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                selectedFiles.length > 0 ||
                !title.trim() ||
                activeMediaCount === 0
              }
              className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  MENYIMPAN...
                </span>
              ) : (
                "✅ SIMPAN PERUBAHAN"
              )}
            </button>
          </div>
        </form>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteConfirm}
          title="Hapus Media Permanen?"
          message="Media ini akan dihapus dari server dan tidak dapat dikembalikan."
          confirmText="Hapus Permanen"
          cancelText="Batal"
          onConfirm={() => {
            deleteMediaPermanent(deleteMediaId);
            setDeleteConfirm(false);
          }}
          onCancel={() => setDeleteConfirm(false)}
        />
      </div>
    </div>
  );
}
