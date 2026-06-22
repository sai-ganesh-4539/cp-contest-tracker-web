import { getUpcomingContests, Contest } from "@/lib/api";
import ContestCard from "@/components/ContestCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  let contests: Contest[] = [];
  let error: string | null = null;

  try {
    contests = await getUpcomingContests();
    contests.sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load contests";
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CP Contest Tracker
            </h1>
            <p className="text-gray-600">
              Upcoming competitive programming contests across platforms.
            </p>
          </div>
          {!error && contests.length > 0 && (
            <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">
              {contests.length} upcoming
            </span>
          )}
        </header>

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        ) : contests.length === 0 ? (
          <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
            No upcoming contests found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {contests.map((c) => (
              <ContestCard key={c.id} contest={c} />
            ))}
          </div>
        )}

        <footer className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Data from Codeforces, CodeChef, AtCoder, LeetCode & more.</span>
          <a
            href="https://cp-contest-tracker-510u.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 underline hover:text-black"
          >
            API docs
          </a>
          <a
            href="https://github.com/sai-ganesh-4539/cp-contest-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 underline hover:text-black"
          >
            Source code
          </a>
        </footer>
      </div>
    </main>
  );
}