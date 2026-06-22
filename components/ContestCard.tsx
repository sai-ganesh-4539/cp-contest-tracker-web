// components/ContestCard.tsx
import type { Contest } from "@/lib/api";

const PLATFORM_STYLES: Record<string, string> = {
  Codeforces:  "bg-red-100    text-red-700    border-red-200",
  CodeChef:    "bg-amber-100  text-amber-700  border-amber-200",
  AtCoder:     "bg-slate-100  text-slate-700  border-slate-200",
  LeetCode:    "bg-orange-100 text-orange-700 border-orange-200",
  CTFtime:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  Kaggle:      "bg-sky-100    text-sky-700    border-sky-200",
  HackerRank:  "bg-green-100  text-green-700  border-green-200",
  HackerEarth: "bg-purple-100 text-purple-700 border-purple-200",
  TopCoder:    "bg-pink-100   text-pink-700   border-pink-200",
};

function formatDuration(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "Unknown length";
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
  const badgeClass =
    PLATFORM_STYLES[contest.platform] ??
    "bg-gray-100 text-gray-700 border-gray-200";

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
          {contest.platform}
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