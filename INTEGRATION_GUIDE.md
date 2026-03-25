# 🎯 COMPLETE BACKEND + FRONTEND INTEGRATION GUIDE

## What I Built For You

I've transformed your frontend demo into a **REAL FULL-STACK APPLICATION** with:

### ✅ Real Backend API
- Express.js server with TypeScript
- RESTful API endpoints
- WebSocket for real-time communication
- Runs on `http://localhost:8000`

### ✅ Real Database
- Prisma ORM with SQLite
- 6 database models (Farmer, Conversation, Message, Scheme, etc.)
- Full CRUD operations
- View data with Prisma Studio

### ✅ Real AI Integration
- Mistral AI Large model integration
- Actual API calls (not mocked!)
- Intelligent crop advisory
- Government scheme matching with AI

### ✅ Voice Agent Simulation
- STT/TTS workflow endpoints
- Conversation history tracking
- Real-time message streaming
- Multi-language support

### ✅ Mock Data Sources
- AgriStack API simulation
- IMD Weather API
- ICAR Crop Advisory
- Agmarknet Market Prices

---

## 📂 What Was Added

### New Backend Directory Structure
```
backend/
├── src/
│   ├── server.ts                    # Main Express server + WebSocket
│   ├── routes/
│   │   ├── farmer.routes.ts         # Farmer CRUD operations
│   │   ├── conversation.routes.ts   # Chat & conversation API
│   │   ├── scheme.routes.ts         # Government schemes
│   │   ├── voiceAgent.routes.ts     # Voice agent simulation
│   │   └── dataSource.routes.ts     # Mock data sources
│   └── services/
│       └── mistral.service.ts       # Mistral AI client
├── prisma/
│   └── schema.prisma                # Database schema
├── .env                             # Environment config
├── package.json
├── tsconfig.json
└── README.md
```

### Updated Frontend
- `src/components/sections/LiveAgent.tsx` - Now connects to real backend!
- Real API calls instead of mocks
- Live conversation with Mistral AI

---

## 🚀 Quick Start (Copy-Paste)

### Option 1: Manual Setup

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run prisma:push
npm run prisma:generate
npm run dev
```

**Terminal 2 - Frontend:**
```bash
# From project root
npm run dev
```

**Terminal 3 - Seed Data:**
```bash
curl -X POST http://localhost:8000/api/schemes/seed
```

### Option 2: Quick Start Script
```bash
chmod +x start.sh
./start.sh
```

---

## 🔑 IMPORTANT: Add Your API Keys

### 1. Mistral AI (Required for Real AI)
```bash
# Edit backend/.env
MISTRAL_API_KEY=your_actual_mistral_key_here
```

Get your key: https://console.mistral.ai/

### 2. Without API Key
The backend will work with **mock responses** if no key is provided.
You'll see warnings in logs but everything else works!

---

## 🧪 Test Your Setup

### 1. Check Backend Health
```bash
curl http://localhost:8000/health
```

Expected:
```json
{
  "status": "ok",
  "uptime": 123.45,
  "environment": "development"
}
```

### 2. Test Voice Agent
```bash
curl -X POST http://localhost:8000/api/voice-agent/test
```

Should return a conversation with AI responses!

### 3. Test Live Agent (Browser)
1. Open http://localhost:3000
2. Scroll to "Try Live AI Agent"
3. Click "Start Call"
4. Type: "Arhar daal ki kheti ke baare mein bataiye"
5. Get real AI response!

---

## 📡 API Endpoints You Can Use

### Conversations
```bash
# Start conversation
POST http://localhost:8000/api/conversations/start-call
Body: {"phoneNumber": "896", "language": "hindi"}

# Send message
POST http://localhost:8000/api/conversations/message
Body: {
  "conversationId": "conversation-id-from-start-call",
  "message": "Mausam kaisa rahega?",
  "role": "USER"
}
```

### Voice Agent
```bash
# Simulate voice call
POST http://localhost:8000/api/voice-agent/simulate-call
Body: {
  "phoneNumber": "9876543210",
  "farmerInput": "Is saal kya ugaao?",
  "language": "hindi"
}
```

### Farmers
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
```

### Government Schemes
```bash
# Get all schemes
GET http://localhost:8000/api/schemes

# Match schemes for a farmer
POST http://localhost:8000/api/schemes/match
Body: {"farmerId": "farmer-uuid"}
```

### Data Sources (Mock)
```bash
# Weather
GET http://localhost:8000/api/data-sources/weather/Pune

# Market Prices
GET http://localhost:8000/api/data-sources/market-prices/wheat

# ICAR Advisory
GET http://localhost:8000/api/data-sources/icar/advisory/rice
```

