import { Suspense } from "react";
import OotdList from "./oootdclient";
import LoadingSpinner from "./loading";
import { createSupabaseServer } from "@/app/utils/supabase/server";
import OotdSearchBar from "./component/Searchbar";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function OotdPage({ searchParams }: PageProps) {
  const { q, sort, page } = await searchParams;
  const supabase = await createSupabaseServer();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please login to continue</p>
      </div>
    );
  }

  // Get influencer ID by user ID
  const { data: influencerId, error } = await supabase.rpc(
    "get_influencer_id_by_auth_user_id",
    { p_auth_user_id: user.id },
  );

  if (error) {
    console.error("Error getting influencer:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-semibold">Error loading influencer</p>
          <p className="text-gray-500 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!influencerId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <p className="text-gray-700 font-semibold">
            No influencer profile found
          </p>
          <p className="text-gray-500 text-sm">
            Please create an influencer profile first
          </p>
        </div>
      </div>
    );
  }

  // Extract search params
  const initialSearch = (await searchParams).q || "";
  const initialSort = (await searchParams).sort || "createdDesc";
  const initialPage = parseInt((await searchParams).page || "1");

  return (
    <div className="min-h-screen">
      {/* HEADER dengan Search - TIDAK DALAM SUSPENSE, LANGSUNG RENDER */}
      <div className="bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-5">
            {/* Title Area */}
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    OOTD — Rere Amalia
                  </h1>
                </div>
                <p className="text-sm text-gray-600 pl-5 font-medium">
                  ✨ Kelola koleksi OOTD dengan cepat, jelas, dan rapi
                </p>
              </div>
            </div>

            {/* Search Bar - Langsung render, tidak dalam Suspense */}
            <OotdSearchBar
              initialSearch={initialSearch}
              initialSort={initialSort}
            />
          </div>
        </div>
      </div>

      {/* Content - HANYA LIST YANG DALAM SUSPENSE */}
      <Suspense
        key={`${initialSearch}-${initialSort}-${initialPage}`}
        fallback={
          <div className="p-6">
            {/* Loading Skeleton untuk List */}
            <div className="flex justify-center py-20">
              <div className="text-center space-y-4">
                <LoadingSpinner />
              </div>
            </div>
          </div>
        }
      >
        <OotdList
          influencerId={influencerId}
          initialSearch={initialSearch}
          initialSort={initialSort}
          initialPage={initialPage}
        />
      </Suspense>
    </div>
  );
}
