# 📊 KisanGuard AI — Data Source Classification & Integrity Specification

KisanGuard AI maintains strict data integrity and anti-hallucination rules. No mock or fabricated data is presented as "live". Every feature explicitly references its verified data source according to the 4 Step-20 Data Integrity Classifications:

* 🟢 **LIVE EXTERNAL DATA**: Live API integration with external real-time providers.
* 🔵 **LOCAL VERIFIED DATASET**: Verified agricultural dataset compiled from government / APMC benchmark feeds.
* 🟡 **FALLBACK DATA**: Safely handled default values when live service is degraded or offline.
* 🔴 **UNVERIFIED**: Prohibited data (any unverified or fabricated data).

---

## Data Source Matrix

| Feature | Primary Data Provider / Source | Data Type Classification | Fallback / Failure Strategy | Verification Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Weather Forecast** | Open-Meteo Open API (`api.open-meteo.com`) | 🟢 **LIVE EXTERNAL DATA** | Clean error message + regional baseline | Verified live JSON responses for lat/lon |
| **Crop Vision Analysis** | Gemini Vision LLM Engine | 🟢 **LIVE EXTERNAL AI** | Polite error state ("Unable to analyze image") | Multi-stage image validation |
| **Market Prices** | APMC Mandi Benchmark Feed (Gujarat Agmarknet) | 🔵 **LOCAL VERIFIED DATASET** | Explicit `COMMODITY_NOT_FOUND` error | Zero price fabrication for unknown crops |
| **Government Schemes** | Official iKhedut & GGRC Portal Directory | 🔵 **LOCAL VERIFIED DATASET** | Clean empty list with official portal link | Portal URLs pointing to official `.gov.in` domain |
| **Agricultural RAG** | KisanGuard Verified Agronomic KB | 🔵 **LOCAL VERIFIED DATASET** | 0 results returned cleanly | Similarity threshold prevents out-of-KB answers |
| **Crop Recommendation** | Agronomic Rotational Penalty Logic | 🔵 **LOCAL VERIFIED DATASET** | Zero-hallucination advisory disclaimer | Rotation penalties penalize repeating loss crops |
| **Crop Risk Assessment** | Multi-factor Risk Matrix + Weather | 🟡 **HYBRID / VERIFIED LOGIC** | Uncertainty disclaimers attached | No guaranteed loss claims |
| **Farmer Profile & History** | Local User-Scoped Auth Storage | 🔵 **LOCAL VERIFIED DATASET** | Isolated profile state | User isolation prevents cross-account leaks |

---

## Rules Enforced Across Data Services

1. **Zero Price Fabrication**: If a market query asks for an unsupported crop (e.g. `dragonfruit_xyz`), the tool returns `COMMODITY_NOT_FOUND` rather than producing estimated or dummy numbers.
2. **Official Source Attribution**: All government scheme results display their official agency (e.g., GGRC, Ministry of Agriculture) and direct link to `https://ikhedut.gujarat.gov.in` or `https://pmkisan.gov.in`.
3. **Uncertainty Language**: Risk evaluations use objective probabilistic phrasing (*"Possible risk based on high humidity"*) rather than false deterministic warnings.
