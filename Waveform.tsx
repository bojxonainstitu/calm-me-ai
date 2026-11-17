'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';

interface WaveformProps {
  waveRef: MutableRefObject<Float32Array | null>;
  levelRef: MutableRefObject<number>;
  speakingRef: MutableRefObject<number>;
  active: boolean;
  className?: string;
}

/** Jonli audio toʻlqin vizualizatori: xodim mikrofoni (koʻk) va AI Fuqaro nutqi (brass) */
export function Waveform({ waveRef, levelRef, speakingRef, active, className }: WaveformProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const draw = (now: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== Math.round(w * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const mid = h / 2;
      // AI Fuqaro nutqi
      const sp = speakingRef.current;
      if (sp > 0.01) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
        ctx.lineWidth = 2;
        for (let x = 0; x <= w; x += 3) {
          const t = now / 1000;
          const env = Math.sin((x / w) * Math.PI);
          const y = mid + Math.sin(x * 0.09 + t * 11) * Math.sin(x * 0.023 - t * 3) * sp * (h * 0.38) * env;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // Xodim mikrofoni
      const buf = waveRef.current;
      ctx.beginPath();
      ctx.strokeStyle = active ? 'rgba(96, 165, 250, 0.95)' : 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 2;
      if (active && buf) {
        const step = Math.max(1, Math.floor(buf.length / w));
        const gain = 1 + levelRef.current * 2;
        for (let x = 0; x < w; x++) {
          const v = buf[x * step] ?? 0;
          const y = mid + v * mid * 1.8 * gain;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        ctx.moveTo(0, mid);
        ctx.lineTo(w, mid);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [waveRef, levelRef, speakingRef, active]);
  return <canvas ref={canvas} className={className} aria-hidden />;
}
