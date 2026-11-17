'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CalendarClock, MapPin, Sparkles, Swords, UserRound } from 'lucide-react';
import type { AgencyId, Scenario, ScheduleEntry, TraineeProfile } from '@/lib/types';
import {
  AGENCIES,
  ATTIRE_OPTIONS,
  GENDER_OPTIONS,
  LEVEL_OPTIONS,
  PROVOCATION_LABELS,
  STATUS_OPTIONS,
  profileSummary,
  statusProvocation,
} from '@/lib/agencies';
import { DIFFICULTY_LABELS, SCENARIOS, getScenario } from '@/lib/scenarios';
import { loadProfile, loadSchedule, saveProfile } from '@/lib/storage';
import { Segmented } from '@/components/ui/segmented';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Emblem } from '@/components/brand/Emblem';
import { aggressionColor, cn, daysFromNow, formatDateUz } from '@/lib/utils';

export function DifficultyPips({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Qiyinlik: ${DIFFICULTY_LABELS[level as 1 | 2 | 3]}`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={cn('h-1.5 w-3 rounded-full', i <= level ? 'bg-brass' : 'bg-slate-700')} />
      ))}
    </span>
  );
}

function ScenarioCard({ s, selected, onSelect }: { s: Scenario; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group relative w-full rounded-xl border p-4 text-left transition-all',
        selected ? 'border-cobalt-400/60 bg-cobalt-500/10 shadow-glow' : 'border-line bg-navy-900/60 hover:border-slate-500/40 hover:bg-navy-900',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{PROVOCATION_LABELS[s.provocation]}</Badge>
            <DifficultyPips level={s.difficulty} />
          </div>
          <h4 className="text-[14.5px] font-semibold leading-snug text-slate-50">{s.title}</h4>
          <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {s.location}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="hud-label block">Start</span>
          <span className="telemetry text-lg font-semibold" style={{ color: aggressionColor(s.initialAggression) }}>
            {s.initialAggression}
          </span>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="mt-3 text-[13px] leading-relaxed text-slate-300">{s.brief}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.tactics.map((t) => (
                <span key={t} className="rounded-md bg-white/[0.04] px-2 py-1 text-[11.5px] text-slate-300">
                  <Swords className="mr-1 inline h-3 w-3 text-brass" aria-hidden />
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-slate-400">
              <UserRound className="h-3.5 w-3.5" aria-hidden />
              AI Fuqaro: {s.citizen.name}, {s.citizen.age} yosh — {s.citizen.role}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export function TrainingSetup() {
  const router = useRouter();
  const [profile, setProfile] = useState<TraineeProfile | null>(null);
  const [scenarioId, setScenarioId] = useState<string>('');
  const [showAll, setShowAll] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);

  useEffect(() => {
    setProfile(loadProfile());
    setSchedule(loadSchedule());
  }, []);

  const p = profile;
  const list = useMemo(() => (p && !showAll ? SCENARIOS.filter((s) => s.agencies.includes(p.agency)) : SCENARIOS), [p, showAll]);

  useEffect(() => {
    if (list.length && !list.some((s) => s.id === scenarioId)) setScenarioId(list[0].id);
  }, [list, scenarioId]);

  if (!p) return <div className="container h-[640px]" aria-busy="true" />;

  const update = <K extends keyof TraineeProfile>(k: K, v: TraineeProfile[K]) => {
    const next = { ...p, [k]: v };
    setProfile(next);
    saveProfile(next);
  };
  const sp = statusProvocation(p);
  const nextDue = schedule[0];

  const start = (id = scenarioId) => {
    saveProfile(p);
    router.push(`/simulate/${encodeURIComponent(id)}`);
  };

  return (
    <section id="mashgulot" className="container scroll-mt-24 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="hud-label">Mashgʻulotni sozlash</span>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Rol matritsasi va ssenariy</h2>
        </div>
        {nextDue && (
          <Link
            href={`/simulate/${encodeURIComponent(nextDue.scenarioId)}`}
            className="flex items-center gap-3 rounded-xl border border-brass/40 bg-brass/10 px-4 py-2.5 text-[13px] text-amber-100 transition-colors hover:bg-brass/20"
          >
            <CalendarClock className="h-4 w-4 text-brass" aria-hidden />
            <span>
              Takroriy mashq: <b>{getScenario(nextDue.scenarioId)?.shortTitle ?? 'ssenariy'}</b> ·{' '}
              {daysFromNow(nextDue.dueAt) <= 0 ? 'bugun' : `${formatDateUz(nextDue.dueAt)}`}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* 1. Rol matritsasi */}
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-steel font-mono text-xs font-bold text-white">1</span>
            <h3 className="text-base font-semibold">Idora va maqom</h3>
          </div>

          <fieldset>
            <legend className="hud-label mb-2">Idora</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {AGENCIES.map((a) => {
                const active = a.id === p.agency;
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update('agency', a.id as AgencyId)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all',
                      active ? 'border-brass/60 bg-brass/10' : 'border-line bg-navy-900/60 hover:border-slate-500/40',
                    )}
                  >
                    <Emblem src={a.emblem} fallback={a.emblemFallback} label={a.org} className="h-8 w-8 shrink-0" />
                    <span className="text-[12.5px] font-medium leading-tight text-slate-100">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5 grid gap-4">
            <div>
              <span className="hud-label mb-2 block">Maqom</span>
              <Segmented name="status" value={p.status} options={STATUS_OPTIONS} onChange={(v) => update('status', v)} />
            </div>
            <div>
              <span className="hud-label mb-2 block">Lavozim darajasi</span>
              <Segmented name="level" value={p.level} options={LEVEL_OPTIONS} onChange={(v) => update('level', v)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="hud-label mb-2 block">Kiyim</span>
                <Segmented name="attire" value={p.attire} options={ATTIRE_OPTIONS} onChange={(v) => update('attire', v)} />
              </div>
              <div>
                <span className="hud-label mb-2 block">Jins</span>
                <Segmented name="gender" value={p.gender} options={GENDER_OPTIONS} onChange={(v) => update('gender', v)} />
              </div>
            </div>
            <div>
              <span className="hud-label mb-2 block">Nutq tili (ovozli kiritish)</span>
              <Segmented
                name="lang"
                value={p.lang}
                options={[
                  { id: 'uz-UZ', label: 'Oʻzbekcha (uz-UZ)' },
                  { id: 'ru-RU', label: 'Ruscha (ru-RU)' },
                ]}
                onChange={(v) => update('lang', v)}
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-slate-600/50 bg-navy-900/50 p-4">
            <p className="hud-label mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-brass" aria-hidden /> Maqomga qarab provokatsiya
            </p>
            <p className="text-[13px] leading-relaxed text-slate-300">
              {sp ? sp.hint : 'AI Fuqaro standart provokatsiya taktikalaridan foydalanadi.'}
            </p>
            <p className="mt-2 font-mono text-[11px] text-slate-500">{profileSummary(p)}</p>
          </div>
        </div>

        {/* 2. Ssenariy kutubxonasi */}
        <div className="panel flex flex-col p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-steel font-mono text-xs font-bold text-white">2</span>
              <h3 className="text-base font-semibold">Ssenariy kutubxonasi</h3>
              <Badge variant="mono">{list.length} ta</Badge>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-slate-400">
              <input type="checkbox" className="accent-blue-600" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
              Barcha idoralar ssenariylari
            </label>
          </div>
          <div className="grid flex-1 content-start gap-2.5">
            {list.map((s) => (
              <ScenarioCard key={s.id} s={s} selected={s.id === scenarioId} onSelect={() => setScenarioId(s.id)} />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-[12.5px] text-slate-400">Mikrofon va kamera faqat sizning ruxsatingiz bilan, lokal ishlaydi.</p>
            <Button size="lg" onClick={() => start()} disabled={!scenarioId}>
              Simulyatsiyani boshlash <ArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
