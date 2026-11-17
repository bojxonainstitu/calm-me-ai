'use client';

import { useRef, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Option<T extends string> {
  id: T;
  label: string;
  hint?: string;
}

interface SegmentedProps<T extends string> {
  name: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  className?: string;
}

/** Klaviatura bilan boshqariladigan segmentli tanlov (role="radiogroup") */
export function Segmented<T extends string>({ name, value, options, onChange, className }: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    onChange(options[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={name} className={cn('flex w-full gap-1 rounded-xl border border-line bg-navy-900/70 p-1', className)}>
      {options.map((o, i) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => onChange(o.id)}
            className={cn(
              'relative flex min-h-9 flex-1 flex-col items-center justify-center rounded-lg px-2 py-1 text-center text-[12.5px] font-medium transition-colors',
              active ? 'text-white' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${name}`}
                className="absolute inset-0 rounded-lg border border-cobalt-400/40 bg-cobalt-500/20"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{o.label}</span>
            {o.hint && <span className="relative text-[10.5px] font-normal text-slate-500">{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
