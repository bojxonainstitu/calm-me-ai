'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Mic, MicOff, Radio, Send, Volume2, VolumeX } from 'lucide-react';
import type { Lang, SampleLine } from '@/lib/types';
import type { SpeechApi } from '@/hooks/useSpeech';
import type { MicAnalyser } from '@/hooks/useMicAnalyser';
import { Waveform } from './Waveform';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceBarProps {
  speech: SpeechApi;
  mic: MicAnalyser;
  lang: Lang;
  disabled: boolean;
  onSubmit: (text: string) => void;
  ttsOn: boolean;
  onToggleTts: () => void;
  samples: SampleLine[];
  draft: string;
  setDraft: (v: string) => void;
}

const QUALITY = {
  good: { label: 'Namuna', cls: 'border-calm/35 text-emerald-200 hover:bg-calm/10' },
  neutral: { label: 'Neytral', cls: 'border-slate-500/40 text-slate-300 hover:bg-white/5' },
  bad: { label: 'Xato', cls: 'border-critical/35 text-red-200 hover:bg-critical/10' },
};

export function VoiceBar({ speech, mic, lang, disabled, onSubmit, ttsOn, onToggleTts, samples, draft, setDraft }: VoiceBarProps) {
  const [continuous, setContinuous] = useState(false);
  const holding = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const submit = (text = draft) => {
    const t = text.trim();
    if (!t || disabled) return;
    onSubmit(t);
    setDraft('');
  };

  // Uzluksiz rejim: har bir yakuniy ibora avtomatik yuboriladi
  useEffect(() => {
    if (!continuous) return;
    if (disabled) {
      speech.stopListening();
      return;
    }
    mic.start();
    speech.startListening({ lang, continuous: true, onFinal: (t) => onSubmit(t) });
    return () => speech.stopListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuous, disabled, lang]);

  const pttDown = async () => {
    if (disabled || continuous) return;
    holding.current = true;
    speech.cancelSpeech();
    await mic.start();
    if (!holding.current) return;
    speech.startListening({ lang, continuous: false, onFinal: (t) => submit(t) });
  };
  const pttUp = () => {
    if (!holding.current) return;
    holding.current = false;
    speech.stopListening();
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-line bg-navy-900/80">
        <Waveform waveRef={mic.waveRef} levelRef={mic.levelRef} speakingRef={speech.speakingRef} active={mic.active} className="h-14 w-full" />
        <div className="pointer-events-none absolute left-3 top-2 flex items-center gap-3 font-mono text-[10.5px] text-slate-500">
          <span className={cn(mic.active ? 'text-blue-300' : '')}>MIC {mic.active ? `${Math.round(mic.level * 100)}%` : 'OFF'}</span>
          <span>PITCH {mic.pitch ? `${mic.pitch} Hz` : '—'}</span>
          {speech.speaking && <span className="text-amber-300">AI FUQARO GAPIRMOQDA</span>}
        </div>
        {speech.listening && (
          <span className="absolute right-3 top-2 flex items-center gap-1.5 font-mono text-[10.5px] text-red-300">
            <i className="h-2 w-2 animate-blink rounded-full bg-critical" /> REC
          </span>
        )}
      </div>

      <div className="flex items-end gap-2">
        <button
          type="button"
          onPointerDown={pttDown}
          onPointerUp={pttUp}
          onPointerLeave={pttUp}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              pttDown();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === ' ' || e.key === 'Enter') pttUp();
          }}
          disabled={disabled || continuous || !speech.sttSupported}
          aria-label="Bosib turing va gapiring (push-to-talk)"
          title={speech.sttSupported ? 'Bosib turing va gapiring' : 'Brauzer nutqni tanishni qoʻllamaydi — Chrome/Edge tavsiya etiladi'}
          className={cn(
            'relative flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-xl border transition-all disabled:opacity-40',
            speech.listening && !continuous ? 'border-critical/60 bg-critical/20 text-red-100' : 'border-cobalt-400/40 bg-cobalt-500/15 text-blue-100 hover:bg-cobalt-500/25',
          )}
        >
          {speech.listening && !continuous && <span className="absolute inset-0 animate-pulse-ring rounded-xl border border-critical/60" />}
          {speech.sttSupported ? <Mic className="h-5 w-5" aria-hidden /> : <MicOff className="h-5 w-5" aria-hidden />}
        </button>

        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            disabled={disabled}
            placeholder={speech.interim ? speech.interim : 'Fuqaroga javobingizni yozing yoki mikrofonni bosib turib gapiring…'}
            aria-label="Xodim javobi"
            className="block w-full resize-none rounded-xl border border-line bg-navy-900/80 px-3.5 py-2.5 text-[14px] text-slate-100 placeholder:text-slate-500 focus:border-cobalt-400/60 focus:outline-none disabled:opacity-50"
          />
        </div>
        <Button size="icon" className="h-12 w-12" onClick={() => submit()} disabled={disabled || !draft.trim()} aria-label="Yuborish">
          <Send aria-hidden />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setContinuous((v) => !v)}
          disabled={!speech.sttSupported}
          aria-pressed={continuous}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors disabled:opacity-40',
            continuous ? 'border-critical/50 bg-critical/15 text-red-100' : 'border-line text-slate-300 hover:bg-white/5',
          )}
        >
          <Radio className="h-3.5 w-3.5" aria-hidden /> Uzluksiz mikrofon
        </button>
        <button
          type="button"
          onClick={onToggleTts}
          aria-pressed={ttsOn}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-slate-300 transition-colors hover:bg-white/5"
          title={speech.voiceName ?? 'Ovoz tanlanmagan'}
        >
          {ttsOn ? <Volume2 className="h-3.5 w-3.5" aria-hidden /> : <VolumeX className="h-3.5 w-3.5" aria-hidden />}
          Fuqaro ovozi {ttsOn ? 'yoqilgan' : 'oʻchirilgan'}
        </button>
        <span className="mx-1 h-4 w-px bg-line" aria-hidden />
        <span className="hud-label">Demo iboralar</span>
        {samples.map((s) => (
          <button
            key={s.quality}
            type="button"
            disabled={disabled}
            onClick={() => submit(s.text)}
            title={s.text}
            className={cn('rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors disabled:opacity-40', QUALITY[s.quality].cls)}
          >
            {QUALITY[s.quality].label}
          </button>
        ))}
      </div>
      {(speech.sttError || mic.error) && <p className="text-[12px] text-amber-300">{speech.sttError ?? mic.error}</p>}
    </div>
  );
}
