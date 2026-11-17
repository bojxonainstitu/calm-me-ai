'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Ban, Database, Gauge, MapPinned, ShieldCheck, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { AGENCY_READINESS, COHORTS, HEAT_RAMP, POISE_WEEKLY, PROVOCATION_TRENDS, REGIONS, heatColor } from '@/lib/analytics-demo';
import { PROVOCATION_LABELS, getAgency } from '@/lib/agencies';
import { computeCompetencies } from '@/lib/engine/debrief';
import { loadSessions } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const RegionHeatmap3D = dynamic(() => import('@/components/three/RegionHeatmap3D').then((m) => m.RegionHeatmap3D), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-white/[0.02]" />,
});

const tooltipStyle = {
  contentStyle: { background: '#0F172A', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 10, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#cbd5e1' },
  cursor: { fill: 'rgba(148,163,184,0.06)' },
};
const axisTick = { fill: '#94a3b8', fontSize: 11 };

export function CommandCenter() {
  const [selected, setSelected] = useState<string | null>(null);
  const [local, setLocal] = useState<{ n: number; avg: number } | null>(null);

  useEffect(() => {
    const s = loadSessions();
    if (!s.length) return setLocal({ n: 0, avg: 0 });
    const avg = Math.round(s.reduce((a, x) => a + computeCompetencies(x).overall, 0) / s.length);
    setLocal({ n: s.length, avg });
  }, []);

  const sortedRegions = useMemo(() => [...REGIONS].sort((a, b) => b.incidents - a.incidents), []);
  const sel = REGIONS.find((r) => r.id === selected) ?? null;
  const max = Math.max(...REGIONS.map((r) => r.incidents));
  const trendData = PROVOCATION_TRENDS.map((t) => ({ name: PROVOCATION_LABELS[t.type], share: t.share, change: t.change }));
  const agencyData = AGENCY_READINESS.map((a) => ({ name: getAgency(a.agency).short, readiness: a.readiness }));

  const kpis = [
    { icon: Activity, label: 'Mashgʻulotlar (oy)', value: '1 284', hint: '+18% oʻtgan oyga nisbatan' },
    { icon: Gauge, label: 'Oʻrtacha vazminlik', value: '73%', hint: '8 hafta ichida +12 p.p.' },
    { icon: ShieldCheck, label: 'Tayyorgarlik ≥ 75%', value: '58%', hint: 'kursant va xodimlar ulushi' },
    { icon: Ban, label: 'Korrupsiya xavfi', value: '3,1%', hint: 'sessiyalarda aniqlangan holat' },
  ];

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="hud-label">Qoʻmondonlik markazi</span>
          <h1 className="mt-1 text-3xl font-bold">Hududiy tayyorgarlik va provokatsiya trendlari</h1>
        </div>
        <Badge variant="brass" className="text-[12px]">
          <Database aria-hidden /> Sintetik demo maʼlumotlar
        </Badge>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="panel px-4 py-3">
            <dt className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
              <k.icon className="h-3.5 w-3.5" aria-hidden /> {k.label}
            </dt>
            <dd className="telemetry mt-1 text-2xl font-semibold text-white">{k.value}</dd>
            <dd className="mt-0.5 text-[11.5px] text-slate-500">{k.hint}</dd>
          </div>
        ))}
        <div className="panel border-cobalt-400/30 px-4 py-3">
          <dt className="flex items-center gap-1.5 text-[11.5px] text-blue-200">
            <Users className="h-3.5 w-3.5" aria-hidden /> Ushbu qurilmada (jonli)
          </dt>
          <dd className="telemetry mt-1 text-2xl font-semibold text-white">{local ? local.n : '—'}</dd>
          <dd className="mt-0.5 text-[11.5px] text-slate-500">{local && local.n ? `sessiya · oʻrtacha ${local.avg}%` : 'hali sessiya yoʻq'}</dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
        <div className="panel relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4">
            <span className="hud-label flex items-center gap-1.5">
              <MapPinned className="h-3 w-3" aria-hidden /> Mojaro hotspotlari · 3D issiqlik xaritasi
            </span>
            <div className="flex items-center gap-2 font-mono text-[10.5px] text-slate-400" aria-label="Rang shkalasi">
              <span>kam</span>
              <span className="flex overflow-hidden rounded">
                {HEAT_RAMP.map((c) => (
                  <i key={c} className="h-2.5 w-6" style={{ background: c }} />
                ))}
              </span>
              <span>koʻp</span>
            </div>
          </div>
          <div className="h-[440px]">
            <RegionHeatmap3D regions={REGIONS} selected={selected} onSelect={setSelected} />
          </div>
          <p className="absolute bottom-3 left-5 font-mono text-[10.5px] text-slate-500">Ustun balandligi va rangi — oylik eskalatsiya holatlari · aylantirish: sichqoncha</p>
        </div>

        <div className="panel flex flex-col p-5">
          {sel ? (
            <div className="mb-4 rounded-xl border border-cobalt-400/30 bg-cobalt-500/10 p-3">
              <p className="text-[14px] font-semibold text-white">{sel.name}</p>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <dt className="text-[10.5px] text-slate-400">Holatlar</dt>
                  <dd className="telemetry text-lg text-white">{sel.incidents}</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] text-slate-400">Tayyorgarlik</dt>
                  <dd className="telemetry text-lg text-white">{sel.readiness}%</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] text-slate-400">Oʻqitilgan</dt>
                  <dd className="telemetry text-lg text-white">{sel.trained}</dd>
                </div>
              </dl>
              <p className="mt-2 text-[12px] text-slate-300">Asosiy trend: {PROVOCATION_LABELS[sel.topProvocation]}</p>
            </div>
          ) : (
            <p className="mb-4 text-[12.5px] text-slate-400">Batafsil koʻrish uchun xaritadagi hudud ustunini bosing.</p>
          )}
          <span className="hud-label">Hududlar reytingi</span>
          <table className="mt-2 w-full text-[12.5px]">
            <caption className="sr-only">Hududlar boʻyicha eskalatsiya holatlari va tayyorgarlik</caption>
            <thead>
              <tr className="text-left text-[11px] text-slate-500">
                <th className="py-1 font-normal">Hudud</th>
                <th className="py-1 text-right font-normal">Holat</th>
                <th className="py-1 text-right font-normal">Tayyor.</th>
              </tr>
            </thead>
            <tbody>
              {sortedRegions.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r.id)}
                  className={cn('cursor-pointer border-t border-line hover:bg-white/[0.03]', selected === r.id && 'bg-cobalt-500/10')}
                >
                  <td className="py-1.5">
                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: heatColor(r.incidents / max) }} aria-hidden />
                    <span className="text-slate-200">{r.name.replace(' viloyati', '')}</span>
                  </td>
                  <td className="telemetry py-1.5 text-right text-slate-100">{r.incidents}</td>
                  <td className="telemetry py-1.5 text-right text-slate-300">{r.readiness}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <span className="hud-label">Eng koʻp uchraydigan provokatsiya turlari · ulush, %</span>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} layout="vertical" margin={{ top: 4, right: 44, bottom: 4, left: 8 }} barCategoryGap={8}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" horizontal={false} />
                <XAxis type="number" domain={[0, 40]} tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={190} tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, 'Ulush']} />
                <Bar dataKey="share" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={16}>
                  <LabelList dataKey="share" position="right" formatter={(v: unknown) => `${v}%`} style={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-slate-400">
            {PROVOCATION_TRENDS.filter((t) => t.change !== 0).map((t) => (
              <li key={t.type} className="flex items-center gap-1">
                {t.change > 0 ? <TrendingUp className="h-3 w-3 text-red-300" aria-hidden /> : <TrendingDown className="h-3 w-3 text-emerald-300" aria-hidden />}
                {PROVOCATION_LABELS[t.type]}: {t.change > 0 ? '+' : ''}
                {t.change} p.p.
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <span className="hud-label">Idoralar kesimida tayyorgarlik · %, meʼyor 75%</span>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agencyData} margin={{ top: 20, right: 12, bottom: 4, left: -16 }} barCategoryGap="28%">
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={axisTick} axisLine={false} tickLine={false} />
                <ReferenceLine y={75} stroke="#D97706" strokeDasharray="4 4" label={{ value: 'meʼyor 75%', fill: '#FBBF24', fontSize: 10.5, position: 'insideTopRight' }} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, 'Tayyorgarlik']} />
                <Bar dataKey="readiness" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={44}>
                  <LabelList dataKey="readiness" position="top" formatter={(v: unknown) => `${v}%`} style={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="panel p-5">
          <span className="hud-label">Oʻrtacha vazminlik indeksi · 8 hafta</span>
          <div className="mt-3 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={POISE_WEEKLY} margin={{ top: 10, right: 16, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 80]} tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} cursor={{ stroke: 'rgba(226,232,240,0.3)' }} formatter={(v) => [`${v}%`, 'Vazminlik']} />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3.5, fill: '#3B82F6', stroke: '#0F172A', strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-5">
          <span className="hud-label">Kurs va vzvodlar kesimida kursantlar tayyorgarligi</span>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-[12.5px]">
              <thead>
                <tr className="text-left text-[11px] text-slate-500">
                  <th className="py-1.5 font-normal">Guruh</th>
                  <th className="py-1.5 text-right font-normal">Sessiya</th>
                  <th className="py-1.5 text-right font-normal">Oʻrtacha ball</th>
                  <th className="py-1.5 pl-4 font-normal">Tayyorgarlik</th>
                  <th className="py-1.5 font-normal">Zaif mezon</th>
                </tr>
              </thead>
              <tbody>
                {COHORTS.map((c) => (
                  <tr key={c.name} className="border-t border-line">
                    <td className="py-2 text-slate-200">{c.name}</td>
                    <td className="telemetry py-2 text-right text-slate-300">{c.sessions}</td>
                    <td className="telemetry py-2 text-right text-slate-100">{c.score}%</td>
                    <td className="py-2 pl-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-700/40">
                          <div className="h-full rounded-full bg-steel" style={{ width: `${c.readiness}%` }} />
                        </div>
                        <span className="telemetry text-slate-300">{c.readiness}%</span>
                      </div>
                    </td>
                    <td className="py-2 text-slate-400">{c.weakest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
