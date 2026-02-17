"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Eye,
  Edit2,
  Trash2,
  Tag,
  AlertTriangle,
} from "lucide-react";
import ProductDetailModal from "./detailproduct";
import { ProductWithPlatformsRow } from "@/app/dashboards/component/DashboardProductClient";
import ProductFormModal from "./component/ModalFormProduct";

type Product = {
  id: string;
  name: string;
  image?: string;
  price?: number;
  category?: string;
  tags?: string[];
  platforms: any[];
};

export default function ShopsList({ userId }: { userId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<ProductWithPlatformsRow | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // State untuk delete confirmation
  const [deleteModal, setDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  async function fetchProducts(nextPage = page, q = search) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      params.append("page", String(nextPage));
      params.append("pageSize", String(pageSize));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/api/products?${params.toString()}`,
        { cache: "no-store" },
      );

      const json = await res.json();
      setProducts(json.data || []);
      setTotal(json.meta?.total || 0);
      setPage(json.meta?.page || nextPage);
      setPageSize(json.meta?.pageSize || pageSize);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function updateUrl(nextPage: number, nextPageSize: number, q: string) {
    setPageSize(nextPageSize);
    setPage(nextPage);
    fetchProducts(nextPage, q);
  }

  // ===== DELETE PRODUCT HANDLER =====
  async function handleDeleteProduct() {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}/api/products/${productToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Failed to delete product (${response.status})`,
        );
      }

      // Success - refresh products list
      await fetchProducts(page, search);

      // Close modal and reset state
      setDeleteModal(false);
      setProductToDelete(null);
    } catch (err: any) {
      console.error("Error deleting product:", err);
      alert(err?.message || "Gagal menghapus produk");
    } finally {
      setDeleting(false);
    }
  }

  function openDeleteConfirmation(product: Product) {
    setProductToDelete(product);
    setDeleteModal(true);
  }

  function closeDeleteModal() {
    if (deleting) return; // Prevent closing while deleting
    setDeleteModal(false);
    setProductToDelete(null);
  }

  useEffect(() => {
    fetchProducts(1);
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50/20 via-white to-indigo-50/10">
      {/* Header Section - Playful Style */}
      <div className="bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col gap-5">
            {/* Title Area */}
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Products
                  </h1>
                </div>
                <p className="text-sm text-gray-600 pl-5 font-medium">
                  ✨ {total} total produk tersedia
                </p>
              </div>

              {/* Primary CTA - Desktop */}
              <button
                onClick={() => {
                  setEdit(null);
                  setOpen(true);
                }}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Tambah Produk
              </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Search className="h-5 w-5 text-gray-900 group-focus-within:text-blue-500 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Cari produk atau kategori..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && updateUrl(1, pageSize, search)
                  }
                  className="relative text-black w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 hover:border-blue-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>

              {/* Primary CTA - Mobile */}
              <button
                onClick={() => {
                  setEdit(null);
                  setOpen(true);
                }}
                className="md:hidden flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 active:scale-95 transition-transform duration-200 group"
              >
                <Plus className="w-5 h-5 group-active:rotate-90 transition-transform duration-300" />
                Tambah Produk
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-100 rounded-3xl animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Products Grid - Playful Cards */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mb-4 shadow-2xl">
                  <Package className="w-12 h-12 text-white" />
                </div>
                <p className="text-gray-500 text-sm font-semibold">
                  {search ? "Tidak ada produk yang cocok" : "Belum ada produk"}
                </p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setDetailProduct(product)}
                  className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-blue-200"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 overflow-hidden">
                    {product.image ? (
                      <>
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                            <Package className="w-10 h-10 text-white" />
                          </div>
                          <p className="text-sm text-gray-400 font-semibold">
                            Belum ada gambar
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Category Badge */}
                    {product.category && (
                      <div className="absolute top-4 left-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-md opacity-40 animate-pulse" />
                          <div className="relative px-3 py-1.5 rounded-2xl text-sm font-black bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl">
                            {product.category}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Platform Count Badge */}
                    {product.platforms?.length > 0 && (
                      <div className="absolute top-4 right-4">
                        <div className="px-3 py-1.5 rounded-2xl text-xs font-bold bg-white/95 backdrop-blur-md text-gray-800 shadow-lg border border-white/50">
                          🏪 {product.platforms.length} platform
                        </div>
                      </div>
                    )}

                    {/* Floating action buttons on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailProduct(product);
                          }}
                          className="p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:scale-110"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEdit(product as ProductWithPlatformsRow);
                            setOpen(true);
                          }}
                          className="p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:scale-110"
                        >
                          <Edit2 className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirmation(product);
                          }}
                          className="p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:scale-110"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Decorative corner accent */}
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  </div>

                  {/* Content Section */}
                  <div className="p-5 space-y-4">
                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-relaxed group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {product.price
                          ? `Rp ${product.price.toLocaleString("id-ID")}`
                          : "—"}
                      </span>
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {product.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {product.tags.length > 2 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                            +{product.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Mobile Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEdit(product as ProductWithPlatformsRow);
                          setOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-2xl text-xs font-bold hover:from-blue-100 hover:to-blue-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all duration-300"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirmation(product);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-2xl text-xs font-bold hover:from-red-100 hover:to-red-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination - Playful Style */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
            <p className="text-sm font-semibold text-gray-600">
              Halaman <span className="text-blue-600">{page}</span> dari{" "}
              <span className="text-blue-600">{totalPages}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => updateUrl(page - 1, pageSize, search)}
                disabled={page <= 1}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl text-sm font-bold text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
              >
                ← Sebelumnya
              </button>
              <button
                onClick={() => updateUrl(page + 1, pageSize, search)}
                disabled={page >= totalPages}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 border-2 border-blue-500 rounded-2xl text-sm font-bold text-white hover:from-blue-600 hover:to-indigo-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg shadow-blue-500/30"
              >
                Berikutnya →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deleteModal && productToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Hapus Produk</h3>
                  <p className="text-red-100 text-sm mt-0.5">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                Apakah Anda yakin ingin menghapus produk{" "}
                <span className="font-bold text-gray-900">
                  "{productToDelete.name}"
                </span>
                ?
              </p>

              {productToDelete.platforms?.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-xs font-semibold text-red-800">
                    ⚠️ Produk ini memiliki {productToDelete.platforms.length}{" "}
                    platform affiliate yang akan ikut terhapus
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 px-5 py-3 bg-white border-2 border-gray-300 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl text-sm font-bold text-white hover:from-red-600 hover:to-red-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Hapus Produk
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductFormModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEdit(null);
        }}
        mode={edit ? "update" : "create"}
        initialData={edit}
        onSuccess={() => {
          setOpen(false);
          setEdit(null);
          fetchProducts(page, search);
        }}
        userId={userId}
      />

      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      )}
    </section>
  );
}
