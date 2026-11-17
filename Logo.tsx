import { cn } from '@/lib/utils';

/** CALM ME AI belgisi: qalqon ichidagi «tinchlanayotgan» toʻlqin */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} aria-hidden="true">
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <path d="M20 2.5 34.5 8v11.2c0 9.1-6.1 15.6-14.5 18.3C11.6 34.8 5.5 28.3 5.5 19.2V8L20 2.5Z" fill="url(#lm-g)" stroke="rgba(255,255,255,0.25)" />
      <path d="M10 21c2.2 0 2.2-5 4.4-5s2.2 8 4.4 8 2.2-6 4.4-6 2.2 3 4.4 3 1.6-.8 2.4-.8" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-extrabold tracking-tight text-white">
          CALM ME <span className="text-gradient-brass">AI</span>
        </span>
        {!compact && <span className="mt-1 hidden text-[11px] font-medium text-slate-400 sm:block">Taktik De-eskalatsiya Simulyatori</span>}
      </span>
    </span>
  );
}
