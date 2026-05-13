import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  loadImageToCanvas,
  computeLuminanceBuffer,
  applyDepthToGeometry,
  DEPTH_GRID_SIZE,
} from '../../lib/depthMap.js';

export default function DepthMesh({ file, depthScale, invert, onReady }) {
  const meshRef = useRef(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [luminance, setLuminance] = useState(null);
  const [texture, setTexture] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoadError('');

    if (!file) return;

    (async () => {
      try {
        const info = await loadImageToCanvas(file, DEPTH_GRID_SIZE);
        if (cancelled) return;
        const lum = computeLuminanceBuffer(info.imageData);
        const tex = new THREE.CanvasTexture(info.canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setImageInfo(info);
        setLuminance(lum);
        setTexture(tex);
        onReady?.(info);
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Failed to process image.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file, onReady]);

  const geometry = useMemo(() => {
    if (!imageInfo) return null;
    const { width, height, aspect } = imageInfo;
    const planeW = aspect >= 1 ? 4 : 4 * aspect;
    const planeH = aspect >= 1 ? 4 / aspect : 4;
    return new THREE.PlaneGeometry(planeW, planeH, width - 1, height - 1);
  }, [imageInfo]);

  useEffect(() => {
    if (!geometry || !luminance) return;
    applyDepthToGeometry(geometry, luminance, { scale: depthScale, invert });
  }, [geometry, luminance, depthScale, invert]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
      texture?.dispose();
    };
  }, [geometry, texture]);

  if (loadError) {
    return (
      <mesh>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial color="#fef2f2" />
      </mesh>
    );
  }

  if (!geometry || !texture) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  );
}
