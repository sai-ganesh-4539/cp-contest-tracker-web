const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://cp-contest-tracker-510u.onrender.com";

export type Contest = {
  id: string;
  platform: string;
  name: string;
  start_time: string;
  duration_minutes: number | null;
  url: string | null;
};

export async function getUpcomingContests(): Promise<Contest[]> {
  const res = await fetch(`${API_BASE}/contests/`, {
    next: { revalidate: 3600 }, // cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch contests: ${res.status}`);
  }

  return res.json();
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
  return res.json();
}