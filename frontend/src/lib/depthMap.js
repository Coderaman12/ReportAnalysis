export const DEPTH_GRID_SIZE = 192;

export async function loadImageToCanvas(source, maxSize = DEPTH_GRID_SIZE) {
  const img = await loadImageElement(source);
  const aspect = img.width / img.height;
  let w, h;
  if (aspect >= 1) {
    w = maxSize;
    h = Math.max(1, Math.round(maxSize / aspect));
  } else {
    h = maxSize;
    w = Math.max(1, Math.round(maxSize * aspect));
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  return { canvas, imageData, width: w, height: h, aspect };
}

function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image.'));
    if (source instanceof File || source instanceof Blob) {
      img.src = URL.createObjectURL(source);
    } else {
      img.src = source;
    }
  });
}

export function computeLuminanceBuffer(imageData) {
  const { data } = imageData;
  const pixelCount = data.length / 4;
  const buf = new Float32Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    buf[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  return buf;
}

export function applyDepthToGeometry(geometry, luminance, { scale = 0.5, invert = false } = {}) {
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < luminance.length; i++) {
    const v = invert ? 1 - luminance[i] : luminance[i];
    positions[i * 3 + 2] = v * scale;
  }
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
}
