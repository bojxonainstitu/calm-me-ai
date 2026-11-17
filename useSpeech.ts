'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { Gender, Lang } from '@/lib/types';

/**
 * Web Speech API: nutqni tanish (STT, uz-UZ / ru-RU) va matnni ovozlashtirish (TTS).
 * Oʻzbek ovozi boʻlmasa, lotin yozuvini tabiiyroq oʻqiydigan turk ovoziga, u ham boʻlmasa
 * istalgan mavjud ovozga oʻtadi; TTS umuman boʻlmasa — «ovozsiz nutq» animatsiyasi.
 */

type Recognition = any;

export interface SpeechApi {
  sttSupported: boolean;
  ttsSupported: boolean;
  listening: boolean;
  interim: string;
  sttError: string | null;
  startListening: (opts: { lang: Lang; continuous: boolean; onFinal: (text: string) => void }) => void;
  stopListening: () => void;
  speaking: boolean;
  voiceName: string | null;
  speak: (text: string, opts: { lang: Lang; gender: Gender; pitch?: number; rate?: number; muted?: boolean }) => void;
  cancelSpeech: () => void;
  /** Gapirish amplitudasi 0–1 (3D yadro va toʻlqin animatsiyasi uchun) */
  speakingRef: MutableRefObject<number>;
}

const FEMALE_HINTS = /(female|ayol|women|woman|milena|yelda|madina|irina|alena|svetlana|katya|google.*female|zira|samantha)/i;
const MALE_HINTS = /(male|erkak|man|pavel|dmitri|yuri|cem|tolga|google.*male|david)/i;

function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang, gender: Gender) {
  const order = lang === 'ru-RU' ? ['ru'] : ['uz', 'tr', 'kk', 'az'];
  for (const prefix of order) {
    const cands = voices.filter((v) => v.lang?.toLowerCase().startsWith(prefix));
    if (!cands.length) continue;
    const hint = gender === 'ayol' ? FEMALE_HINTS : MALE_HINTS;
    return cands.find((v) => hint.test(v.name)) ?? cands[0];
  }
  return voices.find((v) => v.default) ?? voices[0] ?? null;
}

export function useSpeech(): SpeechApi {
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [sttError, setSttError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [voiceName, setVoiceName] = useState<string | null>(null);

  const recRef = useRef<Recognition | null>(null);
  const wantRef = useRef(false);
  const onFinalRef = useRef<(t: string) => void>(() => undefined);
  const bufferRef = useRef('');
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speakingRef = useRef(0);
  const rafRef = useRef(0);
  const fakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const w = window as any;
    setSttSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    const synth: SpeechSynthesis | undefined = w.speechSynthesis;
    setTtsSupported(Boolean(synth));
    if (!synth) return;
    const load = () => (voicesRef.current = synth.getVoices());
    load();
    synth.addEventListener?.('voiceschanged', load);
    return () => synth.removeEventListener?.('voiceschanged', load);
  }, []);

  // Gapirish amplitudasini animatsiya qilish
  useEffect(() => {
    if (!speaking) {
      speakingRef.current = 0;
      return;
    }
    const loop = (t: number) => {
      const s = t / 1000;
      speakingRef.current = 0.35 + 0.65 * Math.abs(Math.sin(s * 9.3) * Math.sin(s * 3.7 + 1.2));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speaking]);

  const stopListening = useCallback(() => {
    wantRef.current = false;
    try {
      recRef.current?.stop();
    } catch {
      /* allaqachon toʻxtagan */
    }
  }, []);

  const startListening = useCallback<SpeechApi['startListening']>(({ lang, continuous, onFinal }) => {
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setSttError('Brauzeringiz nutqni tanishni qoʻllab-quvvatlamaydi (Chrome yoki Edge tavsiya etiladi)');
      return;
    }
    try {
      recRef.current?.abort?.();
    } catch {
      /* eʼtiborsiz */
    }
    onFinalRef.current = onFinal;
    bufferRef.current = '';
    wantRef.current = true;
    setSttError(null);

    const rec: Recognition = new Ctor();
    rec.lang = lang;
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const tx: string = r[0]?.transcript ?? '';
        if (r.isFinal) {
          if (continuous) {
            const clean = tx.trim();
            if (clean) onFinalRef.current(clean);
          } else {
            bufferRef.current += ` ${tx}`;
          }
        } else {
          interimText += tx;
        }
      }
      setInterim(interimText);
    };
    rec.onerror = (e: any) => {
      const map: Record<string, string> = {
        'not-allowed': 'Mikrofonga ruxsat berilmadi',
        'no-speech': 'Nutq aniqlanmadi — qaytadan urinib koʻring',
        network: 'Nutqni tanish xizmatiga ulanib boʻlmadi — matn orqali davom eting',
        'language-not-supported': 'Tanlangan til qoʻllab-quvvatlanmaydi',
      };
      if (e?.error !== 'aborted') setSttError(map[e?.error] ?? 'Nutqni tanishda xatolik');
    };
    rec.onend = () => {
      setInterim('');
      if (!continuous) {
        const text = bufferRef.current.trim();
        bufferRef.current = '';
        setListening(false);
        if (text) onFinalRef.current(text);
        return;
      }
      if (wantRef.current) {
        try {
          rec.start(); // Chrome jimlikdan soʻng toʻxtatadi — qayta ulaymiz
          return;
        } catch {
          /* qayta ishga tushmadi */
        }
      }
      setListening(false);
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setSttError('Mikrofon band — biroz kutib qayta urinib koʻring');
    }
  }, []);

  const cancelSpeech = useCallback(() => {
    if (fakeTimerRef.current) clearTimeout(fakeTimerRef.current);
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* eʼtiborsiz */
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback<SpeechApi['speak']>((text, { lang, gender, pitch = 1, rate = 1, muted }) => {
    cancelSpeech();
    const fakeDuration = Math.min(9000, Math.max(1400, text.length * 58));
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    const fake = () => {
      setSpeaking(true);
      fakeTimerRef.current = setTimeout(() => setSpeaking(false), fakeDuration);
    };
    if (muted || !synth) return fake();
    const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices();
    const voice = pickVoice(voices, lang, gender);
    if (!voice) return fake();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang || lang;
    u.pitch = Math.min(2, Math.max(0.1, pitch));
    u.rate = Math.min(1.6, Math.max(0.6, rate));
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setVoiceName(`${voice.name} (${voice.lang})`);
    setSpeaking(true);
    synth.speak(u);
  }, [cancelSpeech]);

  useEffect(
    () => () => {
      wantRef.current = false;
      try {
        recRef.current?.abort?.();
        window.speechSynthesis?.cancel();
      } catch {
        /* eʼtiborsiz */
      }
      if (fakeTimerRef.current) clearTimeout(fakeTimerRef.current);
    },
    [],
  );

  return {
    sttSupported,
    ttsSupported,
    listening,
    interim,
    sttError,
    startListening,
    stopListening,
    speaking,
    voiceName,
    speak,
    cancelSpeech,
    speakingRef,
  };
}
