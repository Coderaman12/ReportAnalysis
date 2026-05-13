import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import DepthMesh from './DepthMesh.jsx';
import ViewerControls from './ViewerControls.jsx';
import WebGLFallback from './WebGLFallback.jsx';
import { isWebGLAvailable } from '../../lib/webgl.js';

const DEFAULT_DEPTH = 0.55;

export default function XRay3DViewer({ file, invertedHint }) {
  const [depthScale, setDepthScale] = useState(DEFAULT_DEPTH);
  const [invert, setInvert] = useState(false);
  const controlsRef = useRef(null);
  const webglOk = isWebGLAvailable();

  useEffect(() => {
    if (typeof invertedHint === 'boolean') setInvert(invertedHint);
  }, [invertedHint]);

  const resetView = () => {
    controlsRef.current?.reset();
    setDepthScale(DEFAULT_DEPTH);
  };

  if (!webglOk) {
    return <WebGLFallback file={file} />;
  }

  return (
    <div className="xray-canvas-wrap">
      <div className="xray-canvas">
        <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 2]}>
          <color attach="background" args={['#0d1117']} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 4, 5]} intensity={0.9} />
          <directionalLight position={[-3, -2, 2]} intensity={0.35} />
          <DepthMesh file={file} depthScale={depthScale} invert={invert} />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>
      </div>

      <ViewerControls
        depthScale={depthScale}
        onDepthScaleChange={setDepthScale}
        invert={invert}
        onInvertChange={setInvert}
        onReset={resetView}
      />
    </div>
  );
}
