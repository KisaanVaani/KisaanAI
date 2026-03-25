#!/bin/bash

echo "🧹 Cleanup Script - Removing Old Duplicate Files"
echo "================================================"
echo ""
echo "This will remove the following old files/folders:"
echo ""
echo "Folders:"
echo "  - src/ (now in frontend/src/ and backend/lib/)"
echo "  - tests/ (now in backend/tests/)"
echo "  - prisma/ (now in backend/prisma/)"
echo "  - node_modules/ (will be in frontend/ and backend/)"
echo "  - .next/ (will regenerate in frontend/)"
echo ""
echo "Config files:"
echo "  - next.config.mjs (now in frontend/)"
echo "  - tailwind.config.ts (now in frontend/)"
echo "  - postcss.config.mjs (now in frontend/)"
echo "  - tsconfig.json (now in frontend/ and backend/)"
echo "  - vitest.config.ts (now in backend/)"
echo "  - next-env.d.ts (now in frontend/)"
echo "  - package.json (now in frontend/ and backend/)"
echo "  - package-lock.json (now in frontend/ and backend/)"
echo ""
echo "⚠️  IMPORTANT: This will NOT delete:"
echo "  - frontend/ and backend/ folders"
echo "  - .git/ folder"
echo "  - .env.example"
echo "  - .gitignore"
echo "  - Documentation files (*.md)"
echo "  - result*.json files"
echo ""
read -p "Do you want to proceed? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Cleanup cancelled."
    exit 1
fi

echo ""
echo "🗑️  Removing old files..."
echo ""

# Remove folders
if [ -d "src" ]; then
    echo "  Removing src/"
    rm -rf src/
fi

if [ -d "tests" ]; then
    echo "  Removing tests/"
    rm -rf tests/
fi

if [ -d "prisma" ]; then
    echo "  Removing prisma/"
    rm -rf prisma/
fi

if [ -d "node_modules" ]; then
    echo "  Removing node_modules/"
    rm -rf node_modules/
fi

if [ -d ".next" ]; then
    echo "  Removing .next/"
    rm -rf .next/
fi

# Remove config files
if [ -f "next.config.mjs" ]; then
    echo "  Removing next.config.mjs"
    rm next.config.mjs
fi

if [ -f "tailwind.config.ts" ]; then
    echo "  Removing tailwind.config.ts"
    rm tailwind.config.ts
fi

if [ -f "postcss.config.mjs" ]; then
    echo "  Removing postcss.config.mjs"
    rm postcss.config.mjs
fi

if [ -f "tsconfig.json" ]; then
    echo "  Removing tsconfig.json"
    rm tsconfig.json
fi

if [ -f "vitest.config.ts" ]; then
    echo "  Removing vitest.config.ts"
    rm vitest.config.ts
fi

if [ -f "next-env.d.ts" ]; then
    echo "  Removing next-env.d.ts"
    rm next-env.d.ts
fi

if [ -f "package.json" ]; then
    echo "  Removing package.json"
    rm package.json
fi

if [ -f "package-lock.json" ]; then
    echo "  Removing package-lock.json"
    rm package-lock.json
fi

echo ""
echo "✅ Cleanup Complete!"
echo ""
echo "📁 Your project structure is now clean:"
echo "   KisaanAI/"
echo "   ├── frontend/  (Next.js app)"
echo "   ├── backend/   (Backend logic)"
echo "   └── Documentation files"
echo ""
echo "🚀 Next Steps:"
echo "   1. cd frontend && npm install"
echo "   2. cd ../backend && npm install && npm run prisma:generate"
echo "   3. cd ../frontend && npm run dev"
echo ""
