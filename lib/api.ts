// lib/api.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://cp-contest-tracker-510u.onrender.com";

export type Contest = {
  id: string;
  platform: string;
  name: string;
  start_time: string;
  duration_minutes: number | null;
  url: string | null;
};

// Helper: backend returns timezone-naive UTC strings. Append Z so the
// browser interprets them as UTC instead of local time.
function normalizeContest(c: Contest): Contest {
  if (!c.start_time.endsWith("Z")) {
    return { ...c, start_time: c.start_time + "Z" };
  }
  return c;
}

export async function getUpcomingContests(): Promise<Contest[]> {
  const res = await fetch(`${API_BASE}/contests/`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch contests: ${res.status}`);
  const data = await res.json();
  return data.map(normalizeContest);
}

// ===== Bookmarks =====

export async function bookmarkContest(contestId: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/contests/${contestId}/bookmark`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Bookmark failed (${res.status})`);
  }
}

export async function unbookmarkContest(contestId: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/contests/${contestId}/bookmark`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Unbookmark failed (${res.status})`);
  }
}

export async function getMyBookmarks(token: string): Promise<Contest[]> {
  const res = await fetch(`${API_BASE}/me/bookmarks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Fetch bookmarks failed (${res.status})`);
  }
  const data = await res.json();
  // Backend returns BookmarkResponse[] — extract the nested contest object
  const contests: Contest[] = data.map((item: { contest: Contest }) => item.contest);
  return contests.map(normalizeContest);
}