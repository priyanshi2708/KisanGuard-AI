# 🎤 KisanGuard AI — Master Presentation Guide & Demo Script

---

## 1. Presentation Slide Structure (24 Topics)

1. **Title Slide**: KisanGuard AI — Intelligent Farmer Decision Support System
2. **Problem Statement**: Indian farmers face volatile weather, shifting market prices, pest outbreaks, and fragmented government scheme information without personalized guidance.
3. **Why Farmers Need This**: Existing apps are text-heavy, English-centric, lack local language voice support, and provide generic static advice.
4. **Proposed Solution**: A multilingual, voice-enabled AI dashboard combining live weather, APMC mandi prices, scheme eligibility matching, and zero-hallucination crop recommendations.
5. **Main Features Overview**: Voice Chat, Crop Vision Leaf Diagnosis, Crop Recommendations, Risk Index, Weather Alerts, Market Prices, Government Schemes.
6. **System Architecture**: React 18 SPA + Vite + Central AI Agent + Tool Registry + External/Local Data Providers.
7. **AI Agent Architecture**: Model-driven function calling using structured tool definitions rather than hardcoded regex routing.
8. **Tool Registry & Authorization Harness**: Whitelist authorization boundary protecting execution flow.
9. **Agronomic RAG Engine**: High-confidence vector knowledge base for pest management and crop practices.
10. **APMC Mandi Price Benchmark**: District-wise APMC daily benchmark market prices in ₹ per 20 kg (મણ).
11. **Government Schemes Engine**: Eligibility matching engine linking farmers to iKhedut / GGRC / PM-KISAN portals.
12. **Crop Recommendation Logic**: Multi-factor scoring taking into account land size, soil type, water availability, season, and crop rotation history.
13. **Crop Risk Assessment Matrix**: Probabilistic multi-factor risk assessment (weather, soil, pest, fire risk).
14. **Crop Leaf Diagnosis (Vision)**: AI-based leaf disease identification and health assessment.
15. **Multilingual Voice Workflow**: STT → Central Agent → Tool Execution → Response Synthesis → TTS audio playback.
16. **Multilingual Support**: Real-time switching between Gujarati, Roman Gujarati, Hindi, Roman Hindi, and English.
17. **Personalized Dashboard**: User-friendly cards for daily farm status, profit/loss tracking, and advisories.
18. **Security Protections**: Injection defense, schema validation, payload capping, path traversal protection, secret masking.
19. **Data Source Transparency**: Honest 4-tier data classification (Live External, Local Verified, Fallback, Unverified).
20. **Testing & Quality Assurance**: Automated regression suite (24/24 passed), security audit (16/16 passed), demo dataset tests (13/13 passed).
21. **Perfect Farmer Demo Journey**: End-to-end continuous Gujarati farmer scenario.
22. **System Limitations**: Local APMC feeds vs live streaming API; Web Speech browser dependency.
23. **Future Scope**: Direct IoT soil sensor integration, automated scheme application submission, satellite NDVI crop monitoring.
24. **Conclusion**: KisanGuard AI empowers Indian farmers with accessible, reliable, and localized AI decision support.

---

## 2. Perfect Farmer Demo Script (Gujarati / English)

* **Step 1 — Landing**: Open app, select **Gujarati (ગુજરાતી)** language.
* **Step 2 — Authentication**: Log in with Demo account (`kishor@kisanguard.in`).
* **Step 3 — Profile Check**: View profile (*Kishorbhai Patel, Anand, 2 acres, Low Water, Cotton crop*).
* **Step 4 — Weather Inquiry**: Speak or type *"આજે મારા વિસ્તારમાં હવામાન કેવું છે?"* → Agent executes `weatherTool` and displays live temperature (32°C), humidity, and rain probability.
* **Step 5 — Agronomic Advisory**: Ask *"કપાસ માટે કઈ કાળજી રાખવી?"* → Agent executes `agriculturalKnowledgeTool` and retrieves cotton IPM advisory for pink bollworm and whitefly.
* **Step 6 — Market Prices**: Ask *"આજે કપાસનો ભાવ શું છે?"* → Agent executes `marketPriceTool` and displays Anand APMC benchmark rate (₹1580 / મણ).
* **Step 7 — Crop Recommendation**: Ask *"મારી જમીન અને પાણી પ્રમાણે આગળ કયો પાક લઈ શકું?"* → Agent executes `cropRecommendationTool` and suggests Groundnut/Castor/Sesame due to low water and previous cotton loss.
* **Step 8 — Government Scheme**: Ask *"મારા માટે કઈ સરકારી યોજના ઉપયોગી છે?"* → Agent executes `governmentSchemeTool` and suggests GGRC Drip Irrigation Subsidy with official portal link (`ikhedut.gujarat.gov.in`).
* **Step 9 — Vision Diagnosis**: Upload crop leaf image → Agent calls `cropVisionTool` and returns clear health diagnosis and remedies.
* **Step 10 — Voice Inquiry**: Click microphone, speak in Gujarati *"મારી પાસે બે એકર જમીન છે અને પાણી ઓછું છે. કયો પાક સારો રહેશે?"* → Audio recorded, transcribed, processed by agent, and read back via TTS speaker.
* **Step 11 — Language Switch**: Switch language from Gujarati → English → Hindi. Observe immediate interface and chat translation.
* **Step 12 — Logout**: Click Logout → Confirm protected route redirection.

---

## 3. Likely Viva / Evaluation Questions & Answers

**Q1: How does the AI agent select which tool to use?**
*Answer*: We use model-driven function calling through a central Tool Registry (`toolRegistry.js`). The LLM analyzes the user prompt along with tool JSON declarations and returns a tool call request, which is executed safely by the harness.

**Q2: How do you prevent the AI from fabricating market prices or government schemes?**
*Answer*: We enforce strict zero-hallucination rules. Market prices and scheme data come from local verified benchmark datasets. If a crop or scheme is not in the verified dataset, the system returns a clean `NOT_FOUND` error rather than generating fake numbers.

**Q3: How is farmer data isolated?**
*Answer*: Profile and context operations check the active authenticated session ID. Local storage keys are scoped by user account ID, preventing one farmer from viewing or modifying another farmer's profile or history.

**Q4: Is the weather data real or hardcoded?**
*Answer*: Weather data is 🟢 **LIVE EXTERNAL DATA** fetched in real time from Open-Meteo's global forecast API based on the farmer's location coordinates.
