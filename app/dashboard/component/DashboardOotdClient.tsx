"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import OotdFormModal from "../component/OotdFormModal";
import { tree } from "next/dist/build/templates/app-page";
import ConfirmDialog from "./ConfirmDialog";

type PlatformType = "tiktok" | "shopee" | "tokopedia" | "other";

type ProductPlatformRow = {
  id: string;
  productId: string;
  platform: PlatformType | string;
  price: number | null;
  link: string | null;
  lastUpdated: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  image: string | null;
  price: number | null;
  platforms: ProductPlatformRow[];
};

type OotdProductRow = {
  id: string;
  productId: string;
  note: string | null;
  position: number | null;
  product: ProductRow;
};

// Updated OotdMediaRow dengan field baru dari backend
type OotdMediaRow = {
  id: string;
  ootdId: string;
  type: "image" | "video" | string;
  url: string;
  urlpublicid: string; // Cloudinary public ID
  isPrimary: boolean;
  originalSize: number; // Byte
  optimizedSize: number; // Byte
  originalFilename?: string; // Nama asli dari Instagram
  cloudinaryFormat?: string; // Format: jpg, png, webp, mp4, dll
  dimensions?: string; // Format: 1080x1080
  createdAt: string;
  updatedAt: string;
};

export type OotdRow = {
  id: string;
  influencerId: string;
  title: string;
  description: string | null;
  urlPostInstagram?: string | null;
  mood: unknown | null;
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  media: OotdMediaRow[];
  coverImage: string | null;
  ootdProducts: OotdProductRow[];
};

type Meta = { total: number; page: number; pageSize: number };

// Utility function untuk format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Utility function untuk hitung compression ratio
function getCompressionRatio(
  originalSize: number,
  optimizedSize: number
): number {
  if (!originalSize || !optimizedSize) return 0;
  const ratio = ((originalSize - optimizedSize) / originalSize) * 100;
  return Math.round(ratio * 100) / 100;
}

