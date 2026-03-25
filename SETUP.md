# 🚀 Complete Setup Guide - Full-Stack KisanVaani

This guide will help you set up the complete full-stack application with real backend, database, and AI integration.

## 📋 What You're Building

A production-ready AI voice advisory platform with:
- ✅ **Backend API** (Express + TypeScript)
- ✅ **Database** (Prisma + SQLite)
- ✅ **Real AI** (Mistral AI integration)
- ✅ **Voice Agent** (STT/TTS simulation)
- ✅ **Frontend** (Next.js 14)
- ✅ **WebSocket** (Real-time communication)

---

## 🎯 Quick Setup (5 Minutes)

### Step 1: Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Initialize database
npm run prisma:push
npm run prisma:generate

# Start backend (in background or new terminal)
npm run dev
```

Backend runs on: **http://localhost:8000**

### Step 2: Frontend Setup
```bash
# Go back to root
cd..

# Frontend is ready, just start it
npm run dev
```

Frontend runs on: **http://localhost:3000**

### Step 3: Seed Database
```bash
# In a new terminal
curl -X POST http://localhost:8000/api/schemes/seed
```

---

## 🔑 Environment Configuration

### Backend `.env`
Location: `backend/.env`

```env
# Mistral AI (Get from https://console.mistral.ai/)
MISTRAL_API_KEY=your_mistral_api_key_here

# Server Configuration
PORT=8000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
CORS_ORIGIN=http://localhost:3000
WS_PORT=8001
```

### Frontend `.env.local` (Optional)
Location: `.env.local` (root directory)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints Reference

### 🔥 Voice Agent (Real AI!)
```bash
# Test Mistral AI integration
POST http://localhost:8000/api/voice-agent/simulate-call
Body: {
  "phoneNumber": "9876543210",
  "farmerInput": "Is saal arhar ki kheti kaise karein?",
  "language": "hindi"
}

# Get crop advisory
POST http://localhost:8000/api/voice-agent/crop-advisory
Body: {
  "location": "Maharashtra, Pune",
  "landSize": 2,
  "language": "hindi"
}
```

### 💬 Conversations
```bash
# Start conversation
POST http://localhost:8000/api/conversations/start-call
Body: {"phoneNumber": "896", "language": "hindi"}

# Send message
POST http://localhost:8000/api/conversations/message
Body: {
  "conversationId": "uuid",
  "message": "Mausam kaisa rahega?",
  "role": "USER"
}

# End call
POST http://localhost:8000/api/conversations/end-call
Body: {"conversationId": "uuid"}
```

### 👨‍🌾 Farmers
```bash
# Create farmer
POST http://localhost:8000/api/farmers
Body: {
  "name": "Ramesh Kumar",
  "phoneNumber": "9876543210",
  "state": "Maharashtra",
  "district": "Pune",
  "landSize": 2.5
}

# Get all farmers
GET http://localhost:8000/api/farmers

# Get farmer by phone
GET http://localhost:8000/api/farmers/phone/9876543210
```

### 📜 Government Schemes
```bash
# Get all schemes
GET http://localhost:8000/api/schemes

# Match schemes for farmer
POST http://localhost:8000/api/schemes/match
Body: {"farmerId": "uuid"}

# Seed schemes (run once)
POST http://localhost:8000/api/schemes/seed
```

### 📊 Data Sources
```bash
# Weather data
GET http://localhost:8000/api/data-sources/weather/Pune

# Market prices
GET http://localhost:8000/api/data-sources/market-prices/pigeon-pea

# ICAR advisory
GET http://localhost:8000/api/data-sources/icar/advisory/wheat

# AgriStack data
GET http://localhost:8000/api/data-sources/agristack/farmer-id
```

---

## 🧪 Testing the Application

### 1. Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-26T...",
  "uptime": 123.45,
  "environment": "development"
}
```

### 2. Test Voice Agent
```bash
curl -X POST http://localhost:8000/api/voice-agent/test
```

### 3. Test Full Flow

