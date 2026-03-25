# KisaanAI - Separated Frontend & Backend

This project has been reorganized into separate frontend and backend folders for better code organization and maintainability.

## Project Structure

```
KisaanAI/
├── frontend/           # Next.js frontend application
│   ├── src/
│   │   ├── app/       # Pages and API routes
│   │   └── components/ # React components
│   ├── package.json
│   └── README.md
│
├── backend/            # Backend logic and utilities
│   ├── lib/           # Business logic
│   ├── prisma/        # Database schema
│   ├── tests/         # Test files
│   ├── package.json
│   └── README.md
│
└── README.md          # This file
```

## Benefits of Separation

1. **Clear Boundaries**: Frontend UI code is separate from backend logic
2. **Independent Development**: Edit frontend without affecting backend and vice versa
3. **Better Organization**: Easy to locate and modify specific functionality
4. **Scalability**: Can be split into separate repositories if needed in the future

## Getting Started

### Option 1: Run from Frontend (Recommended)

```bash
# Install frontend dependencies
cd frontend
npm install

# Copy environment file
cp .env.example .env
# Edit .env and add your API keys

# Install backend dependencies (for Prisma)
cd ../backend
npm install
npm run prisma:generate

# Go back to frontend and run
cd ../frontend
npm run dev
```

The frontend will import backend logic automatically from `../backend/lib/`

### Option 2: Run Each Separately

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm test  # Run backend tests
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Development Workflow

- **Frontend Changes**: Work in `frontend/src/components/` and `frontend/src/app/`
- **Backend Logic**: Work in `backend/lib/`
- **Database Changes**: Modify `backend/prisma/schema.prisma`
- **Tests**: Located in `backend/tests/`

## How They Connect

The frontend Next.js API routes (`frontend/src/app/api/chat/route.ts`) import backend utilities from `backend/lib/`:

```typescript
import { getContextualPrompt } from '../../../../../../backend/lib/orchestrator';
import { textToSpeech } from '../../../../../../backend/lib/sarvam';
```

This keeps the architecture clean while maintaining a working monorepo structure.

## Environment Variables

Both frontend and backend have `.env.example` files. Required variables:

- `MISTRAL_API_KEY`: Your Mistral AI API key
- `SARVAM_API_KEY`: Your Sarvam TTS API key
- `DATABASE_URL`: Database connection string

## Documentation

- Frontend: See `frontend/README.md`
- Backend: See `backend/README.md`
- API Integration: See `API-INTEGRATION.md` (root)
- Testing: See `TEST-GUIDE.md` (root)

## Moving Forward

This structure allows you to:
- ✅ Edit frontend components without touching backend code
- ✅ Modify backend logic independently
- ✅ Run tests specifically for backend
- ✅ Eventually split into microservices if needed
- ✅ Maintain clear separation of concerns
