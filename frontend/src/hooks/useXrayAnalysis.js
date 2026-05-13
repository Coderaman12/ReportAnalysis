import { useState, useCallback } from 'react';
import { analyzeXray } from '../lib/api.js';

export default function useXrayAnalysis() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = useCallback(async (f) => {
    setLoading(true);
    setError('');
    setResult(null);
    setFile(f);
    try {
      const data = await analyzeXray(f);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setResult(null);
    setError('');
  }, []);

  return { file, result, loading, error, analyze, reset };
}
