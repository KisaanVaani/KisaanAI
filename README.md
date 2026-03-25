# KisaanAI 🌾

An AI-powered voice assistant for Indian farmers providing real-time weather, market prices, and farming advice in multiple languages (Hindi, Kannada, English).

## ✨ Features

- **Voice Interface**: Speak in Hindi, Kannada, or English
- **Real Weather Data**: Integrated with WeatherAPI.com, Tomorrow.io, and Open-Meteo
- **Market Prices**: Real-time Mandi prices via Agmarknet
- **Farming Advice**: Powered by Mistral AI with context-aware recommendations
- **Multi-language Support**: Automatic language detection and response
- **High-Quality Voice**: Sarvam AI text-to-speech with natural-sounding voices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/KisaanVaani/KisaanAI.git
cd KisaanAI

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Fill in your API keys in .env.local (see setup below)
```

### Configuration

#### 1. **Mistral API** (Required for farming advice)
- Sign up at: https://console.mistral.ai/
- Get your API key
- Add to `.env.local`:
  ```
  MISTRAL_API_KEY=your_key_here
  ```

#### 2. **Sarvam AI** (Required for voice output)
- Sign up at: https://sarvam.ai/
- Get your API key
- Add to `.env.local`:
  ```
  SARVAM_API_KEY=your_key_here
  ```

#### 3. **Weather Data** (At least one required)

**Option A: Open-Meteo (Recommended - Completely FREE)** ✅
- No API key needed!
- Already enabled by default
- Provides: Current weather, forecasts, historical data
- Website: https://open-meteo.com/

**Option B: WeatherAPI.com** (Better structured data)
- Sign up at: https://www.weatherapi.com/
- Free tier available
- Add to `.env.local`:
  ```
  WEATHER_API_KEY=your_weatherapi_key_here
  ```

**Option C: Tomorrow.io** (Advanced weather)
- Sign up at: https://www.tomorrow.io/weather-api/
- Free tier available
- Add to `.env.local`:
  ```
  TOMORROW_IO_API_KEY=your_tomorrow_io_key_here
  ```

**Weather Priority** (Auto-fallback if previous fails):
1. WeatherAPI.com (if key provided)
2. Tomorrow.io (if key provided)
3. Open-Meteo (always available, FREE)

### Running the Application

```bash
# Development server
npm run dev

# Open browser and go to http://localhost:3000
```

## 📊 Architecture

```
Frontend (Next.js)
    ↓
API Route (/api/chat)
    ↓
Orchestrator (Context aggregation)
    ├─ Weather APIs (Real-time weather)
    ├─ Market Data (Agmarknet)
    ├─ Soil Data (SoilGrids)
    └─ Mistral AI LLM
    ↓
Sarvam AI TTS (Voice synthesis)
    ↓
Browser (Audio playback)
```

## 🗂️ Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts       # Main chat endpoint
│   ├── page.tsx                 # Frontend UI
│   └── layout.tsx               # Layout
├── components/
│   ├── layout/                  # Navbar, Footer
│   └── sections/                # Page sections, LiveAgent
├── lib/
│   ├── orchestrator.ts          # Context aggregation
│   ├── data-sources.ts          # Data fetching
│   ├── sarvam.ts                # Text-to-speech
│   └── weather-providers.ts     # Weather API wrapper
└── utils/
    └── utils.ts                 # Utility functions

tests/                            # Test suite (Vitest)
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

All 25+ tests passing ✅

## 📱 Usage

1. Click the **microphone button**
2. Speak your farming query in Hindi, Kannada, or English
3. The system will:
   - Detect your language and location
   - Fetch real-time weather and market data
   - Get farming advice from Mistral AI
   - Speak the response in your language

**Example queries:**
- "मुझे Hassan में अरहर की खेती करनी है" (I want to farm arhar del in Hassan)
- "ನನ್ನ ಭೂಮಿಯಲ್ಲಿ ಹೋಧಿ ಬೀಜ ಬಿತ್ತಿ ಬೇಕಾ?" (Should I sow cotton seeds in my land?)
- "What's the current weather for tomato farming in Bangalore?"

## 🔒 Security

- API keys are **never** committed to GitHub (protected via `.gitignore`)
- Use `.env.local` for sensitive data
- Database (`dev.db`) is also ignored

## 📈 Real Data Integration Status

| Feature | Status | Source |
|---------|--------|--------|
| Weather | ✅ Live | WeatherAPI.com / Open-Meteo |
| Market Prices | 🔄 Mocked | Agmarknet (ready for web scraping) |
| Soil Data | 🔄 Mocked | SoilGrids (ready for integration) |
| LLM Advice | ✅ Live | Mistral AI |
| Voice Output | ✅ Live | Sarvam AI |

## 🛗 API Endpoints

### `POST /api/chat`

Request:
```json
{
  "transcript": "आई किसान हूँ और मेरे पास 2 हेक्टेयर खेत है",
  "language": "hi-IN",
  "userId": "farmer123",
  "farmerId": "farm456"
}
```

Response:
```json
{
  "reply": "नमस्कार राजेश! आपकी खेती के लिए...",
  "language": "hi-IN",
  "audio": "base64_encoded_audio",
  "success": true
}
```

## 📚 Documentation

- [Weather Providers](./src/lib/weather-providers.ts) - Understand weather API selection
- [Orchestrator](./src/lib/orchestrator.ts) - Context extraction and aggregation
- [Sarvam Integration](./src/lib/sarvam.ts) - Text-to-speech setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

- [Mistral AI](https://docs.mistral.ai/)
- [Sarvam AI](https://sarvam.ai/docs)
- [WeatherAPI.com](https://www.weatherapi.com/docs/)
- [Open-Meteo](https://open-meteo.com/en/docs)
- [Tomorrow.io](https://docs.tomorrow.io/)

## 🐛 Troubleshooting

### "Weather API Error"
- Check that at least one weather provider is configured
- Open-Meteo requires no key and works offline

### "Audio not playing"
- Ensure Sarvam API key is valid
- Check browser autoplay settings
- Try shorter text responses

### "Location not detected"
- Make sure location is mentioned in your query
- Try: "I am in [city name] growing [crop]"

## 📜 License

MIT License - see LICENSE file for details

## 🏆 Credits

Built with ❤️ for Indian farmers using:
- [Next.js](https://nextjs.org/)
- [Mistral AI](https://mistral.ai/)
- [Sarvam AI](https://sarvam.ai/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For issues and support:
- GitHub Issues: https://github.com/KisaanVaani/KisaanAI/issues
- Email: support@kisaanvaani.com

---

**Made for Indian Farmers** 🌾🇮🇳
