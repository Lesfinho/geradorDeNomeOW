# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Name Generator MVP — users register with a username, add names to a global pool, and draw random names. Drawn names are marked as used (`isUsed=true`).

**Stack**: Spring Boot 4.0.5 (Java 17) + React (Vite + Tailwind) + PostgreSQL. Monorepo: frontend lives in `frontend/`. Deployed as a single JAR on Railway.

Base package: `sexocom.example.demo`

## Build & Run Commands

```bash
# Backend only
./mvnw spring-boot:run

# Frontend dev (with API proxy to :8080)
cd frontend && npm run dev

# Full build (backend + frontend bundled into JAR)
./mvnw package -DskipTests

# Run the built JAR
java -jar target/demo-0.0.1-SNAPSHOT.jar

# Tests
./mvnw test
./mvnw test -Dtest=DemoApplicationTests#contextLoads
```

## Architecture

### Backend
- `model/` — JPA entities: `AppUser` (username only), `NameEntry` (name + isUsed + addedBy/drawnBy)
- `repository/` — Spring Data JPA repos. `NameEntryRepository` has a native query with `FOR UPDATE SKIP LOCKED` for race-safe random draws.
- `service/` — `UserService` (register/lookup), `NameService` (add/draw/stats)
- `controller/` — REST API under `/api/users` and `/api/names`
- `config/WebConfig` — SPA forwarding (non-API routes → `index.html`)

### Frontend (`frontend/`)
- Vite + React + Tailwind CSS (JavaScript)
- `src/api.js` — fetch wrapper for all API calls
- `src/components/` — RegisterForm, AddNameForm, DrawName, PoolStats, Header
- User stored in `localStorage` after registration (no auth tokens)
- Vite dev server proxies `/api` → `http://localhost:8080`

### API Endpoints
- `POST /api/users/register` — `{ username }` → `{ user, alreadyExisted }`
- `POST /api/names` — `{ name, userId }` → NameResponse
- `POST /api/names/draw` — `{ userId }` → `{ name, empty }`
- `GET /api/names/stats` → `{ available, total }`

### Deployment
- `frontend-maven-plugin` builds React and `maven-resources-plugin` copies `frontend/dist/` into JAR static resources
- Single JAR serves both API and frontend (no CORS needed)
- Railway env vars: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `PORT`
- `Procfile` and `system.properties` at project root for Railway
