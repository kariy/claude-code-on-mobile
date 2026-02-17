import type { SessionListResponse, SessionHistoryResponse } from "@/types/api";

export async function fetchSessions(
  refresh?: boolean,
): Promise<SessionListResponse> {
  const qs = refresh ? "?refresh=1" : "";
  const res = await fetch("/v1/sessions" + qs);
  if (!res.ok) throw new Error("Failed to fetch sessions: " + res.status);
  return res.json();
}

export async function fetchHistory(
  sessionId: string,
  encodedCwd?: string,
): Promise<SessionHistoryResponse> {
  const qs = encodedCwd
    ? "?encoded_cwd=" + encodeURIComponent(encodedCwd)
    : "";
  const res = await fetch(
    "/v1/sessions/" + encodeURIComponent(sessionId) + "/history" + qs,
  );
  if (!res.ok) throw new Error("Failed to fetch history: " + res.status);
  return res.json();
}
