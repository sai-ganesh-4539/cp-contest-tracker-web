// app/about/page.tsx
"use client";

import Link from "next/link";
import Header from "@/components/Header";

const TECH_STACK = [
  { name: "Next.js 16", category: "Frontend", desc: "React 19 + App Router + Server Components" },
  { name: "TypeScript", category: "Language", desc: "Type-safe frontend" },
  { name: "Tailwind CSS", category: "Styling", desc: "Utility-first CSS framework" },
  { name: "FastAPI", category: "Backend", desc: "Python async web framework" },
  { name: "PostgreSQL", category: "Database", desc: "Hosted on Neon (free tier)" },
  { name: "Redis", category: "Cache", desc: "Caches contest list, rate-limits bookmarks" },
  { name: "SQLAlchemy", category: "ORM", desc: "Python SQL toolkit" },
  { name: "APScheduler", category: "Scheduler", desc: "Hourly contest fetch + 5-min reminder job" },
  { name: "Resend", category: "Email", desc: "Email API for contest reminders" },
  { name: "JWT + bcrypt", category: "Auth", desc: "Stateless auth with hashed passwords" },
  { name: "Render", category: "Backend host", desc: "FastAPI deployed as web service" },
  { name: "Vercel", category: "Frontend host", desc: "Next.js deployed with edge network" },
];

const FEATURES = [
  {
    title: "Multi-platform contest aggregation",
    desc: "Fetches upcoming contests from 17+ platforms including Codeforces, CodeChef, AtCoder, LeetCode, Kaggle, CTFtime, and more. Backend polls clist.by + Codeforces API every 6 hours.",
  },
  {
    title: "Filtering & search",
    desc: "Filter contests by platform, date range (7d / 30d / all), and free-text search across contest names. Client-side filtering for instant results.",
  },
  {
    title: "User authentication",
    desc: "JWT-based auth with bcrypt password hashing. Password policy enforces 8+ chars with uppercase, lowercase, and digit. Tokens persist in localStorage.",
  },
  {
    title: "Bookmarks",
    desc: "Star any contest to save it. Bookmarks page shows only your starred contests. Rate-limited to 10 per hour to prevent abuse.",
  },
  {
    title: "Email reminders",
    desc: "APScheduler job runs every 5 minutes. Finds bookmarks for contests starting in 50-70 minutes, sends a styled HTML email via Resend, marks them as notified.",
  },
  {
    title: "Google Calendar export",
    desc: "One-click 'Add to Calendar' button on every contest card. Generates a Google Calendar URL with pre-filled event details.",
  },
  {
    title: "Caching & rate-limiting",
    desc: "Redis caches the contest list (1-hour TTL) to keep API responses fast. Bookmark creation is rate-limited per user via Redis counters.",
  },
  {
    title: "Friendly error handling",
    desc: "Backend sleeps on free tier after 15 min idle. Frontend detects network timeouts and shows 'Server is waking up' message with a retry button instead of a confusing CORS error.",
  },
];

const ARCHITECTURE = [
  {
    step: "1",
    title: "User visits site",
    desc: "Vercel serves the Next.js app. AuthContext hydrates from localStorage.",
  },
  {
    step: "2",
    title: "Fetch contests",
    desc: "Frontend calls GET /contests/. Backend checks Redis cache first, falls back to PostgreSQL, returns JSON.",
  },
  {
    step: "3",
    title: "Background fetcher",
    desc: "APScheduler job every 6h calls Codeforces API + clist.by API, upserts contests into Postgres, clears Redis cache.",
  },
  {
    step: "4",
    title: "User signs up / logs in",
    desc: "POST /auth/register (JSON) or /auth/login (form-encoded, OAuth2PasswordRequestForm). Returns JWT access token.",
  },
  {
    step: "5",
    title: "Bookmark a contest",
    desc: "POST /contests/{id}/bookmark with Bearer token. Rate-limited via Redis. Stored in bookmarks table.",
  },
  {
    step: "6",
    title: "Email reminder",
    desc: "Every 5 min, scheduler queries bookmarks where contest starts in 50-70 min AND not yet notified. Sends Resend email, sets notified=true.",
  },
];

const LIMITATIONS = [
  "Backend on Render free tier sleeps after 15 min of inactivity. First request may take 30-60s to wake up. UptimeRobot pings /health every 5 min to minimize this.",
  "Email reminders currently send only to the verified developer email (Resend free tier). To send to any user, a custom domain needs to be verified at resend.com/domains.",
  "Contest data depends on clist.by (rate-limited free API) and Codeforces API. Occasional fetch failures are non-fatal — cached data is served.",
  "No OAuth (Google/GitHub login) yet — only email/password. Adding OAuth is on the roadmap.",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">About</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            CP Contest Tracker aggregates upcoming competitive programming contests
            across 17+ platforms into a single, filterable dashboard. Users can
            bookmark contests, get email reminders one hour before start time, and
            export them to Google Calendar.
          </p>
        </header>

        {/* Live links */}
        <section className="mb-12 p-5 bg-white rounded-xl border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Live
          </h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href="https://cp-contest-tracker-web.vercel.app"
              className="inline-block rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              Live site →
            </a>
            <a
              href="https://cp-contest-tracker-510u.onrender.com/docs"
              className="inline-block rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              API docs (FastAPI Swagger)
            </a>
            <a
              href="https://github.com/sai-ganesh-4539/cp-contest-tracker"
              className="inline-block rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              Backend repo
            </a>
            <a
              href="https://github.com/sai-ganesh-4539/cp-contest-tracker-web"
              className="inline-block rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              Frontend repo
            </a>
          </div>
        </section>

        {/* Tech stack */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Tech stack</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="p-4 bg-white rounded-lg border border-slate-200"
              >
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="font-semibold text-slate-900">{tech.name}</span>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {tech.category}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Features</h2>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-5 bg-white rounded-lg border border-slate-200"
              >
                <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">How it works</h2>
          <ol className="space-y-3">
            {ARCHITECTURE.map((item) => (
              <li
                key={item.step}
                className="flex gap-4 p-4 bg-white rounded-lg border border-slate-200"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Limitations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Known limitations
          </h2>
          <ul className="space-y-2">
            {LIMITATIONS.map((lim, i) => (
              <li
                key={i}
                className="flex gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200"
              >
                <span className="text-amber-600 flex-shrink-0">⚠</span>
                <p className="text-sm text-amber-900 leading-relaxed">{lim}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="mb-12 p-6 bg-slate-900 rounded-xl text-center">
          <h2 className="text-xl font-bold text-white mb-2">Try it out</h2>
          <p className="text-slate-300 text-sm mb-4">
            Sign up, bookmark a contest, and get an email reminder 1 hour before it starts.
          </p>
          <Link
            href="/"
            className="inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            Browse contests →
          </Link>
        </section>
        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link href="/" className="text-slate-700 underline hover:text-black">
            ← Back to contests
          </Link>
          <a
            href="https://github.com/sai-ganesh-4539/cp-contest-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-700 underline hover:text-black"
          >
            Backend repo
          </a>
          <a
            href="https://github.com/sai-ganesh-4539/cp-contest-tracker-web"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-700 underline hover:text-black"
          >
            Frontend repo
          </a>
        </footer>
      </div>
    </main>
  );
}