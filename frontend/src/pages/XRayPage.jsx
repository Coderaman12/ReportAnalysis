import XRayUpload from '../components/xray/XRayUpload.jsx';
import XRay3DViewer from '../components/xray/XRay3DViewer.jsx';
import XRayAnalysisCard from '../components/xray/XRayAnalysisCard.jsx';
import useXrayAnalysis from '../hooks/useXrayAnalysis.js';

export default function XRayPage() {
  const { file, result, loading, error, analyze, reset } = useXrayAnalysis();

  const hasResult = file && result;

  return (
    <>
      {!file && !loading && (
        <>
          <div className="hero">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              New · 3D visualization
            </div>
            <h1>
              See your X-ray in <span className="hero-accent">3D</span>
            </h1>
            <p>
              Upload an X-ray and rotate it as a depth map — dense areas like
              bones rise toward you, soft tissue recedes. An AI explanation
              appears alongside so you can understand exactly what you're
              seeing.
            </p>
          </div>

          <div className="feature-row">
            <div className="feature-chip">
              <span className="feature-chip-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </span>
              <div className="feature-chip-text">
                <strong>Rotatable depth view</strong>
                Drag to orbit, scroll to zoom.
              </div>
            </div>
            <div className="feature-chip">
              <span className="feature-chip-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <div className="feature-chip-text">
                <strong>Plain-language findings</strong>
                AI explains what's on the image.
              </div>
            </div>
            <div className="feature-chip">
              <span className="feature-chip-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <div className="feature-chip-text">
                <strong>Private & local</strong>
                3D rendering runs in your browser.
              </div>
            </div>
          </div>

          <div className="card">
            <XRayUpload onAnalyze={analyze} error={error} />
          </div>
        </>
      )}

      {loading && (
        <div className="card loading">
          <div className="spinner" />
          <p>Reading your X-ray. This can take 10–30 seconds.</p>
        </div>
      )}

      {hasResult && (
        <>
          <div className="xray-layout">
            <XRay3DViewer
              file={file}
              invertedHint={result.imageInterpretation?.invertedHint}
            />
            <XRayAnalysisCard result={result} />
          </div>
          <button className="ghost-btn" onClick={reset}>
            Upload another X-ray
          </button>
        </>
      )}

      {!loading && file && !result && error && (
        <div className="card">
          <div className="error">{error}</div>
          <button className="ghost-btn" onClick={reset}>
            Try again
          </button>
        </div>
      )}
    </>
  );
}
