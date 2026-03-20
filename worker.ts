import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

type LeaderboardPayload = {
  name: string;
  score: number;
  population: number;
  happiness: number;
  pollution: number;
};

const app = new Hono<{ Bindings: Bindings }>();

function jsonError(message: string, status: number) {
  return Response.json({ success: false, error: message }, { status });
}

function normalizeLimit(rawValue: string | undefined) {
  const parsed = Number.parseInt(rawValue ?? '10', 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 10;
  }

  return Math.min(parsed, 100);
}

function validatePayload(body: unknown): LeaderboardPayload | string {
  if (typeof body !== 'object' || body === null) {
    return '请求体必须是 JSON 对象';
  }

  const payload = body as Partial<LeaderboardPayload>;
  const normalizedName = payload.name?.trim();

  if (!normalizedName || normalizedName.length < 2 || normalizedName.length > 20) {
    return '玩家名称长度需要在 2 到 20 个字符之间';
  }

  const metrics = {
    score: payload.score,
    population: payload.population,
    happiness: payload.happiness,
    pollution: payload.pollution,
  };

  for (const [key, value] of Object.entries(metrics)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return `${key} 必须是有效数字`;
    }

    if (value < 0) {
      return `${key} 不能为负数`;
    }
  }

  if (
    metrics.score > 1_000_000 ||
    metrics.population > 1_000_000 ||
    metrics.happiness > 1_000_000 ||
    metrics.pollution > 1_000_000
  ) {
    return '分数字段超出允许范围';
  }

  return {
    name: normalizedName,
    score: Math.floor(metrics.score),
    population: Math.floor(metrics.population),
    happiness: Math.floor(metrics.happiness),
    pollution: Math.floor(metrics.pollution),
  };
}

app.get('/api/leaderboard', async (c) => {
  const limit = normalizeLimit(c.req.query('limit'));

  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, name, score, population, happiness, pollution, created_at
       FROM leaderboard
       ORDER BY score DESC, created_at ASC
       LIMIT ?`,
    )
      .bind(limit)
      .all();

    return c.json({ success: true, data: results });
  } catch (error) {
    console.error('Leaderboard fetch failed', error);
    return jsonError('排行榜读取失败', 500);
  }
});

app.post('/api/leaderboard', async (c) => {
  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return jsonError('请求体不是合法 JSON', 400);
  }

  const payload = validatePayload(body);

  if (typeof payload === 'string') {
    return jsonError(payload, 400);
  }

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO leaderboard (name, score, population, happiness, pollution)
       VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(
        payload.name,
        payload.score,
        payload.population,
        payload.happiness,
        payload.pollution,
      )
      .run();

    if (!result.success) {
      return jsonError('排行榜写入失败', 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Leaderboard submit failed', error);
    return jsonError('排行榜写入失败', 500);
  }
});

export default app;