---

## 🗄️ Database Access

### View Database
```bash
cd backend
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555`

### Database Models
- **Farmer** - Farmer profiles
- **Conversation** - Call sessions
- **Message** - Chat messages
- **SchemeMatch** - Matched schemes
- **Scheme** - Government schemes
- **CallLog** - Call logs

---

## 📱 Frontend Integration

The Live Agent component now connects to your real backend:

```typescript
// src/components/sections/LiveAgent.tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Start call - real API
const response = await fetch(`${API_URL}/api/conversations/start-call`, {
  method: 'POST',
  body: JSON.stringify({ phoneNumber: '896', language: 'hindi' })
})

// Send message - real AI response
const response = await fetch(`${API_URL}/api/conversations/message`, {
  method: 'POST',
  body: JSON.stringify({ conversationId, message, role: 'USER' })
})
```

---

## 🎥 Demo Checklist for Hackathon

### 1. Show Backend is Running
```bash
curl http://localhost:8000/health
```

### 2. Show Real AI Integration
```bash
curl -X POST http://localhost:8000/api/voice-agent/test
```
Point out the Hindi response from Mistral AI!

### 3. Show Frontend with Live Agent
1. Open http://localhost:3000
2. Navigate to "Try Live AI Agent"
3. Start a call
4. Send messages
5. Show real-time AI responses

### 4. Show Database
```bash
cd backend && npm run prisma:studio
```
Show the Farmer, Conversation, and Message tables

### 5. Show API Endpoints
Use Postman or curl to demonstrate:
- Creating a farmer
- Matching schemes
- Getting weather data
- Market prices

---

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database errors
```bash
cd backend
rm dev.db
npm run prisma:push
npm run prisma:generate
```

###  Port already in use
```bash
# Kill backend
lsof -ti:8000 | xargs kill -9

# Kill frontend
lsof -ti:3000 | xargs kill -9
```

### Mistral API errors
- Check your API key in `backend/.env`
- Verify account has credits
- Backend works with mocks if no key provided

### Cannot connect frontend to backend
- Ensure backend is running on port 8000
- Check CORS settings in `backend/.env`
- Verify `CORS_ORIGIN=http://localhost:3000`

---

## 📊 Architecture Flow

```
User Browser
    ↓
Next.js Frontend (Port 3000)
    ↓
LiveAgent Component
    ↓
HTTP/WebSocket Connection
    ↓
Express Backend (Port 8000)
    ↓
    ├─→ Mistral AI Service (Real API calls)
    ├─→ Prisma Database (SQLite)
    ├─→ Mock Data Sources (Weather, Markets, etc.)
    └─→ WebSocket Server (Real-time)
```

---

## 🎉 What Makes This Real

### Before (Demo):
- ❌ Hardcoded responses
- ❌ No database
- ❌ No real AI
- ❌ Frontend only

### After (Full-Stack):
- ✅ Real Express API
- ✅ SQLite database with Prisma
- ✅ Real Mistral AI integration
- ✅ WebSocket support
- ✅ Conversation history
- ✅ Farmer profiles
- ✅ Government schemes matching
- ✅ Mock data source APIs

---

## 📚 Documentation

- **Backend API**: `backend/README.md`
- **Setup Guide**: `SETUP.md`
- **Main README**: `README.md`

---

## 🚀 Deployment Ready

Your app is ready to deploy to:
- **Backend**: Railway, Render, DigitalOcean
- **Frontend**: Vercel, Netlify
- **Database**: PostgreSQL (just change DATABASE_URL)

---

## ✅ Final Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Database initialized with Prisma
- [ ] Schemes seeded
- [ ] Mistral API key added (optional but recommended)
- [ ] Live Agent working
- [ ] Test API endpoints

---

## 🏆 You're Ready for the Hackathon!

Your project now has:
- ✅ Professional backend architecture
- ✅ Real AI integration
- ✅ Database persistence
- ✅ REST API + WebSocket
- ✅ Beautiful frontend
- ✅ Complete documentation

**Good luck! 🚀🌾**

---

## 💡 Quick Commands Reference

```bash
# Start everything
./start.sh

# Backend only
cd backend && npm run dev

# Frontend only
npm run dev

# View database
cd backend && npm run prisma:studio

# Test API
curl http://localhost:8000/health

# Seed database
curl -X POST http://localhost:8000/api/schemes/seed
```

---

**Built with ❤️ for Hackathon Success**
