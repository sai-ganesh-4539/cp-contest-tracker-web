// components/ContestCard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bookmarkContest, unbookmarkContest, ApiError, type Contest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { friendlyError } from "@/lib/errors";
import { getGoogleCalendarUrl } from "@/lib/calendar";

const PLATFORM_STYLES: Record<string, string> = {
  codeforces:  "bg-red-100    text-red-700    border-red-200    dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  codechef:    "bg-amber-100  text-amber-700  border-amber-200  dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  atcoder:     "bg-slate-100  text-slate-700  border-slate-200  dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  leetcode:    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900",
  ctftime:     "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  kaggle:      "bg-sky-100    text-sky-700    border-sky-200    dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900",
  ac:          "bg-rose-100   text-rose-700   border-rose-200   dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
  uoj:         "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900",
  naukri:      "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900",
  cups:        "bg-blue-100   text-blue-700   border-blue-200   dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  basecamp:    "bg-teal-100   text-teal-700   border-teal-200   dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900",
  datsteam:    "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-900",
  open:        "bg-lime-100   text-lime-700   border-lime-200   dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-900",
  wincentdragonbyte: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900",
  projecteuler: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900",
  repovive:    "bg-cyan-100   text-cyan-700   border-cyan-200   dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900",
  midnightcodecup: "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
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
    PLATFORM_STYLES[platformKey] ?? "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

  const displayPlatform = contest.platform
    ? contest.platform.charAt(0).toUpperCase() + contest.platform.slice(1)
    : "Unknown";

  const href = contest.url ?? "#";
  const calUrl = getGoogleCalendarUrl(contest);

  const { isAuthenticated, token, bookmarkedIds, refreshBookmarks, logout } = useAuth();
  const router = useRouter();
  const isBookmarked = bookmarkedIds.has(contest.id);
  const [busy, setBusy] = useState(false);
  const [starError, setStarError] = useState<string | null>(null);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      // Token expired mid-session — bounce to login, preserve current page
      if (err instanceof ApiError && err.status === 401) {
        const currentPath = window.location.pathname + window.location.search;
        logout();
        router.push(`/login?next=${encodeURIComponent(currentPath)}&reason=expired`);
        return;
      }
      setStarError(
        friendlyError(err instanceof Error ? err.message : "Bookmark failed")
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(calUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
        >
          {displayPlatform}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {relative}
          </span>
          <button
            onClick={toggleBookmark}
            disabled={busy}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            aria-pressed={isBookmarked}
            title={
              !isAuthenticated
                ? "Log in to bookmark"
                : isBookmarked
                ? "Remove bookmark"
                : "Add bookmark"
            }
            className={`rounded-full p-1 transition disabled:opacity-50 ${
              isBookmarked
                ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"
                : "text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-400"
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

      <h3 className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-slate-700 dark:text-slate-100 dark:group-hover:text-slate-300">
        {contest.name}
      </h3>

      <div className="mt-auto flex items-center justify-between text-sm text-slate-600 gap-2 dark:text-slate-400">
        <div className="flex flex-col">
          <span>{absolute}</span>
          <span className="font-medium">{formatDuration(contest.duration_minutes)}</span>
        </div>
        <button
          onClick={handleCalendarClick}
          title="Add to Google Calendar"
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:border-slate-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-3.5 w-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          Calendar
        </button>
      </div>

      {starError && (
        <p className="text-xs text-red-600 mt-1 dark:text-red-400" role="alert">{starError}</p>
      )}
    </a>
  );
}