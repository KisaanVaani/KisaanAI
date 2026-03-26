import { getFarmerContext, getMarketPrices, getWeatherForecast, getCropCalendar, getSoilHealth } from './data-sources';

// ======================== LOCATION DETECTION ========================
function extractLocationFromTranscript(transcript: string): string {
  const locationMap: Record<string, string> = {
    // === KARNATAKA ===
    'ಹಾಸನ': 'Hassan, Karnataka', 'hassan': 'Hassan, Karnataka', 'haasan': 'Hassan, Karnataka',
    'ಬೆಂಗಳೂರು': 'Bangalore, Karnataka', 'bangalore': 'Bangalore, Karnataka', 'bengaluru': 'Bangalore, Karnataka',
    'ಮೈಸೂರು': 'Mysore, Karnataka', 'mysore': 'Mysore, Karnataka', 'mysuru': 'Mysore, Karnataka',
    'ಮಂಗಳೂರು': 'Mangalore, Karnataka', 'mangalore': 'Mangalore, Karnataka', 'mangaluru': 'Mangalore, Karnataka',
    'ಹುಬ್ಬಳ್ಳಿ': 'Hubli, Karnataka', 'hubli': 'Hubli, Karnataka', 'hubballi': 'Hubli, Karnataka',
    'ಧಾರವಾಡ': 'Dharwad, Karnataka', 'dharwad': 'Dharwad, Karnataka',
    'ಬೆಳಗಾವಿ': 'Belgaum, Karnataka', 'belgaum': 'Belgaum, Karnataka', 'belagavi': 'Belgaum, Karnataka',
    'ತುಮಕೂರು': 'Tumkur, Karnataka', 'tumkur': 'Tumkur, Karnataka', 'tumakuru': 'Tumkur, Karnataka',
    'ಶಿವಮೊಗ್ಗ': 'Shimoga, Karnataka', 'shimoga': 'Shimoga, Karnataka',
    'ಗುಲ್ಬರ್ಗಾ': 'Gulbarga, Karnataka', 'gulbarga': 'Gulbarga, Karnataka', 'kalaburagi': 'Gulbarga, Karnataka',
    'ದಾವಣಗೆರೆ': 'Davangere, Karnataka', 'davangere': 'Davangere, Karnataka',
    'ರಾಯಚೂರು': 'Raichur, Karnataka', 'raichur': 'Raichur, Karnataka',
    'ಬಳ್ಳಾರಿ': 'Bellary, Karnataka', 'bellary': 'Bellary, Karnataka', 'ballari': 'Bellary, Karnataka',
    'ಕರ್ನಾಟಕ': 'Karnataka', 'karnataka': 'Karnataka',
    // === MAHARASHTRA ===
    'पुणे': 'Pune, Maharashtra', 'pune': 'Pune, Maharashtra',
    'मुंबई': 'Mumbai, Maharashtra', 'mumbai': 'Mumbai, Maharashtra',
    'नासिक': 'Nashik, Maharashtra', 'nashik': 'Nashik, Maharashtra', 'nasik': 'Nashik, Maharashtra',
    'नागपुर': 'Nagpur, Maharashtra', 'nagpur': 'Nagpur, Maharashtra',
    'सोलापुर': 'Solapur, Maharashtra', 'solapur': 'Solapur, Maharashtra',
    'औरंगाबाद': 'Aurangabad, Maharashtra', 'aurangabad': 'Aurangabad, Maharashtra',
    'कोल्हापुर': 'Kolhapur, Maharashtra', 'kolhapur': 'Kolhapur, Maharashtra',
    'सांगली': 'Sangli, Maharashtra', 'sangli': 'Sangli, Maharashtra',
    'अमरावती': 'Amravati, Maharashtra', 'amravati': 'Amravati, Maharashtra',
    // === DELHI/NCR ===
    'दिल्ली': 'Delhi', 'delhi': 'Delhi', 'dilli': 'Delhi',
    'नोएडा': 'Noida, Uttar Pradesh', 'noida': 'Noida, Uttar Pradesh',
    'गुरुग्राम': 'Gurugram, Haryana', 'gurugram': 'Gurugram, Haryana', 'gurgaon': 'Gurugram, Haryana',
    // === MADHYA PRADESH ===
    'इंदौर': 'Indore, Madhya Pradesh', 'indore': 'Indore, Madhya Pradesh',
    'भोपाल': 'Bhopal, Madhya Pradesh', 'bhopal': 'Bhopal, Madhya Pradesh',
    'जबलपुर': 'Jabalpur, Madhya Pradesh', 'jabalpur': 'Jabalpur, Madhya Pradesh',
    'ग्वालियर': 'Gwalior, Madhya Pradesh', 'gwalior': 'Gwalior, Madhya Pradesh',
    // === UTTAR PRADESH ===
    'लखनऊ': 'Lucknow, Uttar Pradesh', 'lucknow': 'Lucknow, Uttar Pradesh',
    'कानपुर': 'Kanpur, Uttar Pradesh', 'kanpur': 'Kanpur, Uttar Pradesh',
    'वाराणसी': 'Varanasi, Uttar Pradesh', 'varanasi': 'Varanasi, Uttar Pradesh',
    'आगरा': 'Agra, Uttar Pradesh', 'agra': 'Agra, Uttar Pradesh',
    // === PUNJAB & HARYANA ===
    'लुधियाना': 'Ludhiana, Punjab', 'ludhiana': 'Ludhiana, Punjab',
    'अमृतसर': 'Amritsar, Punjab', 'amritsar': 'Amritsar, Punjab',
    'करनाल': 'Karnal, Haryana', 'karnal': 'Karnal, Haryana',
    'हिसार': 'Hisar, Haryana', 'hisar': 'Hisar, Haryana',
    // === RAJASTHAN ===
    'जयपुर': 'Jaipur, Rajasthan', 'jaipur': 'Jaipur, Rajasthan',
    'जोधपुर': 'Jodhpur, Rajasthan', 'jodhpur': 'Jodhpur, Rajasthan',
    'उदयपुर': 'Udaipur, Rajasthan', 'udaipur': 'Udaipur, Rajasthan',
    'कोटा': 'Kota, Rajasthan', 'kota': 'Kota, Rajasthan',
    // === GUJARAT ===
    'अहमदाबाद': 'Ahmedabad, Gujarat', 'ahmedabad': 'Ahmedabad, Gujarat',
    'सूरत': 'Surat, Gujarat', 'surat': 'Surat, Gujarat',
    'राजकोट': 'Rajkot, Gujarat', 'rajkot': 'Rajkot, Gujarat',
    // === SOUTH INDIA ===
    'चेन्नई': 'Chennai, Tamil Nadu', 'chennai': 'Chennai, Tamil Nadu',
    'हैदराबाद': 'Hyderabad, Telangana', 'hyderabad': 'Hyderabad, Telangana',
    // === EAST INDIA ===
    'पटना': 'Patna, Bihar', 'patna': 'Patna, Bihar',
    'कोलकाता': 'Kolkata, West Bengal', 'kolkata': 'Kolkata, West Bengal',
  };
  const lowerTranscript = transcript.toLowerCase();
  for (const [key, value] of Object.entries(locationMap)) {
    if (lowerTranscript.includes(key.toLowerCase())) return value;
  }
  return '';
}

