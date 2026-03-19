import { LeaderboardEntry, LeaderboardSubmission } from '../types';

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}

interface LeaderboardCreateResponse {
  entry: LeaderboardEntry;
}

async function ensureSuccess(response: Response) {
  if (response.ok) {
    return;
  }

  let message = `Request failed with status ${response.status}`;
  try {
    const payload = (await response.json()) as { error?: string; message?: string };
    if (payload.error || payload.message) {
      message = payload.error ?? payload.message ?? message;
    }
  } catch {
    // Ignore JSON parse failures and keep the fallback message.
  }

  throw new Error(message);
}

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const response = await fetch(`/api/leaderboard?limit=${limit}`);
  await ensureSuccess(response);
  const data = (await response.json()) as LeaderboardResponse;
  return data.entries ?? [];
}

export async function submitScore(submission: LeaderboardSubmission) {
  const response = await fetch('/api/leaderboard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submission),
  });

  await ensureSuccess(response);
  const data = (await response.json()) as LeaderboardCreateResponse;
  return data.entry;
}
