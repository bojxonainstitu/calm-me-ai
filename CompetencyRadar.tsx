'use client';

import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface RadarRow {
  axis: string;
  value: number;
  target: number;
  raw: string;
}

interface TickProps {
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  textAnchor?: 'start' | 'middle' | 'end';
  payload?: { value: string };
}

/** 4 oʻqli kompetensiya radari: Joriy sessiya (koʻk) va Maqsad 75% (brass, punktir) */
export function CompetencyRadar({ data }: { data: RadarRow[] }) {
  const byAxis = new Map(data.map((d) => [d.axis, d]));
  const Tick = ({ x = 0, y = 0, cx = 0, payload, textAnchor = 'middle' }: TickProps) => {
    const row = payload ? byAxis.get(payload.value) : undefined;
    const anchor = Math.abs(x - cx) < 8 ? 'middle' : textAnchor;
    return (
      <g transform={`translate(${x},${y})`}>
        <text textAnchor={anchor} fill="#cbd5e1" fontSize={11.5} dy={-2}>
          {payload?.value}
        </text>
        <text textAnchor={anchor} fill="#94a3b8" fontSize={11} dy={12} fontFamily="var(--font-mono)">
          {row?.raw}
        </text>
      </g>
    );
  };
  return (
    <div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="68%" margin={{ top: 16, right: 36, bottom: 8, left: 36 }}>
            <PolarGrid stroke="rgba(148,163,184,0.16)" />
            <PolarAngleAxis dataKey="axis" tick={<Tick />} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} tickCount={5} />
            <Radar name="Maqsad (75%)" dataKey="target" stroke="#D97706" strokeDasharray="4 4" strokeWidth={1.5} fill="none" isAnimationActive={false} />
            <Radar name="Joriy sessiya" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.22} dot={{ r: 4, fill: '#3B82F6', stroke: '#0F172A', strokeWidth: 2 }} />
            <Tooltip
              cursor={false}
              contentStyle={{ background: '#0F172A', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#cbd5e1' }}
              formatter={(v, name) => [`${v}%`, String(name)]}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#cbd5e1' }} iconType="line" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <table className="mt-2 w-full text-[12.5px]">
        <caption className="sr-only">Kompetensiyalar jadvali</caption>
        <thead>
          <tr className="text-left text-slate-500">
            <th className="py-1 font-normal">Mezon</th>
            <th className="py-1 text-right font-normal">Natija</th>
            <th className="py-1 text-right font-normal">Ball</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.map((d) => (
            <tr key={d.axis}>
              <td className="py-1.5 text-slate-300">{d.axis}</td>
              <td className="telemetry py-1.5 text-right text-slate-200">{d.raw}</td>
              <td className={`telemetry py-1.5 text-right ${d.value >= 75 ? 'text-emerald-300' : d.value >= 50 ? 'text-amber-300' : 'text-red-300'}`}>
                {d.value}%{d.value >= 75 ? ' ✓' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
