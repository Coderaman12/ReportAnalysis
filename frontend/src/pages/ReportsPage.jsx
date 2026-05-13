import ReportUpload from '../components/report/ReportUpload.jsx';
import AnalysisResult from '../components/report/AnalysisResult.jsx';
import useReportAnalysis from '../hooks/useReportAnalysis.js';

export default function ReportsPage() {
  const { result, loading, error, analyze, reset } = useReportAnalysis();

  return (
    <>
      {!result && !loading && (
        <>
          <div className="hero">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              AI-powered analysis
            </div>
            <h1>
              Understand your <span className="hero-accent">medical report</span>
            </h1>
            <p>
              Upload a lab result, prescription, or scan to get a plain-language
              summary, recommended specialist, and personalized next steps — in
              under a minute.
            </p>
          </div>
          <div className="card">
            <ReportUpload onAnalyze={analyze} error={error} />
          </div>
        </>
      )}

      {loading && (
        <div className="card loading">
          <div className="spinner" />
          <p>Analyzing your report. This can take 10–30 seconds.</p>
        </div>
      )}

      {result && (
        <>
          <AnalysisResult result={result} />
          <button className="ghost-btn" onClick={reset}>
            Analyze another report
          </button>
        </>
      )}
    </>
  );
}
