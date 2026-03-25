# KisaanAI Backend

This folder contains the backend logic and utilities for KisaanAI.

## Structure
```
backend/
├── lib/                  # Backend utilities
│   ├── orchestrator.ts   # AI orchestration logic
│   ├── sarvam.ts         # Sarvam TTS integration
│   ├── data-sources.ts   # Data fetching utilities
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema file
├── tests/                # Test files
│   ├── api-chat.test.ts
│   ├── data-sources.test.ts
│   ├── orchestrator.test.ts
│   └── sarvam.test.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

## Running Tests

```bash
npm test              # Run tests once
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
```

## Usage

This backend is used by the frontend Next.js application. The frontend API routes import functions from `backend/lib/` to perform operations like:

- Orchestrating AI responses with contextual data
- Converting text to speech using Sarvam API
- Fetching weather, market prices, and crop calendar data

## Database

The application uses SQLite for local development. The database file is located at `prisma/dev.db`.
