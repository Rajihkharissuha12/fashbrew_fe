// app/dashboard/product/DashboardProductClient.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProductFormModal from "../component/ProductFormModal";
import {
  Search,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Tag,
  Package,
  X,
  Copy,
  Check,
} from "lucide-react";
import ProductLoading from "../product/loading";

export type ProductPlatformRow = {
  id: string;
  productId: string;
  platform: string;
  price: number | null;
  link: string | null;
  lastUpdated: string | null;
};

export type ProductWithPlatformsRow = {
  id: string;
  name: string;
  price: number | null;
  clicks: number;
  image?: string | null;
  affiliateLink?: string | null;
  category?: string | null;
  description?: string | null;
  influencerId?: string | null;
  tags?: string[] | null;
  platforms: ProductPlatformRow[];
};

type Meta = { total: number; page: number; pageSize: number };

const fetchProducts = async (
  apiBase: string,
  userId: string,
  page: number,
  pageSize: number,
  q?: string
): Promise<{ rows: ProductWithPlatformsRow[]; meta: Meta }> => {
  const qs = new URLSearchParams({
    userId,
    page: String(page),
    pageSize: String(pageSize),
    ...(q ? { q } : {}),
  });

  const res = await fetch(`${apiBase}/api/products?${qs}`, {
    cache: "no-store",
  });
  if (!res) throw new Error(`API error ${res}`);

  const { data = [], meta } = await res.json();
  return { rows: data, meta };
};

