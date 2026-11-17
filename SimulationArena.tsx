'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Clock, Flag, Radar } from 'lucide-react';
import type { CriteriaScores, Evaluation, Scenario, SessionRecord, SessionStatus, TraineeProfile, Turn } from '@/lib/types';
import { getScenario } from '@/lib/scenarios';
import { fillTemplate, getAgency, profileSummary } from '@/lib/agencies';
import { getCustomScenario, loadProfile, loadSchedule, saveSchedule, saveSession, getDemoMode } from '@/lib/storage';
import { evaluateTurn, simulateTurn } from '@/lib/client-api';
import { nextPoise } from '@/lib/engine/evaluator';
import { RESOLVE_THRESHOLD } from '@/lib/engine/citizen';
import { computeCompetencies, updateSchedule } from '@/lib/engine/debrief';
import { useSpeech } from '@/hooks/useSpeech';
import { useMicAnalyser } from '@/hooks/useMicAnalyser';
import { CoreCanvas } from '@/components/three/CoreCanvas';
import { AggressionMeter, CriteriaPanel, PoiseGauge } from './Meters';
import { Transcript } from './Transcript';
import { VoiceBar } from './VoiceBar';
import { BiometricMonitor } from './BiometricMonitor';
import { LegalQuickRef, ScenarioBrief, UstozHint } from './Panels';
import { BriefingOverlay, OutcomeOverlay } from './Overlays';
import { DifficultyPips } from '@/components/landing/TrainingSetup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { aggressionColor, aggressionState, clamp, emotionFor, formatClock, uid } from '@/lib/utils';

const MAX_TURNS = 8;
type Outcome = Exclude<SessionStatus, 'briefing' | 'active'>;

function avgCriteria(turns: Turn[]): CriteriaScores | null {
  const evs = turns.filter((t) => t.speaker === 'officer' && t.evaluation).map((t) => t.evaluation!.scores);
  if (!evs.length) return null;
  const sum = evs.reduce((a, s) => ({ etiquette: a.etiquette + s.etiquette, legal: a.legal + s.legal, stability: a.stability + s.stability }), {
    etiquette: 0,
    legal: 0,
    stability: 0,
  });
  return { etiquette: Math.round(sum.etiquette / evs.length), legal: Math.round(sum.legal / evs.length), stability: Math.round(sum.stability / evs.length) };
}

