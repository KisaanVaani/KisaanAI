#!/bin/bash

echo "🌾 KisanVaani - Quick Start Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node -v)${NC}"
echo ""

# Step 1: Backend Setup
echo -e "${YELLOW}📦 Step 1: Setting up backend...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Copying from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  IMPORTANT: Edit backend/.env and add your MISTRAL_API_KEY!${NC}"
    echo "Get your key from: https://console.mistral.ai/"
fi

# Initialize database
echo "Initializing database..."
npm run prisma:push > /dev/null 2>&1
npm run prisma:generate > /dev/null 2>&1

echo -e "${GREEN}✅ Backend setup complete!${NC}"
echo ""

# Start backend in background
echo -e "${YELLOW}🚀 Starting backend server...${NC}"
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo "Backend logs: backend.log"

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check backend.log for errors.${NC}"
    exit 1
fi

# Seed database
echo "Seeding database with government schemes..."
curl -X POST http://localhost:8000/api/schemes/seed > /dev/null 2>&1
echo -e "${GREEN}✅ Database seeded!${NC}"
echo ""

# Step 2: Frontend Setup
cd ..
echo -e "${YELLOW}📦 Step 2: Setting up frontend...${NC}"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed"
fi

echo -e "${GREEN}✅ Frontend setup complete!${NC}"
echo ""

# Start frontend
echo -e "${YELLOW}🚀 Starting frontend server...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
echo "Frontend logs: frontend.log"

echo ""
echo -e "${GREEN}=================================="
echo "🎉 Setup Complete!"
echo "==================================${NC}"
echo ""
echo -e "✅ Backend running: ${GREEN}http://localhost:8000${NC}"
echo -e "✅ Frontend running: ${GREEN}http://localhost:3000${NC}"
echo -e "✅ Database studio: Run ${YELLOW}cd backend && npm run prisma:studio${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Edit backend/.env and add your MISTRAL_API_KEY"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Scroll to 'Try Live AI Agent' and click 'Start Call'"
echo ""
echo -e "${YELLOW}🛑 To stop servers:${NC}"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${YELLOW}📊 View logs:${NC}"
echo "   tail -f backend.log"
echo "   tail -f frontend.log"
echo ""
echo "Good luck with your hackathon! 🚀🌾"
