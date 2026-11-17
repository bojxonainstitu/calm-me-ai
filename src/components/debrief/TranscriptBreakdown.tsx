'use client';

import { Award, BookOpenCheck, Check, ExternalLink, Lightbulb, Minus, TrendingDown, TrendingUp, TriangleAlert, X } from 'lucide-react';
import type { Turn } from '@/lib/types';
import { HighlightedText } from '@/components/sim/HighlightedText';
import { getLegalRefs, legalShort } from '@/lib/legal';
import { cn, formatClock } from '@/lib/utils';

const VERDICT = {
  deescalate: { label: 'De-eskalatsiya', icon: TrendingDown, cls: 'border-calm/40 bg-calm/10 text-emerald-200', rail: 'bg-calm' },
  neutral: { label: 'Neytral', icon: Minus, cls: 'border-slate-500/40 bg-white/5 text-slate-300', rail: 'bg-slate-500' },
  escalate: { label: 'Eskalatsiya', icon: TrendingUp, cls: 'border-critical/40 bg-critical/10 text-red-200', rail: 'bg-critical' },
};

export function TranscriptBreakdown({ turns, bestId, worstId }: { turns: Turn[]; bestId?: string; worstId?: string }) {
  const rows = turns
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.speaker === 'officer' && t.evaluation)
    .map(({ t, i }) => ({
      officer: t,
      before: [...turns.slice(0, i)].reverse().find((x) => x.speaker === 'citizen'),
      after: turns.slice(i + 1).find((x) => x.speaker === 'citizen'),
    }));

  return (
    <ol className="space-y-4">
      {rows.map(({ officer, before, after }, idx) => {
        const ev = officer.evaluation!;
        const v = VERDICT[ev.verdict];
        const VIcon = v.icon;
        const cited = getLegalRefs(ev.citedRefIds);
        const recommended = getLegalRefs(ev.legalRefIds.filter((id) => !ev.citedRefIds.includes(id)));
        return (
          <li key={officer.id} className="panel relative overflow-hidden">
            <span className={cn('absolute inset-y-0 left-0 w-1', v.rail)} aria-hidden />
            <div className="grid gap-0 lg:grid-cols-2">
              {/* Chap: muloqot */}
              <div className="border-b border-line p-4 pl-5 lg:border-b-0 lg:border-r">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-500">
                    #{idx + 1} · {formatClock(officer.t)} · javob {officer.responseTimeSec?.toFixed(1) ?? '—'} s
                  </span>
                  <span className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium', v.cls)}>
                    <VIcon className="h-3 w-3" aria-hidden />
                    {v.label} {ev.aggressionDelta > 0 ? '+' : ''}
                    {ev.aggressionDelta}
                  </span>
                  {officer.id === bestId && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-brass/50 bg-brass/10 px-1.5 py-0.5 text-[11px] text-amber-200">
                      <Award className="h-3 w-3" aria-hidden /> Eng samarali javob
                    </span>
                  )}
                  {officer.id === worstId && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-critical/50 bg-critical/10 px-1.5 py-0.5 text-[11px] text-red-200">
                      <TriangleAlert className="h-3 w-3" aria-hidden /> Burilish nuqtasi
                    </span>
                  )}
                </div>
                {before && <p className="mb-2 border-l-2 border-slate-600 pl-3 text-[12.5px] italic leading-relaxed text-slate-400">Fuqaro: «{before.text}»</p>}
                <p className="text-[14px] leading-relaxed text-slate-100">
                  <HighlightedText text={officer.text} highlights={ev.highlights} />
                </p>
                {after && (
                  <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                    → Reaksiya: «{after.text}» <span className="font-mono">(agr. {after.aggressionAfter})</span>
                  </p>
                )}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { k: 'Etiket', v: ev.scores.etiquette },
                    { k: 'Huquq', v: ev.scores.legal },
                    { k: 'Barqarorlik', v: ev.scores.stability },
                  ].map((s) => (
                    <div key={s.k} className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                      <div className="text-[10.5px] text-slate-500">{s.k}</div>
                      <div className={cn('telemetry text-[14px] font-semibold', s.v >= 75 ? 'text-emerald-300' : s.v >= 50 ? 'text-amber-300' : 'text-red-300')}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Oʻng: AI Ustoz */}
              <div className="p-4">
                <p className="hud-label mb-1.5">AI Ustoz izohi</p>
                <p className="text-[13px] leading-relaxed text-slate-200">{ev.feedback}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ev.flags.map((f) => (
                    <span
                      key={f.code}
                      className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]', f.kind === 'positive' ? 'border-calm/30 text-emerald-200' : 'border-critical/35 text-red-200')}
                    >
                      {f.kind === 'positive' ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
                      {f.label}
                    </span>
                  ))}
                </div>
                {ev.suggestion && ev.verdict !== 'deescalate' && (
                  <div className="mt-3 rounded-lg border border-brass/30 bg-brass/[0.06] p-3">
                    <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-amber-200">
                      <Lightbulb className="h-3.5 w-3.5" aria-hidden /> Shunday deyish mumkin edi
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-slate-200">{ev.suggestion}</p>
                  </div>
                )}
                {(cited.length > 0 || recommended.length > 0) && (
                  <div className="mt-3 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-300">
                      <BookOpenCheck className="h-3.5 w-3.5 text-cobalt-400" aria-hidden /> Huquqiy asos
                    </p>
                    {cited.map((r) => (
                      <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="flex items-start gap-1.5 text-[12px] text-emerald-200 hover:underline">
                        <Check className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                        <span>
                          <span className="font-mono">{legalShort(r)}</span> — toʻgʻri qoʻllandi
                        </span>
                      </a>
                    ))}
                    {recommended.map((r) => (
                      <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="group block rounded-md bg-white/[0.03] px-2 py-1.5 text-[12px] hover:bg-white/[0.06]">
                        <span className="font-mono text-amber-200">{legalShort(r)}</span>
                        <ExternalLink className="ml-1 inline h-3 w-3 text-slate-500 group-hover:text-slate-300" aria-hidden />
                        <span className="mt-0.5 block leading-snug text-slate-400">{r.summary}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