1. Open http://localhost:3000
2. Scroll to "Try Live AI Agent" section
3. Click "Start Call"
4. Type: "Arhar daal ki kheti ke baare mein bataiye"
5. Get real AI response from Mistral!

---

## 🗄️ Database Management

### View Database
```bash
cd backend
npm run prisma:studio
```

Opens Prisma Studio at: **http://localhost:5555**

### Database Models

- **Farmer** - Farmer profiles (name, phone, location, land size)
- **Conversation** - Call sessions with status tracking
- **Message** - Individual chat messages (user/assistant)
- **SchemeMatch** - AI-matched government schemes
- **Scheme** - Government schemes database
- **CallLog** - Call metadata and recordings

### Reset Database
```bash
cd backend
rm dev.db
npm run prisma:push
npm run prisma:generate
curl -X POST http://localhost:8000/api/schemes/seed
```

---

## 🎥 Demo Your Project

### Live AI Agent Demo

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `npm run dev` (from root)
3. **Open Browser**: http://localhost:3000
4. **Navigate**: Scroll to "Try Live AI Agent"
5. **Start Call**: Click the green button
6. **Chat**: Type messages and get AI responses
7. **Show Backend**: Open http://localhost:8000/health

### Voice Agent Demo

1. Run: `curl -X POST http://localhost:8000/api/voice-agent/test`
2. Show the Hindi response from Mistral AI
3. Demonstrate real API integration

### Data Sources Demo

```bash
# Show weather data
curl http://localhost:8000/api/data-sources/weather/Bangalore

# Show market prices
curl http://localhost:8000/api/data-sources/market-prices/wheat

# Show integrated query
curl -X POST http://localhost:8000/api/data-sources/integrated-query \
  -H "Content-Type: application/json" \
  -d '{"farmerId":"test","location":"Pune","crop":"wheat"}'
```

---

## 📁 Project Architecture

```
kisaanAI/
├── backend/                      # 🔥 Real Backend API
│   ├── src/
│   │   ├── server.ts            # Express + WebSocket
│   │   ├── routes/              # API endpoints
│   │   │   ├── farmer.routes.ts
│   │   │   ├── conversation.routes.ts
│   │   │   ├── scheme.routes.ts
│   │   │   ├── voiceAgent.routes.ts
│   │   │   └── dataSource.routes.ts
│   │   └── services/
│   │       └── mistral.service.ts  # Mistral AI client
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── .env                     # Environment config
│   └── package.json
│
├── src/                         # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
│       └── sections/
│           └── LiveAgent.tsx    # Connects to backend!
│
└── README.md
```

---

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
lsof -ti:8000 | xargs kill -9
```

**Database errors:**
```bash
cd backend
rm dev.db
npm run prisma:push
npm run prisma:generate
```

**Module not found:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Cannot connect to backend:**
- Check backend is running on port 8000
- Verify CORS settings in `backend/.env`
- Check firewall settings

### Mistral AI Issues

**API key not working:**
- Verify key is correct in `backend/.env`
- Check credits at https://console.mistral.ai/
- Test with: `curl -X POST http://localhost:8000/api/voice-agent/test`

**Mock responses instead of real AI:**
- Backend falls back to mocks if API key is invalid
- Check console logs for error messages

---

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect to Railway/Render
3. Set environment variables:
   - `MISTRAL_API_KEY`
   - `DATABASE_URL` (PostgreSQL)
   - `NODE_ENV=production`
4. Deploy!

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import to Vercel
3. Set `NEXT_PUBLIC_API_URL` to your backend URL
4. Deploy!

---

## 📚 Additional Resources

- **Mistral AI Docs**: https://docs.mistral.ai/
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Express Docs**: https://expressjs.com/

---

## 🎉 You're Ready!

Run these commands to start:

```bash
# Terminal 1: Backend
cd backend && npm install && npm run prisma:push && npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Seed database
curl -X POST http://localhost:8000/api/schemes/seed
```

Then open: **http://localhost:3000**

**Good luck with your hackathon!** 🏆🌾
