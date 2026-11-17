'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface EmblemProps {
  src: string;
  fallback: string;
  label: string;
  className?: string;
}

/**
 * Idora emblemasi uchun joy. /public/logos/*.png boʻlmasa —
 * neytral taktik qalqon (SVG) va qisqartma koʻrsatiladi.
 */
export function Emblem({ src, fallback, label, className }: EmblemProps) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={cn('relative inline-flex h-11 w-11 items-center justify-center', className)} title={label}>
      {!failed ? (
        <img src={src} alt={label} className="h-full w-full object-contain" onError={() => setFailed(true)} />
      ) : (
        <svg viewBox="0 0 44 48" className="h-full w-full" role="img" aria-label={label}>
          <path d="M22 2 40 8.5v13.2C40 33 32.4 41 22 46 11.6 41 4 33 4 21.7V8.5L22 2Z" fill="#0F172A" stroke="#D97706" strokeWidth="1.5" />
          <path d="M22 7 35.5 12v9.8c0 8.6-5.6 14.8-13.5 18.9C14.1 36.6 8.5 30.4 8.5 21.8V12L22 7Z" fill="none" stroke="rgba(217,119,6,0.35)" />
          <text x="22" y="27.5" textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize={fallback.length > 2 ? 9 : 11} fontWeight="700" fill="#FBBF24">
            {fallback}
          </text>
        </svg>
      )}
    </span>
  );
}
