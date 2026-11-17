'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Activity, Film, GraduationCap, LayoutDashboard, Crosshair, WifiOff } from 'lucide-react';
import { Logo } from './Logo';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { fetchHealth, type HealthInfo } from '@/lib/client-api';
import { getDemoMode, setDemoMode, type DemoMode } from '@/lib/storage';

const NAV = [
  { href: '/', label: 'Mashgʻulot', icon: Crosshair },
  { href: '/video-to-sim', label: 'Video → Ssenariy', icon: Film },
  { href: '/debrief', label: 'AI Ustoz', icon: GraduationCap },
  { href: '/admin', label: 'Qoʻmondonlik markazi', icon: LayoutDashboard },
];

export function StatusBadge({ health, demo }: { health: HealthInfo | null | undefined; demo: DemoMode }) {
  const offline = health === null;
  const loading = health === undefined;
  const live = !offline && !loading && health.provider !== 'none' && demo !== 'on';
  const label = loading ? 'Ulanmoqda…' : offline ? 'Oflayn demo' : live ? `AI Tizim: Faol · ${health.provider === 'openai' ? 'OpenAI' : 'Gemini'}` : 'AI Tizim: Faol · Demo';
  const color = offline ? '#F59E0B' : '#10B981';
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-line bg-navy-900/80 px-3 py-1 font-mono text-[11px] text-slate-300"
      title={health && !offline ? `Model: ${health.model}` : 'Server bilan aloqa yoʻq — barcha funksiyalar brauzerda ishlaydi'}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full" style={{ backgroundColor: color }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      </span>
      {offline ? <WifiOff className="h-3 w-3" aria-hidden /> : <Activity className="h-3 w-3" aria-hidden />}
      {label}
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthInfo | null | undefined>(undefined);
  const [demo, setDemo] = useState<DemoMode>('auto');

  useEffect(() => {
    setDemo(getDemoMode());
    let alive = true;
    fetchHealth().then((h) => alive && setHealth(h));
    const onStore = () => setDemo(getDemoMode());
    window.addEventListener('calmme:storage', onStore);
    return () => {
      alive = false;
      window.removeEventListener('calmme:storage', onStore);
    };
  }, []);

  const inSim = pathname?.startsWith('/simulate');

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-navy-950/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0" aria-label="CALM ME AI — bosh sahifa">
          <Logo compact={inSim} />
        </Link>
        <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Asosiy navigatsiya">
          {NAV.map((n) => {
            const active = n.href === '/' ? pathname === '/' || inSim : pathname?.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                  active ? 'bg-white/[0.06] text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <label className="hidden items-center gap-2 text-[12px] text-slate-400 md:flex">
            <Switch
              checked={demo === 'on'}
              onChange={(v) => {
                const m: DemoMode = v ? 'on' : 'auto';
                setDemoMode(m);
                setDemo(m);
              }}
              label="Demo rejim (tarmoqsiz)"
            />
            Demo rejim
          </label>
          <StatusBadge health={health} demo={demo} />
        </div>
      </div>
      <nav className="container flex gap-1 overflow-x-auto pb-2 lg:hidden" aria-label="Mobil navigatsiya">
        {NAV.map((n) => {
          const active = n.href === '/' ? pathname === '/' : pathname?.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn('whitespace-nowrap rounded-md px-3 py-1.5 text-xs', active ? 'bg-white/10 text-white' : 'text-slate-400')}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
