import OpenAI from 'openai';

if (!process.env.OPENROUTER_API_KEY) {
  console.warn('⚠️  OPENROUTER_API_KEY is not set. Add it to backend/.env');
}

export const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'MedReport AI',
  },
});

const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free';

const VISION_FALLBACKS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
];

const TEXT_FALLBACKS = [
  ...VISION_FALLBACKS,
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-chat-v3.1:free',
  'mistralai/mistral-small-3.2-24b-instruct:free',
];

export function buildModelChain({ needsVision = true, primaryOverride } = {}) {
  const primary = primaryOverride || PRIMARY_MODEL;
  const base = needsVision ? VISION_FALLBACKS : TEXT_FALLBACKS;
  return [...new Set([primary, ...base.filter((m) => m !== primary)])];
}

export function extractJson(text) {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('Model did not return valid JSON.');
  }
}

export function isRetryable(err) {
  const status = err?.status || err?.response?.status;
  return status === 429 || status === 502 || status === 503 || status === 504 || !status;
}

export async function callModelWithFallback({
  messages,
  needsVision = true,
  primaryOverride,
  temperature = 0.3,
  maxTokens = 2048,
}) {
  const chain = buildModelChain({ needsVision, primaryOverride });

  let lastErr;
  for (const model of chain) {
    try {
      console.log(`→ trying model: ${model}`);
      const response = await client.chat.completions.create({
        model,
        temperature,
        max_tokens: maxTokens,
        messages,
      });

      const text = response.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response from model.');

      const parsed = extractJson(text);
      parsed._modelUsed = model;
      return parsed;
    } catch (err) {
      console.warn(`  ✗ ${model} failed: ${err.status || ''} ${err.message}`);
      lastErr = err;
      if (!isRetryable(err)) throw err;
    }
  }

  const msg = lastErr?.status === 429
    ? 'All free models are rate-limited right now. Wait a minute and try again, or add a small OpenRouter credit ($1) to unlock higher free-tier limits.'
    : `Analysis failed: ${lastErr?.message || 'unknown error'}`;
  const e = new Error(msg);
  e.status = lastErr?.status || 500;
  throw e;
}

export function imageBufferToDataUri(buffer, mimetype) {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}
