import { Hono } from 'hono';

interface Bindings {
  ASSETS: Fetcher;
  DB: D1Database;
}

interface LeaderboardInsert {
  name: string;
  score: number;
  population: number;
  happiness: number;
  pollution: number;
}

const app = new Hono<{ Bindings: Bindings }>();

const rateLimitWindowMs = 60_000;
const maxRequestsPerWindow = 10;
const requestBuckets = new Map<string, number[]>();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getClientKey = (request: Request) =>
  request.headers.get('cf-connecting-ip') ||
  request.headers.get('x-forwarded-for') ||
  request.headers.get('x-real-ip') ||
  'anonymous';

const isRateLimited = (clientKey: string) => {
  const now = Date.now();
  const recent = (requestBuckets.get(clientKey) || []).filter((timestamp) => now - timestamp < rateLimitWindowMs);

  recent.push(now);
  requestBuckets.set(clientKey, recent);

  return recent.length > maxRequestsPerWindow;
};

const parseLimit = (rawLimit: string | undefined) => {
  const limit = Number.parseInt(rawLimit || '10', 10);
  if (!Number.isFinite(limit)) {
    return 10;
  }

  return clamp(limit, 1, 20);
};

const validateSubmission = (payload: unknown): LeaderboardInsert | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const score = typeof candidate.score === 'number' ? candidate.score : Number(candidate.score);
  const population = typeof candidate.population === 'number' ? candidate.population : Number(candidate.population);
  const happiness = typeof candidate.happiness === 'number' ? candidate.happiness : Number(candidate.happiness);
  const pollution = typeof candidate.pollution === 'number' ? candidate.pollution : Number(candidate.pollution);

  if (!name || name.length > 24) {
    return null;
  }

  if (![score, population, happiness, pollution].every(Number.isFinite)) {
    return null;
  }

  return {
    name,
    score: clamp(Math.floor(score), 0, 1_000_000),
    population: clamp(Math.floor(population), 0, 1_000_000),
    happiness: clamp(Math.floor(happiness), 0, 1_000_000),
    pollution: clamp(Math.floor(pollution), 0, 1_000_000),
  };
};

app.get('/api/leaderboard', async (c) => {
  const limit = parseLimit(c.req.query('limit'));
  const { results } = await c.env.DB.prepare(
    `
      SELECT id, name, score, population, happiness, pollution, created_at AS timestamp
      FROM leaderboard
      ORDER BY score DESC, created_at ASC
      LIMIT ?
    `,
  )
    .bind(limit)
    .all();

  return c.json({ entries: results ?? [] });
});

app.post('/api/leaderboard', async (c) => {
  const clientKey = getClientKey(c.req.raw);
  if (isRateLimited(clientKey)) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const validated = validateSubmission(payload);
  if (!validated) {
    return c.json({ error: 'Invalid leaderboard submission' }, 400);
  }

  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `
      INSERT INTO leaderboard (id, name, score, population, happiness, pollution, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(id, validated.name, validated.score, validated.population, validated.happiness, validated.pollution, createdAt)
    .run();

  return c.json(
    {
      entry: {
        id,
        ...validated,
        timestamp: createdAt,
      },
    },
    201,
  );
});

app.notFound((c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
