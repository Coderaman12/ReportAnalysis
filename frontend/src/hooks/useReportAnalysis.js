import { useState, useCallback } from 'react';
import { analyzeReport } from '../lib/api.js';

export default function useReportAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = useCallback(async (file, notes) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeReport(file, notes);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError('');
  }, []);

  return { result, loading, error, analyze, reset };
}
