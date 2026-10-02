# 🏗️ KisanGuard AI — System Architecture & Workflow Specification

## 1. System Overview

KisanGuard AI uses a modern micro-frontend single-page architecture built with React 18, Vite, and Tailwind CSS, coupled with a central model-driven AI Agent and dynamic Tool Registry.

```
+-----------------------------------------------------------------------+
|                             FARMER USER UI                            |
| (Landing / Onboarding / Dashboard / Chat / Vision / Weather / Voice)  |
+-----------------------------------------------------------------------+
                                    │
                                    ▼
+-----------------------------------------------------------------------+
|                       LANGUAGE & AUTH CONTEXT                         |
| (Gujarati, Roman Gujarati, Hindi, Roman Hindi, English / Isolated Session)|
+-----------------------------------------------------------------------+
                                    │
                                    ▼
+-----------------------------------------------------------------------+
|                         CENTRAL AI AGENT                              |
|           (aiAssistantService.js + Gemini Model Engine)               |
+-----------------------------------------------------------------------+
                                    │
                                    ▼
+-----------------------------------------------------------------------+
|                          TOOL REGISTRY                                |
|        (toolRegistry.js — Tool Whitelist & Schema Validation)          |
+-----------------------------------------------------------------------+
        │             │            │            │             │
        ▼             ▼            ▼            ▼             ▼
  +----------+   +----------+ +----------+ +----------+  +----------+
  | Weather  |   | Market   | | Scheme   | | RAG      |  | Crop Rec |
  | Tool     |   | Price    | | Tool     | | Advisory |  | & Risk   |
  +----------+   +----------+ +----------+ +----------+  +----------+
        │             │            │            │             │
        ▼             ▼            ▼            ▼             ▼
 Open-Meteo      APMC Mandi    iKhedut      Vector KB     Rotation
 Live API        Benchmark     Govt Data    Advisories    Engine
 (🟢 LIVE)      (🔵 VERIFIED)  (🔵 VERIFIED) (🔵 VERIFIED) (🔵 VERIFIED)
```

---

## 2. Voice Processing Architecture (STT → Agent → Tools → Response → TTS)

```
[ Farmer Speaks ] ──► [ SpeechToTextService ] ──► [ User Text Query ]
                                                           │
                                                           ▼
[ Audio Feedback ] ◄── [ TextToSpeechService ] ◄── [ Agent Response ]
                                                           ▲
                                                           │
                                              [ Central AI Agent Engine ]
                                                           │
                                                           ▼
                                                 [ Tool Executions ]
```

1. **Speech-To-Text (STT)**: Capture audio via Web Speech API or AudioRecorderService. Language automatically matches active user context (`gu-IN`, `hi-IN`, `en-US`).
2. **Central Agent Processing**: The recognized prompt is sent to `aiAssistantService.js` with active farmer context (`ConversationId`, land size, current crop, soil, water).
3. **Model-Driven Tool Selection**: Model determines whether to call `weatherTool`, `marketPriceTool`, `governmentSchemeTool`, `agriculturalKnowledgeTool`, `cropRecommendationTool`, or `cropRiskTool`.
4. **Tool Execution**: Tools run within the isolated `toolRegistry.js` harness with parameter validation and zero-hallucination disclaimers.
5. **Synthesis & Response Generation**: Agent synthesizes tool output into natural farmer-friendly language.
6. **Text-To-Speech (TTS)**: Response is converted to speech audio playback in the farmer's preferred language.

---

## 3. Tool Registry & Authorization Engine

All tool interactions pass through `src/tools/toolRegistry.js`:
* **Whitelist Authorization**: Reject any requested tool name not present in registered tools (`UNAUTHORIZED_TOOL`).
* **Schema Validation**: Validate primitive parameters (latitude/longitude boundaries, string max lengths).
* **Execution Wrap**: Inject safety disclaimers and structured status codes (`SUCCESS`, `INVALID_TOOL_INPUT`, `TOOL_EXECUTION_ERROR`).

---

## 4. Multi-Tool Reasoning Engine

For complex farmer inquiries requiring multiple data domains (e.g. *"I have 2 acres with low water in Anand, what crop should I plant next, what is its market price, and what weather risks exist?"*):
* Central agent dynamically plans sequential or parallel tool calls (`cropRecommendationTool` + `marketPriceTool` + `weatherTool`).
* Synthesizes cross-domain data into a unified, clean response without duplicate information or contradictory advice.
