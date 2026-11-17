'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ban, CheckCircle2, Flag, GraduationCap, Info, Printer, RotateCcw, Siren, Sparkles, ThumbsUp, Wrench } from 'lucide-react';
import type { ScheduleEntry, SessionRecord } from '@/lib/types';
import { buildSampleSession, computeCompetencies, radarData, ustozSummary } from '@/lib/engine/debrief';
import { getSession, loadSchedule, loadSessions } from '@/lib/storage';
import { profileSummary } from '@/lib/agencies';
import { CompetencyRadar } from './CompetencyRadar';
import { TranscriptBreakdown } from './TranscriptBreakdown';
import { AggressionJourney } from './AggressionJourney';
import { SpacedRepetition } from './SpacedRepetition';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn, formatClock, formatDateUz } from '@/lib/utils';

const TONE = {
  calm: { icon: CheckCircle2, cls: 'text-emerald-300' },
  tense: { icon: Flag, cls: 'text-blue-200' },
  critical: { icon: Siren, cls: 'text-red-300' },
};

export function DebriefView({ sessionId }: { sessionId?: string }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);

  useEffect(() => {
    const all = loadSessions();
    setHistory(all);
    setSchedule(loadSchedule());
    const s = (sessionId && getSession(sessionId)) || all[0] || buildSampleSession();
    setSession(s);
  }, [sessionId]);

  const comp = useMemo(() => (session ? computeCompetencies(session) : null), [session]);
  const summary = useMemo(() => (session && comp ? ustozSummary(session, comp) : null), [session, comp]);

  if (!session || !comp || !summary) return <div className="container h-[70vh]" aria-busy="true" />;

  const corruption = session.outcomeReason === 'corruption';
  const T = corruption ? { icon: Ban, cls: 'text-red-300' } : TONE[summary.tone];
  const kpis = [
    { label: 'Umumiy natija', value: `${comp.overall}%`, hint: comp.overall >= 75 ? 'Meʼyordan yuqori' : 'Meʼyor — 75%' },
    { label: 'Agressiya', value: `${session.initialAggression} → ${session.finalAggression}`, hint: session.finalAggression < session.initialAggression ? 'pasaydi' : 'oshdi' },
    { label: 'Vazminlik indeksi', value: `${session.poiseIndex}%`, hint: 'provokatsiya ostida' },
    { label: 'Javoblar', value: `${comp.officerTurns}`, hint: `${comp.deescalations} yumshatdi · ${comp.escalations} keskinlashtirdi` },
    { label: 'Davomiylik', value: formatClock(session.endedAt - session.startedAt), hint: `oʻrtacha javob ${comp.speedSec.toFixed(1)} s` },
  ];

  return (
    <div className="container py-8">
      {session.isSample && (
        <div className="no-print mb-5 flex items-start gap-2.5 rounded-xl border border-cobalt-400/30 bg-cobalt-500/10 px-4 py-3 text-[13px] text-blue-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Bu namunaviy sessiya (qoidaviy dvigatel real vaqtda hisoblagan). Oʻz natijangizni koʻrish uchun{' '}
          <Link href="/#mashgulot" className="underline">
            simulyatsiyani yakunlang
          </Link>
          .
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <span className="hud-label flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden /> AI Ustoz · sessiyadan keyingi tahlil
          </span>
          <h1 className="mt-2 flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
            <T.icon className={cn('h-7 w-7 shrink-0', T.cls)} aria-hidden />
            {summary.headline}
          </h1>
          <p className="mt-1.5 text-[14px] text-slate-300">{session.scenarioTitle}</p>
          <p className="mt-1 font-mono text-[11.5px] text-slate-500">
            {formatDateUz(session.startedAt, true)} · {profileSummary(session.profile)} · {session.mode === 'demo' ? 'Demo rejim' : 'Jonli rejim'}
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          {history.length > 0 && (
            <select
              aria-label="Sessiyani tanlash"
              value={session.isSample ? '' : session.id}
              onChange={(e) => e.target.value && router.push(`/debrief?session=${encodeURIComponent(e.target.value)}`)}
              className="h-10 max-w-[260px] rounded-xl border border-line bg-navy-900 px-3 text-[13px] text-slate-200"
            >
              {session.isSample && <option value="">Namunaviy sessiya</option>}
              {history.map((h) => (
                <option key={h.id} value={h.id}>
                  {formatDateUz(h.startedAt, true)} — {h.scenarioTitle.slice(0, 38)}
                </option>
              ))}
            </select>
          )}
          <Link href={`/simulate/${encodeURIComponent(session.scenarioId)}`} className={cn(buttonVariants({ variant: 'secondary' }))}>
            <RotateCcw aria-hidden /> Qayta urinish
          </Link>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer aria-hidden /> Chop etish
          </Button>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="panel px-4 py-3">
            <dt className="text-[11.5px] text-slate-400">{k.label}</dt>
            <dd className="telemetry mt-1 text-2xl font-semibold text-white">{k.value}</dd>
            <dd className="mt-0.5 text-[11.5px] text-slate-500">{k.hint}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="panel p-5">
          <span className="hud-label">4 oʻqli kompetensiya radari</span>
          <CompetencyRadar data={radarData(comp)} />
        </div>
        <div className="space-y-6">
          <div className="panel p-5">
            <span className="hud-label flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" aria-hidden /> Ustoz xulosasi
            </span>
            <div className="mt-2 space-y-2 text-[14px] leading-relaxed text-slate-200">
              {summary.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-200">
                  <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> Kuchli tomonlar
                </p>
                <ul className="mt-1.5 space-y-1 text-[12.5px] text-slate-300">
                  {summary.strengths.length ? summary.strengths.map((s) => <li key={s}>• {s}</li>) : <li className="text-slate-500">Hali aniqlanmadi</li>}
                </ul>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-amber-200">
                  <Wrench className="h-3.5 w-3.5" aria-hidden /> Rivojlantirish kerak
                </p>
                <ul className="mt-1.5 space-y-1.5 text-[12.5px] text-slate-300">
                  {summary.growth.length ? (
                    summary.growth.map((g) => (
                      <li key={g.label}>
                        <span className="text-slate-100">• {g.label}.</span> <span className="text-slate-400">{g.tip}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">Jiddiy xato qayd etilmadi</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="panel p-5">
            <span className="hud-label">Agressiya yoʻli</span>
            <AggressionJourney turns={session.turns} initial={session.initialAggression} />
          </div>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="breakdown">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 id="breakdown" className="text-xl font-bold">
            Transkript tahlili
          </h2>
          <p className="flex items-center gap-3 text-[12px] text-slate-400">
            <span>
              <mark className="rounded bg-calm/15 px-1 text-emerald-100 underline decoration-calm/70 decoration-2">yashil</mark> — de-eskalatsiya qilgan ibora
            </span>
            <span>
              <mark className="rounded bg-critical/15 px-1 text-red-100 underline decoration-critical/80 decoration-wavy">qizil</mark> — eskalatsiya qilgan ibora
            </span>
          </p>
        </div>
        <TranscriptBreakdown turns={session.turns} bestId={summary.bestTurnId} worstId={summary.worstTurnId} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SpacedRepetition entries={schedule} />
        <div className="panel p-5">
          <span className="hud-label">Sessiyalar tarixi</span>
          {history.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-slate-400">Saqlangan sessiyalar yoʻq.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {history.slice(0, 8).map((h) => {
                const c = computeCompetencies(h);
                return (
                  <li key={h.id}>
                    <Link href={`/debrief?session=${encodeURIComponent(h.id)}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-white/[0.02]">
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] text-slate-200">{h.scenarioTitle}</span>
                        <span className="font-mono text-[11px] text-slate-500">{formatDateUz(h.startedAt, true)}</span>
                      </span>
                      <Badge variant={c.overall >= 75 ? 'calm' : c.overall >= 50 ? 'tense' : 'critical'}>{c.overall}%</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
