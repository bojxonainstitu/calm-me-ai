'use client';

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Turn } from '@/lib/types';

/** Sessiya davomida agressiya yoʻli (bitta qator, zonalar chegarasi punktir bilan) */
export function AggressionJourney({ turns, initial }: { turns: Turn[]; initial: number }) {
  const data = [{ step: 'Start', value: initial, who: 'Boshlangʻich holat' }];
  let n = 0;
  turns.forEach((t) => {
    if (typeof t.aggressionAfter !== 'number' || t.t === 0) return;
    if (t.speaker === 'officer') n += 1;
    data.push({ step: t.speaker === 'officer' ? `J${n}` : `F${n}`, value: t.aggressionAfter, who: t.speaker === 'officer' ? `${n}-javobingizdan soʻng` : `Fuqaro reaksiyasi (${n})` });
  });
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.10)" vertical={false} />
          <XAxis dataKey="step" tick={{ fill: '#64748b', fontSize: 10.5, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} ticks={[0, 33, 66, 100]} tick={{ fill: '#64748b', fontSize: 10.5, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <ReferenceLine y={66} stroke="#EF4444" strokeOpacity={0.4} strokeDasharray="3 4" />
          <ReferenceLine y={33} stroke="#10B981" strokeOpacity={0.4} strokeDasharray="3 4" />
          <Tooltip
            contentStyle={{ background: '#0F172A', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 10, fontSize: 12 }}
            labelFormatter={(_, p) => (p?.[0]?.payload?.who as string) ?? ''}
            formatter={(v) => [v, 'Agressiya']}
            itemStyle={{ color: '#cbd5e1' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3.5, fill: '#3B82F6', stroke: '#0F172A', strokeWidth: 2 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
