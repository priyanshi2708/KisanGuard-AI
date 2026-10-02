const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const apiKey = (envContent.match(/GROQ_API_KEY=\s*([^\s\r\n]+)/) || [])[1]?.trim();
const chatModel = (envContent.match(/GROQ_CHAT_MODEL=\s*([^\s\r\n]+)/) || [])[1]?.trim() || 'openai/gpt-oss-120b';
const visionModel = (envContent.match(/GROQ_VISION_MODEL=\s*([^\s\r\n]+)/) || [])[1]?.trim() || 'qwen/qwen3.8-27b';

console.log('=== KISANGUARD AI STEP 9.1 INTEGRATION TEST SUITE ===');
console.log('[Groq] API key configured:', !!apiKey);
console.log('[Groq] Chat model:', chatModel);
console.log('[Groq] Vision model:', visionModel);

async function runTests() {
  console.log('\n--- 1. NORMAL CHAT TEST: "નમસ્તે" ---');
  try {
    const res1 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: chatModel,
        messages: [{ role: 'user', content: 'નમસ્તે' }]
      })
    });
    console.log('[Chat 1] HTTP', res1.status);
    const data1 = await res1.json();
    console.log('[Chat 1] Output:', data1.choices?.[0]?.message?.content);
  } catch (err) {
    console.error('[Chat 1] Error:', err.message);
  }

  console.log('\n--- 2. NORMAL CHAT TEST: "મારા પાકના પાન પીળા થઈ ગયા છે" ---');
  try {
    const res2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: chatModel,
        messages: [{ role: 'user', content: 'મારા પાકના પાન પીળા થઈ ગયા છે' }]
      })
    });
    console.log('[Chat 2] HTTP', res2.status);
    const data2 = await res2.json();
    console.log('[Chat 2] Output:', data2.choices?.[0]?.message?.content);
  } catch (err) {
    console.error('[Chat 2] Error:', err.message);
  }

  console.log('\n--- 3. VISION TEST: Real Leaf Image Analysis ---');
  try {
    const imgBuf = fs.readFileSync(path.join(__dirname, 'test_crop.jpg'));
    const base64 = imgBuf.toString('base64');
    console.log('[Vision] Image size:', base64.length, 'bytes');

    const res3 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: visionModel,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Identify this crop and inspect leaf health. Output JSON.' },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + base64 } }
          ]
        }],
        temperature: 0.1,
        max_tokens: 1000
      })
    });
    console.log('[Vision] HTTP', res3.status);
    const data3 = await res3.json();
    console.log('[Vision] Output:', data3.choices?.[0]?.message?.content);
  } catch (err) {
    console.error('[Vision] Error:', err.message);
  }
}

runTests();
