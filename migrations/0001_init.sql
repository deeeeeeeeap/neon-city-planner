CREATE TABLE leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  population INTEGER NOT NULL DEFAULT 0,
  happiness INTEGER NOT NULL DEFAULT 0,
  pollution INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_score ON leaderboard(score DESC, created_at ASC);
