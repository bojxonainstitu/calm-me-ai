'use client';

import Link from 'next/link';
import { CalendarClock, Play, Repeat } from 'lucide-react';
import type { ScheduleEntry } from '@/lib/types';
import { PROVOCATION_LABELS } from '@/lib/agencies';
import { getScenario } from '@/lib/scenarios';
import { buttonVariants } from '@/components/ui/button';
import { cn, daysFromNow, formatDateUz } from '@/lib/utils';

export function SpacedRepetition({ entries }: { entries: ScheduleEntry[] }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <span className="hud-label flex items-center gap-1.5">
          <Repeat className="h-3 w-3" aria-hidden /> Takroriy oʻrganish jadvali
        </span>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-slate-400">
        Provokatsiya turi boʻyicha natija <b className="text-slate-200">75% dan past</b> boʻlsa — 3 kundan soʻng murakkablashtirilgan variant; 75–89% — 7 kun; 90%+ — 14
        kundan soʻng mustahkamlovchi takror.
      </p>
      {entries.length === 0 ? (
        <p className="mt-4 rounded-lg bg-white/[0.03] p-3 text-[12.5px] text-slate-400">Hozircha rejalashtirilgan mashq yoʻq — birinchi simulyatsiyani yakunlang.</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {entries.map((e) => {
            const d = daysFromNow(e.dueAt);
            const s = getScenario(e.scenarioId);
            const hard = e.scenarioId.endsWith('--hard');
            return (
              <li key={e.id} className="rounded-xl border border-line bg-navy-900/60 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-100">{PROVOCATION_LABELS[e.provocation]}</p>
                    <p className="mt-0.5 text-[12px] text-slate-400">{s?.shortTitle ?? e.scenarioId}</p>
                  </div>
                  <span
                    className={cn(
                      'telemetry rounded-md border px-1.5 py-0.5 text-[11px]',
                      e.score >= 75 ? 'border-calm/40 text-emerald-200' : 'border-critical/40 text-red-200',
                    )}
                  >
                    {e.score}%
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-400">{e.reason}</p>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-mono text-[11.5px] text-amber-200">
                    <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                    {formatDateUz(e.dueAt)} · {d <= 0 ? 'bugun' : `${d} kundan soʻng`}
                    {hard && ' · II bosqich'}
                  </span>
                  <Link href={`/simulate/${encodeURIComponent(e.scenarioId)}`} className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }))}>
                    <Play aria-hidden /> Hozir mashq qilish
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
