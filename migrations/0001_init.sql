CREATE TABLE IF NOT EXISTS leaderboard (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  population INTEGER NOT NULL,
  happiness INTEGER NOT NULL,
  pollution INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS leaderboard_score_created_at_idx
  ON leaderboard (score DESC, created_at ASC);
