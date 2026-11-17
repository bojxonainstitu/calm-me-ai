'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

/**
 * Mikrofon tahlilchisi (Web Audio API): ovoz balandligi (RMS), toʻlqin shakli va
 * avtokorrelyatsiya orqali asosiy chastota (pitch). Barcha hisoblash brauzerda.
 */

function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const size = buf.length;
  let rms = 0;
  for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / size);
  if (rms < 0.012) return -1;
  let r1 = 0;
  let r2 = size - 1;
  const thres = 0.2;
  for (let i = 0; i < size / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < size / 2; i++) if (Math.abs(buf[size - i]) < thres) { r2 = size - i; break; }
  const b = buf.slice(r1, r2);
  const n = b.length;
  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) c[i] += b[j] * b[j + i];
  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < n; i++) if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  if (maxpos <= 0 || maxpos >= n - 1) return -1;
  let T0 = maxpos;
  const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const bb = (x3 - x1) / 2;
  if (a) T0 = T0 - bb / (2 * a);
  const f = sampleRate / T0;
  return f > 60 && f < 500 ? f : -1;
}

export interface MicAnalyser {
  active: boolean;
  error: string | null;
  level: number;
  pitch: number | null;
  levelRef: MutableRefObject<number>;
  waveRef: MutableRefObject<Float32Array | null>;
  start: () => Promise<boolean>;
  stop: () => void;
  /** Soʻnggi chaqiruvdan beri qayd etilgan eng yuqori RMS (0–1) va uni nolga tushiradi */
  consumePeak: () => number;
}

export function useMicAnalyser(): MicAnalyser {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [pitch, setPitch] = useState<number | null>(null);
  const levelRef = useRef(0);
  const peakRef = useRef(0);
  const waveRef = useRef<Float32Array | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastUiRef = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
    levelRef.current = 0;
    setLevel(0);
    setPitch(null);
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    if (ctxRef.current) return true;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Brauzer mikrofonni qoʻllab-quvvatlamaydi');
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      waveRef.current = buf;
      streamRef.current = stream;
      ctxRef.current = ctx;
      setActive(true);
      setError(null);
      let lastPitchAt = 0;
      const loop = (now: number) => {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        const norm = Math.min(1, rms * 4);
        levelRef.current = levelRef.current * 0.7 + norm * 0.3;
        peakRef.current = Math.max(peakRef.current, norm);
        if (now - lastUiRef.current > 100) {
          lastUiRef.current = now;
          setLevel(levelRef.current);
        }
        if (now - lastPitchAt > 160) {
          lastPitchAt = now;
          const f = autoCorrelate(buf.subarray(0, 1024), ctx.sampleRate);
          setPitch(f > 0 ? Math.round(f) : null);
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
      return true;
    } catch (e) {
      setError((e as Error).name === 'NotAllowedError' ? 'Mikrofonga ruxsat berilmadi' : 'Mikrofonni ishga tushirib boʻlmadi');
      return false;
    }
  }, []);

  const consumePeak = useCallback(() => {
    const p = peakRef.current;
    peakRef.current = 0;
    return Math.round(p * 100) / 100;
  }, []);

  useEffect(() => stop, [stop]);

  return { active, error, level, pitch, levelRef, waveRef, start, stop, consumePeak };
}
