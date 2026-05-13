import OpenAI from 'openai';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

if (!process.env.OPENROUTER_API_KEY) {
  console.warn('⚠️  OPENROUTER_API_KEY is not set. Add it to backend/.env');
}

const client = new OpenAI({
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

function buildModelChain(needsVision) {
  const base = needsVision ? VISION_FALLBACKS : TEXT_FALLBACKS;
  const chain = [PRIMARY_MODEL, ...base.filter((m) => m !== PRIMARY_MODEL)];
  return [...new Set(chain)];
}

const SYSTEM_PROMPT = `You are a medical report analysis assistant helping patients understand their lab/diagnostic reports in plain language.

You are NOT a doctor. Every response MUST include a clear disclaimer that this is informational only and not a medical diagnosis.

Given a medical report (lab results, imaging, prescription, discharge summary, etc.), return a STRICT JSON object — no markdown, no prose, no code fences, ONLY JSON — matching this schema:

{
  "summary": "2-4 sentence plain-language summary of the report",
  "issues": [
    { "title": "short issue name", "detail": "what it means for the patient", "severity": "low | moderate | high" }
  ],
  "improvements": [
    { "area": "diet | lifestyle | medication | follow-up | exercise | sleep | mental-health", "suggestion": "specific actionable advice" }
  ],
  "recommendedDepartment": {
    "primary": "name of the primary medical department/specialist to consult",
    "alternatives": ["other relevant specialists if any"],
    "urgency": "routine | soon | urgent"
  },
  "keyMetrics": [
    { "name": "metric name (e.g. Hemoglobin)", "value": "value with unit", "status": "normal | low | high | borderline" }
  ],
  "disclaimer": "This analysis is informational and not a substitute for professional medical advice."
}

Rules:
- Output ONLY the JSON object. No markdown. No code fences. No explanation.
- If the document is not a medical report, return one item in "issues" explaining that, and set recommendedDepartment.primary to "N/A".
- Be conservative: never overstate severity. If a result is ambiguous, mark it borderline and recommend follow-up.
- Tailor improvements to what the report actually shows; do not invent findings.`;

function extractJson(text) {
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

async function buildUserContent({ buffer, mimetype, filename, patientNotes }) {
  const notesLine = patientNotes ? `\n\nPatient-provided notes/symptoms: ${patientNotes}` : '';
  const fileLine = filename ? ` (filename: ${filename})` : '';

  if (mimetype === 'application/pdf') {
    const { text } = await pdfParse(buffer);
    const cleaned = (text || '').trim();
    if (!cleaned) {
      throw new Error('Could not extract any text from the PDF. Try uploading as an image instead.');
    }
    const userText = `Please analyze this medical report${fileLine}.${notesLine}\n\n--- BEGIN REPORT TEXT ---\n${cleaned.slice(0, 12000)}\n--- END REPORT TEXT ---\n\nReturn the JSON exactly as specified.`;
    return [{ type: 'text', text: userText }];
  }

  const base64 = buffer.toString('base64');
  const userText = `Please analyze the attached medical report image${fileLine}.${notesLine}\n\nReturn the JSON exactly as specified in the system instructions.`;
  return [
    { type: 'text', text: userText },
    { type: 'image_url', image_url: { url: `data:${mimetype};base64,${base64}` } },
  ];
}

function isRetryable(err) {
  const status = err?.status || err?.response?.status;
  return status === 429 || status === 502 || status === 503 || status === 504 || !status;
}

export async function analyzeReport({ buffer, mimetype, filename, patientNotes }) {
  const userContent = await buildUserContent({ buffer, mimetype, filename, patientNotes });
  const needsVision = mimetype !== 'application/pdf';
  const chain = buildModelChain(needsVision);

  let lastErr;
  for (const model of chain) {
    try {
      console.log(`→ trying model: ${model}`);
      const response = await client.chat.completions.create({
        model,
        temperature: 0.3,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      });

      const text = response.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response from model.');

      const parsed = extractJson(text);
      if (!parsed.disclaimer) {
        parsed.disclaimer = 'This analysis is informational and not a substitute for professional medical advice.';
      }
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