async function fetchOotds(
  apiBase: string,
  userId: string,
  page: number,
  pageSize: number,
  q?: string
): Promise<{ rows: OotdRow[]; meta: Meta }> {
  const qs = new URLSearchParams();
  if (userId) qs.set("userId", userId);
  if (q) qs.set("q", q);
  qs.set("page", String(page));
  qs.set("pageSize", String(pageSize));
  const res = await fetch(`${apiBase}/api/ootds?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  console.log(json);

  const rows: OotdRow[] = (json.data || []).map((o: any) => {
    const mediaArr: OotdMediaRow[] = Array.isArray(o.media)
      ? o.media.map((m: any) => ({
          id: String(m.id),
          ootdId: String(m.ootdId),
          type: String(m.type),
          url: String(m.url),
          urlpublicid: String(m.urlpublicid), // Cloudinary public ID
          isPrimary: Boolean(m.isPrimary),
          originalSize: Number(m.originalSize || 0), // Byte
          optimizedSize: Number(m.optimizedSize || 0), // Byte
          originalFilename: m.originalFilename || undefined, // Nama asli
          cloudinaryFormat: m.cloudinaryFormat || undefined, // Format file
          dimensions: m.dimensions || undefined, // Dimensi
          createdAt: m.createdAt
            ? new Date(m.createdAt).toISOString()
            : new Date().toISOString(),
          updatedAt: m.updatedAt
            ? new Date(m.updatedAt).toISOString()
            : new Date().toISOString(),
        }))
      : [];
    const primary = mediaArr.find((m) => m.isPrimary) || mediaArr[0] || null;

    return {
      id: String(o.id),
      influencerId: String(o.influencerId),
      title: o.title,
      description: o.description ?? null,
      urlPostInstagram: o.urlPostInstagram ?? null,
      mood: o.mood ?? null,
      isPublic: Boolean(o.isPublic),
      viewCount: Number(o.viewCount ?? 0),
      likeCount: Number(o.likeCount ?? 0),
      createdAt: o.createdAt
        ? new Date(o.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: o.updatedAt
        ? new Date(o.updatedAt).toISOString()
        : new Date().toISOString(),
      media: mediaArr,
      coverImage: primary ? primary.url : null,
      ootdProducts: Array.isArray(o.ootdProducts)
        ? o.ootdProducts.map((op: any) => ({
            id: String(op.id),
            productId: String(op.productId),
            note: op.note ?? null,
            position: op.position != null ? Number(op.position) : null,
            product: {
              id: String(op.product?.id ?? ""),
              name: String(op.product?.name ?? ""),
              image: op.product?.image ?? null,
              price:
                op.product?.price != null ? Number(op.product.price) : null,
              platforms: Array.isArray(op.product?.platforms)
                ? op.product.platforms.map((pl: any) => ({
                    id: String(pl.id),
                    productId: String(pl.productId),
                    platform: String(pl.platform),
                    price: pl.price != null ? Number(pl.price) : null,
                    link: pl.link ?? null,
                    lastUpdated: pl.lastUpdated
                      ? new Date(pl.lastUpdated).toISOString()
                      : null,
                  }))
                : [],
            },
          }))
        : [],
    };
  });
  const meta: Meta = json.meta || { total: rows.length, page, pageSize };
  return { rows, meta };
}

async function deleteOotd(apiBase: string, id: string | number) {
  const res = await fetch(`${apiBase}/api/ootds/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function DashboardOotdClient({
  userId,
  apiBaseUrl = "http://localhost:4000",
  initialItems = [],
  initialMeta = { total: 0, page: 1, pageSize: 10 },
  initialQuery = "",
}: {
  userId: string;
  apiBaseUrl?: string;
  initialItems?: OotdRow[];
  initialMeta?: Meta;
  initialQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<OotdRow[]>(initialItems);
  const [meta, setMeta] = useState<Meta>(initialMeta);
  const [q, setQ] = useState<string>(initialQuery);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<OotdRow | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetch, setFetch] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [idOotd, setIdOotd] = useState<string>("");

  function updateUrl(page: number, pageSize: number, query: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (query) params.set("q", query);
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  const didHydrateInitial = useRef(false);

  useEffect(() => {
    const urlPage = Number(searchParams.get("page") || initialMeta.page || 1);
    const urlPageSize = Number(
      searchParams.get("pageSize") || initialMeta.pageSize || 10
    );
    const urlQ = searchParams.get("q") || "";
    if (
      !didHydrateInitial.current &&
      initialItems.length > 0 &&
      initialMeta.page === urlPage &&
      initialMeta.pageSize === urlPageSize &&
      (initialQuery || "") === urlQ
    ) {
      didHydrateInitial.current = true;
      return;
    }
    let mounted = true;
    setLoading(true);
    setFetchError(null);
    fetchOotds(apiBaseUrl, userId, urlPage, urlPageSize, urlQ || undefined)
      .then(({ rows, meta }) => {
        console.log("OOTD", rows);
        if (mounted) {
          setItems(rows);
          setMeta(meta);
          setQ(urlQ);
        }
      })
      .catch((err) => {
        if (mounted) setFetchError(err?.message || "Gagal mengambil OOTD");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [searchParams, userId, apiBaseUrl, fetch]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function onAdd() {
    setEditItem(null);
    setOpen(true);
  }

  function onEdit(row: OotdRow) {
    setEditItem(row);
    setOpen(true);
  }

  async function onDelete(idootd: string) {
    try {
      await deleteOotd(apiBaseUrl, idootd);
      const { rows, meta } = await fetchOotds(
        apiBaseUrl,
        userId,
        1,
        10,
        q || undefined
      );
      setItems(rows);
      setMeta(meta);
      setExpanded(new Set());
    } catch (e: any) {
      alert(e?.message || "Gagal menghapus OOTD");
    }
  }

  async function handleSuccess() {
    setOpen(false);
    updateUrl(1, meta.pageSize, q);
  }

  const isEmpty = !loading && !fetchError && items.length === 0;

  return (
    <section className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          OOTD
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="flex w-full sm:w-auto items-center gap-2">
            <input
              className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-200"
              placeholder="Cari judul atau deskripsi..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateUrl(1, meta.pageSize, q);
              }}
            />
            <button
              className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              onClick={() => updateUrl(1, meta.pageSize, q)}
            >
              Cari
            </button>
          </div>

          {/* Add Button */}
          <button
            className="w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition"
            onClick={onAdd}
          >
            + Tambah OOTD
          </button>
        </div>
      </div>

      {/* Loading / Error / Empty States */}
      {loading && (
        <div className="text-center text-sm text-gray-500 py-12">
          Memuat OOTD...
        </div>
      )}
      {fetchError && (
        <div className="text-center text-sm text-red-600 py-12">
          Error: {fetchError}
        </div>
      )}
      {isEmpty && (
        <div className="border border-gray-200 rounded-xl p-8 sm:p-12 bg-gray-50 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Belum ada OOTD
          </p>
          <button
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            onClick={onAdd}
          >
            Buat OOTD Pertama
          </button>
        </div>
      )}

      {/* Cards */}
      {!loading && !fetchError && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {items.map((it) => {
            const isExpanded = expanded.has(it.id);
            const primaryMedia =
              it.media.find((m) => m.isPrimary) || it.media[0];

            return (
              <div
                key={it.id}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
              >
                {/* Cover Image - Instagram style 4:5 ratio */}
                <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden dark:from-zinc-800 dark:to-zinc-900">
                  {primaryMedia ? (
                    <>
                      <img
                        src={primaryMedia.url}
                        alt={it.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      {/* Video indicator */}
                      {primaryMedia.type === "video" && (
                        <div className="absolute top-4 left-4">
                          <div className="p-2 bg-black/60 backdrop-blur-sm rounded-full">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400 dark:text-gray-600">
                        <svg
                          className="w-16 h-16 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm">No Image</span>
                      </div>
                    </div>
                  )}

                  {/* Top badges - compact */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {!it.isPublic && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/90 text-white backdrop-blur-sm shadow-lg">
                        🔒 Private
                      </span>
                    )}
                    {it.media.length > 1 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm shadow-sm dark:bg-zinc-800/90 dark:text-gray-300">
                        📸 {it.media.length}
                      </span>
                    )}
                  </div>

                  {/* Gradient overlay with title - always visible */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pb-3">
                    <h3 className="font-bold text-white text-lg line-clamp-2 leading-tight mb-2">
                      {it.title}
                    </h3>

                    {/* Mood tags - max 3 */}
                    {Array.isArray(it.mood) &&
                      (it.mood as any[]).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {(it.mood as any[]).slice(0, 3).map((m, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30"
                            >
                              {String(m)}
                            </span>
                          ))}
                          {(it.mood as any[]).length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                              +{(it.mood as any[]).length - 3}
                            </span>
                          )}
                        </div>
                      )}

                    {/* Meta info compact */}
                    <div className="flex items-center gap-3 text-xs text-white/80">
                      {it.ootdProducts.length > 0 && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          {it.ootdProducts.length}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {it.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {it.likeCount}
                      </span>
                    </div>
                  </div>

                  {/* Quick actions overlay - Desktop hover only */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex items-center justify-center gap-3">
                    <button
                      onClick={() => router.push(`/dashboard/ootd/${it.id}`)}
                      className="p-3 bg-white/95 hover:bg-white rounded-xl transition-all shadow-lg backdrop-blur-sm hover:scale-110"
                      title="Detail"
                    >
                      <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(it)}
                      className="p-3 bg-white/95 hover:bg-white rounded-xl transition-all shadow-lg backdrop-blur-sm hover:scale-110"
                      title="Edit"
                    >
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    {/* <button
                      onClick={() => toggleExpand(it.id)}
                      className="p-3 bg-white/95 hover:bg-white rounded-xl transition-all shadow-lg backdrop-blur-sm hover:scale-110"
                      title={isExpanded ? "Tutup" : "Expand"}
                    >
                      <svg
                        className={`w-5 h-5 text-gray-700 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button> */}
                    <button
                      onClick={() => {
                        setDeleteConfirm(true);
                        setIdOotd(it.id);
                      }}
                      className="p-3 bg-white/95 hover:bg-white rounded-xl transition-all shadow-lg backdrop-blur-sm hover:scale-110"
                      title="Hapus"
                    >
                      <svg
                        className="w-5 h-5 text-red-600"
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

                {/* Mobile actions - always visible */}
                <div className="lg:hidden flex gap-2 p-3 bg-gray-50 dark:bg-zinc-800/50">
                  <button
                    onClick={() => router.push(`/dashboard/ootd/${it.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white border border-gray-200 dark:border-zinc-700"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Detail
                  </button>
                  <button
                    onClick={() => onEdit(it)}
                    className="flex items-center justify-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  {/* <button
                    onClick={() => toggleExpand(it.id)}
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-gray-300"
                    title="Expand"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button> */}
                  <button
                    onClick={() => {
                      setDeleteConfirm(true);
                      setIdOotd(it.id);
                    }}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors dark:bg-red-900/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
                    title="Hapus"
                  >
                    <svg
                      className="w-4 h-4"
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
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !fetchError && items.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200 dark:border-zinc-800 pt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
            Halaman {meta.page} dari{" "}
            {Math.max(Math.ceil(meta.total / meta.pageSize), 1)} • Total{" "}
            {meta.total} item
          </p>

          <div className="flex justify-center sm:justify-end items-center gap-2">
            <button
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-zinc-800"
              onClick={() =>
                updateUrl(Math.max(1, meta.page - 1), meta.pageSize, q)
              }
              disabled={meta.page <= 1}
            >
              ← Sebelumnya
            </button>
            <button
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-zinc-800"
              onClick={() =>
                updateUrl(
                  Math.min(
                    Math.max(Math.ceil(meta.total / meta.pageSize), 1),
                    meta.page + 1
                  ),
                  meta.pageSize,
                  q
                )
              }
              disabled={
                meta.page >= Math.max(Math.ceil(meta.total / meta.pageSize), 1)
              }
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Hapus Ootd?"
        message="Ootd ini akan dihapus dari daftar OOTD."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={() => {
          onDelete(idOotd);
          setDeleteConfirm(false);
        }}
        onCancel={() => setDeleteConfirm(false)}
      />

      {/* Modal */}
      <OotdFormModal
        open={open}
        onClose={() => {
          setOpen(false);
          setFetch(fetch + 1);
        }}
        mode={editItem?.id ? "update" : "create"}
        initialData={editItem as any}
        defaultInfluencerId={userId}
        onSuccess={handleSuccess}
        apiBaseUrl={apiBaseUrl}
      />
    </section>
  );
}
