import { useState } from 'react';
import UploadDropZone from '../common/UploadDropZone.jsx';
import useFileUpload from '../../hooks/useFileUpload.js';
import {
  REPORT_ACCEPT,
  REPORT_MIME_TYPES,
  MAX_NOTES_LENGTH,
} from '../../lib/constants.js';

export default function ReportUpload({ onAnalyze, error }) {
  const { file, error: localError, pickFile } = useFileUpload({
    allowedMimes: REPORT_MIME_TYPES,
  });
  const [notes, setNotes] = useState('');

  const submit = () => {
    if (!file) return;
    onAnalyze(file, notes.trim());
  };

  const displayedError = error || localError;

  return (
    <div>
      <UploadDropZone
        accept={REPORT_ACCEPT}
        file={file}
        onFile={pickFile}
        title="Drop your report here, or click to browse"
        hint="PDF, JPG, PNG, or WEBP — up to 15 MB"
      />

      <label className="field-label" htmlFor="notes">
        Symptoms or concerns (optional)
      </label>
      <textarea
        id="notes"
        placeholder="e.g. recurring headaches for two weeks, fatigue, family history of diabetes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={MAX_NOTES_LENGTH}
      />

      <button className="primary-btn" disabled={!file} onClick={submit}>
        Analyze report
      </button>

      {displayedError && <div className="error">{displayedError}</div>}
    </div>
  );
}
