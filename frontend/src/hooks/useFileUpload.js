import { useState, useCallback } from 'react';
import { MAX_UPLOAD_BYTES } from '../lib/constants.js';

export default function useFileUpload({ allowedMimes, maxBytes = MAX_UPLOAD_BYTES } = {}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const pickFile = useCallback(
    (f) => {
      if (!f) return;
      if (allowedMimes && !allowedMimes.includes(f.type)) {
        setError(`Unsupported file type. Allowed: ${allowedMimes.join(', ')}`);
        return;
      }
      if (f.size > maxBytes) {
        setError(`File too large. Max ${Math.round(maxBytes / (1024 * 1024))} MB.`);
        return;
      }
      setError('');
      setFile(f);
    },
    [allowedMimes, maxBytes]
  );

  const reset = useCallback(() => {
    setFile(null);
    setError('');
  }, []);

  return { file, error, pickFile, reset, setError };
}
