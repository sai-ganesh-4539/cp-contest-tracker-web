// lib/calendar.ts
import type { Contest } from "./api";

/**
 * Generate a Google Calendar "add event" URL for a contest.
 * Format: https://calendar.google.com/calendar/render?action=TEMPLATE&...
 */
export function getGoogleCalendarUrl(contest: Contest): string {
  const startDate = new Date(contest.start_time);
  const endDate = new Date(
    startDate.getTime() + (contest.duration_minutes ?? 60) * 60 * 1000
  );

  // Google Calendar expects dates in YYYYMMDDTHHMMSSZ format (UTC)
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${contest.name} (${contest.platform})`,
    dates: `${fmt(startDate)}/${fmt(endDate)}`,
    details: `Competitive programming contest on ${contest.platform}.\n\n${contest.url ?? ""}`,
    location: contest.url ?? "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}