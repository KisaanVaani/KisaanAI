# KisaanAI

Voice-first agricultural assistant for Indian farmers, powered by Mistral AI, live context data, and optional Sarvam TTS.

## What This Project Includes

- `frontend/` - Next.js app (UI + API routes)
- `backend/` - shared orchestration logic, Prisma, tests
- `scripts/run-project.sh` - one-command local setup + run

## Core Features

- Voice-first interaction flow
- Context-aware crop guidance (weather, market, soil context)
- Multi-language conversation support
- Local persistence with Prisma + SQLite
- Built-in API health check endpoint

## Quick Start

### 1) Prerequisites

- Node.js 18+
- npm

### 2) Install dependencies

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 3) Configure environment

Create `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

Required:

- `MISTRAL_API_KEY`

Optional:

- `SARVAM_API_KEY`
- `DATABASE_URL`
- Weather provider keys

### 4) Prepare Prisma

```bash
cd ../backend
npm run prisma:generate
npm run prisma:migrate
```

### 5) Run locally

From repo root:

```bash
npm run dev
```

App: `http://localhost:3000`  
Chat API: `http://localhost:3000/api/chat`  
Health API: `http://localhost:3000/api/health`

## Easy One-Command Run

Use this for first-time local setup:

```bash
npm run start:easy
```

It will:

- install missing dependencies
- create `frontend/.env.local` if missing
- run Prisma generate + DB push
- start the frontend dev server

## Health Check

`GET /api/health` validates runtime configuration and returns:

- overall readiness (`ok`, `ready`)
- missing required env vars
- masked env preview for required/optional keys

Status codes:

- `200` when required keys are configured
- `503` when required keys are missing

## Common Commands

- `npm run dev` - start frontend dev server from repo root
- `npm run start:easy` - setup + run
- `cd frontend && npm run build` - production build
- `cd backend && npm test` - backend tests
- `cd backend && npm run test:coverage` - coverage

## Troubleshooting

- `401 Unauthorized` on chat: verify `MISTRAL_API_KEY` in `frontend/.env.local`
- Missing chunk / `Cannot find module './xxx.js'`: stop dev server, delete `frontend/.next`, restart
- `EMFILE: too many open files`: restart and use the existing polling-based dev script

## Additional Docs

- `frontend/README.md`
- `backend/README.md`
- `README-STRUCTURE.md`
- `API-INTEGRATION.md`
- `TEST-GUIDE.md`