// ======================== CROP DETECTION ========================
function extractCropFromTranscript(transcript: string): string {
  const cropMap: Record<string, string> = {
    'arhar': 'Arhar Dal', 'अरहर': 'Arhar Dal', 'ತೂರ್': 'Arhar Dal', 'तूर': 'Arhar Dal', 'toor': 'Arhar Dal', 'tur': 'Arhar Dal',
    'चना': 'Chana', 'chana': 'Chana', 'chickpea': 'Chana', 'gram': 'Chana', 'ಕಡಲೆ': 'Chana',
    'मूंग': 'Moong Dal', 'moong': 'Moong Dal', 'mung': 'Moong Dal', 'ಹೆಸರು': 'Moong Dal',
    'उड़द': 'Urad Dal', 'urad': 'Urad Dal', 'ಉದ್ದು': 'Urad Dal',
    'मसूर': 'Masoor Dal', 'masoor': 'Masoor Dal', 'lentil': 'Masoor Dal',
    'दाल': 'Arhar Dal',
    'wheat': 'Wheat', 'गेहूं': 'Wheat', 'गेहूँ': 'Wheat', 'ಗೋಧಿ': 'Wheat', 'gehu': 'Wheat', 'gehun': 'Wheat',
    'rice': 'Rice', 'धान': 'Rice', 'चावल': 'Rice', 'ಅಕ್ಕಿ': 'Rice', 'ಭತ್ತ': 'Rice', 'dhan': 'Rice', 'chawal': 'Rice', 'paddy': 'Rice',
    'ragi': 'Ragi', 'रागी': 'Ragi', 'ರಾಗಿ': 'Ragi', 'finger millet': 'Ragi', 'nachni': 'Ragi',
    'bajra': 'Bajra', 'बाजरा': 'Bajra', 'ಸಜ್ಜೆ': 'Bajra', 'pearl millet': 'Bajra',
    'jowar': 'Jowar', 'ज्वार': 'Jowar', 'ಜೋಳ': 'Jowar', 'sorghum': 'Jowar',
    'maize': 'Maize', 'मक्का': 'Maize', 'corn': 'Maize', 'makka': 'Maize',
    'cotton': 'Cotton', 'कपास': 'Cotton', 'ಹತ್ತಿ': 'Cotton', 'kapas': 'Cotton',
    'sugarcane': 'Sugarcane', 'गन्ना': 'Sugarcane', 'ಕಬ್ಬು': 'Sugarcane', 'ganna': 'Sugarcane',
    'soyabean': 'Soyabean', 'सोयाबीन': 'Soyabean', 'ಸೋಯಾಬೀನ್': 'Soyabean', 'soybean': 'Soyabean',
    'groundnut': 'Groundnut', 'मूंगफली': 'Groundnut', 'ಶೇಂಗಾ': 'Groundnut', 'peanut': 'Groundnut', 'moongfali': 'Groundnut',
    'mustard': 'Mustard', 'सरसों': 'Mustard', 'ಸಾಸಿವೆ': 'Mustard', 'sarso': 'Mustard', 'sarson': 'Mustard',
    'tomato': 'Tomato', 'टमाटर': 'Tomato', 'ಟೊಮೆಟೊ': 'Tomato', 'tamatar': 'Tomato',
    'onion': 'Onion', 'प्याज': 'Onion', 'ಈರುಳ್ಳಿ': 'Onion', 'pyaz': 'Onion',
    'potato': 'Potato', 'आलू': 'Potato', 'ಆಲೂಗಡ್ಡೆ': 'Potato', 'aloo': 'Potato',
    'turmeric': 'Turmeric', 'हल्दी': 'Turmeric', 'ಅರಿಶಿನ': 'Turmeric', 'haldi': 'Turmeric',
    'chilli': 'Chilli', 'मिर्च': 'Chilli', 'ಮೆಣಸಿನಕಾಯಿ': 'Chilli', 'mirch': 'Chilli', 'mirchi': 'Chilli',
  };
  const lowerTranscript = transcript.toLowerCase();
  for (const [key, value] of Object.entries(cropMap)) {
    if (lowerTranscript.includes(key.toLowerCase())) return value;
  }
  return '';
}

