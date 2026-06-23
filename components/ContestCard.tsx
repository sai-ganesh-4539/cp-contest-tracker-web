// components/ContestCard.tsx
import type { Contest } from "@/lib/api";

const PLATFORM_STYLES: Record<string, string> = {
  // Major CP platforms
  codeforces:  "bg-red-100    text-red-700    border-red-200",
  codechef:    "bg-amber-100  text-amber-700  border-amber-200",
  atcoder:     "bg-slate-100  text-slate-700  border-slate-200",
  leetcode:    "bg-orange-100 text-orange-700 border-orange-200",
  // CTF / security
  ctftime:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  // Data / ML
  kaggle:      "bg-sky-100    text-sky-700    border-sky-200",
  // Chinese platforms
  ac:          "bg-rose-100   text-rose-700   border-rose-200",
  uoj:         "bg-violet-100 text-violet-700 border-violet-200",
  naukri:      "bg-indigo-100 text-indigo-700 border-indigo-200",
  // Russian / Eastern European
  cups:        "bg-blue-100   text-blue-700   border-blue-200",
  basecamp:    "bg-teal-100   text-teal-700   border-teal-200",
  datsteam:    "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  // Other
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
    PLATFORM_STYLES[platformKey] ??
    "bg-gray-100 text-gray-700 border-gray-200";

  // Capitalize platform name for display: "codeforces" → "Codeforces"
  const displayPlatform = contest.platform
    ? contest.platform.charAt(0).toUpperCase() + contest.platform.slice(1)
    : "Unknown";

  const href = contest.url ?? "#";

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
        <span className="text-xs font-medium text-slate-500">
          {relative}
        </span>
      </div>

      <h3 className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-slate-700">
        {contest.name}
      </h3>

      <div className="mt-auto flex items-center justify-between text-sm text-slate-600">
        <span>{absolute}</span>
        <span className="font-medium">{formatDuration(contest.duration_minutes)}</span>
      </div>
    </a>
  );
}