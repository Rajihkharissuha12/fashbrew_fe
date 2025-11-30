export default function Loading() {
  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="h-8 w-32 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="flex-1 sm:w-64 h-10 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-full sm:w-40 h-10 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800"
          >
            {/* Image skeleton - 4:5 ratio like Instagram */}
            <div className="aspect-[4/5] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-800 dark:to-zinc-700 animate-pulse"></div>

            {/* Mobile actions skeleton */}
            <div className="lg:hidden flex gap-2 p-3 bg-gray-50 dark:bg-zinc-800/50">
              <div className="flex-1 h-9 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
              <div className="w-11 h-9 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
              <div className="w-11 h-9 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200 dark:border-zinc-800 pt-6">
        <div className="h-5 w-48 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mx-auto sm:mx-0"></div>
        <div className="flex justify-center sm:justify-end items-center gap-2">
          <div className="w-24 h-10 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
          <div className="w-24 h-10 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