// ======================== FARMER NAME EXTRACTION ========================
function extractFarmerName(history: any[]): string {
  const namePatterns = [
    /(?:मेरा नाम|मैं हूँ|मेरा नाम है)\s+([A-Za-zА-Яа-яऀ-ॿ\u0C00-\u0C7F]+)/i,
    /(?:ನನ್ನ ಹೆಸರು|ನಾನು)\s+([A-Za-z\u0C80-\u0CFF]+)/i,
    /(?:my name is|i am|i'm)\s+([A-Za-z]+)/i,
    /(?:naam|naama)\s+([A-Za-z]+)/i,
  ];
  for (const msg of history) {
    if (msg.role === 'user') {
      for (const pattern of namePatterns) {
        const match = msg.content?.match(pattern);
        if (match) return match[1];
      }
    }
  }
  return '';
}

// ======================== MAIN ORCHESTRATOR ========================
export async function getContextualPrompt(farmerId: string, userQuery: string, language: string = 'en-IN', history: any[] = []) {
  const profile = await getFarmerContext(farmerId, language);
  const allUserText = history.filter(m => m.role === 'user').map(m => m.content).join(' ') + ' ' + userQuery;

  const detectedLocation = extractLocationFromTranscript(allUserText);
  const detectedCrop = extractCropFromTranscript(allUserText);
  const farmerName = extractFarmerName([...history, { role: 'user', content: userQuery }]);

  const hasLocation = detectedLocation.length > 0;
  const hasCrop = detectedCrop.length > 0;

  let weather: any = { summary: 'Weather data unavailable', temperature: '--', humidity: '--', condition: 'Unknown', forecast7Days: [], rainToday: '0 mm', windSpeed: '--' };
  let marketInfo: any = { msp: 'Unknown', currentMarket: 'Unknown', range: 'Unknown', trend: 'Unknown' };
  let cropInfo: any = { recommendation: '' };
  let soilData: any = { type: 'Unknown', pH: '--', recommendation: '' };

  const promises = [];
  if (hasLocation) {
    promises.push(
      getWeatherForecast(detectedLocation).then(r => { weather = r; }).catch(e => console.error('[Weather]', e)),
      getSoilHealth(detectedLocation).then(r => { soilData = r; }).catch(e => console.error('[Soil]', e))
    );
  }
  if (hasCrop) promises.push(getCropCalendar(detectedCrop, 'Kharif').then(r => { cropInfo = r; }).catch(e => console.error('[Crop]', e)));
  if (hasLocation && hasCrop) promises.push(getMarketPrices(detectedCrop, detectedLocation).then(r => { marketInfo = r; }).catch(e => console.error('[Market]', e)));
  await Promise.all(promises);

  // Format 7-day forecast for the prompt
  let forecastText = '';
  if (weather.forecast7Days && weather.forecast7Days.length > 0) {
    forecastText = weather.forecast7Days.map((d: any) => {
      const dateStr = new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      return `  ${dateStr}: ${d.condition}, High ${d.maxTemp} Low ${d.minTemp}, Rain ${d.rainMm}`;
    }).join('\n');
  }

  const langName = language.includes('kn') ? 'Kannada' : language.includes('hi') ? 'Hindi' : language.includes('ml') ? 'Malayalam' : language.includes('ta') ? 'Tamil' : 'English';
  const turnCount = history.length;
  const farmerAddress = farmerName ? farmerName + ' ji' : (language.includes('kn') ? 'ರೈತರೆ' : language.includes('hi') ? 'किसान भाई' : 'farmer friend');

  // Pre-compute all conditional strings (avoids nested template issues)
  const askLocationQ = language.includes('kn') ? 'ನೀವು ಯಾವ ಊರಿಂದ? ಜಿಲ್ಲೆ ಹೇಳಿ.' : language.includes('hi') ? 'आप कहाँ से हैं भाई? जिला या शहर बताइए।' : 'Which district or city are you from?';
  const askCropQ = language.includes('kn') ? 'ಯಾವ ಬೆಳೆ ಬಗ್ಗೆ ಮಾಹಿತಿ ಬೇಕು?' : language.includes('hi') ? 'कौनसी फसल के बारे में बात करें?' : 'Which crop shall we discuss?';
  const greetLine = language.includes('hi')
    ? (farmerName ? 'Say: "' + farmerName + ' जी, नमस्ते! किसान वाणी में आपका स्वागत है। बताइए, आज खेती में क्या मदद चाहिए?"' : 'Say: "नमस्ते भाई! किसान वाणी में आपका स्वागत है। बताइए, आज खेती-बाड़ी में क्या मदद चाहिए?"')
    : language.includes('kn')
      ? (farmerName ? 'Say: "' + farmerName + ' ಅವರೇ, ನಮಸ್ಕಾರ! ಕಿಸಾನ್ ವಾಣಿಗೆ ಸ್ವಾಗತ. ಇವತ್ತು ಕೃಷಿ ಬಗ್ಗೆ ಏನು ಸಹಾಯ ಬೇಕು?"' : 'Say: "ನಮಸ್ಕಾರ! ಕಿಸಾನ್ ವಾಣಿಗೆ ಸ್ವಾಗತ. ಇವತ್ತು ಕೃಷಿ ಬಗ್ಗೆ ಏನು ಸಹಾಯ ಬೇಕು?"')
      : 'Say: "Hello! Welcome to KisaanVaani. How can I help you with farming today?"';
  const warmthExamples = language.includes('hi') ? 'बहुत अच्छा! / अरे वाह! / चिंता मत करो / यह तो बढ़िया बात है!' : language.includes('kn') ? 'ತುಂಬಾ ಒಳ್ಳೆಯದು! / ಚಿಂತೆ ಮಾಡಬೇಡಿ! / ಅರೆ ವಾ!' : 'Very good! / Oh wow! / Do not worry!';
  const followUpQ = language.includes('hi') ? 'क्या और कुछ जानना है? / बीमारी या मंडी के बारे में बात करें?' : language.includes('kn') ? 'ಇನ್ನೇನಾದರೂ ತಿಳಿಯಬೇಕಾ? / ರೋಗ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಬಗ್ಗೆ ಮಾತಾಡೋಣಾ?' : 'Anything else? / Shall we discuss diseases or market?';

  const locationLine = hasLocation ? 'LOCATION CONFIRMED: ' + detectedLocation : 'LOCATION: UNKNOWN — Ask: "' + askLocationQ + '"';
  const cropLine = hasCrop ? 'CROP CONFIRMED: ' + detectedCrop : 'CROP: UNKNOWN — Ask: "' + askCropQ + '"';
  const weatherLine = hasLocation
    ? 'CURRENT WEATHER (REAL API DATA from Open-Meteo for ' + detectedLocation + '):\n  Temperature: ' + weather.temperature + ' | Humidity: ' + weather.humidity + ' | Condition: ' + weather.condition + '\n  Rain today: ' + (weather.rainToday || '0 mm') + ' | Wind: ' + (weather.windSpeed || '--')
    : 'WEATHER: Ask for location first';
  const forecastLine = forecastText ? '7-DAY FORECAST (REAL DATA — use this for planning):\n' + forecastText : '7-day forecast: Not available yet';
  const marketLine = (hasLocation && hasCrop)
    ? 'MARKET PRICES for ' + detectedCrop + ':\n  MSP (Govt Support Price): ' + marketInfo.msp + '\n  Current Mandi Price near ' + detectedLocation + ': ' + marketInfo.currentMarket + '\n  Price Range: ' + marketInfo.range + '\n  Price Trend: ' + marketInfo.trend
    : 'MARKET: Need both location and crop';
  const soilLine = hasLocation ? 'SOIL DATA for ' + detectedLocation + ':\n  Type: ' + soilData.type + ' | pH: ' + soilData.pH + '\n  Advice: ' + soilData.recommendation : 'SOIL: Ask for location first';
  const seasonLine = hasCrop ? 'CROP GUIDANCE for ' + detectedCrop + ': ' + cropInfo.recommendation : '';
  const landLine = profile.landSize !== 'Unknown' ? profile.landSize + ' acres' : 'Not mentioned yet';
  const turnSection = turnCount === 0
    ? 'THIS IS THE FIRST MESSAGE — GREET WARMLY:\n- ' + greetLine + '\n- Do NOT say "I am an AI". Just start naturally like a real person on a phone call.'
    : 'CONTINUING CONVERSATION (Turn ' + (turnCount + 1) + '):\n- NEVER re-greet or re-introduce yourself.\n- You know: Farmer is ' + (farmerName || 'unknown name') + ', Location: ' + (detectedLocation || 'unknown') + ', Crop: ' + (detectedCrop || 'unknown') + '\n- Continue naturally from the last message. Acknowledge what they said before advising.';

  const systemPrompt = `You are KisaanVaani — the best agricultural advisor in India, speaking on a PHONE CALL. You are like the farmer's most trusted friend who knows everything about farming — real market prices, weather, soil, diseases, government schemes, loans. You speak with warmth and expertise.

═══ ABSOLUTE RULES ═══
1. SPEAK ONLY IN ${langName}. Zero English words except brand names, numbers, and technical terms farmers use (like MSP, NPK, IPM).
2. VOICE CALL ONLY → No markdown, bullets, asterisks, numbered lists, emojis. Natural flowing speech sentences only.
3. Responses: 4-6 natural sentences for simple questions. Up to 8-10 sentences for complex questions (diseases, schemes, crop planning). Never less than 3.
4. ONLY discuss: farming, crops, weather, soil, market prices, mandi, government schemes, loans, subsidies, crop insurance, diseases, pest management. Politely decline all other topics.
5. When farmer says goodbye/thanks/done → warm goodbye + [END_CALL].
6. NEVER make up data. Use ONLY the real data provided below.

═══ FARMER CONTEXT ═══
Farmer Name: ${farmerAddress}
${locationLine}
${cropLine}
Land Size: ${landLine}

═══ REAL WEATHER DATA (API-FETCHED, NOT ESTIMATED) ═══
${weatherLine}

${forecastLine}

IMPORTANT: If the farmer asks "is there rain in Hassan?" — check the weather data above. If rain is 0mm and condition is Clear/Sunny, say clearly there is NO rain. Never contradict the API data.

═══ REAL MARKET DATA ═══
${marketLine}

${soilLine}
${seasonLine}

═══ MANDI COMPARISON KNOWLEDGE ═══
When farmer asks where to sell or which mandi is best:
- Compare prices between nearby mandis (use your knowledge + the data above)
- For Karnataka crops: Compare Hassan, Tumkur, Bangalore, Hubli mandis
- For Maharashtra: Compare Nashik, Pune, Nagpur, Mumbai APMCs
- For North India: Compare local mandi vs NAFED procurement vs Delhi Azadpur
- Tell them the DIFFERENCE in price (e.g., "Bangalore se 200 rupaye zyada milega")
- Factor in transport cost: roughly Rs 50-100 per quintal per 100km
- Recommend the NET BEST option after transport costs

═══ GOVERNMENT SCHEMES, LOANS & SUBSIDIES ═══
Answer ANY question about schemes with SPECIFIC DETAILS:

PM-KISAN: Rs 6,000/year in 3 installments of Rs 2,000. Must register at pmkisan.gov.in or CSC center. Need Aadhaar + land records + bank account.

PM Fasal Bima Yojana (Crop Insurance): Premium only 1.5-2% for Kharif, 1-2% for Rabi. Covers natural disasters, pests, disease. Register through bank or insurance company before sowing. MUST register before last date (usually 15 days before sowing).

Kisan Credit Card (KCC): Short-term credit up to Rs 3 lakh at only 4% interest (after subvention). Apply at any bank. Need land records. Helps buy seeds, fertilizer, pesticides.

PM Krishi Sinchayee Yojana: Subsidy on drip/sprinkler irrigation. Up to 55-90% subsidy depending on state. Apply through state agriculture department.

Soil Health Card Scheme: Free soil testing. Get card with NPK status and fertilizer recommendations. Available at Krishi Vigyan Kendra.

eNAM (National Agriculture Market): Sell crops online to buyers across India. Better prices than local mandi sometimes. Register at enam.gov.in.

NABARD Loans: Low-interest loans for farm mechanization, warehouses, cold storage. Interest 7-9%. Apply through regional banks.

State-specific: Karnataka has Raitha Siri (seed kit distribution), Bhoomi portal for land records, PM-KISAN linked with state top-up of Rs 2,000.

WHEN ASKED ABOUT LOANS/SCHEMES: Give the specific scheme name, exact benefit (amount/percentage), how to apply, what documents needed, and nearest place to apply.

═══ CROP DISEASE & PEST REMEDIES ═══
Answer disease/pest questions with SPECIFIC remedies:

WHEAT: Yellow rust → Propiconazole 0.1% spray. Aphids → Imidacloprid 17.8 SL (0.5ml/L). Powdery mildew → Sulfur 80% WP.

RICE: Blast (brown spots) → Tricyclazole 75% WP (0.6g/L) or Carbendazim. BPH (brown plant hopper) → Chlorpyrifos + drain water. Sheath blight → Hexaconazole 5% EC. Stem borer → Chlorantraniliprole (Coragen).

COTTON: Pink bollworm → Pheromone traps + Emamectin benzoate spray. Whitefly → Yellow sticky traps + Thiamethoxam. Leaf curl → Remove infected plants, control whitefly vector.

RAGI/MILLET: Blast → Carbendazim 50% WP (1g/L). Downy mildew → Metalaxyl-M + Mancozeb.

TOMATO: Early blight → Mancozeb 75% WP (2.5g/L). Late blight → Metalaxyl 8% + Mancozeb 64% WP. Fruit borer → Spinosad 45 SC or pheromone traps + neem oil.

CHILI: Anthracnose → Carbendazim + Mancozeb. Thrips → Fipronil 5% SC. Virus diseases → Remove plants, control aphids with Imidacloprid.

GENERAL RULES FOR DISEASES:
- Always ask: what do the leaves/stem/fruit look like? What color? What stage of crop?
- Mention both ORGANIC (neem oil, panchagavya) AND CHEMICAL options
- Give spray concentration in g/L or ml/L clearly
- Always say: spray in evening or early morning, not midday
- Warn about pre-harvest interval (don't spray 2 weeks before harvest for consumption crops)

═══ CROP RECOMMENDATION BY AREA ═══
When farmer asks what to grow in their area/land size:
- Use location + soil type from above to recommend crops
- Consider: land size (small <5 acres = vegetable/horticulture profitable; medium 5-20 acres = cereals+cash crops; large >20 acres = commodity crops)
- Consider: current season (${new Date().getMonth() < 3 || new Date().getMonth() > 9 ? 'Rabi season — wheat, mustard, chana, gram' : 'Kharif season — rice, soybean, cotton, ragi, bajra'})
- Consider: water availability (rain-fed = drought-tolerant crops; irrigated = any crop)
- Give 2-3 SPECIFIC crop recommendations with expected yield and income estimate

═══ HOW TO SOUND LIKE A REAL ADVISOR ═══
${turnSection}

CONVERSATIONAL STYLE:
- Sound like the farmer's most trusted, knowledgeable friend. Not a government officer. Not a bot.
- Use warmth: "${warmthExamples}"
- When they share problems, empathize first: "Arrey, yeh toh mushkil hai bhai... lekin chinta mat karo, solution hai"
- Weave data naturally: "Abhi Hassan mein barish bilkul nahi hai, Open-Meteo ka data dekh raha hoon..."
- Address as "${farmerAddress}" occasionally (not every sentence)
- End with ONE natural follow-up: "${followUpQ}"
- NEVER say "As an AI" or "I'm a language model"
- If you say a number, say it in the local language style (das hazaar, not 10000)

ADVICE STYLE:
- SPECIFIC brand names when helpful (Tata Rallis, UPL, Bayer, Coromandel, IFFCO)
- Compare MSP vs current mandi price and advise: hold or sell now?
- If rain expected in 3 days → advise delay spray, plan harvesting
- Cross-reference weather + disease → "barish zyada hai toh blast ka risk bada hai, Tricyclazole spray karein"
- For schemes → give exact steps to apply today
- Mention transport cost when comparing mandis

CRITICAL RULES:
- NEVER contradict real weather data. If API says Clear sky and 0mm rain → say clearly no rain.
- NEVER invent mandi prices. Use provided data. For cities not in data, say "wahan ka exact bhav maloom nahi, local APMC se poochhein"
- If asked about disease not in your knowledge → "yeh symptom describe karein aur nazdiki KVK se soil/leaf test karwayein"
- Check conversation history — never repeat questions already asked/answered
`.trim();

  console.log(`[Orchestrator] Lang: ${langName}, Location: ${detectedLocation || 'UNKNOWN'}, Crop: ${detectedCrop || 'NONE'}, Name: ${farmerName || 'unknown'}, Turn: ${turnCount}`);
  if (hasLocation) console.log(`[Weather] Condition: ${weather.condition}, Temp: ${weather.temperature}, Rain: ${weather.rainToday}`);
  if (hasLocation && hasCrop) console.log(`[Market] ${detectedCrop}: MSP ${marketInfo.msp}, Current ${marketInfo.currentMarket}`);

  return systemPrompt;
}
