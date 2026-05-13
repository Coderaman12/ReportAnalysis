import { useRef, useState } from 'react';
import { formatBytes } from '../../lib/constants.js';

export default function UploadDropZone({
  accept,
  file,
  onFile,
  title = 'Drop your file here, or click to browse',
  hint = '',
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    onFile(e.dataTransfer.files?.[0]);
  };

  return (
    <>
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
          accept={accept}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <div className="upload-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="upload-title">{title}</p>
        {hint && <p className="upload-hint">{hint}</p>}
      </div>

      {file && (
        <div className="file-info">
          <span className="file-info-name">{file.name}</span>
          <span className="file-info-size">{formatBytes(file.size)}</span>
        </div>
      )}
    </>
  );
}
