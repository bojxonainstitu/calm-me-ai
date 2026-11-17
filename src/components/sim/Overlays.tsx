'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Ban, CheckCircle2, Flag, Keyboard, Mic, RotateCcw, Siren, GraduationCap } from 'lucide-react';
import type { Scenario, SessionStatus } from '@/lib/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatClock } from '@/lib/utils';
import { DifficultyPips } from '@/components/landing/TrainingSetup';

function Backdrop({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <motion.div initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} className="panel corner-ticks w-full max-w-xl p-6">
        {children}
      </motion.div>
    </motion.div>
  );
}

export function BriefingOverlay({ scenario, onStart, profileLine }: { scenario: Scenario; onStart: (voice: boolean) => void; profileLine: string }) {
  return (
    <Backdrop>
      <div className="flex items-center gap-2">
        <Badge variant="mono">Brifing</Badge>
        <DifficultyPips level={scenario.difficulty} />
        {scenario.source === 'video' && <Badge variant="brass">Videodan yaratilgan</Badge>}
      </div>
      <h2 className="mt-3 text-xl font-bold leading-snug">{scenario.title}</h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-slate-300">{scenario.brief}</p>
      <div className="mt-4 grid gap-2 rounded-xl bg-white/[0.03] p-4 text-[13px]">
        <p>
          <span className="text-slate-400">Vazifa: </span>
          <span className="text-slate-100">{scenario.objective}</span>
        </p>
        <p>
          <span className="text-slate-400">Sizning rolingiz: </span>
          <span className="text-slate-100">{profileLine}</span>
        </p>
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-slate-400">
        Ovozli rejimda mikrofon faqat tugmani bosib turganingizda yoki «Uzluksiz mikrofon» yoqilganda ishlaydi. Nutqni tanish brauzer xizmati orqali amalga
        oshiriladi; matn rejimi esa toʻliq oflayn.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button size="lg" onClick={() => onStart(true)} autoFocus>
          <Mic aria-hidden /> Ovoz bilan boshlash
        </Button>
        <Button size="lg" variant="secondary" onClick={() => onStart(false)}>
          <Keyboard aria-hidden /> Matn rejimida
        </Button>
      </div>
    </Backdrop>
  );
}

const OUTCOME: Record<Exclude<SessionStatus, 'briefing' | 'active'>, { title: string; icon: typeof CheckCircle2; color: string }> = {
  resolved: { title: 'Vaziyat de-eskalatsiya qilindi', icon: CheckCircle2, color: 'text-emerald-300' },
  failed: { title: 'Vaziyat nazoratdan chiqdi', icon: Siren, color: 'text-red-300' },
  ended: { title: 'Mashgʻulot yakunlandi', icon: Flag, color: 'text-blue-200' },
};

export function OutcomeOverlay({
  outcome,
  reason,
  finalAggression,
  poise,
  turns,
  durationMs,
  sessionId,
  onRetry,
}: {
  outcome: Exclude<SessionStatus, 'briefing' | 'active'>;
  reason?: string;
  finalAggression: number;
  poise: number;
  turns: number;
  durationMs: number;
  sessionId: string;
  onRetry: () => void;
}) {
  const corruption = reason === 'corruption';
  const o = corruption ? { title: 'Mashgʻulot toʻxtatildi: korrupsiya xavfi', icon: Ban, color: 'text-red-300' } : OUTCOME[outcome];
  const Icon = o.icon;
  const stats = [
    { label: 'Yakuniy agressiya', value: `${finalAggression}` },
    { label: 'Vazminlik indeksi', value: `${poise}%` },
    { label: 'Javoblar', value: `${turns}` },
    { label: 'Davomiylik', value: formatClock(durationMs) },
  ];
  return (
    <Backdrop>
      <Icon className={cn('h-9 w-9', o.color)} aria-hidden />
      <h2 className="mt-3 text-2xl font-bold">{o.title}</h2>
      {corruption && (
        <p className="mt-2 text-[13.5px] leading-relaxed text-red-100/90">
          Kelishuvga moyillik bildirilgan ibora real xizmatda Jinoyat kodeksining 210-moddasi boʻyicha javobgarlikka olib kelishi mumkin. AI Ustoz tahlilida
          toʻgʻri javob namunasi bilan tanishing.
        </p>
      )}
      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel-inset px-3 py-2.5">
            <dt className="text-[11px] text-slate-400">{s.label}</dt>
            <dd className="telemetry mt-0.5 text-xl font-semibold text-white">{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/debrief?session=${encodeURIComponent(sessionId)}`} className={cn(buttonVariants({ size: 'lg', variant: 'brass' }))}>
          <GraduationCap aria-hidden /> AI Ustoz tahlili
        </Link>
        <Button size="lg" variant="secondary" onClick={onRetry}>
          <RotateCcw aria-hidden /> Qayta urinish
        </Button>
        <Link href="/#mashgulot" className={cn(buttonVariants({ size: 'lg', variant: 'ghost' }))}>
          Boshqa ssenariy
        </Link>
      </div>
    </Backdrop>
  );
}
