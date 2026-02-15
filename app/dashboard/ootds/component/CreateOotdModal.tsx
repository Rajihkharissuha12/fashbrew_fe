"use client";

import React, { useEffect, useState, useCallback } from "react";
import TagInput from "./TagInput";
import { useDebounce } from "@/app/hooks/useDebounce";

interface Product {
  id: string;
  name: string;
  image: string;
}

interface ProductPick {
  id: string;
  name: string;
  note: string;
  position: number;
}

interface CreateOotdModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId: string;
  apiBaseUrl?: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function CreateOotdModal({
  open,
  onClose,
  onSuccess,
  userId,
  apiBaseUrl = API_BASE,
}: CreateOotdModalProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [urlPostInstagram, setUrlPostInstagram] = useState("");
  const [description, setDescription] = useState("");
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  // Product selection
  const [productOptions, setProductOptions] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductPick[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState("");
  // ✅ NEW: Dropdown visibility
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // ✅ NEW: Product search
  const [productSearch, setProductSearch] = useState("");
  const debouncedSearch = useDebounce(productSearch, 300);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  // ✅ Fetch products dengan search
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

        const json = await res.json();
        const list = (json.items || json.data || []).map((p: any) => ({
          id: String(p.id),
          name: String(p.name),
          image: String(p.image),
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

  // ✅ Load products saat modal dibuka
  useEffect(() => {
    if (open) {
      fetchProducts("");
    }
  }, [open, fetchProducts]);

  // ✅ Fetch ulang saat search berubah (debounced)
  useEffect(() => {
    if (open) {
      fetchProducts(debouncedSearch);
    }
  }, [debouncedSearch, open, fetchProducts]);

  // Reset form on close
  useEffect(() => {
    if (!open) {
      setTitle("");
      setUrlPostInstagram("");
      setDescription("");
      setMoodTags([]);
      setIsPublic(true);
      setSelectedProducts([]);
      setSelectedToAdd("");
      setProductSearch("");
      setEditingNoteId(null);
      setEditingNoteValue("");
    }
  }, [open]);

  // Add product
  // ✅ FIXED: Add product dengan langsung pass productId
  function handleAddProduct(productId?: string) {
    const targetId = productId || selectedToAdd;

    if (!targetId) {
      return; // Silent fail
    }

    if (selectedProducts.some((p) => p.id === targetId)) {
      alert("Produk sudah ada dalam daftar");
      setSelectedToAdd("");
      return;
    }

    const product = productOptions.find((p) => p.id === targetId);
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

    setSelectedToAdd("");
    setProductSearch("");
    setShowProductDropdown(false);
  }

  // Remove product
  function handleRemoveProduct(id: string) {
    setSelectedProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, idx) => ({ ...p, position: idx + 1 }));
    });
  }

  // Move product
  function moveProduct(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedProducts.length) return;

    const newList = [...selectedProducts];
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];

    const reordered = newList.map((p, idx) => ({ ...p, position: idx + 1 }));
    setSelectedProducts(reordered);
  }

  // Edit note
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

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Judul wajib diisi");
      return;
    }

    if (!urlPostInstagram.trim()) {
      alert("Link Instagram wajib diisi");
      return;
    }

    const payload = {
      userId,
      title: title.trim(),
      urlPostInstagram: urlPostInstagram.trim(),
      description: description.trim() || undefined,
      mood: moodTags.length > 0 ? moodTags : undefined,
      isPublic,
      products: selectedProducts.map((p) => ({
        id: p.id,
        note: p.note || undefined,
        position: p.position,
      })),
    };

    try {
      setLoading(true);

      const res = await fetch(`${apiBaseUrl}/api/ootds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gagal membuat OOTD");
      }

      const result = await res.json();
      console.log("OOTD created:", result);

      alert("OOTD berhasil dibuat!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(`Gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  // ✅ Filter available products (yang belum dipilih)
  const availableProducts = productOptions.filter(
    (p) => !selectedProducts.some((sp) => sp.id === p.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              TAMBAH OOTD BARU
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Isi data dengan lengkap untuk hasil terbaik
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
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Gunakan judul yang menarik dan deskriptif
            </p>
          </div>

          {/* LINK INSTAGRAM */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              LINK INSTAGRAM POST <span className="text-red-600">*</span>
            </label>
            <input
              type="url"
              value={urlPostInstagram}
              onChange={(e) => setUrlPostInstagram(e.target.value)}
              placeholder="https://www.instagram.com/p/ABC123def/"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Media otomatis diambil dari Instagram post
            </p>
          </div>

          {/* DESKRIPSI */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              DESKRIPSI
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan tentang OOTD ini, occasion, atau tips styling..."
              rows={4}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            />
          </div>

          {/* MOOD TAGS */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              MOOD TAGS
            </label>
            <TagInput
              tags={moodTags}
              onChange={setMoodTags}
              placeholder="Ketik mood lalu tekan Enter (contoh: casual, elegant, summer)"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Contoh mood: casual, formal, summer, elegant, sporty
            </p>
            {moodTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {moodTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setMoodTags((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="hover:text-orange-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              STATUS PUBLIKASI
            </label>
            <select
              value={String(isPublic)}
              onChange={(e) => setIsPublic(e.target.value === "true")}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="true">Publik (Terlihat semua orang)</option>
              <option value="false">Private (Hanya kamu)</option>
            </select>
          </div>

          {/* PRODUK */}
          <div className="border-t-2 border-gray-200 pt-6">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              PRODUK YANG DIGUNAKAN ({selectedProducts.length})
            </label>

            {/* ✅ SEARCH & CUSTOM DROPDOWN */}
            <div className="space-y-3 mb-4">
              {/* Search Input */}
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

              {/* ✅ CUSTOM DROPDOWN LIST */}
              {showProductDropdown && (
                <div className="relative">
                  <div className="absolute z-20 w-full bg-white border-2 border-gray-300 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {productsLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                        <p className="text-sm font-medium">Memuat produk...</p>
                      </div>
                    ) : availableProducts.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-gray-600 font-medium">
                          {productSearch
                            ? `Tidak ditemukan "${productSearch}"`
                            : "Semua produk sudah dipilih"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {productSearch
                            ? "Coba kata kunci lain"
                            : "Hapus produk untuk memilih ulang"}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Header */}
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

                        {/* Product Items */}
                        <div className="divide-y divide-gray-100">
                          {availableProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                // ✅ Langsung pass productId, tidak tunggu state update
                                handleAddProduct(product.id);
                              }}
                              className="w-full px-4 py-3.5 text-left hover:bg-orange-50 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                {/* Icon Product */}
                                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors overflow-hidden">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // ✅ Fallback jika image gagal load
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.parentElement!.innerHTML = `
                  <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                `;
                                      }}
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

                                {/* Product Name */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500 group-hover:text-orange-500 transition-colors">
                                    Klik untuk menambahkan
                                  </p>
                                </div>

                                {/* Arrow Indicator */}
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

                  {/* Backdrop to close dropdown */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setShowProductDropdown(false);
                      setProductSearch("");
                    }}
                  />
                </div>
              )}

              {/* Search Result Info */}
              {!showProductDropdown && productSearch && !productsLoading && (
                <p className="text-sm text-gray-600">
                  {availableProducts.length > 0 ? (
                    <>
                      Ditemukan{" "}
                      <span className="font-bold text-orange-600">
                        {availableProducts.length} produk
                      </span>{" "}
                      untuk &quot;{productSearch}&quot;
                    </>
                  ) : (
                    <>
                      Tidak ada produk yang cocok dengan &quot;{productSearch}
                      &quot;
                    </>
                  )}
                </p>
              )}
            </div>

            {/* PRODUCT LIST - sama seperti sebelumnya */}
            {selectedProducts.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                <svg
                  className="w-16 h-16 mx-auto mb-3 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <p className="text-gray-600 font-bold text-base mb-1">
                  Belum ada produk ditambahkan
                </p>
                <p className="text-sm text-gray-500">
                  Cari dan pilih produk di atas untuk menambahkan
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* URUTAN & MOVE */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-sm">
                          {product.position}
                        </div>
                        <button
                          type="button"
                          onClick={() => moveProduct(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Pindah ke atas"
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
                          className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Pindah ke bawah"
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

                      {/* PRODUCT INFO */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-base mb-2">
                          {product.name}
                        </h4>

                        {/* NOTE EDITOR */}
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
                              placeholder="Tulis catatan untuk produk ini..."
                              className="flex-1 border-2 border-orange-500 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveNote(product.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                            >
                              SIMPAN
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                            >
                              BATAL
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              startEditNote(product.id, product.note)
                            }
                            className="text-sm text-gray-700 cursor-pointer hover:bg-orange-50 p-2.5 rounded-lg border-2 border-transparent hover:border-orange-300 transition"
                          >
                            {product.note ? (
                              <span className="font-medium">
                                💬 {product.note}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">
                                + Klik untuk tambah catatan (opsional)
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* REMOVE */}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus produk"
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
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              BATAL
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !urlPostInstagram.trim()}
              className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  MENYIMPAN...
                </span>
              ) : (
                "✅ SIMPAN OOTD"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
