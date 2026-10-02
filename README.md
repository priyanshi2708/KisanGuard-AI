# 🌾 KisanGuard AI — Intelligent Farmer Decision Support System

> **A multilingual, AI-agent powered advisory dashboard designed specifically for Indian farmers.**
> KisanGuard AI integrates real-time weather forecasts, verified APMC mandi market prices, official government scheme eligibility matching, agronomic RAG knowledge retrieval, crop risk assessment, zero-hallucination crop recommendations, and voice & crop image analysis into a unified, farmer-friendly web application.

---

## 🚀 Key Features

* **🌾 Zero-Hallucination Crop Recommendation**: Personalized crop suggestions based on soil type, land size, water availability, season, and historical crop loss with rotational penalty algorithms.
* **⚡ Central AI Agent & Dynamic Tool Registry**: Model-driven function calling using a strict central Tool Registry supporting 7 specialized agricultural tools.
* **⛅ Live Weather Intelligence**: Integrated with Open-Meteo API for real-time weather forecasts, rain probability, temperature, and agricultural alerts.
* **📊 Mandi Market Price Benchmark**: APMC market price dataset providing price ranges in ₹ per 20 kg (મણ) across Gujarat districts.
* **🏛️ Government Scheme Eligibility**: Matching engine for official schemes (PM-KISAN, GGRC Drip Irrigation, Crop Insurance, Solar Pump) with direct official portal attribution.
* **📚 Agronomic RAG Knowledge Base**: High-confidence vector-matched agronomic database covering pest management, disease remedies, and irrigation schedules.
* **📷 Crop Vision Analysis**: AI-powered crop leaf image diagnosis for disease identification and health assessment.
* **🎙️ Multilingual Voice Interface**: Full Speech-To-Text (STT) and Text-To-Speech (TTS) integration supporting Gujarati, Hindi, and English.
* **🌐 Multilingual Support**: Dynamic runtime translation across Gujarati, Roman Gujarati, Hindi, Roman Hindi, and English.
* **🔒 Enterprise-Grade Security & Isolation**: Strict prompt injection protection, schema validation, tool authorization boundaries, and user-scoped local isolation.

---

## 📐 System Architecture Overview

```
[ Farmer UI (React + Vite + Tailwind) ]
                  │
                  ▼
      [ Central AI Agent Engine ]
                  │
        (Model-Driven Routing)
                  │
                  ▼
         [ Tool Registry ]
  ┌───────────────┼───────────────┐
  ▼               ▼               ▼
[WeatherTool] [MarketTool]   [SchemeTool]
  ▼               ▼               ▼
Open-Meteo      APMC Feed    iKhedut Dataset
 (🟢 LIVE)     (🔵 VERIFIED)   (🔵 VERIFIED)

  ┌───────────────┼───────────────┐
  ▼               ▼               ▼
[KnowledgeTool] [RecTool]     [RiskTool]
  ▼               ▼               ▼
RAG Vector KB   Agri Logic      Multi-Factor
 (🔵 VERIFIED)   (🔵 VERIFIED)   (HYBRID)
```

---

## 📊 Data Source Classifications

KisanGuard AI strictly classifies all information sources according to data integrity standards:

| Feature / Service | Data Source | Classification | Verification Status |
| :--- | :--- | :--- | :--- |
| **Weather Forecast** | Open-Meteo Live API | 🟢 **LIVE EXTERNAL DATA** | Verified Real-Time |
| **Crop Vision AI** | Gemini 1.5 / Vision LLM | 🟢 **LIVE EXTERNAL AI** | Verified Dynamic API |
| **Market Prices** | APMC Mandi Benchmark Dataset | 🔵 **LOCAL VERIFIED DATASET** | Verified APMC Data |
| **Government Schemes** | iKhedut & GGRC Scheme Dataset | 🔵 **LOCAL VERIFIED DATASET** | Verified Official Govt Data |
| **Agricultural RAG** | KisanGuard Agronomic KB | 🔵 **LOCAL VERIFIED DATASET** | Verified RAG Database |
| **Crop Recommendation** | Agronomic Recommendation Logic | 🔵 **LOCAL VERIFIED DATASET** | Verified Rotation Engine |
| **Crop Risk Assessment**| Hybrid Weather + Advisory Engine| 🟡 **HYBRID / VERIFIED LOGIC**| Uncertainty Notes Enforced |

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 18 + Vite
* **Styling**: Tailwind CSS + Glassmorphism design System + Lucide Icons + Framer Motion
* **Routing**: React Router DOM v6
* **AI Engine**: Google Gemini API / Central Agent Architecture
* **State Management**: React Context API (`LanguageContext`, Auth Context)
* **Build Tool**: Vite 6

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kisanguard-ai/climateguard.git
   cd climateguard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

6. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## 🧪 Testing & Verification

Run automated test suites located in `scratch/`:

```bash
# System-Wide Regression Test Suite
node scratch/test_step21_regression.js

# Data Integrity & Classification Audit
node scratch/test_step20_data_integrity.js

# Security & Injection Protection Audit
node scratch/test_step19_security.js

# Demo Dataset Scenario Verification
node scratch/test_step27_demo_dataset.js
```

---

## 🔒 Security Protections

* **Prompt Injection Defense**: Multi-language injection patterns blocked before agent processing.
* **Tool Authorization Boundary**: Strict whitelist enforcement rejecting unauthorized tools (`executeSystemCommand`, `shellTool`, etc.).
* **Input Schema Validation**: Out-of-bounds parameter rejection (e.g. Latitude out of [-90, 90]).
* **Payload Limits**: Request payload capping preventing buffer overflow attacks.
* **User Isolation**: User-scoped storage isolation preventing cross-account profile access.
* **Secret Protection**: Automatic response sanitization preventing API key leakage in logs or responses.

---

## ⚠️ Known Limitations

1. **Market Prices**: Sourced from APMC benchmark mandi feeds for major Gujarat districts. Live real-time streaming API integration requires state APMC web sockets.
2. **Government Scheme Submissions**: Scheme eligibility is matched locally; direct application submission requires authenticating with the state iKhedut portal SSO.
3. **Voice Recognition (STT)**: Uses Web Speech API native browser engine; performance depends on browser microphone quality and ambient field noise.

---

## 📜 License & Credits

Built for KisanGuard AI Master Project. All rights reserved.
