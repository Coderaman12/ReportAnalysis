import { useState } from 'react';
import ReportUpload from './components/ReportUpload.jsx';
import AnalysisResult from './components/AnalysisResult.jsx';
import './App.css';

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (file, notes) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('report', file);
      if (notes) formData.append('notes', notes);

      const apiBase = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiBase}/api/analyze`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed.');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            Med<span className="brand-accent">Report</span>
          </div>
          <div className="topbar-tag">AI Analysis</div>
        </div>
      </header>

      <main className="content">
        {!result && !loading && (
          <>
            <div className="hero">
              <h1>Understand your medical report</h1>
              <p>Upload a lab result, prescription, or scan to get a plain-language summary and next steps.</p>
            </div>
            <div className="card">
              <ReportUpload onAnalyze={handleAnalyze} error={error} />
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
      </main>
    </div>
  );
}
