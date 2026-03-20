export interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
  population: number;
  happiness: number;
  pollution: number;
  created_at: string;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error: string;
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    throw new Error('服务器返回了不可识别的响应');
  }

  return (await response.json()) as ApiResponse<T>;
}

function getErrorMessage(response: Response, payload: ApiFailure | null, fallback: string) {
  if (payload?.error) {
    return payload.error;
  }

  if (response.status >= 500) {
    return `${fallback}，请稍后重试`;
  }

  return fallback;
}

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const response = await fetch(`/api/leaderboard?limit=${limit}`);
  const payload = await parseJson<LeaderboardEntry[]>(response);

  if (!response.ok || !payload.success) {
    throw new Error(getErrorMessage(response, payload.success ? null : payload, '排行榜加载失败'));
  }

  return payload.data;
}

export async function submitScore(payload: {
  name: string;
  score: number;
  population: number;
  happiness: number;
  pollution: number;
}): Promise<void> {
  const response = await fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJson<null>(response);

  if (!response.ok || !data.success) {
    throw new Error(getErrorMessage(response, data.success ? null : data, '成绩提交失败'));
  }
}
