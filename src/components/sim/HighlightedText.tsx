import type { ReactNode } from 'react';
import type { Highlight } from '@/lib/types';

/** Eskalatsiya (qizil) va de-eskalatsiya (yashil) qilgan iboralarni matn ichida belgilaydi */
export function HighlightedText({ text, highlights }: { text: string; highlights?: Highlight[] }) {
  if (!highlights?.length) return <>{text}</>;
  const lower = text.toLowerCase();
  const ranges: { start: number; end: number; kind: Highlight['kind'] }[] = [];
  [...highlights]
    .sort((a, b) => b.text.length - a.text.length)
    .forEach((h) => {
      const idx = lower.indexOf(h.text.toLowerCase());
      if (idx < 0) return;
      const r = { start: idx, end: idx + h.text.length, kind: h.kind };
      if (ranges.some((x) => r.start < x.end && x.start < r.end)) return;
      ranges.push(r);
    });
  ranges.sort((a, b) => a.start - b.start);
  const out: ReactNode[] = [];
  let pos = 0;
  ranges.forEach((r, i) => {
    if (r.start > pos) out.push(text.slice(pos, r.start));
    out.push(
      <mark
        key={i}
        className={
          r.kind === 'positive'
            ? 'rounded bg-calm/15 px-0.5 text-emerald-100 underline decoration-calm/70 decoration-2 underline-offset-[3px]'
            : 'rounded bg-critical/15 px-0.5 text-red-100 underline decoration-critical/80 decoration-wavy decoration-1 underline-offset-[3px]'
        }
        title={r.kind === 'positive' ? 'De-eskalatsiya qilgan ibora' : 'Eskalatsiya qilgan ibora'}
      >
        {text.slice(r.start, r.end)}
      </mark>,
    );
    pos = r.end;
  });
  if (pos < text.length) out.push(text.slice(pos));
  return <>{out}</>;
}
