# KisaanAI – Agricultural Voice Assistant

KisaanAI is a voice-first, multi-language agricultural assistant that generates contextual farming advice using **Mistral AI** (LLM), weather/market/soil signals, and optional **Sarvam AI** text-to-speech.

This repository is a **monorepo**:
- **`frontend/`**: Next.js app (UI + `POST /api/chat`)
- **`backend/`**: shared orchestration + data utilities + Prisma schema + Vitest tests

### Features

- **Voice-first UI**: browser speech recognition + audio playback
- **Context-aware advice**: combines farmer + weather + market + soil context before calling the LLM
- **Multi-language**: designed for Indian languages (Hindi/Kannada/English)
- **Local persistence**: SQLite via Prisma (dev-friendly)

### Project structure

```
KisaanAI/
├── frontend/              # Next.js app (runs the dev server)
├── backend/               # shared logic + prisma + tests
├── README-STRUCTURE.md    # monorepo notes
├── API-INTEGRATION.md     # integration details
├── TEST-GUIDE.md          # test suite docs
└── README.md              # you are here
```

### Quickstart (local)

**Prereqs**
- Node.js **18+**
- npm

**Install**

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

**Environment variables**

The dev server is started from `frontend/`, so put your runtime env in **`frontend/.env.local`**:

```bash
cd frontend
cp .env.example .env.local
```

At minimum, set:
- `MISTRAL_API_KEY` (required)
- `SARVAM_API_KEY` (optional, for TTS)

**Prisma (first time)**

```bash
cd ../backend
npm run prisma:generate
npm run prisma:migrate
```

**Run**

From the repo root:

```bash
npm run dev
```

App will be at `http://localhost:3000` and the API at `http://localhost:3000/api/chat`.

### Useful commands

- **Dev server**: `npm run dev` (runs `frontend`)
- **Easy one-command runner**: `npm run start:easy`
- **Frontend build**: `cd frontend && npm run build`
- **Frontend lint**: `cd frontend && npm run lint`
- **Backend tests**: `cd backend && npm test`
- **Backend coverage**: `cd backend && npm run test:coverage`

### Easy run script

If you want one command for first-time setup + run:

```bash
npm run start:easy
```

This script:
- installs dependencies when `node_modules` is missing
- creates `frontend/.env.local` from `frontend/.env.example` if needed
- runs Prisma generate + DB push in `backend/`
- starts the dev server

### Documentation

- **Frontend**: `frontend/README.md`
- **Backend**: `backend/README.md`
- **Repo structure**: `README-STRUCTURE.md`
- **API integration notes**: `API-INTEGRATION.md`
- **Test suite**: `TEST-GUIDE.md`
