'use client';

import { useState, type MouseEvent } from 'react';
import { formatTimestamp } from '@/lib/utils';

interface Props {
  data: { t: number; level: number }[];
  duration: number;
  trigger: number;
}

/** Eskalatsiya darajasi vaqt boʻyicha (bitta qator) + trigger belgisi + hover tooltip */
export function EscalationTimeline({ data, duration, trigger }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560;
  const H = 150;
  const m = { l: 34, r: 12, t: 14, b: 26 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const x = (t: number) => m.l + (t / Math.max(1, duration)) * iw;
  const y = (v: number) => m.t + ih - (v / 100) * ih;
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(d.t).toFixed(1)},${y(d.level).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data[data.length - 1]?.t ?? 0).toFixed(1)},${y(0)} L${x(data[0]?.t ?? 0).toFixed(1)},${y(0)} Z`;
  const hp = hover !== null ? data[hover] : null;

  const onMove = (e: MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const t = ((px - m.l) / iw) * duration;
    let best = 0;
    data.forEach((d, i) => {
      if (Math.abs(d.t - t) < Math.abs(data[best].t - t)) best = i;
    });
    setHover(best);
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label="Eskalatsiya darajasi dinamikasi">
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="rgba(148,163,184,0.12)" />
            <text x={m.l - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#64748b" fontFamily="var(--font-mono)">
              {v}
            </text>
          </g>
        ))}
        <path d={area} fill="rgba(59,130,246,0.10)" />
        <path d={line} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
        <line x1={x(trigger)} x2={x(trigger)} y1={m.t - 4} y2={y(0)} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
        <g transform={`translate(${x(trigger)} ${m.t - 4})`}>
          <rect x="-34" y="-11" width="68" height="14" rx="3" fill="#EF4444" />
          <text x="0" y="-1" textAnchor="middle" fontSize="8.5" fill="#fff" fontFamily="var(--font-mono)" fontWeight="700">
            TRIGGER {formatTimestamp(trigger)}
          </text>
        </g>
        {[0, duration / 2, duration].map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="var(--font-mono)">
            {formatTimestamp(t)}
          </text>
        ))}
        {hp && (
          <g>
            <line x1={x(hp.t)} x2={x(hp.t)} y1={m.t} y2={y(0)} stroke="rgba(226,232,240,0.35)" />
            <circle cx={x(hp.t)} cy={y(hp.level)} r="4.5" fill="#3B82F6" stroke="#0F172A" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hp && (
        <div
          className="pointer-events-none absolute top-0 rounded-md border border-line bg-navy-900/95 px-2 py-1 font-mono text-[11px] text-slate-200 shadow-panel"
          style={{ left: `${(x(hp.t) / W) * 100}%`, transform: 'translate(-50%, -110%)' }}
        >
          {formatTimestamp(hp.t)} · daraja {hp.level}
        </div>
      )}
    </div>
  );
}
