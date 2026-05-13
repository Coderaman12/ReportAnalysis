import { callModelWithFallback, imageBufferToDataUri } from '../lib/openrouterClient.js';
import { XRAY_SYSTEM_PROMPT, XRAY_DEFAULT_DISCLAIMER } from './prompts/xrayPrompt.js';

function buildUserContent({ buffer, mimetype, filename }) {
  const fileLine = filename ? ` (filename: ${filename})` : '';
  const userText = `Please analyze the attached X-ray image${fileLine} for the patient.\n\nReturn the JSON exactly as specified in the system instructions.`;
  return [
    { type: 'text', text: userText },
    { type: 'image_url', image_url: { url: imageBufferToDataUri(buffer, mimetype) } },
  ];
}

export async function analyzeXray({ buffer, mimetype, filename }) {
  const userContent = buildUserContent({ buffer, mimetype, filename });

  const parsed = await callModelWithFallback({
    needsVision: true,
    temperature: 0.2,
    primaryOverride: process.env.OPENROUTER_XRAY_MODEL,
    messages: [
      { role: 'system', content: XRAY_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
  });

  if (!parsed.disclaimer) parsed.disclaimer = XRAY_DEFAULT_DISCLAIMER;
  return parsed;
}
