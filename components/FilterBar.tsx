// components/FilterBar.tsx
"use client";

import { useMemo } from "react";

export const PLATFORMS = [
  "codeforces",
  "codechef",
  "atcoder",
  "leetcode",
  "ctftime",
  "kaggle",
  "hackerrank",
  "hackerearth",
  "topcoder",
];

export const DATE_RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "All upcoming", days: null },
] as const;

export type FilterState = {
  platform: string | null;   // null = All
  dateRange: number | null;  // null = All upcoming
  search: string;
};

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availablePlatforms: string[];  // platforms actually present in current data
  totalCount: number;
  filteredCount: number;
}

const PLATFORM_LABELS: Record<string, string> = {
  codeforces: "Codeforces",
  codechef: "CodeChef",
  atcoder: "AtCoder",
  leetcode: "LeetCode",
  ctftime: "CTFtime",
  kaggle: "Kaggle",
  hackerrank: "HackerRank",
  hackerearth: "HackerEarth",
  topcoder: "TopCoder",
};

const PLATFORM_COLORS: Record<string, string> = {
  codeforces:  "bg-red-500    text-white    border-red-600",
  codechef:    "bg-amber-500  text-white    border-amber-600",
  atcoder:     "bg-slate-600  text-white    border-slate-700",
  leetcode:    "bg-orange-500 text-white    border-orange-600",
  ctftime:     "bg-emerald-500 text-white   border-emerald-600",
  kaggle:      "bg-sky-500    text-white    border-sky-600",
  hackerrank:  "bg-green-500  text-white    border-green-600",
  hackerearth: "bg-purple-500 text-white    border-purple-600",
  topcoder:    "bg-pink-500   text-white    border-pink-600",
};

export default function FilterBar({
  filters,
  onChange,
  availablePlatforms,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  // Show platforms that actually have contests, sorted by PLATFORMS order
  const visiblePlatforms = useMemo(() => {
    return PLATFORMS.filter((p) => availablePlatforms.includes(p));
  }, [availablePlatforms]);

  return (
    <div className="mb-6 space-y-4">
      {/* Platform chips */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter by platform"
      >
        <button
          onClick={() => onChange({ ...filters, platform: null })}
          aria-pressed={filters.platform === null}
          className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
            filters.platform === null
              ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
              : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
          }`}
        >
          All
        </button>
        {visiblePlatforms.map((p) => {
          const isActive = filters.platform === p;
          const colorClass = PLATFORM_COLORS[p] ?? "bg-gray-500 text-white border-gray-600";
          return (
            <button
              key={p}
              onClick={() => onChange({ ...filters, platform: isActive ? null : p })}
              aria-pressed={isActive}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                isActive
                  ? colorClass
                  : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
              }`}
            >
              {PLATFORM_LABELS[p] ?? p}
            </button>
          );
        })}
      </div>

      {/* Date range + search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div
          className="flex items-center gap-2"
          role="group"
          aria-label="Filter by date range"
        >
          <span className="text-sm text-slate-500 dark:text-slate-400">Show:</span>
          {DATE_RANGES.map((range) => {
            const isActive = filters.dateRange === range.days;
            return (
              <button
                key={range.label}
                onClick={() => onChange({ ...filters, dateRange: range.days })}
                aria-pressed={isActive}
                className={`rounded-md px-2.5 py-1 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search contests..."
          aria-label="Search contests by name"
          className="w-full sm:w-64 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
        />
      </div>

      {/* Result count */}
      <div
        className="text-xs text-slate-500 dark:text-slate-400"
        role="status"
        aria-live="polite"
      >
        Showing {filteredCount} of {totalCount} contests
      </div>
    </div>
  );
}