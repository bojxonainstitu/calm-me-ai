'use client';

import { motion } from 'framer-motion';

/** Namunaviy kliplar uchun sintetik «kadr» — siluetlar va maxfiylik niqoblari (real tasvir emas) */
export function SyntheticFrame({ scene, index, masked }: { scene: 'road' | 'street' | 'border'; index: number; masked: boolean }) {
  const shift = (index % 3) * 6 - 6;
  const people =
    scene === 'border'
      ? [30, 62, 94, 126, 158, 196].map((x, i) => ({ x: x + (i % 2) * 2, y: 64 + (i % 2) * 4, s: 1 - i * 0.04 }))
      : scene === 'street'
        ? [
            { x: 70 + shift, y: 58, s: 1.05 },
            { x: 132 - shift, y: 60, s: 1 },
            { x: 190, y: 66, s: 0.85 },
          ]
        : [
            { x: 58 + shift, y: 60, s: 1 },
            { x: 108, y: 62, s: 0.95 },
          ];
  return (
    <svg viewBox="0 0 240 135" className="h-full w-full" role="img" aria-label="Sintetik kadr: siluetlar">
      <defs>
        <linearGradient id={`sky-${scene}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e293b" />
          <stop offset="1" stopColor="#0b1222" />
        </linearGradient>
      </defs>
      <rect width="240" height="135" fill={`url(#sky-${scene})`} />
      <rect y="100" width="240" height="35" fill="#111a2e" />
      {scene === 'border' && (
        <>
          <rect x="196" y="30" width="38" height="70" rx="3" fill="#16203a" stroke="#334155" />
          <rect x="202" y="40" width="26" height="14" fill="#1e3a8a" opacity="0.5" />
        </>
      )}
      {scene === 'road' && (
        <g>
          <rect x="140" y="70" width="86" height="34" rx="8" fill="#1f2937" stroke="#475569" />
          <rect x="152" y="58" width="58" height="18" rx="6" fill="#273449" />
          <rect x="166" y="94" width="34" height="8" rx="1.5" fill="#e2e8f0" />
          {masked && (
            <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 1 }} x="162" y="91" width="42" height="14" rx="2" fill="#475569" stroke="#D97706" strokeWidth="1.2" />
          )}
        </g>
      )}
      {people.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
          <rect x="-12" y="8" width="24" height="36" rx="9" fill="#334155" />
          <circle cx="0" cy="0" r="8" fill="#64748b" />
          {scene === 'street' && i === 0 && <rect x="9" y="-6" width="7" height="12" rx="1.5" fill="#94a3b8" />}
          {masked && (
            <motion.rect
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              x="-11"
              y="-11"
              width="22"
              height="22"
              rx="3"
              fill="#475569"
              stroke="#D97706"
              strokeWidth="1.2"
            />
          )}
        </g>
      ))}
      <text x="6" y="12" fontFamily="monospace" fontSize="7" fill="#94a3b8">
        CAM-0{index + 1} · SINTETIK
      </text>
    </svg>
  );
}
