// app/bookmarks/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getMyBookmarks, Contest } from "@/lib/api";
import ContestCard from "@/components/ContestCard";
import Header from "@/components/Header";
import { friendlyError } from "@/lib/errors";

export default function BookmarksPage() {
  const { isAuthenticated, isReady, token } = useAuth();   // <-- add isReady
  const router = useRouter();

  const [bookmarks, setBookmarks] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(friendlyError(e instanceof Error ? e.message : "Failed to load bookmarks"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Wait for auth to be hydrated before deciding what to do
    if (!isReady) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    load();
  }, [isReady, isAuthenticated, router, load]);

  // Show nothing while auth state is loading (prevents flash of redirect)
  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookmarks</h1>
          <p className="text-gray-600">
            Contests you&apos;ve saved to follow up on.
          </p>
        </header>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl border border-slate-200 bg-white p-5 animate-pulse"
              >
                <div className="h-4 w-20 bg-slate-200 rounded mb-3" />
                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-1/2 bg-slate-100 rounded mt-8" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="mb-3">{error}</p>
            <button
              onClick={load}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Try again
            </button>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-xl text-center">
            <p className="text-slate-600 mb-4">
              You haven&apos;t bookmarked any contests yet.
            </p>
            <Link
              href="/"
              className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Browse contests
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">
                {bookmarks.length} bookmarked
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {bookmarks.map((c) => (
                <ContestCard key={c.id} contest={c} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}