#!/bin/bash

echo "🔍 Verifying Frontend & Backend Separation..."
echo ""

# Check frontend structure
echo "📁 Frontend Structure:"
if [ -d "frontend/src/app" ]; then
    echo "  ✓ frontend/src/app"
else
    echo "  ✗ frontend/src/app (MISSING)"
fi

if [ -d "frontend/src/components" ]; then
    echo "  ✓ frontend/src/components"
else
    echo "  ✗ frontend/src/components (MISSING)"
fi

if [ -f "frontend/package.json" ]; then
    echo "  ✓ frontend/package.json"
else
    echo "  ✗ frontend/package.json (MISSING)"
fi

if [ -f "frontend/tsconfig.json" ]; then
    echo "  ✓ frontend/tsconfig.json"
else
    echo "  ✗ frontend/tsconfig.json (MISSING)"
fi

echo ""

# Check backend structure
echo "📁 Backend Structure:"
if [ -d "backend/lib" ]; then
    echo "  ✓ backend/lib"
else
    echo "  ✗ backend/lib (MISSING)"
fi

if [ -d "backend/prisma" ]; then
    echo "  ✓ backend/prisma"
else
    echo "  ✗ backend/prisma (MISSING)"
fi

if [ -d "backend/tests" ]; then
    echo "  ✓ backend/tests"
else
    echo "  ✗ backend/tests (MISSING)"
fi

if [ -f "backend/package.json" ]; then
    echo "  ✓ backend/package.json"
else
    echo "  ✗ backend/package.json (MISSING)"
fi

echo ""

# Check critical files
echo "📄 Critical Files:"
if [ -f "backend/lib/orchestrator.ts" ]; then
    echo "  ✓ backend/lib/orchestrator.ts"
else
    echo "  ✗ backend/lib/orchestrator.ts (MISSING)"
fi

if [ -f "backend/lib/sarvam.ts" ]; then
    echo "  ✓ backend/lib/sarvam.ts"
else
    echo "  ✗ backend/lib/sarvam.ts (MISSING)"
fi

if [ -f "backend/lib/data-sources.ts" ]; then
    echo "  ✓ backend/lib/data-sources.ts"
else
    echo "  ✗ backend/lib/data-sources.ts (MISSING)"
fi

if [ -f "frontend/src/app/api/chat/route.ts" ]; then
    echo "  ✓ frontend/src/app/api/chat/route.ts"
else
    echo "  ✗ frontend/src/app/api/chat/route.ts (MISSING)"
fi

echo ""
echo "✅ Verification Complete!"
echo ""
echo "📚 Next Steps:"
echo "  1. cd frontend && npm install"
echo "  2. cd ../backend && npm install && npm run prisma:generate"
echo "  3. cd ../frontend && npm run dev"
echo ""
echo "📖 See SEPARATION-SUMMARY.md for detailed information"
