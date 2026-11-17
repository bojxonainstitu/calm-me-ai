'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, type CSSProperties } from 'react';
import { AlertTriangle, ShieldCheck, Siren, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { CriteriaScores } from '@/lib/types';
import { aggressionColor, aggressionState, cn } from '@/lib/utils';

function AnimatedNumber({ value, className, style }: { value: number; className?: string; style?: CSSProperties }) {
  const spring = useSpring(value, { stiffness: 80, damping: 18 });
  const display = useTransform(spring, (v) => Math.round(v).toString());
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  return (
    <motion.span className={className} style={style}>
      {display}
    </motion.span>
  );
}

const TONE_ICON = { calm: ShieldCheck, tense: AlertTriangle, critical: Siren };
const TONE_BADGE = {
  calm: 'border-calm/40 bg-calm/10 text-emerald-200',
  tense: 'border-tense/40 bg-tense/10 text-amber-200',
  critical: 'border-critical/50 bg-critical/15 text-red-200',
};

/** Agressiya hisoblagichi: katta raqam, holat (ikonka + matn), gradient shkala va dinamika chizigʻi */
export function AggressionMeter({ value, history }: { value: number; history: number[] }) {
  const st = aggressionState(value);
  const Icon = TONE_ICON[st.tone];
  const color = aggressionColor(value);
  const w = 220;
  const h = 40;
  const pts = history.length > 1 ? history : [history[0] ?? value, value];
  const path = pts.map((v, i) => `${((i / (pts.length - 1)) * w).toFixed(1)},${(h - (v / 100) * h).toFixed(1)}`).join(' ');
  return (
    <div className="panel p-4" aria-live="polite">
      <div className="flex items-center justify-between">
        <span className="hud-label">Agressiya darajasi</span>
        <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold', TONE_BADGE[st.tone])}>
          <Icon className="h-3 w-3" aria-hidden />
          {st.label}
        </span>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <AnimatedNumber value={value} className="telemetry text-5xl font-semibold leading-none" style={{ color }} />
        <span className="mb-1 font-mono text-sm text-slate-500">/100</span>
      </div>
      <div className="relative mt-3 h-2 rounded-full" style={{ background: 'linear-gradient(90deg,#10B981 0%,#F59E0B 50%,#EF4444 100%)' }}>
        <motion.span
          className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_2px_#070B14]"
          initial={false}
          animate={{ left: `${value}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-500">
        <span>0</span>
        <span>33</span>
        <span>66</span>
        <span>100</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-10 w-full" role="img" aria-label="Agressiya dinamikasi">
        <line x1="0" x2={w} y1={h - 0.33 * h} y2={h - 0.33 * h} stroke="rgba(148,163,184,0.15)" strokeDasharray="2 3" />
        <line x1="0" x2={w} y1={h - 0.66 * h} y2={h - 0.66 * h} stroke="rgba(148,163,184,0.15)" strokeDasharray="2 3" />
        <polyline points={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** Vazminlik indeksi — yarim doira oʻlchagich */
export function PoiseGauge({ value, delta }: { value: number; delta: number }) {
  const r = 52;
  const len = Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <span className="hud-label">Vazminlik indeksi</span>
        <span className={cn('inline-flex items-center gap-1 font-mono text-[11px]', delta > 0 ? 'text-emerald-300' : delta < 0 ? 'text-red-300' : 'text-slate-400')}>
          <TrendIcon className="h-3 w-3" aria-hidden />
          {delta > 0 ? '+' : ''}
          {delta}
        </span>
      </div>
      <div className="relative mx-auto mt-1 h-[74px] w-[140px]">
        <svg viewBox="0 0 140 74" className="h-full w-full" aria-hidden>
          <path d="M 18 66 A 52 52 0 0 1 122 66" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="9" strokeLinecap="round" />
          <motion.path
            d="M 18 66 A 52 52 0 0 1 122 66"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={len}
            initial={false}
            animate={{ strokeDashoffset: len * (1 - v / 100) }}
            transition={{ type: 'spring', stiffness: 70, damping: 18 }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <AnimatedNumber value={v} className="telemetry text-3xl font-semibold text-white" />
          <span className="font-mono text-xs text-slate-500">%</span>
        </div>
      </div>
      <p className="mt-1 text-center text-[11.5px] text-slate-400">Provokatsiya ostida barqarorlik</p>
    </div>
  );
}

const CRITERIA: { key: keyof CriteriaScores; label: string; hint: string }[] = [
  { key: 'etiquette', label: 'Rasmiy etiket', hint: '«Siz», salomlashish, oʻzini tanishtirish' },
  { key: 'legal', label: 'Huquqiy asos', hint: 'Moddani toʻgʻri qoʻllash, huquqlarni tushuntirish' },
  { key: 'stability', label: 'Emotsional barqarorlik', hint: 'Provokatsiyaga berilmaslik' },
];

function statusFor(v: number) {
  if (v >= 75) return { color: '#10B981', text: 'yaxshi' };
  if (v >= 50) return { color: '#F59E0B', text: 'oʻrtacha' };
  return { color: '#EF4444', text: 'past' };
}

/** Uch mezon boʻyicha oʻrtacha ball va soʻnggi javob bahosi */
export function CriteriaPanel({ avg, last }: { avg: CriteriaScores | null; last: CriteriaScores | null }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <span className="hud-label">Evaluator Agent</span>
        <span className="font-mono text-[10.5px] text-slate-500">oʻrtacha · soʻnggi</span>
      </div>
      <ul className="mt-3 space-y-3.5">
        {CRITERIA.map((c) => {
          const v = avg ? avg[c.key] : 0;
          const l = last ? last[c.key] : null;
          const st = statusFor(v);
          return (
            <li key={c.key}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-medium text-slate-200" title={c.hint}>
                  {c.label}
                </span>
                <span className="telemetry text-[13px] text-slate-200">
                  {avg ? `${v}%` : '—'}
                  {l !== null && <span className="ml-2 text-[11px] text-slate-500">({l})</span>}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-700/40">
                <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${v}%`, backgroundColor: st.color }} transition={{ type: 'spring', stiffness: 90, damping: 20 }} />
              </div>
              <span className="sr-only">Holat: {st.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
