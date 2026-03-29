# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Name Generator MVP — users register with a username, add names to a global pool, and draw random names. Drawn names are marked as used (`isUsed=true`).

**Stack**: Express + TypeScript + Prisma + React (Vite + Tailwind) + PostgreSQL. Monorepo: frontend lives in `frontend/`. Deployed on Render as a single Node service.

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

# Prisma: generate client
npx prisma generate

# Prisma: push schema to database
DATABASE_URL="..." npx prisma db push
```

## Architecture

### Backend (`src/`)
- `index.ts` — Express server, serves API + static frontend
- `prisma.ts` — PrismaClient singleton
- `routes/users.ts` — `POST /api/users/register`
- `routes/names.ts` — `POST /api/names`, `POST /api/names/draw`, `GET /api/names/stats`
- `prisma/schema.prisma` — AppUser + NameEntry models

### Frontend (`frontend/`)
- Vite + React + Tailwind CSS (JavaScript)
- `src/api.js` — fetch wrapper for all API calls
- `src/components/` — RegisterForm, AddNameForm, DrawName, PoolStats, Header
- User stored in `localStorage` after registration
- Vite dev server proxies `/api` → `http://localhost:8080`

### API Endpoints
- `POST /api/users/register` — `{ username }` → `{ user, alreadyExisted }`
- `POST /api/names` — `{ name, userId }` → NameResponse
- `POST /api/names/draw` — `{ userId }` → `{ name, empty }`
- `GET /api/names/stats` → `{ available, total }`

### Draw uses raw SQL with `FOR UPDATE SKIP LOCKED` for race-safe random selection.

### Deployment (Render)
- Language: Node
- Build command: `npm install && npm run build && cd frontend && npm install && npm run build`
- Start command: `npm start`
- Env var: `DATABASE_URL` (Render PostgreSQL internal URL)
