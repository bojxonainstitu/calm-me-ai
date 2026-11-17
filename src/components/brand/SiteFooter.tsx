import { ShieldCheck } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-line">
      <div className="container grid gap-4 py-8 text-[12px] leading-relaxed text-slate-500 md:grid-cols-[1fr_auto]">
        <p className="max-w-3xl">
          <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-brass" aria-hidden />
          Huquqiy havolalar oʻquv maqsadida qisqartirilgan bayon boʻlib, rasmiy matn oʻrnini bosmaydi — amaldagi tahririni{' '}
          <a href="https://lex.uz" target="_blank" rel="noreferrer" className="text-slate-300 underline decoration-slate-600 underline-offset-2 hover:text-white">
            lex.uz
          </a>{' '}
          orqali tekshiring. Ssenariylar, personalar va qoʻmondonlik markazidagi statistika sintetik (namunaviy) maʼlumotlardir. Video va biometrik maʼlumotlar
          qurilmadan tashqariga yuborilmaydi; AI tahliliga faqat xiralashtirilgan kadrlar uzatiladi.
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-600">CALM ME AI · MVP · 2026</p>
      </div>
    </footer>
  );
}