export function SimulationArena({ scenarioId }: { scenarioId: string }) {
  const [scenario, setScenario] = useState<Scenario | null | undefined>(undefined);
  const [profile, setProfile] = useState<TraineeProfile | null>(null);
  const [status, setStatus] = useState<SessionStatus>('briefing');
  const [outcomeReason, setOutcomeReason] = useState<string | undefined>();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [aggression, setAggression] = useState(50);
  const [aggHistory, setAggHistory] = useState<number[]>([]);
  const [poise, setPoise] = useState(70);
  const [poiseDelta, setPoiseDelta] = useState(0);
  const [lastEval, setLastEval] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [ttsOn, setTtsOn] = useState(true);
  const [draft, setDraft] = useState('');
  const [now, setNow] = useState(0);
  const [sessionId, setSessionId] = useState('');

  const startedAt = useRef(0);
  const lastCitizenAt = useRef(0);
  const turnsRef = useRef<Turn[]>([]);
  const aggRef = useRef(50);
  const poiseRef = useRef(70);

  const speech = useSpeech();
  const mic = useMicAnalyser();

  // Ssenariy va profilni yuklash
  useEffect(() => {
    const id = decodeURIComponent(scenarioId);
    setScenario(getScenario(id) ?? getCustomScenario(id) ?? null);
    setProfile(loadProfile());
  }, [scenarioId]);

  const setTurnsSync = (updater: (prev: Turn[]) => Turn[]) => {
    const next = updater(turnsRef.current);
    turnsRef.current = next;
    setTurns(next);
  };

  const reset = useCallback(
    (s: Scenario) => {
      speech.cancelSpeech();
      turnsRef.current = [];
      setTurns([]);
      setAggression(s.initialAggression);
      aggRef.current = s.initialAggression;
      setAggHistory([s.initialAggression]);
      setPoise(70);
      poiseRef.current = 70;
      setPoiseDelta(0);
      setLastEval(null);
      setOutcomeReason(undefined);
      setDraft('');
      setStatus('briefing');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (scenario) reset(scenario);
  }, [scenario, reset]);

  // Taymer
  useEffect(() => {
    if (status !== 'active') return;
    const t = setInterval(() => setNow(Date.now() - startedAt.current), 500);
    return () => clearInterval(t);
  }, [status]);

  const speakCitizen = useCallback(
    (text: string) => {
      if (!scenario || !profile) return;
      speech.speak(text, {
        lang: profile.lang,
        gender: scenario.citizen.voice.gender,
        pitch: scenario.citizen.voice.pitch,
        rate: scenario.citizen.voice.rate,
        muted: !ttsOn,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenario, profile, ttsOn],
  );

  const begin = async (voice: boolean) => {
    if (!scenario) return;
    startedAt.current = Date.now();
    lastCitizenAt.current = Date.now();
    setSessionId(uid('ses'));
    setNow(0);
    setStatus('active');
    const opener: Turn = { id: uid('t'), speaker: 'citizen', text: scenario.openingLine, t: 0, aggressionAfter: scenario.initialAggression, emotion: emotionFor(scenario.initialAggression) };
    setTurnsSync(() => [opener]);
    speakCitizen(scenario.openingLine);
    if (voice) await mic.start();
  };

  const finish = useCallback(
    (outcome: Outcome, reason?: string) => {
      if (!scenario || !profile) return;
      setStatus(outcome);
      setOutcomeReason(reason);
      mic.stop();
      speech.stopListening();
      const record: SessionRecord = {
        id: sessionId || uid('ses'),
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        provocation: scenario.provocation,
        difficulty: scenario.difficulty,
        profile,
        startedAt: startedAt.current,
        endedAt: Date.now(),
        turns: turnsRef.current,
        outcome,
        outcomeReason: reason,
        initialAggression: scenario.initialAggression,
        finalAggression: aggRef.current,
        poiseIndex: poiseRef.current,
        mode: getDemoMode() === 'on' ? 'demo' : 'live',
      };
      saveSession(record);
      if (record.turns.some((t) => t.speaker === 'officer')) {
        saveSchedule(updateSchedule(loadSchedule(), record, computeCompetencies(record)));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenario, profile, sessionId],
  );

  const handleSend = async (text: string) => {
    if (!scenario || !profile || busy || status !== 'active') return;
    setBusy(true);
    speech.cancelSpeech();
    const sentAt = Date.now();
    const officerIndex = turnsRef.current.filter((t) => t.speaker === 'officer').length;
    const micPeak = mic.active ? mic.consumePeak() : undefined;
    const officerTurn: Turn = {
      id: uid('t'),
      speaker: 'officer',
      text,
      t: sentAt - startedAt.current,
      responseTimeSec: Math.round(((sentAt - lastCitizenAt.current) / 1000) * 10) / 10,
      micPeak,
    };
    setTurnsSync((prev) => [...prev, officerTurn]);
    const history = turnsRef.current.map((t) => ({ speaker: t.speaker, text: t.text }));
    const prevOfficer = turnsRef.current.filter((t) => t.speaker === 'officer' && t.id !== officerTurn.id).map((t) => t.text);

    try {
      const evaluation = await evaluateTurn(
        { scenario, profile, utterance: text, history, aggression: aggRef.current, turnIndex: officerIndex, micPeak },
        prevOfficer,
      );
      const afterEval = Math.round(clamp(aggRef.current + evaluation.aggressionDelta));
      aggRef.current = afterEval;
      setAggression(afterEval);
      const p = nextPoise(poiseRef.current, evaluation, micPeak);
      setPoiseDelta(p - poiseRef.current);
      poiseRef.current = p;
      setPoise(p);
      setLastEval(evaluation);
      setTurnsSync((prev) => prev.map((t) => (t.id === officerTurn.id ? { ...t, evaluation, aggressionAfter: afterEval } : t)));

      const reply = await simulateTurn({ scenario, profile, history, aggression: afterEval, evaluation, turnIndex: officerIndex });
      const finalAgg = Math.round(clamp(reply.aggression));
      aggRef.current = finalAgg;
      setAggression(finalAgg);
      setAggHistory((h) => [...h, afterEval, finalAgg]);
      const citizenTurn: Turn = { id: uid('t'), speaker: 'citizen', text: reply.text, t: Date.now() - startedAt.current, aggressionAfter: finalAgg, emotion: reply.emotion };
      setTurnsSync((prev) => [...prev, citizenTurn]);
      lastCitizenAt.current = Date.now();
      speakCitizen(reply.text);

      const count = officerIndex + 1;
      if (evaluation.flags.some((f) => f.code === 'corruption')) finish('failed', 'corruption');
      else if (finalAgg >= 97) finish('failed', 'breakdown');
      else if (finalAgg <= RESOLVE_THRESHOLD && count >= 3) finish('resolved');
      else if (count >= MAX_TURNS) finish('ended', 'max_turns');
    } finally {
      setBusy(false);
    }
  };

  const samples = useMemo(
    () => (scenario && profile ? scenario.sampleOfficerLines.map((l) => ({ ...l, text: fillTemplate(l.text, profile) })) : []),
    [scenario, profile],
  );
  const avg = useMemo(() => avgCriteria(turns), [turns]);
  const cited = useMemo(() => new Set(turns.flatMap((t) => t.evaluation?.citedRefIds ?? [])), [turns]);
  const lastCitizen = [...turns].reverse().find((t) => t.speaker === 'citizen');

  if (scenario === undefined || !profile) return <div className="container h-[70vh]" aria-busy="true" />;
  if (scenario === null)
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold">Ssenariy topilmadi</h1>
        <p className="mt-2 text-slate-400">Bu ssenariy oʻchirilgan yoki boshqa qurilmada yaratilgan boʻlishi mumkin.</p>
        <Link href="/#mashgulot" className="mt-6 inline-block text-blue-300 underline">
          Ssenariylar kutubxonasiga qaytish
        </Link>
      </div>
    );

  const st = aggressionState(aggression);
  const officerCount = turns.filter((t) => t.speaker === 'officer').length;

  return (
    <div className="container py-5">
      {/* Yuqori panel */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href="/#mashgulot" className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Kutubxona
        </Link>
        <span className="h-4 w-px bg-line" aria-hidden />
        <h1 className="min-w-0 flex-1 truncate font-display text-base font-semibold sm:text-lg">{scenario.title}</h1>
        <Badge variant="outline">{getAgency(profile.agency).short}</Badge>
        <DifficultyPips level={scenario.difficulty} />
        <span className="flex items-center gap-1.5 font-mono text-[13px] text-slate-300">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {formatClock(now)}
        </span>
        <span className="font-mono text-[12px] text-slate-500">
          {officerCount}/{MAX_TURNS}
        </span>
        <Button size="sm" variant="danger" onClick={() => finish('ended', 'manual')} disabled={status !== 'active' || officerCount === 0}>
          <Flag aria-hidden /> Yakunlash
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
        {/* Chap ustun */}
        <aside className="order-2 space-y-4 xl:order-1">
          <ScenarioBrief scenario={scenario} />
          <LegalQuickRef ids={scenario.legalRefIds} cited={cited} />
        </aside>

        {/* Markaz */}
        <section className="order-1 space-y-4 xl:order-2" aria-label="Simulyatsiya arenasi">
          <div className="panel corner-ticks scanlines relative h-[340px] overflow-hidden sm:h-[400px]">
            <CoreCanvas aggression={aggression} levelRef={mic.levelRef} speakingRef={speech.speakingRef} />
            <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1">
              <span className="hud-label flex items-center gap-1.5">
                <Radar className="h-3 w-3" aria-hidden /> AI Fuqaro · {scenario.citizen.name}
              </span>
              <span className="font-mono text-[12px]" style={{ color: aggressionColor(aggression) }}>
                {st.label.toUpperCase()} · {lastCitizen?.emotion ?? emotionFor(aggression)}
              </span>
            </div>
            <div className="pointer-events-none absolute right-4 top-4 text-right font-mono text-[11px] text-slate-500">
              <div>AGR {String(aggression).padStart(3, '0')}</div>
              <div>VZM {String(poise).padStart(3, '0')}</div>
            </div>
            <AnimatePresence mode="wait">
              {lastCitizen && status === 'active' && (
                <motion.p
                  key={lastCitizen.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-x-6 bottom-5 mx-auto max-w-2xl rounded-xl bg-navy-950/75 px-4 py-2.5 text-center text-[14.5px] leading-relaxed text-white ring-1 ring-white/10 backdrop-blur"
                >
                  «{lastCitizen.text}»
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="panel p-4">
            <div className="h-56 sm:h-64">
              <Transcript turns={turns} citizenName={scenario.citizen.name} busy={busy} />
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <VoiceBar
                speech={speech}
                mic={mic}
                lang={profile.lang}
                disabled={busy || status !== 'active'}
                onSubmit={handleSend}
                ttsOn={ttsOn}
                onToggleTts={() => {
                  setTtsOn((v) => !v);
                  speech.cancelSpeech();
                }}
                samples={samples}
                draft={draft}
                setDraft={setDraft}
              />
            </div>
          </div>
        </section>

        {/* Oʻng ustun */}
        <aside className="order-3 space-y-4">
          <AggressionMeter value={aggression} history={aggHistory} />
          <PoiseGauge value={poise} delta={poiseDelta} />
          <CriteriaPanel avg={avg} last={lastEval?.scores ?? null} />
          <UstozHint evaluation={lastEval} onUseSuggestion={setDraft} />
          <BiometricMonitor aggression={aggression} />
        </aside>
      </div>

      {status === 'briefing' && <BriefingOverlay scenario={scenario} onStart={begin} profileLine={profileSummary(profile)} />}
      {(status === 'resolved' || status === 'failed' || status === 'ended') && (
        <OutcomeOverlay
          outcome={status}
          reason={outcomeReason}
          finalAggression={aggression}
          poise={poise}
          turns={officerCount}
          durationMs={now}
          sessionId={sessionId}
          onRetry={() => reset(scenario)}
        />
      )}
    </div>
  );
}
