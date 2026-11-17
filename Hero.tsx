'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Film, ShieldCheck, Scale, WifiOff } from 'lucide-react';
import { CoreCanvas } from '@/components/three/CoreCanvas';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Emblem } from '@/components/brand/Emblem';
import { cn } from '@/lib/utils';

const STATS = [
  { icon: ShieldCheck, value: '6', label: 'taktik ssenariy + videodan yangilari' },
  { icon: Scale, value: '3', label: 'mezonli real vaqt bahosi' },
  { icon: WifiOff, value: '100%', label: 'oflayn Demo rejim' },
];

const EMBLEMS = [
  { src: '/logos/bojxona.png', fallback: 'BQ', label: 'Bojxona qoʻmitasi' },
  { src: '/logos/iiv.png', fallback: 'IIV', label: 'Ichki ishlar vazirligi' },
  { src: '/logos/mg.png', fallback: 'MG', label: 'Milliy gvardiya' },
];

export function Hero() {
  return (
    <section className="container grid items-center gap-10 pb-10 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Badge variant="mono" className="mb-5">Taktik de-eskalatsiya · AI trenajyor</Badge>
        <h1 className="text-balance text-4xl font-extrabold leading-[1.08] sm:text-5xl xl:text-[56px]">
          Provokatsiyaga emas — <span className="text-gradient-brass">qonunga</span> tayaning.
        </h1>
        <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-slate-300">
          CALM ME AI — Bojxona, IIV va Milliy gvardiya xodimlari uchun simulyator. Keskin fuqaro bilan muloqotni xavfsiz muhitda mashq qiling: har bir
          iborangiz <b className="font-semibold text-white">rasmiy etiket</b>, <b className="font-semibold text-white">huquqiy asos</b> va{' '}
          <b className="font-semibold text-white">emotsional barqarorlik</b> boʻyicha real vaqtda baholanadi, AI Ustoz esa qaysi soʻz vaziyatni
          keskinlashtirganini va qaysi moddaga tayanish kerakligini koʻrsatadi.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#mashgulot" className={cn(buttonVariants({ size: 'lg' }))}>
            Mashgʻulotni boshlash <ArrowRight aria-hidden />
          </a>
          <Link href="/video-to-sim" className={cn(buttonVariants({ size: 'lg', variant: 'secondary' }))}>
            <Film aria-hidden /> Videodan ssenariy
          </Link>
        </div>
        <dl className="mt-9 grid max-w-xl grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="panel-inset px-4 py-3">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <s.icon className="mb-2 h-4 w-4 text-brass" aria-hidden />
                <span className="telemetry block text-2xl font-semibold text-white">{s.value}</span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-slate-400">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex items-center gap-4">
          <span className="hud-label">Moʻljallangan idoralar</span>
          <div className="flex items-center gap-3">
            {EMBLEMS.map((e) => (
              <Emblem key={e.label} {...e} className="h-10 w-10 opacity-90" />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="panel corner-ticks scanlines relative h-[420px] overflow-hidden sm:h-[480px]"
      >
        <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-1">
          <span className="hud-label">Neural Acoustic Core</span>
          <span className="font-mono text-[11px] text-slate-500">aggression → rang · pulsatsiya · sim tarangligi</span>
        </div>
        <CoreCanvas aggression={50} idle />
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex items-center justify-between font-mono text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-calm" />Xotirjam 0–33</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-tense" />Tarang 34–66</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-critical" />Kritik 67–100</span>
        </div>
      </motion.div>
    </section>
  );
}
