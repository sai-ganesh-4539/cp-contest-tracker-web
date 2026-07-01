// lib/errors.ts
export function friendlyError(error: string): string {
  if (
    error.includes("Failed to fetch") ||
    error.includes("Network error") ||
    error.includes("ERR_FAILED") ||
    error.includes("NetworkError")
  ) {
    return "Server is waking up (free tier). Please wait 30 seconds and try again.";
  }
  return error;
}

export function isWakeupError(error: string): boolean {
  return (
    error.includes("Failed to fetch") ||
    error.includes("Network error") ||
    error.includes("ERR_FAILED") ||
    error.includes("NetworkError")
  );
}