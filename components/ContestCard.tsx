// components/ContestCard.tsx
"use client";

import { useState } from "react";
import type { Contest } from "@/lib/api";
import { bookmarkContest, unbookmarkContest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { friendlyError } from "@/lib/errors";

const PLATFORM_STYLES: Record<string, string> = {
  codeforces:  "bg-red-100    text-red-700    border-red-200",
  codechef:    "bg-amber-100  text-amber-700  border-amber-200",
  atcoder:     "bg-slate-100  text-slate-700  border-slate-200",
  leetcode:    "bg-orange-100 text-orange-700 border-orange-200",
  ctftime:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  kaggle:      "bg-sky-100    text-sky-700    border-sky-200",
  ac:          "bg-rose-100   text-rose-700   border-rose-200",
  uoj:         "bg-violet-100 text-violet-700 border-violet-200",
  naukri:      "bg-indigo-100 text-indigo-700 border-indigo-200",
  cups:        "bg-blue-100   text-blue-700   border-blue-200",
  basecamp:    "bg-teal-100   text-teal-700   border-teal-200",
  datsteam:    "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  open:        "bg-lime-100   text-lime-700   border-lime-200",
  wincentdragonbyte: "bg-purple-100 text-purple-700 border-purple-200",
  projecteuler: "bg-yellow-100 text-yellow-800 border-yellow-200",
  repovive:    "bg-cyan-100   text-cyan-700   border-cyan-200",
  midnightcodecup: "bg-stone-100 text-stone-700 border-stone-200",
};

function formatDuration(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "Self-paced";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatStart(iso: string): { absolute: string; relative: string } {
  const date = new Date(iso);
  const absolute = date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const diffMs = date.getTime() - Date.now();
  const diffH = Math.round(diffMs / (1000 * 60 * 60));
  let relative: string;
  if (diffH < 0) relative = "Already started";
  else if (diffH < 1) relative = "Starting soon";
  else if (diffH < 24) relative = `in ${diffH}h`;
  else relative = `in ${Math.floor(diffH / 24)}d ${diffH % 24}h`;
  return { absolute, relative };
}

export default function ContestCard({ contest }: { contest: Contest }) {
  const { absolute, relative } = formatStart(contest.start_time);
  const platformKey = (contest.platform || "").toLowerCase();
  const badgeClass =
    PLATFORM_STYLES[platformKey] ?? "bg-gray-100 text-gray-700 border-gray-200";

  const displayPlatform = contest.platform
    ? contest.platform.charAt(0).toUpperCase() + contest.platform.slice(1)
    : "Unknown";

  const href = contest.url ?? "#";

  // Bookmark state
  const { isAuthenticated, token, bookmarkedIds, refreshBookmarks } = useAuth();
  const isBookmarked = bookmarkedIds.has(contest.id);
  const [busy, setBusy] = useState(false);
  const [starError, setStarError] = useState<string | null>(null);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();      // don't trigger card link
    e.stopPropagation();     // don't bubble up

    if (!isAuthenticated || !token) {
      setStarError("Log in to bookmark contests");
      return;
    }
    if (busy) return;

    setBusy(true);
    setStarError(null);
    try {
      if (isBookmarked) {
        await unbookmarkContest(contest.id, token);
      } else {
        await bookmarkContest(contest.id, token);
      }
      await refreshBookmarks();
    } catch (err) {
      setStarError(
        friendlyError(err instanceof Error ? err.message : "Bookmark failed")
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
        >
          {displayPlatform}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">{relative}</span>
          <button
            onClick={toggleBookmark}
            disabled={busy}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            title={
              !isAuthenticated
                ? "Log in to bookmark"
                : isBookmarked
                ? "Remove bookmark"
                : "Add bookmark"
            }
            className={`rounded-full p-1 transition disabled:opacity-50 ${
              isBookmarked
                ? "text-yellow-500 hover:bg-yellow-50"
                : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-slate-700">
        {contest.name}
      </h3>

      <div className="mt-auto flex items-center justify-between text-sm text-slate-600">
        <span>{absolute}</span>
        <span className="font-medium">{formatDuration(contest.duration_minutes)}</span>
      </div>

      {starError && (
        <p className="text-xs text-red-600 mt-1">{starError}</p>
      )}
    </a>
  );
}