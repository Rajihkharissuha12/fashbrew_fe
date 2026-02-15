"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  initialSearch: string;
  initialSort: string;
};

export default function OotdSearchBar({ initialSearch, initialSort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateURL(search, sort);
  }

  function handleSortChange(newSort: string) {
    setSort(newSort);
    updateURL(search, newSort);
  }

  function updateURL(searchQuery: string, sortQuery: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery) {
      params.set("q", searchQuery);
    } else {
      params.delete("q");
    }

    if (sortQuery !== "createdDesc") {
      params.set("sort", sortQuery);
    } else {
      params.delete("sort");
    }

    // Reset to page 1 when searching/sorting
    params.delete("page");

    const queryString = params.toString();
    const newURL = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(newURL);
    });
  }

  function clearSearch() {
    setSearch("");
    updateURL("", sort);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex-1 relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <svg
            className={`h-5 w-5 transition-colors duration-200 ${
              isPending
                ? "text-orange-500 animate-spin"
                : "text-gray-900 group-focus-within:text-orange-500"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Cari judul atau nomor OOTD..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isPending}
          className="relative text-black w-full pl-11 pr-24 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 hover:border-orange-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Clear button */}
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-2 flex items-center px-3 text-gray-400 hover:text-orange-600 transition-colors"
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
        )}
      </form>

      {/* Sort Dropdown */}
      <div className="relative group">
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          disabled={isPending}
          className="appearance-none w-full sm:w-auto pl-4 pr-11 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-orange-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="createdDesc">🕐 Terbaru</option>
          <option value="createdAsc">⏰ Terlama</option>
          <option value="numberDesc">🔢 Nomor Tinggi</option>
          <option value="numberAsc">🔢 Nomor Rendah</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none group-hover:text-orange-500 transition-colors">
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
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
