"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "./loading";
import ConfirmDialog from "@/app/dashboards/component/ConfirmDialog";
import CreateOotdModal from "./component/CreateOotdModal";
import EditOotdModal from "./component/EditOotdModal";

type OotdMediaRow = {
  id: string;
  ootdId: string;
  type: "image" | "video" | string;
  url: string;
  urlpublicid: string;
  isPrimary: boolean;
  originalSize: number;
  optimizedSize: number;
  originalFilename?: string;
  cloudinaryFormat?: string;
  dimensions?: string;
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
  number: number;
  media: OotdMediaRow[];
  coverImage: string | null;
  ootdProducts: any[];
};

type ApiResponse = {
  items: OotdRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type Props = {
  influencerId: string;
  initialSearch?: string;
  initialSort?: string;
  initialPage?: number;
};

export default function OotdListClient({
  influencerId,
  initialSearch = "",
  initialSort = "createdDesc",
  initialPage = 1,
}: Props) {
  const router = useRouter();

  const [ootds, setOotds] = useState<OotdRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);

  // modal & delete state
  const [openCreate, setOpenCreate] = useState(false);
  const [editOotd, setEditOotd] = useState<OotdRow | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");

  const totalPages = Math.ceil(total / pageSize);

  async function fetchOotds() {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (initialSearch) params.append("q", initialSearch);
      params.append("sort", initialSort);
      params.append("influencer_id", influencerId);
      params.append("page", String(page));
      params.append("limit", String(pageSize));

      const res = await fetch(
        `${API_BASE}/api/ootds/search?${params.toString()}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json: ApiResponse = await res.json();
      setOotds(json.items || []);
      setTotal(json.pagination?.total || 0);
    } catch (e) {
      console.error("Error fetching OOTDs:", e);
      setOotds([]);
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    fetchOotds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update when props change (dari URL)
  useEffect(() => {
    setPage(initialPage);
    fetchOotds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearch, initialSort, initialPage]);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams();
    if (initialSearch) params.set("q", initialSearch);
    if (initialSort !== "createdDesc") params.set("sort", initialSort);
    if (newPage > 1) params.set("page", newPage.toString());

    const queryString = params.toString();
    const newURL = queryString
      ? `/dashboard/ootds?${queryString}`
      : "/dashboard/ootds";

    router.push(newURL);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteOotd(id: string) {
    const res = await fetch(`${API_BASE}/api/ootds/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Gagal menghapus OOTD");
    }
    await res.json();
  }

  async function handleDeleteConfirm() {
    try {
      await deleteOotd(deleteId);
      setDeleteConfirm(false);
      setDeleteId("");
      await fetchOotds();
    } catch (e: any) {
      alert(e?.message || "Gagal menghapus OOTD");
    }
  }

  const isEmpty = !loading && ootds.length === 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header dengan Button Tambah */}
      <div className="flex items-center justify-between">
        <div>
          {total > 0 && (
            <p className="text-sm text-gray-600 font-medium">
              <span className="text-orange-600 font-semibold">{total}</span>{" "}
              OOTD ditemukan
            </p>
          )}
        </div>

        {/* Button Tambah OOTD */}
        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
        >
          <svg
            className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="hidden sm:inline">Tambah OOTD</span>
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      )}

      {/* EMPTY STATE */}
      {isEmpty && (
        <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center bg-gray-50">
          <p className="text-gray-700 font-semibold mb-3">
            {initialSearch
              ? "Tidak ada OOTD yang cocok dengan pencarian"
              : "Belum ada OOTD untuk influencer ini."}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {initialSearch
              ? "Coba kata kunci lain atau buat OOTD baru"
              : "Mulai dengan membuat OOTD pertama agar feed terlihat hidup."}
          </p>
          <button
            onClick={() => setOpenCreate(true)}
            className="bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide shadow-sm hover:bg-orange-700"
          >
            BUAT OOTD {initialSearch ? "BARU" : "PERTAMA"}
          </button>
        </div>
      )}

      {/* GRID CARD - sama seperti sebelumnya */}
      {!loading && ootds.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ootds.map((it) => {
              const primaryMedia =
                it.media.find((m) => m.isPrimary) || it.media[0];

              return (
                <div
                  key={it.id}
                  onClick={() => router.push(`/dashboard/ootds/${it.id}`)}
                  className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-orange-200"
                >
                  {/* IMAGE CONTAINER */}
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 overflow-hidden">
                    {primaryMedia ? (
                      <>
                        <img
                          src={primaryMedia.url}
                          alt={it.title}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                        />
                        {/* Playful overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-600/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                            <svg
                              className="w-10 h-10 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-400 font-semibold">
                            Belum ada gambar
                          </p>
                        </div>
                      </div>
                    )}

                    {/* FLOATING BADGES */}
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                      {/* Number Badge with pulse */}
                      {it.number && (
                        <div className="relative">
                          <div className="absolute inset-0 bg-orange-500 rounded-2xl blur-md opacity-40 animate-pulse" />
                          <div className="relative px-3 py-1.5 rounded-2xl text-sm font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl">
                            #{it.number}
                          </div>
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="flex flex-col gap-2 items-end">
                        {!it.isPublic && (
                          <div className="px-3 py-1.5 rounded-2xl text-xs font-bold bg-white/95 backdrop-blur-md text-gray-800 shadow-lg border border-white/50">
                            🔒 Private
                          </div>
                        )}
                        {it.media.length > 1 && (
                          <div className="px-3 py-1.5 rounded-2xl text-xs font-bold bg-white/95 backdrop-blur-md text-gray-800 shadow-lg border border-white/50">
                            📸 {it.media.length} foto
                          </div>
                        )}
                        {primaryMedia?.type === "video" && (
                          <div className="px-3 py-1.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                            🎥 Video
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Floating detail button on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-white/95 backdrop-blur-md rounded-2xl px-6 py-3 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Lihat Detail
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONTENT - More Spacious */}
                  <div className="p-5 space-y-4">
                    {/* Title with gradient hover */}
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-relaxed group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-amber-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {it.title}
                    </h3>

                    {/* Soft Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditOotd(it);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-2xl text-xs font-bold hover:from-blue-100 hover:to-blue-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all duration-300"
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
                            strokeWidth={2.5}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(it.id);
                          setDeleteConfirm(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-2xl text-xs font-bold hover:from-red-100 hover:to-red-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 transition-all duration-300"
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
                            strokeWidth={2.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                </div>
              );
            })}
          </div>

          {/* PAGINATION - Playful Style */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
              <p className="text-sm font-semibold text-gray-600">
                Halaman <span className="text-orange-600">{page}</span> dari{" "}
                <span className="text-orange-600">{totalPages}</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl text-sm font-bold text-orange-600 hover:from-orange-100 hover:to-amber-100 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                >
                  ← Sebelumnya
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 border-2 border-orange-500 rounded-2xl text-sm font-bold text-white hover:from-orange-600 hover:to-amber-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg shadow-orange-500/30"
                >
                  Berikutnya →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ConfirmDialog
        open={deleteConfirm}
        title="Hapus OOTD?"
        message="OOTD ini akan dihapus dari daftar. Tindakan ini tidak dapat dibatalikan."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(false)}
      />

      <CreateOotdModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={() => {
          setOpenCreate(false);
          fetchOotds();
        }}
        userId={influencerId}
        apiBaseUrl={API_BASE}
      />
      <EditOotdModal
        open={!!editOotd}
        onClose={() => setEditOotd(null)}
        onSuccess={() => {
          setEditOotd(null);
          fetchOotds();
        }}
        userId={influencerId}
        ootdData={editOotd}
        apiBaseUrl={API_BASE}
      />
    </div>
  );
}
