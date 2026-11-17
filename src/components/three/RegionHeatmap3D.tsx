'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RegionStat } from '@/lib/analytics-demo';
import { heatColor } from '@/lib/analytics-demo';
import { PROVOCATION_LABELS } from '@/lib/agencies';

interface Props {
  regions: RegionStat[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

/** Hudud markazlarini taxminiy geografik joylashuvga proyeksiyalash (shimol — sahna ichkarisi) */
function project(lat: number, lon: number): [number, number] {
  return [(lon - 65.5) * 0.7, -(lat - 40.3) * 0.9];
}

function Column({ r, max, selected, onSelect }: { r: RegionStat; max: number; selected: boolean; onSelect: (id: string) => void }) {
  const [hover, setHover] = useState(false);
  const group = useRef<THREE.Group>(null!);
  const grow = useRef(0);
  const t = r.incidents / max;
  const h = 0.15 + t * 2.3;
  const color = heatColor(t);
  const [x, z] = project(r.lat, r.lon);

  useFrame((_, dt) => {
    grow.current = THREE.MathUtils.damp(grow.current, 1, 2.2, dt);
    group.current.scale.y = Math.max(0.001, grow.current);
  });

  useEffect(() => {
    document.body.style.cursor = hover ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hover]);

  return (
    <group position={[x, 0, z]}>
      <group ref={group}>
        <mesh
          position={[0, h / 2, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(true);
          }}
          onPointerOut={() => setHover(false)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(r.id);
          }}
        >
          <cylinderGeometry args={[0.24, 0.24, h, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hover || selected ? 0.6 : 0.16} metalness={0.35} roughness={0.42} />
        </mesh>
      </group>
      <mesh position={[0, 0.006, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.27, 0.31, 6]} />
        <meshBasicMaterial color={selected ? '#3B82F6' : '#334155'} />
      </mesh>
      <Html position={[0, h + 0.2, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <span className="whitespace-nowrap font-mono text-[11px] font-semibold text-slate-200 drop-shadow">{r.short}</span>
      </Html>
      {hover && (
        <Html position={[0, h + 0.75, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="w-52 rounded-lg border border-line bg-navy-900/95 p-2.5 text-[11.5px] text-slate-200 shadow-panel">
            <p className="font-semibold text-white">{r.name}</p>
            <p className="mt-1 font-mono">Eskalatsiya holatlari: {r.incidents}</p>
            <p className="font-mono">Tayyorgarlik: {r.readiness}%</p>
            <p className="mt-1 text-slate-400">Asosiy trend: {PROVOCATION_LABELS[r.topProvocation]}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

export function RegionHeatmap3D({ regions, selected, onSelect }: Props) {
  const max = Math.max(...regions.map((r) => r.incidents));
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0.5, 7.2, 7.4], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onSelect(null)}
      aria-label="Oʻzbekiston hududlari boʻyicha 3D issiqlik xaritasi"
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 8, 5]} intensity={1.4} />
      <pointLight position={[-5, 3, -3]} intensity={10} color="#3B82F6" distance={16} />
      <gridHelper args={[16, 32, '#1e293b', '#0f172a']} position={[0, 0, 0.2]} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0.2]}>
        <planeGeometry args={[16, 9]} />
        <meshStandardMaterial color="#0a1020" metalness={0.5} roughness={0.7} transparent opacity={0.85} />
      </mesh>
      {regions.map((r) => (
        <Column key={r.id} r={r} max={max} selected={selected === r.id} onSelect={onSelect} />
      ))}
      <OrbitControls enablePan={false} minPolarAngle={0.35} maxPolarAngle={1.2} minDistance={6} maxDistance={14} enableDamping />
    </Canvas>
  );
}

export default RegionHeatmap3D;
