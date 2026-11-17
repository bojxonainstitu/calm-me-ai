'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { clamp, cn } from '@/lib/utils';

interface Metrics {
  motion: number;
  blinkRate: number;
  tension: number;
}

/**
 * Zero-Click Edge AI biometrik monitor (ixtiyoriy).
 * Kamera kadrlari faqat brauzerda 64×48 piksellik kanvasda tahlil qilinadi va hech qayerga yuborilmaydi:
 *  - mimik faollik: ketma-ket kadrlar farqi;
 *  - koʻz qisish (taxminiy): yuqori-markaziy zonadagi qisqa harakat choʻqqilari;
 *  - kuchlanish indeksi: yuqoridagilar + vaziyat agressiyasi.
 * Ruxsat berilmasa — aniq belgilangan SIMULYATSIYA rejimi.
 */
export function BiometricMonitor({ aggression }: { aggression: number }) {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<'off' | 'live' | 'sim'>('off');
  const [m, setM] = useState<Metrics>({ motion: 0, blinkRate: 0, tension: 0 });
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const aggRef = useRef(aggression);
  aggRef.current = aggression;

  useEffect(() => {
    if (!enabled) {
      setMode('off');
      return;
    }
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;
    let prev: Uint8ClampedArray | null = null;
    let motionEma = 0;
    let eyeEma = 0;
    let lastBlink = 0;
    const blinks: number[] = [];
    const startedAt = performance.now();

    const simulate = () => {
      setMode('sim');
      timer = setInterval(() => {
        const a = aggRef.current / 100;
        const now = performance.now();
        if (Math.random() < 0.08 + a * 0.12) blinks.push(now);
        while (blinks.length && now - blinks[0] > 60_000) blinks.shift();
        const elapsed = Math.min(60, (now - startedAt) / 1000);
        const rate = elapsed > 5 ? Math.round((blinks.length / elapsed) * 60) : 15;
        const motion = clamp(18 + a * 40 + (Math.random() - 0.5) * 12);
        setM({ motion: Math.round(motion), blinkRate: rate, tension: Math.round(clamp(25 + a * 55 + (Math.random() - 0.5) * 8)) });
      }, 500);
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (video.current) {
          video.current.srcObject = stream;
          await video.current.play().catch(() => undefined);
        }
        const cv = document.createElement('canvas');
        cv.width = 64;
        cv.height = 48;
        canvas.current = cv;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        setMode('live');
        timer = setInterval(() => {
          if (!ctx || !video.current || video.current.readyState < 2) return;
          ctx.drawImage(video.current, 0, 0, 64, 48);
          const data = ctx.getImageData(0, 0, 64, 48).data;
          if (prev) {
            let diff = 0;
            let eye = 0;
            let eyeN = 0;
            for (let i = 0; i < data.length; i += 4) {
              const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
              const plum = prev[i] * 0.299 + prev[i + 1] * 0.587 + prev[i + 2] * 0.114;
              const d = Math.abs(lum - plum);
              diff += d;
              const px = (i / 4) % 64;
              const py = Math.floor(i / 4 / 64);
              if (px >= 20 && px < 44 && py >= 12 && py < 22) {
                eye += d;
                eyeN++;
              }
            }
            const motion = diff / (64 * 48) / 255;
            const eyeAvg = eyeN ? eye / eyeN / 255 : 0;
            motionEma = motionEma * 0.8 + motion * 0.2;
            const now = performance.now();
            // Koʻz zonasidagi qisqa choʻqqi umumiy harakatdan sezilarli kuchli boʻlsa — koʻz qisish deb hisoblaymiz
            if (eyeAvg > Math.max(0.035, eyeEma * 2.4) && eyeAvg > motion * 1.8 && now - lastBlink > 250) {
              blinks.push(now);
              lastBlink = now;
            }
            eyeEma = eyeEma * 0.9 + eyeAvg * 0.1;
            while (blinks.length && now - blinks[0] > 60_000) blinks.shift();
            const elapsed = Math.min(60, (now - startedAt) / 1000);
            const rate = elapsed > 5 ? Math.round((blinks.length / elapsed) * 60) : 0;
            const motionPct = clamp(motionEma * 900);
            const tension = clamp(motionPct * 0.55 + Math.max(0, rate - 17) * 1.4 + aggRef.current * 0.25);
            setM({ motion: Math.round(motionPct), blinkRate: rate, tension: Math.round(tension) });
          }
          prev = new Uint8ClampedArray(data);
        }, 200);
      } catch {
        if (!cancelled) simulate();
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
      if (video.current) video.current.srcObject = null;
    };
  }, [enabled]);

  const rows = [
    { label: 'Mimik faollik', value: `${m.motion}%` },
    { label: 'Koʻz qisish ≈', value: `${m.blinkRate}/daq` },
    { label: 'Kuchlanish indeksi', value: `${m.tension}%` },
  ];

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="hud-label flex items-center gap-1.5">
          {enabled ? <Camera className="h-3 w-3" aria-hidden /> : <CameraOff className="h-3 w-3" aria-hidden />}
          Biometrik monitor
        </span>
        <Switch checked={enabled} onChange={setEnabled} label="Biometrik monitorni yoqish" />
      </div>
      {enabled ? (
        <div className="mt-3 grid grid-cols-[96px_1fr] gap-3">
          <div className="relative h-[72px] w-24 overflow-hidden rounded-lg border border-line bg-black">
            <video ref={video} muted playsInline className={cn('h-full w-full -scale-x-100 object-cover', mode !== 'live' && 'hidden')} />
            {mode !== 'live' && (
              <div className="flex h-full w-full items-center justify-center font-mono text-[9px] text-amber-300">SIMULYATSIYA</div>
            )}
            <span className="absolute inset-x-0 top-0 h-px animate-scan bg-cobalt-400/70" aria-hidden />
          </div>
          <dl className="space-y-1">
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-2">
                <dt className="text-[11.5px] text-slate-400">{r.label}</dt>
                <dd className="telemetry text-[12.5px] text-slate-100">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <p className="mt-2 text-[12px] leading-relaxed text-slate-400">Ixtiyoriy: mimika va koʻz qisish chastotasi brauzer ichida tahlil qilinadi.</p>
      )}
      <p className="mt-2 flex items-center gap-1.5 font-mono text-[10.5px] text-slate-500">
        <Lock className="h-3 w-3" aria-hidden />
        {mode === 'sim' ? 'Kameraga ruxsat yoʻq — simulyatsiya qiymatlari' : 'Lokal qayta ishlash · video yuklanmaydi'}
      </p>
    </div>
  );
}
