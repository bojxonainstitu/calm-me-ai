import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium leading-5 [&_svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-cobalt-400/30 bg-cobalt-500/10 text-blue-200',
        outline: 'border-line bg-transparent text-slate-300',
        brass: 'border-brass/40 bg-brass/10 text-amber-200',
        calm: 'border-calm/35 bg-calm/10 text-emerald-200',
        tense: 'border-tense/35 bg-tense/10 text-amber-200',
        critical: 'border-critical/40 bg-critical/10 text-red-200',
        mono: 'border-line bg-navy-900/80 font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-300',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
