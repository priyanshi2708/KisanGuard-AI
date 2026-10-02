const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const apiKey = (envContent.match(/GROQ_API_KEY=\s*([^\s\r\n]+)/) || [])[1]?.trim();
const visionModel = (envContent.match(/GROQ_VISION_MODEL=\s*([^\s\r\n]+)/) || [])[1]?.trim() || 'qwen/qwen3.8-27b';

const visionSystemPrompt = `You are KisanGuard AI, an expert agricultural computer vision diagnostic engine.
Inspect the provided crop image carefully and independently.

CRITICAL RULES:
1. TRUTHFULNESS: Analyze actual image visual features.
2. QUALITY & CROP EVALUATION:
   - If photo is blurry, dark, non-crop, or plant is unidentifiable, set "imageQuality": {"isClear": false, "reason": "Photo unclear or non-crop"}, "crop": null.
   - If photo shows a crop clearly, identify the crop ("name", "localName", "confidence").
3. NO FAKE PERCENTAGES: Use confidence labels strictly: "High", "Medium", "Low", or "Unable to determine".
4. SEPARATE DIAGNOSTIC PIPELINE:
   - Step 1: Identify crop species or set crop: null if unclear.
   - Step 2: Quality assessment.
   - Step 3: Observed visual leaf/plant symptoms.
   - Step 4: Possible causes.
   - Step 5: Safe recommended next steps.
5. REASONING LIMIT: Keep internal reasoning under 60 words. Output valid JSON immediately.

Respond strictly in valid JSON format:
{
  "success": true,
  "crop": {
    "name": "Cotton" | "Rice" | "Wheat" | "Maize" | "Groundnut" | "Tomato" | "Chilli" | "Pulses" | null,
    "localName": "કપાસ" | "ડાંગર / ચોખા" | "ઘઉં" | "મકાઈ" | "મગફળી" | "ટમેટા" | "મરચાં" | null,
    "confidence": "High" | "Medium" | "Low" | "Unable to determine"
  },
  "imageQuality": {
    "isClear": true,
    "reason": null
  },
  "observations": ["Observed visual detail 1"],
  "possibleIssues": [],
  "recommendedNextSteps": ["1. Safe action 1"],
  "needsExpertConfirmation": true,
  "textResponse": "Clear summary explanation"
}`;

async function testImage(filename, label) {
  console.log(`\n========================================`);
  console.log(`TESTING IMAGE: ${label} (${filename})`);
  console.log(`========================================`);
  
  const imgPath = path.join(__dirname, filename);
  if (!fs.existsSync(imgPath)) {
    console.error(`File not found: ${imgPath}`);
    return;
  }
  
  const imgBuf = fs.readFileSync(imgPath);
  const base64 = imgBuf.toString('base64');
  console.log(`[Vision] Image size: ${base64.length} bytes`);

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: visionModel,
      messages: [
        { role: 'system', content: visionSystemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Inspect this image and identify the crop or non-crop object.' },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + base64 } }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1500
    })
  });

  console.log(`[Vision] HTTP ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  console.log(`[Vision] Raw AI Output:\n${content}`);
}

async function runAll() {
  await testImage('cotton_test.jpg', 'Cotton Test Image');
  await new Promise(r => setTimeout(r, 3000));
  await testImage('wheat_test.jpg', 'Wheat Test Image');
  await new Promise(r => setTimeout(r, 3000));
  await testImage('rice_test.jpg', 'Rice Test Image');
  await new Promise(r => setTimeout(r, 3000));
  await testImage('noncrop_test.jpg', 'Non-Crop / Car Test Image');
}

runAll();
