'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, CircleDashed, Clapperboard, FileVideo, Loader2, Play, ScanFace, Sparkles, Upload, Zap, ShieldCheck, Quote } from 'lucide-react';
import type { VideoToSimResponse } from '@/lib/types';
import { SAMPLE_CLIPS } from '@/lib/engine/video';
import { videoToSim } from '@/lib/client-api';
import { extractFrames, sleep } from '@/lib/video-client';
import { saveCustomScenario } from '@/lib/storage';
import { getLegalRefs, legalShort } from '@/lib/legal';
import { PROVOCATION_LABELS } from '@/lib/agencies';
import { SyntheticFrame } from './SyntheticFrame';
import { EscalationTimeline } from './EscalationTimeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatTimestamp } from '@/lib/utils';

type Phase = 'idle' | 'privacy' | 'trigger' | 'scenario' | 'done' | 'error';
const ORDER: Phase[] = ['privacy', 'trigger', 'scenario', 'done'];

function StepHeader({ n, title, desc, state, icon: Icon }: { n: number; title: string; desc: string; state: 'pending' | 'running' | 'done'; icon: typeof ScanFace }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
          state === 'done' ? 'border-calm/40 bg-calm/10 text-emerald-200' : state === 'running' ? 'border-cobalt-400/50 bg-cobalt-500/15 text-blue-100' : 'border-line text-slate-500',
        )}
      >
        {state === 'running' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : state === 'done' ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Icon className="h-4 w-4" aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="hud-label">Bosqich {n}</p>
        <h3 className="text-[15px] font-semibold">{title}</h3>
        <p className="mt-0.5 text-[12.5px] text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

export function VideoToSim() {
  const router = useRouter();
  const [sampleId, setSampleId] = useState<string>(SAMPLE_CLIPS[1].id);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [frames, setFrames] = useState<string[]>([]);
  const [result, setResult] = useState<VideoToSimResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sample = SAMPLE_CLIPS.find((c) => c.id === sampleId);
  const stateOf = (p: Phase): 'pending' | 'running' | 'done' => {
    if (phase === 'idle' || phase === 'error') return 'pending';
    const cur = ORDER.indexOf(phase);
    const idx = ORDER.indexOf(p);
    return idx < cur ? 'done' : idx === cur ? 'running' : 'pending';
  };

  const pickFile = (f: File | null | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('video/')) {
      setError('Faqat video fayl yuklang (mp4, webm, mov)');
      return;
    }
    if (f.size > 200 * 1024 * 1024) {
      setError('Fayl hajmi 200 MB dan oshmasligi kerak');
      return;
    }
    setError(null);
    setFile(f);
    setSampleId('');
    setPhase('idle');
    setResult(null);
  };

  const run = async () => {
    setError(null);
    setResult(null);
    setFrames([]);
    try {
      setPhase('privacy');
      let payload: Parameters<typeof videoToSim>[0];
      if (file) {
        const [ex] = await Promise.all([extractFrames(file), sleep(1200)]);
        setFrames(ex.frames);
        payload = {
          frames: ex.frames,
          frameTimes: ex.times,
          durationSec: ex.durationSec,
          fileName: file.name,
          note,
          facesBlurred: ex.faces,
          platesBlurred: ex.plates,
          privacyMethod: ex.method,
        };
      } else {
        await sleep(1500);
        payload = { sampleId, note };
      }
      setPhase('trigger');
      const [res] = await Promise.all([videoToSim(payload), sleep(1400)]);
      setResult(res);
      setPhase('scenario');
      await sleep(900);
      setPhase('done');
    } catch (e) {
      setError((e as Error).message || 'Tahlil jarayonida xatolik');
      setPhase('error');
    }
  };

  const launch = () => {
    if (!result) return;
    saveCustomScenario(result.scenario);
    router.push(`/simulate/${encodeURIComponent(result.scenario.id)}`);
  };

  const running = phase === 'privacy' || phase === 'trigger' || phase === 'scenario';
  const a = result?.analysis;
  const showTrigger = a && (phase === 'scenario' || phase === 'done');
  const showScenario = result && phase === 'done';

  return (
    <div className="container py-8">
      <div className="mb-6 max-w-3xl">
        <span className="hud-label">Video → Ssenariy generatori</span>
        <h1 className="mt-1 text-3xl font-bold">Real mojaro videosidan — oʻquv simulyatsiyasiga</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-300">
          Instruktor bodikamera yoki ijtimoiy tarmoqdagi qisqa klipni yuklaydi. Brauzer yuzlar va raqamlarni lokal niqoblaydi, AI esa eskalatsiya nuqtasi va
          manipulyatsiya taktikasini aniqlab, uni bir bosishda oʻynaladigan AI Fuqaro ssenariysiga aylantiradi.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Manba */}
        <div className="space-y-4">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              'panel flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed p-8 text-center transition-colors',
              drag ? 'border-cobalt-400/70 bg-cobalt-500/10' : 'hover:border-slate-500/50',
            )}
          >
            <input ref={inputRef} type="file" accept="video/*" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
            {file ? <FileVideo className="h-8 w-8 text-cobalt-400" aria-hidden /> : <Upload className="h-8 w-8 text-slate-400" aria-hidden />}
            <p className="text-[14px] font-medium text-slate-100">{file ? file.name : 'Videoni shu yerga tashlang yoki tanlang'}</p>
            <p className="text-[12px] text-slate-400">
              {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · kadrlar brauzerda ajratiladi` : 'MP4 / WebM / MOV · 200 MB gacha · video serverga yuklanmaydi'}
            </p>
          </label>

          <div className="panel p-4">
            <label htmlFor="note" className="hud-label">
              Instruktor izohi (ixtiyoriy)
            </label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Masalan: bloger telefon bilan xodimga yaqinlashib, guvohnoma talab qilmoqda…"
              className="mt-2 block w-full resize-none rounded-xl border border-line bg-navy-900/80 px-3 py-2 text-[13.5px] text-slate-100 placeholder:text-slate-500 focus:border-cobalt-400/60 focus:outline-none"
            />
          </div>

          <div className="panel p-4">
            <p className="hud-label mb-3">Yoki namunaviy klipni tanlang</p>
            <div className="grid gap-2">
              {SAMPLE_CLIPS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSampleId(c.id);
                    setFile(null);
                    setPhase('idle');
                    setResult(null);
                    if (inputRef.current) inputRef.current.value = '';
                  }}
                  aria-pressed={sampleId === c.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all',
                    sampleId === c.id ? 'border-cobalt-400/60 bg-cobalt-500/10' : 'border-line bg-navy-900/60 hover:border-slate-500/40',
                  )}
                >
                  <span className="h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-line">
                    <SyntheticFrame scene={c.scene} index={0} masked={false} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium leading-snug text-slate-100">{c.title}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-slate-500">
                      {c.source} · {formatTimestamp(c.durationSec)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={run} disabled={running || (!file && !sampleId)}>
            {running ? <Loader2 className="animate-spin" aria-hidden /> : <Zap aria-hidden />}
            {running ? 'Tahlil qilinmoqda…' : 'Avtomatik tahlilni boshlash'}
          </Button>
          {error && <p className="text-[13px] text-red-300">{error}</p>}
        </div>

        {/* Pipeline */}
        <div className="space-y-4">
          {/* 1 */}
          <div className="panel p-5">
            <StepHeader n={1} title="Privacy Shield" desc="Yuzlar va avtomobil raqamlari brauzerda mozaikalanadi — serverga faqat anonimlashtirilgan kadrlar ketadi." state={stateOf('privacy')} icon={ScanFace} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="relative aspect-video overflow-hidden rounded-lg border border-line bg-navy-900">
                  {file ? (
                    frames[i] ? (
                      <img src={frames[i]} alt={`Anonimlashtirilgan kadr ${i + 1}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <CircleDashed className={cn('h-5 w-5 text-slate-600', phase === 'privacy' && 'animate-spin')} aria-hidden />
                      </div>
                    )
                  ) : sample ? (
                    <SyntheticFrame scene={sample.scene} index={i} masked={stateOf('privacy') === 'done'} />
                  ) : null}
                  {phase === 'privacy' && <span className="absolute inset-x-0 top-0 h-px animate-scan bg-cobalt-400" aria-hidden />}
                </div>
              ))}
            </div>
            {a && (
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11.5px] text-slate-400">
                <span>
                  <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-300" aria-hidden />
                  Yuzlar: {a.facesBlurred}
                </span>
                <span>Raqam/matn: {a.platesBlurred}</span>
                <span>
                  Usul:{' '}
                  {a.privacyMethod === 'face-detector' ? 'FaceDetector API' : a.privacyMethod === 'heuristic' ? 'toʻliq kadr mozaikasi' : 'sintetik namuna'}
                </span>
              </p>
            )}
          </div>

          {/* 2 */}
          <div className="panel p-5">
            <StepHeader n={2} title="Trigger Extraction" desc="AI mojaro keskinlashgan aniq lahza va fuqaroning manipulyatsiya taktikasini aniqlaydi." state={stateOf('trigger')} icon={Clapperboard} />
            <AnimatePresence>
              {showTrigger && a && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                  <EscalationTimeline data={a.timeline} duration={a.durationSec} trigger={a.triggerTimestampSec} />
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="panel-inset p-3">
                      <p className="hud-label">Eskalatsiya nuqtasi · {formatTimestamp(a.triggerTimestampSec)}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-200">{a.triggerDescription}</p>
                    </div>
                    <div className="panel-inset p-3">
                      <p className="hud-label">Manipulyatsiya taktikasi</p>
                      <p className="mt-1 text-[13px] font-medium text-amber-200">{a.tactic}</p>
                      <Badge variant="outline" className="mt-2">
                        {PROVOCATION_LABELS[a.provocation]}
                      </Badge>
                      {a.quote && (
                        <p className="mt-2 flex gap-1.5 text-[12.5px] italic text-slate-400">
                          <Quote className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {a.quote}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3 */}
          <div className="panel p-5">
            <StepHeader n={3} title="Instant Scenario Launch" desc="Video bir bosishda AI Fuqaro bilan oʻynaladigan simulyatsiyaga aylantiriladi." state={stateOf('scenario')} icon={Sparkles} />
            <AnimatePresence>
              {showScenario && result && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-brass/30 bg-brass/[0.06] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brass">{result.source === 'llm' ? 'AI tomonidan yaratildi' : 'Demo dvigatel'}</Badge>
                    <Badge variant="mono">Start agressiya {result.scenario.initialAggression}</Badge>
                  </div>
                  <h4 className="mt-2 text-[16px] font-semibold leading-snug">{result.scenario.title}</h4>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">{result.scenario.brief}</p>
                  <p className="mt-3 text-[13px] text-slate-400">
                    AI Fuqaro: <span className="text-slate-200">{result.scenario.citizen.name}, {result.scenario.citizen.age} yosh — {result.scenario.citizen.role}</span>
                  </p>
                  <p className="mt-2 rounded-lg bg-navy-950/60 px-3 py-2 text-[13.5px] italic text-slate-100">«{result.scenario.openingLine}»</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {getLegalRefs(result.scenario.legalRefIds).map((r) => (
                      <span key={r.id} className="rounded-md bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-amber-100">
                        {legalShort(r)}
                      </span>
                    ))}
                  </div>
                  <Button size="lg" variant="brass" className="mt-4" onClick={launch}>
                    <Play aria-hidden /> Simulyatsiyani boshlash
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