const deleteProduct = async (apiBase: string, id: string) => {
  const res = await fetch(`${apiBase}/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
};

const useDebounce = <T,>(value: T, delay = 400): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// Detail Modal Component
function ProductDetailModal({
  product,
  onClose,
}: {
  product: ProductWithPlatformsRow;
  onClose: () => void;
}) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyToClipboard = async (link: string, platformId: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedLink(platformId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto dark:bg-zinc-900 dark:border dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
                {product.name}
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Harga:</span> Rp{" "}
                  {product.price?.toLocaleString("id-ID") || "-"}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Klik:</span> {product.clicks}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          {product.image && (
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 dark:text-white">
                Deskripsi
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {product.description}
              </p>
            </div>
          )}

          {/* Category */}
          {product.category && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 dark:text-white">
                Kategori
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                {product.category}
              </span>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 dark:text-white">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Platforms */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 dark:text-white">
              Platform Affiliate ({product.platforms.length})
            </h3>
            {product.platforms.length > 0 ? (
              <div className="space-y-3">
                {product.platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 dark:bg-zinc-800/50 dark:border-zinc-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {platform.platform}
                      </h4>
                      {platform.price && (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Rp {platform.price.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                    {platform.link && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={platform.link}
                          readOnly
                          className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-600 dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-400"
                        />
                        <button
                          onClick={() =>
                            copyToClipboard(platform.link!, platform.id)
                          }
                          className="p-2 hover:bg-white border border-gray-200 rounded-lg transition-colors dark:hover:bg-zinc-900 dark:border-zinc-700"
                          title="Copy link"
                        >
                          {copiedLink === platform.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                        <a
                          href={platform.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white border border-gray-200 rounded-lg transition-colors dark:hover:bg-zinc-900 dark:border-zinc-700"
                          title="Buka link"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-600" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl dark:bg-zinc-800/50 dark:text-gray-400">
                Belum ada platform affiliate
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardProductClient({
  userId,
  initialPage,
  initialPageSize,
  initialQuery,
  apiBaseUrl,
}: {
  userId: string;
  initialPage: number;
  initialPageSize: number;
  initialQuery: string;
  apiBaseUrl: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductWithPlatformsRow[]>([]);
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: initialPage,
    pageSize: initialPageSize,
  });
  const [search, setSearch] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<ProductWithPlatformsRow | null>(null);
  const [detailProduct, setDetailProduct] =
    useState<ProductWithPlatformsRow | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const debounced = useDebounce(search, 300);
  const prevKey = useRef("");

  const updateUrl = (page: number, pageSize: number, q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    q ? params.set("q", q) : params.delete("q");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const refetchProducts = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    setLoading(true);
    const key = `${debounced}-${searchParams.get("page")}-${searchParams.get(
      "pageSize"
    )}-${refreshTrigger}`;
    if (prevKey.current === key) {
      setLoading(false);
      return;
    }
    prevKey.current = key;

    fetchProducts(
      apiBaseUrl,
      userId,
      Number(searchParams.get("page") || 1),
      Number(searchParams.get("pageSize") || 12),
      debounced
    )
      .then(({ rows, meta }) => {
        setProducts(rows);
        setMeta(meta);
      })
      .catch((err) => {
        err.name !== "AbortError" && console.error(err);
      })
      .finally(() => setLoading(false));
  }, [debounced, searchParams, apiBaseUrl, userId, refreshTrigger]);

  const handleDelete = async (p: ProductWithPlatformsRow) => {
    if (!confirm(`Hapus "${p.name}"?`)) return;
    try {
      await deleteProduct(apiBaseUrl, p.id);
      refetchProducts();
    } catch (err) {
      alert("Gagal menghapus produk");
    }
  };

  const totalPages = Math.ceil(meta.total / meta.pageSize);

  if (loading) {
    return <ProductLoading />;
  }

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            {meta.total} total produk
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && updateUrl(1, meta.pageSize, search)
              }
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Produk</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>

      {/* Products List - Table Layout */}
      {/* <div className="bg-white border border-gray-200 rounded-xl overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 dark:bg-zinc-800">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {search ? "Tidak ada produk yang cocok" : "Belum ada produk"}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 dark:bg-zinc-800 dark:border-zinc-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
                      Produk
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
                      Harga
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
                      Tags
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-zinc-700"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center dark:bg-zinc-800">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {product.platforms.length} platform
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Rp {product.price?.toLocaleString("id-ID") || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.category ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                            {product.category}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.tags && product.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {product.tags.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
                                +{product.tags.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDetailProduct(product)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-zinc-800"
                            title="Detail"
                          >
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => {
                              setEdit(product);
                              setOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-zinc-800"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-gray-200 dark:divide-zinc-800">
              {products.map((product) => (
                <div key={product.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0 dark:border-zinc-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 dark:bg-zinc-800">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-sm font-medium text-gray-900 mt-1 dark:text-white">
                        Rp {product.price?.toLocaleString("id-ID") || "-"}
                      </p>
                    </div>
                  </div>

                  {product.category && (
                    <div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        {product.category}
                      </span>
                    </div>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setDetailProduct(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-white"
                    >
                      <Eye className="w-4 h-4" />
                      Detail
                    </button>
                    <button
                      onClick={() => {
                        setEdit(product);
                        setOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-blue-200 hover:bg-blue-50 text-blue-600 rounded-lg text-sm font-medium transition-colors dark:border-blue-900 dark:hover:bg-blue-900/20"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium transition-colors dark:border-red-900 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div> */}

      {/* Products Grid - Modern Card Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 dark:bg-zinc-800">
              <Package className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm dark:text-gray-400">
              {search ? "Tidak ada produk yang cocok" : "Belum ada produk"}
            </p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
            >
              <div className="relative aspect-square bg-gray-50 overflow-hidden dark:bg-zinc-800">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-200 dark:text-gray-700" />
                  </div>
                )}

                {product.category && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm dark:bg-zinc-800/90 dark:text-gray-300">
                      {product.category}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex items-end justify-center p-4 gap-2">
                  <button
                    onClick={() => setDetailProduct(product)}
                    className="p-2.5 bg-white/95 hover:bg-white rounded-xl transition-colors shadow-lg backdrop-blur-sm"
                    title="Detail"
                  >
                    <Eye className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => {
                      setEdit(product);
                      setOpen(true);
                    }}
                    className="p-2.5 bg-white/95 hover:bg-white rounded-xl transition-colors shadow-lg backdrop-blur-sm"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2.5 bg-white/95 hover:bg-white rounded-xl transition-colors shadow-lg backdrop-blur-sm"
                    title="Hapus"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3
                  className="font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem] dark:text-white cursor-pointer"
                  onClick={() => setDetailProduct(product)}
                  title={product.name}
                >
                  {product.name}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {product.price
                      ? `Rp ${product.price.toLocaleString("id-ID")}`
                      : "—"}
                  </span>
                  {product.platforms.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {product.platforms.length} platform
                    </span>
                  )}
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-600 dark:bg-zinc-800 dark:text-gray-400"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 2 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                        +{product.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex lg:hidden gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <button
                    onClick={() => setDetailProduct(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white"
                  >
                    <Eye className="w-4 h-4" />
                    Detail
                  </button>
                  <button
                    onClick={() => {
                      setEdit(product);
                      setOpen(true);
                    }}
                    className="flex items-center justify-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors dark:bg-red-900/20 dark:hover:bg-red-900/30"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Halaman <span className="font-medium">{meta.page}</span> dari{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => updateUrl(meta.page - 1, meta.pageSize, search)}
              disabled={meta.page <= 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-white"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => updateUrl(meta.page + 1, meta.pageSize, search)}
              disabled={meta.page >= totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-white"
            >
              Berikutnya
            </button>
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
        userId={userId}
        onSuccess={() => {
          setOpen(false);
          setEdit(null);
          refetchProducts();
        }}
        apiBaseUrl={apiBaseUrl}
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
