'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserRound, TrendingDown, TrendingUp } from 'lucide-react';
import type { Turn } from '@/lib/types';
import { HighlightedText } from './HighlightedText';
import { aggressionColor, cn, formatClock } from '@/lib/utils';

export function Transcript({ turns, citizenName, busy }: { turns: Turn[]; citizenName: string; busy: boolean }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns.length, busy]);

  return (
    <div className="h-full space-y-3 overflow-y-auto pr-1" role="log" aria-live="polite" aria-label="Suhbat transkripti">
      {turns.map((t) => {
        const officer = t.speaker === 'officer';
        if (t.speaker === 'system')
          return (
            <p key={t.id} className="text-center font-mono text-[11px] text-slate-500">
              {t.text}
            </p>
          );
        const ev = t.evaluation;
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex gap-2.5', officer ? 'flex-row-reverse' : '')}
          >
            <span
              className={cn(
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border',
                officer ? 'border-cobalt-400/40 bg-cobalt-500/15 text-blue-200' : 'border-line bg-navy-700 text-slate-300',
              )}
              aria-hidden
            >
              {officer ? <Shield className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
            </span>
            <div className={cn('max-w-[85%]', officer ? 'text-right' : '')}>
              <div className={cn('mb-1 flex items-center gap-2 font-mono text-[10.5px] text-slate-500', officer ? 'justify-end' : '')}>
                <span>{officer ? 'Siz' : citizenName}</span>
                <span>{formatClock(t.t)}</span>
                {!officer && t.emotion && <span className="text-slate-400">· {t.emotion}</span>}
                {officer && ev && (
                  <span className={cn('inline-flex items-center gap-0.5', ev.aggressionDelta < 0 ? 'text-emerald-300' : ev.aggressionDelta > 0 ? 'text-red-300' : 'text-slate-400')}>
                    {ev.aggressionDelta < 0 ? <TrendingDown className="h-3 w-3" aria-hidden /> : ev.aggressionDelta > 0 ? <TrendingUp className="h-3 w-3" aria-hidden /> : null}
                    {ev.aggressionDelta > 0 ? '+' : ''}
                    {ev.aggressionDelta}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  'inline-block rounded-2xl px-3.5 py-2.5 text-left text-[13.5px] leading-relaxed',
                  officer ? 'rounded-tr-sm bg-cobalt-500/15 text-slate-100 ring-1 ring-cobalt-400/25' : 'rounded-tl-sm bg-navy-700/80 text-slate-100 ring-1 ring-white/5',
                )}
                style={!officer && typeof t.aggressionAfter === 'number' ? { boxShadow: `inset 3px 0 0 ${aggressionColor(t.aggressionAfter)}` } : undefined}
              >
                {officer ? <HighlightedText text={t.text} highlights={ev?.highlights} /> : t.text}
              </div>
            </div>
          </motion.div>
        );
      })}
      {busy && (
        <div className="flex items-center gap-2 pl-10 font-mono text-[11px] text-slate-500">
          <span className="flex gap-1">
            <i className="h-1.5 w-1.5 animate-blink rounded-full bg-slate-400" />
            <i className="h-1.5 w-1.5 animate-blink rounded-full bg-slate-400 [animation-delay:200ms]" />
            <i className="h-1.5 w-1.5 animate-blink rounded-full bg-slate-400 [animation-delay:400ms]" />
          </span>
          Evaluator Agent tahlil qilmoqda…
        </div>
      )}
      <div ref={end} />
    </div>
  );
}
