import { createRequire } from 'module';
import { callModelWithFallback, imageBufferToDataUri } from '../lib/openrouterClient.js';
import { PDF_MIME_TYPE } from '../lib/constants.js';
import { REPORT_SYSTEM_PROMPT, REPORT_DEFAULT_DISCLAIMER } from './prompts/reportPrompt.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

async function buildUserContent({ buffer, mimetype, filename, patientNotes }) {
  const notesLine = patientNotes ? `\n\nPatient-provided notes/symptoms: ${patientNotes}` : '';
  const fileLine = filename ? ` (filename: ${filename})` : '';

  if (mimetype === PDF_MIME_TYPE) {
    const { text } = await pdfParse(buffer);
    const cleaned = (text || '').trim();
    if (!cleaned) {
      throw new Error('Could not extract any text from the PDF. Try uploading as an image instead.');
    }
    const userText = `Please analyze this medical report${fileLine}.${notesLine}\n\n--- BEGIN REPORT TEXT ---\n${cleaned.slice(0, 12000)}\n--- END REPORT TEXT ---\n\nReturn the JSON exactly as specified.`;
    return [{ type: 'text', text: userText }];
  }

  const userText = `Please analyze the attached medical report image${fileLine}.${notesLine}\n\nReturn the JSON exactly as specified in the system instructions.`;
  return [
    { type: 'text', text: userText },
    { type: 'image_url', image_url: { url: imageBufferToDataUri(buffer, mimetype) } },
  ];
}

export async function analyzeReport({ buffer, mimetype, filename, patientNotes }) {
  const userContent = await buildUserContent({ buffer, mimetype, filename, patientNotes });
  const needsVision = mimetype !== PDF_MIME_TYPE;

  const parsed = await callModelWithFallback({
    needsVision,
    messages: [
      { role: 'system', content: REPORT_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
  });

  if (!parsed.disclaimer) parsed.disclaimer = REPORT_DEFAULT_DISCLAIMER;
  return parsed;
}
