import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-steel text-white shadow-glow hover:bg-cobalt-400 active:scale-[0.98]',
        secondary: 'border border-line bg-navy-700/70 text-slate-100 hover:bg-navy-700 hover:border-slate-500/40',
        outline: 'border border-slate-500/30 bg-transparent text-slate-200 hover:border-cobalt-400/60 hover:bg-cobalt-500/10',
        ghost: 'text-slate-300 hover:bg-white/5 hover:text-white',
        brass: 'bg-brass text-navy-950 shadow-brass hover:bg-brass-400 active:scale-[0.98]',
        danger: 'border border-critical/40 bg-critical/15 text-red-200 hover:bg-critical/25',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, type = 'button', ...props }, ref) => (
  <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = 'Button';
