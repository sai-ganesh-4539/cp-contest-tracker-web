// app/bookmarks/page.tsx
"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getMyBookmarks, Contest, ApiError } from "@/lib/api";   // <-- import ApiError
import ContestCard from "@/components/ContestCard";
import FilterBar, { FilterState } from "@/components/FilterBar";
import Header from "@/components/Header";
import { friendlyError } from "@/lib/errors";

export default function BookmarksPage() {
  return (
    <Suspense fallback={null}>
      <BookmarksInner />
    </Suspense>
  );
}

function BookmarksInner() {
  const { isAuthenticated, isReady, token, logout } = useAuth();
  const router = useRouter();

  const [bookmarks, setBookmarks] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    platform: null,
    dateRange: null,
    search: "",
  });

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBookmarks(token);
      data.sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      setBookmarks(data);
    } catch (e) {
      // Bulletproof 401 detection — works because lib/api.ts now throws ApiError
      if (e instanceof ApiError && e.status === 401) {
        logout();
        router.push("/login?next=/bookmarks&reason=expired");
        return;
      }
      const msg = e instanceof Error ? e.message : "Failed to load bookmarks";
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  }, [token, logout, router]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.push("/login?next=/bookmarks");
      return;
    }
    load();
  }, [isReady, isAuthenticated, router, load]);

  const availablePlatforms = useMemo(
    () =>
      Array.from(new Set(bookmarks.map((c) => c.platform))).filter(Boolean) as string[],
    [bookmarks]
  );

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((c) => {
      if (filters.platform && c.platform !== filters.platform) return false;
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        if (!c.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [bookmarks, filters]);

  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">My Bookmarks</h1>
          <p className="text-gray-600 dark:text-slate-400">
            Contests you&apos;ve saved to follow up on.
          </p>
        </header>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse"
              >
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded mt-8" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
            <p className="mb-3">{error}</p>
            <button
              onClick={load}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Try again
            </button>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You haven&apos;t bookmarked any contests yet.
            </p>
            <Link
              href="/"
              className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Browse contests
            </Link>
          </div>
        ) : (
          <>
            <FilterBar
              filters={filters}
              onChange={setFilters}
              availablePlatforms={availablePlatforms}
              totalCount={bookmarks.length}
              filteredCount={filteredBookmarks.length}
            />

            {filteredBookmarks.length === 0 ? (
              <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                No bookmarks match your filters.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredBookmarks.map((c) => (
                  <ContestCard key={c.id} contest={c} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}