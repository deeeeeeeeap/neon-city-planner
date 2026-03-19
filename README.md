# Neon City Planner

Cloudflare Workers deployment target for the Neon City Planner game. The app is a single-repo full-stack project:

- React + Vite SPA
- Hono API on the same Worker
- D1 leaderboard storage
- TailwindCSS v4 local build

## Requirements

- Node.js 20+
- npm
- Cloudflare account with `wrangler login`

## Install

```bash
npm install
```

## Local development

Start the Vite + Cloudflare development environment:

```bash
npm run dev
```

## Type check

```bash
npx tsc --noEmit
```

## Build

```bash
npm run build
```

## D1 migration

Apply the local migration:

```bash
npm run db:migrate:local
```

Apply the remote migration:

```bash
npm run db:migrate:remote
```

## Deploy

1. Update `wrangler.jsonc` with your real D1 `database_id`
2. Log in to Cloudflare:

```bash
wrangler login
```

3. Deploy:

```bash
npm run deploy
```

## Project structure

```text
index.html
index.tsx
index.css
worker.ts
wrangler.jsonc
migrations/
src/
  api/
  components/
  game/
  i18n/
  store/
  types.ts
```
