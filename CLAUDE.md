# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ResenhaGenerator — a name generator for a group of 9 Overwatch friends. Users register with username + 4-digit PIN, add names to a global pool (max 12 chars), and draw random names. Drawn names are marked as used. Features a Markov chain name suggestion engine and Discord webhook notifications.

**Stack**: Express + TypeScript + Prisma + React (Vite + Tailwind) + PostgreSQL. Monorepo: frontend in `frontend/`. Deployed on Render (Node) + Neon (PostgreSQL).

## Build & Run Commands

```bash
# Backend dev (requires DATABASE_URL env var)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nomegenerator" npm run dev

# Frontend dev (with API proxy to :8080)
cd frontend && npm run dev

# Build everything
npm run build:all

# Start production server
npm start

# Prisma
npx prisma generate
DATABASE_URL="..." npx prisma db push
```

## Architecture

### Backend (`src/`)
- `index.ts` — Express server, serves API + static frontend
- `prisma.ts` — PrismaClient singleton
- `auth.ts` — Token-based session auth middleware + token generator
- `discord.ts` — Discord webhook notifications
- `markov.ts` — Name suggestion engine (Markov chain + affix detection + couple blender)
- `routes/users.ts` — register, reset-pin
- `routes/names.ts` — add, draw, list all, stats, suggest

### Frontend (`frontend/`)
- Vite + React + Tailwind CSS (JavaScript), dark theme
- `src/api.js` — fetch wrapper with auth headers
- `src/gifs.js` — Roadhog GIF URL list for random backgrounds
- `src/components/GifBackground.jsx` — fullscreen GIF background with overlay
- `src/components/` — RegisterForm, AddNameForm, DrawName, PoolStats, Header, NameList, Suggestions

### API Endpoints
- `POST /api/users/register` — `{ username, pin }` → `{ user, alreadyExisted }`
- `POST /api/users/reset-pin` — `{ username, secret }` → `{ newPin }`
- `POST /api/names` — `{ name }` + Bearer token → NameResponse (max 12 chars)
- `POST /api/names/draw` — Bearer token → `{ name, empty }`
- `GET /api/names/all` — Bearer token → all names with addedBy/drawnBy
- `GET /api/names/suggest` — Bearer token → `{ suggestions, minReached, total }`
- `GET /api/names/stats` → `{ available, total }` (public)

### Auth
- 4-digit PIN per user (stored plaintext — acceptable for 9 friends)
- Random 64-char hex token generated on register/login, sent as `Authorization: Bearer <token>`
- "Forgot PIN" requires a group secret (`GROUP_SECRET` env var)

### Draw uses raw SQL with `FOR UPDATE SKIP LOCKED` for race-safe random selection.

### Deployment (Render + Neon)
- **Render**: Language Node, Build: `npm install && npm run build && cd frontend && npm install && npm run build`, Start: `npx prisma db push --accept-data-loss && npm start`
- **Neon**: Free PostgreSQL, connection string with `?sslmode=require`
- Env vars: `DATABASE_URL`, `GROUP_SECRET`, `DISCORD_WEBHOOK_URL` (optional)
