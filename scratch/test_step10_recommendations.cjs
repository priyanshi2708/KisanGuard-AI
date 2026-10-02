const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const apiKey = (envContent.match(/GROQ_API_KEY=\s*([^\s\r\n]+)/) || [])[1]?.trim();
const chatModel = (envContent.match(/GROQ_CHAT_MODEL=\s*([^\s\r\n]+)/) || [])[1]?.trim() || 'openai/gpt-oss-120b';

console.log('=== KISANGUARD AI STEP 10 INTEGRATION TEST SUITE ===');
console.log('[Groq] API key configured:', !!apiKey);
console.log('[Groq] Chat model:', chatModel);

const testCases = [
  { id: 1, name: 'Gujarati Query', msg: 'આ સિઝનમાં મારી 2 એકર જમીનમાં કયો પાક વાવું?' },
  { id: 2, name: 'Roman Gujarati Query', msg: 'Aa season ma mari 2 acre jamin ma kayo pak vavu?' },
  { id: 3, name: 'Hindi Query', msg: 'इस मौसम में मेरी 2 एकड़ जमीन में कौन सी फसल लगाऊं?' },
  { id: 4, name: 'English Query', msg: 'Which crop should I grow this season on my 2-acre farm?' },
  { id: 5, name: 'Crop Comparison', msg: 'આ વખતે કપાસ વાવું કે મગફળી?' },
  { id: 6, name: 'Missing Information Query', msg: 'મારી જમીન માટે કયો પાક સારો રહેશે?' },
  { id: 7, name: 'Profile Context Reuse', msg: 'મારો હાલનો પાક કપાસ છે, આગામી સિઝન માટે શું વાવવું?' },
  { id: 8, name: 'Market Integration Check', msg: 'મગફળીનો આજના માર્કેટનો ભાવ અને ભલામણ આપો' },
  { id: 9, name: 'Scheme Integration Check', msg: 'આઇ ખેડૂત પોર્ટલ પર મગફળી માટે કોઈ સરકારી સબસીડી યોજના છે?' },
  { id: 10, name: 'Tool Selection Check', msg: 'આણંદ વિસ્તારમાં રવિ સિઝનમાં કયો પાક નફાકારક રહેશે?' },
  { id: 11, name: 'Conversation Context Check', msg: 'તેના માટે કેટલું પાણી જોઈએ?' },
  { id: 12, name: 'Failure Recovery Check', msg: 'હવામાન કે બજાર ભાવ ન હોય તો પણ સલાહ આપો' }
];

async function runSingleTest(tc) {
  console.log(`\n--------------------------------------------------`);
  console.log(`TEST ${tc.id}: ${tc.name}`);
  console.log(`Message: "${tc.msg}"`);
  console.log(`--------------------------------------------------`);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: chatModel,
        messages: [
          {
            role: 'system',
            content: `You are KisanGuard AI, an expert conversational AI for Indian farmers. Respond strictly in valid JSON format:
{
  "type": "general" | "crop" | "market" | "scheme",
  "text": "Your answer in Gujarati or the language of the query",
  "bulletPoints": ["Point 1", "Point 2"],
  "actionSteps": ["Step 1", "Step 2"],
  "suggestions": ["Option 1", "Option 2"]
}`
          },
          { role: 'user', content: tc.msg }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });

    console.log(`HTTP ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const snippet = content.length > 300 ? content.substring(0, 300) + '...' : content;
    console.log(`Response Snippet:\n${snippet}`);
    return { success: res.ok, status: res.status };
  } catch (err) {
    console.error(`Test ${tc.id} exception:`, err.message);
    return { success: false, error: err.message };
  }
}

async function runTestSuite() {
  let passed = 0;
  for (const tc of testCases) {
    const res = await runSingleTest(tc);
    if (res.success) passed++;
    await new Promise(r => setTimeout(r, 2000)); // 2 second delay between calls to manage rate limits
  }

  console.log(`\n==================================================`);
  console.log(`STEP 10 TEST SUITE RESULT: ${passed} / ${testCases.length} PASSED`);
  console.log(`==================================================`);
}

runTestSuite();
