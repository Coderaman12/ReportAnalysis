import { useRef, useState } from 'react';

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp';

export default function ReportUpload({ onAnalyze, error }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [dragging, setDragging] = useState(false);

  const pickFile = (f) => {
    if (!f) return;
    const maxBytes = 15 * 1024 * 1024;
    if (f.size > maxBytes) {
      alert('File too large. Max 15 MB.');
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const submit = () => {
    if (!file) return;
    onAnalyze(file, notes.trim());
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div>
      <div
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        <p className="upload-title">Drop your report here, or click to browse</p>
        <p className="upload-hint">PDF, JPG, PNG, or WEBP — up to 15 MB</p>
      </div>

      {file && (
        <div className="file-info">
          <span className="file-info-name">{file.name}</span>
          <span className="file-info-size">{formatSize(file.size)}</span>
        </div>
      )}

      <label className="field-label" htmlFor="notes">
        Symptoms or concerns (optional)
      </label>
      <textarea
        id="notes"
        placeholder="e.g. recurring headaches for two weeks, fatigue, family history of diabetes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={2000}
      />

      <button className="primary-btn" disabled={!file} onClick={submit}>
        Analyze report
      </button>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
