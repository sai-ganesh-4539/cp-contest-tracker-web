// app/page.tsx
"use client";

import { Suspense, useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getUpcomingContests, Contest } from "@/lib/api";
import ContestCard from "@/components/ContestCard";
import FilterBar, { FilterState } from "@/components/FilterBar";
import Header from "@/components/Header";
import { friendlyError } from "@/lib/errors";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fix #6: initialize filters from URL on first render
  const [filters, setFilters] = useState<FilterState>(() => {
    const platform = searchParams.get("platform");
    const days = searchParams.get("days");
    const search = searchParams.get("search");
    return {
      platform: platform || null,
      dateRange: days ? Number(days) : 30,
      search: search || "",
    };
  });

  // fix #8: debounce search for filtering (input stays responsive)
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 200);
    return () => clearTimeout(t);
  }, [filters.search]);

  // fix #6: reflect filter changes into URL (skip initial mount to avoid clobbering)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (filters.platform) params.set("platform", filters.platform);
    if (filters.dateRange !== null) params.set("days", String(filters.dateRange));
    if (filters.search) params.set("search", filters.search);
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }, [filters, router]);

  const loadContests = useCallback(() => {
    setLoading(true);
    setError(null);
    getUpcomingContests()
      .then((data) => {
        data.sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        const now = Date.now();
        const upcoming = data.filter(
          (c) => new Date(c.start_time).getTime() > now
        );
        setContests(upcoming);
        setLoading(false);
      })
      .catch((e) => {
        setError(friendlyError(e instanceof Error ? e.message : "Failed to load contests"));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadContests();
  }, [loadContests]);

  const availablePlatforms = useMemo(() => {
    return Array.from(new Set(contests.map((c) => c.platform))).filter(Boolean) as string[];
  }, [contests]);

  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      if (filters.platform && c.platform !== filters.platform) return false;
      if (filters.dateRange !== null) {
        const contestTime = new Date(c.start_time).getTime();
        const now = Date.now();
        const maxTime = now + filters.dateRange * 24 * 60 * 60 * 1000;
        if (contestTime > maxTime) return false;
      }
      // fix #8: filter on debounced value, not the live input
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        if (!c.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [contests, filters.platform, filters.dateRange, debouncedSearch]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-slate-100">
              CP Contest Tracker
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              Upcoming competitive programming contests across platforms.
            </p>
          </div>
          {!loading && !error && contests.length > 0 && (
            <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white dark:bg-white dark:text-slate-900">
              {contests.length} upcoming
            </span>
          )}
        </header>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl border border-slate-200 bg-white p-5 animate-pulse dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-4 w-20 bg-slate-200 rounded mb-3 dark:bg-slate-700" />
                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2 dark:bg-slate-700" />
                <div className="h-3 w-1/2 bg-slate-100 rounded mt-8 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
            <p className="mb-3">{error}</p>
            <button
              onClick={loadContests}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <FilterBar
              filters={filters}
              onChange={setFilters}
              availablePlatforms={availablePlatforms}
              totalCount={contests.length}
              filteredCount={filteredContests.length}
            />

            {filteredContests.length === 0 ? (
              <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                No contests match your filters. Try changing the date range or platform.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredContests.map((c) => (
                  <ContestCard key={c.id} contest={c} />
                ))}
              </div>
            )}
          </>
        )}

        <footer className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1 dark:border-slate-800 dark:text-slate-500">
          <span>Data from Codeforces, CodeChef, AtCoder, LeetCode & more.</span>
          <Link
            href="/about"
            className="text-gray-700 underline hover:text-black dark:text-slate-300 dark:hover:text-white"
          >
            About
          </Link>
          <a
            href="https://cp-contest-tracker-510u.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 underline hover:text-black dark:text-slate-300 dark:hover:text-white"
          >
            API docs
          </a>
          <a
            href="https://github.com/sai-ganesh-4539/cp-contest-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 underline hover:text-black dark:text-slate-300 dark:hover:text-white"
          >
            Source code
          </a>
        </footer>
      </div>
    </main>
  );
}