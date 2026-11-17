'use client';

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { CORE_FRAG, CORE_VERT, GLASS_FRAG, GLASS_VERT } from './shaders';
import { aggressionColor, cn } from '@/lib/utils';

export interface NeuralCoreProps {
  /** 0–100 */
  aggression: number;
  /** Xodim mikrofoni balandligi 0–1 */
  levelRef?: MutableRefObject<number>;
  /** AI Fuqaro nutq amplitudasi 0–1 */
  speakingRef?: MutableRefObject<number>;
  /** Landing uchun: agressiya oʻz-oʻzidan tsikl boʻyicha oʻzgaradi */
  idle?: boolean;
  className?: string;
}

const C_CALM = new THREE.Color('#10B981');
const C_TENSE = new THREE.Color('#F59E0B');
const C_CRIT = new THREE.Color('#EF4444');

function stateColor(a: number, out: THREE.Color) {
  if (a < 0.5) return out.copy(C_CALM).lerp(C_TENSE, a / 0.5);
  return out.copy(C_TENSE).lerp(C_CRIT, (a - 0.5) / 0.5);
}

function CoreScene({ aggression, levelRef, speakingRef, idle }: Omit<NeuralCoreProps, 'className'>) {
  const target = useRef(aggression / 100);
  target.current = aggression / 100;
  const agg = useRef(aggression / 100);
  const color = useMemo(() => new THREE.Color(), []);

  const group = useRef<THREE.Group>(null!);
  const wire = useRef<THREE.Mesh>(null!);
  const wireMat = useRef<THREE.MeshBasicMaterial>(null!);
  const rings = useRef<THREE.Group>(null!);
  const pts = useRef<THREE.Points>(null!);
  const ptsMat = useRef<THREE.PointsMaterial>(null!);
  const pulse = useRef<THREE.Mesh>(null!);
  const pulseMat = useRef<THREE.MeshBasicMaterial>(null!);
  const rim = useRef<THREE.PointLight>(null!);

  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAgg: { value: 0 },
      uLevel: { value: 0 },
      uColor: { value: new THREE.Color('#10B981') },
      uDeep: { value: new THREE.Color('#0B1B3F') },
    }),
    [],
  );
  const glassUniforms = useMemo(() => ({ uColor: { value: new THREE.Color('#10B981') }, uTime: { value: 0 } }), []);

  const particles = useMemo(() => {
    const n = 760;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 2.1 + Math.random() * 1.4;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.cos(ph) * 0.7;
      arr[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    return arr;
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const tgt = idle ? 0.5 + 0.48 * Math.sin(t * 0.22) : target.current;
    agg.current = THREE.MathUtils.damp(agg.current, tgt, 1.6, dt);
    const a = agg.current;
    const lvl = Math.max(levelRef?.current ?? 0, (speakingRef?.current ?? 0) * 0.8);
    stateColor(a, color);

    coreUniforms.uTime.value = t;
    coreUniforms.uAgg.value = a;
    coreUniforms.uLevel.value = THREE.MathUtils.damp(coreUniforms.uLevel.value, lvl, 8, dt);
    coreUniforms.uColor.value.copy(color);
    glassUniforms.uColor.value.copy(color);
    glassUniforms.uTime.value = t;

    wire.current.rotation.y += dt * (0.15 + a * 0.9);
    wire.current.rotation.x += dt * (0.05 + a * 0.3);
    wire.current.scale.setScalar(1 + Math.sin(t * (2 + a * 10)) * 0.015 * (1 + a * 3) + lvl * 0.04);
    wireMat.current.color.copy(color);
    wireMat.current.opacity = 0.16 + a * 0.34;

    rings.current.children.forEach((r, i) => {
      r.rotation.z += dt * (0.18 + a * 1.2) * (i % 2 ? -1 : 1);
      r.rotation.x = Math.PI / 2 + Math.sin(t * 0.3 + i * 1.7) * 0.28;
    });

    pts.current.rotation.y -= dt * (0.04 + a * 0.35);
    ptsMat.current.color.copy(color);
    ptsMat.current.size = 0.018 + a * 0.022;

    const freq = 0.45 + a * 1.8;
    const ph = (t * freq) % 1;
    pulse.current.scale.setScalar(1.1 + ph * 2.6);
    pulseMat.current.opacity = (1 - ph) * (0.22 + a * 0.38);
    pulseMat.current.color.copy(color);

    rim.current.color.copy(color);
    rim.current.intensity = 16 + a * 30 + lvl * 25;

    if (a > 0.82) {
      const k = (a - 0.82) * 0.07;
      group.current.position.set((Math.random() - 0.5) * k, (Math.random() - 0.5) * k, 0);
    } else {
      group.current.position.set(0, 0, 0);
    }

    // Kamera paralaksi (sichqoncha/touch)
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 0.7, 2.5, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 0.25 + state.pointer.y * 0.4, 2.5, dt);
    cam.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} color="#dbeafe" />
      <pointLight ref={rim} position={[-3, 1.5, -2]} intensity={18} distance={12} />
      <pointLight position={[3, -2, 2]} intensity={8} color="#3B82F6" distance={10} />
      {/* Studiya yorugʻligi — toʻliq protsedural, tarmoqsiz ishlaydi */}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, -4]} scale={[10, 2, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={1.2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={1.6} position={[4, 1, 3]} scale={2} color="#fbbf24" />
      </Environment>

      <group ref={group}>
        <mesh>
          <icosahedronGeometry args={[1, 40]} />
          <shaderMaterial uniforms={coreUniforms} vertexShader={CORE_VERT} fragmentShader={CORE_FRAG} />
        </mesh>
        <mesh ref={wire}>
          <icosahedronGeometry args={[1.38, 2]} />
          <meshBasicMaterial ref={wireMat} wireframe transparent opacity={0.25} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.82, 64, 64]} />
          <shaderMaterial
            uniforms={glassUniforms}
            vertexShader={GLASS_VERT}
            fragmentShader={GLASS_FRAG}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <group ref={rings}>
          {[2.15, 2.42, 2.72].map((r, i) => (
            <mesh key={r} rotation={[Math.PI / 2, 0, i]}>
              <torusGeometry args={[r, 0.012 + i * 0.004, 16, 180]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.22} />
            </mesh>
          ))}
        </group>
        <points ref={pts}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particles, 3]} />
          </bufferGeometry>
          <pointsMaterial ref={ptsMat} size={0.025} transparent opacity={0.85} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        <mesh ref={pulse} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 0]}>
          <ringGeometry args={[0.97, 1, 96]} />
          <meshBasicMaterial ref={pulseMat} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.02, 0]}>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#0b1222" metalness={0.7} roughness={0.45} />
      </mesh>
    </>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** WebGL boʻlmagan qurilmalar uchun CSS zaxira varianti */
function CoreFallback({ aggression }: { aggression: number }) {
  const c = aggressionColor(aggression);
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-48 w-48">
        <div className="absolute inset-0 animate-pulse-ring rounded-full border" style={{ borderColor: c }} />
        <div
          className="absolute inset-6 rounded-full transition-all duration-700"
          style={{ background: `radial-gradient(circle at 35% 30%, #ffffff55, ${c} 40%, #0b1b3f 85%)`, boxShadow: `0 0 80px -10px ${c}` }}
        />
      </div>
    </div>
  );
}

export function NeuralCore({ className, ...props }: NeuralCoreProps) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => setWebgl(hasWebGL()), []);
  return (
    <div className={cn('relative h-full w-full', className)}>
      {webgl === false ? (
        <CoreFallback aggression={props.aggression} />
      ) : webgl ? (
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0.25, 6.2], fov: 38 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          aria-label="Fuqaro agressiya darajasini aks ettiruvchi 3D akustik yadro"
        >
          <CoreScene {...props} />
        </Canvas>
      ) : null}
    </div>
  );
}

export default NeuralCore;
