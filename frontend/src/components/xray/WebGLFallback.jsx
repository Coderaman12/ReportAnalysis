import { useEffect, useState } from 'react';

export default function WebGLFallback({ file }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="webgl-fallback">
      {url && <img src={url} alt="Uploaded X-ray" />}
      <p>
        3D view is unavailable because your browser does not support WebGL. The
        analysis below still applies to this X-ray.
      </p>
    </div>
  );
}
