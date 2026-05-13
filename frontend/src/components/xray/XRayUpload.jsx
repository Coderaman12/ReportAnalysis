import UploadDropZone from '../common/UploadDropZone.jsx';
import useFileUpload from '../../hooks/useFileUpload.js';
import { IMAGE_ACCEPT, IMAGE_MIME_TYPES } from '../../lib/constants.js';

export default function XRayUpload({ onAnalyze, error }) {
  const { file, error: localError, pickFile } = useFileUpload({
    allowedMimes: IMAGE_MIME_TYPES,
  });

  const submit = () => {
    if (!file) return;
    onAnalyze(file);
  };

  const displayedError = error || localError;

  return (
    <div>
      <UploadDropZone
        accept={IMAGE_ACCEPT}
        file={file}
        onFile={pickFile}
        title="Drop your X-ray image here, or click to browse"
        hint="JPG, PNG, or WEBP — up to 15 MB"
      />

      <button className="primary-btn" disabled={!file} onClick={submit}>
        Generate 3D view
      </button>

      {displayedError && <div className="error">{displayedError}</div>}
    </div>
  );
}
