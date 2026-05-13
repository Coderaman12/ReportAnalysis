# MedReport AI

A web app that lets patients upload a medical report (lab result, prescription, scan) and receive an AI-generated plain-language analysis with suggested next steps and a recommended specialist.

## What it does

1. Patient uploads a report (PDF or image).
2. Backend extracts content — PDFs via `pdf-parse`, images sent directly to a vision model.
3. AI model returns a structured JSON analysis.
4. Frontend renders summary, findings, suggestions, key metrics, recommended doctor department, and urgency.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| AI | OpenRouter free-tier vision models (Gemma 4, Nemotron, etc.) |
| PDF | `pdf-parse` for server-side text extraction |
| Hosting (frontend) | Netlify |
| Hosting (backend) | Render |

## How it works (request flow)

```
[ User uploads file ]
       │
       ▼
[ React frontend ] ──── multipart/form-data ───▶ [ Express /api/analyze ]
                                                       │
                                  PDF? ────────────────┤
                                   │                   │
                              pdf-parse              base64 image
                                   │                   │
                                   ▼                   ▼
                              [ Send to OpenRouter vision model ]
                                            │
                              fallback chain on 429/5xx
                                            │
                                            ▼
                              [ Strict JSON response ]
                                            │
                                            ▼
                              [ Rendered analysis UI ]
```

## Response schema

The AI returns this structure (parsed and rendered on the frontend):

```json
{
  "summary": "Plain-language overview",
  "issues": [ { "title", "detail", "severity": "low|moderate|high" } ],
  "improvements": [ { "area": "diet|lifestyle|...", "suggestion" } ],
  "recommendedDepartment": {
    "primary": "Specialist name",
    "alternatives": ["..."],
    "urgency": "routine|soon|urgent"
  },
  "keyMetrics": [ { "name", "value", "status": "normal|low|high|borderline" } ],
  "disclaimer": "..."
}
```

## Project structure

```
ReportAnalysis/
├── backend/
│   ├── server.js              # Express setup, CORS, routing
│   ├── routes/analyze.js      # POST /api/analyze
│   └── services/analyzer.js   # OpenRouter call + model fallback
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── ReportUpload.jsx
│           └── AnalysisResult.jsx
└── netlify.toml               # Netlify build config
```

## Run locally

```bash
# backend
cd backend
cp .env.example .env             # then add OPENROUTER_API_KEY
npm install
npm run dev                      # http://localhost:5000

# frontend (separate terminal)
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

## Environment variables

**Backend (Render)**
- `OPENROUTER_API_KEY` — key from [openrouter.ai](https://openrouter.ai)
- `OPENROUTER_MODEL` — default `google/gemma-4-31b-it:free`
- `ALLOWED_ORIGINS` — comma-separated frontend URLs for CORS

**Frontend (Netlify)**
- `VITE_API_URL` — full backend URL (e.g. `https://reportanalysis01.onrender.com`)

## Key design decisions

- **Strict JSON output** — system prompt forces structured response; client-side `extractJson` strips any stray markdown.
- **Model fallback chain** — if a free model is rate-limited (429), the backend automatically retries with the next free model.
- **PDF text extraction server-side** — avoids needing vision tokens for text-only PDFs and is much faster.
- **Disclaimer enforced** — every response includes a medical-advice disclaimer, added defensively even if the model omits it.

## Future add-ons

- **User accounts & report history** — save past analyses per patient, track trends over time.
- **Compare multiple reports** — side-by-side metric comparison across visits.
- **Multi-language support** — translate analysis to Hindi / regional languages.
- **Doctor directory** — instead of just naming a department, link to nearby verified doctors.
- **Symptom-driven follow-up Q&A** — chat with the AI to clarify findings after the initial analysis.
- **Voice symptom input** — patients describe symptoms by speaking instead of typing.
- **Export to PDF** — downloadable analysis report patients can show to a doctor.
- **EHR integration** — pull reports directly from hospital systems (FHIR API).
- **Better OCR for low-quality scans** — fallback OCR layer before AI for blurry/handwritten reports.
- **Doctor verification mode** — let a real doctor review and sign-off on AI analyses for higher trust.
- **Mobile app** — native Android/iOS for camera capture of reports on the go.
- **Caching** — cache identical report hashes to avoid re-calling AI for the same upload.

## Disclaimer

This project is informational only. It is not a medical device and must not be used as a substitute for professional medical advice, diagnosis, or treatment.
