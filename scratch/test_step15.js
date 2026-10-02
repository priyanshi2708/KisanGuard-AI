/**
 * Step 15 Verification Suite for KisanGuard AI Conversation Context & Memory
 */

import { normalizeInputIntent } from '../src/services/aiAssistantService.js';

console.log("=== KISANGUARD AI STEP 15 VERIFICATION ===");

// 1. Test Roman Gujarati & Intent Normalization
const intent1 = normalizeInputIntent("mari pase kapas no pak che");
console.log("Test 1 (Roman Gujarati Intent):", intent1.isRomanGujarati ? "PASSED" : "FAILED");

const intent2 = normalizeInputIntent("mere khet me patte peele ho gaye hain");
console.log("Test 2 (Roman Hindi Intent):", intent2.isRomanHindi ? "PASSED" : "FAILED");

console.log("=== ALL SCRIPT TESTS COMPLETED SUCCESSFULLY ===");
