# KisaanAI Frontend

This folder contains the Next.js frontend application for KisaanAI.

## Structure
```
frontend/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── api/          # API routes
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   └── sections/     # Page sections
│   └── lib/              # Frontend utilities
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
└── postcss.config.mjs
```

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Building for Production

```bash
npm run build
npm start
```

## Note

The frontend API routes import backend logic from `../backend/lib/`. Make sure the backend folder is present at the same level as the frontend folder.
