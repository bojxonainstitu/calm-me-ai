import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1440px' } },
    extend: {
      colors: {
        navy: { 950: '#070B14', 900: '#0A0F1C', 850: '#0C1322', 800: '#0F172A', 700: '#16203A' },
        cobalt: { DEFAULT: '#1E40AF', 400: '#3B82F6', 500: '#2563EB', 600: '#1E40AF', 700: '#1E3A8A' },
        steel: '#2563EB',
        brass: { DEFAULT: '#D97706', 300: '#FBBF24', 400: '#F59E0B', 600: '#B45309', 700: '#92400E' },
        calm: '#10B981',
        tense: '#F59E0B',
        critical: '#EF4444',
        line: 'rgba(148, 163, 184, 0.15)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-jakarta)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderColor: { DEFAULT: 'rgba(148, 163, 184, 0.15)' },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.8)',
        glow: '0 0 0 1px rgba(37,99,235,0.35), 0 0 24px -4px rgba(37,99,235,0.45)',
        brass: '0 0 0 1px rgba(217,119,6,0.4), 0 0 24px -6px rgba(217,119,6,0.5)',
      },
      keyframes: {
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.25' } },
      },
      animation: {
        scan: 'scan 3.2s linear infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        blink: 'blink 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
