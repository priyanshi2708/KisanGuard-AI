import fs from 'fs';
import path from 'path';

function getGroqApiKey() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GROQ_API_KEY=\s*([^\s\r\n]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (e) {}
  return null;
}

async function testGroq() {
  const apiKey = getGroqApiKey();
  if (!apiKey) return;

  const modelsToTest = [
    'llama-3.3-70b-versatile',
    'llama-3.3-70b-specdec',
    'llama3-70b-8192',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b'
  ];

  for (const model of modelsToTest) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        })
      });
      console.log(`Model [${model}] HTTP status: ${res.status}`);
    } catch (e) {
      console.error(`Model [${model}] Exception:`, e.message);
    }
  }
}

testGroq();
