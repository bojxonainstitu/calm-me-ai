import { Hero } from '@/components/landing/Hero';
import { TrainingSetup } from '@/components/landing/TrainingSetup';
import { BrainCircuit, GraduationCap, MessageSquareWarning, Repeat } from 'lucide-react';

const STEPS = [
  { icon: MessageSquareWarning, title: 'Simulyatsiya', text: 'AI Fuqaro maqomingizga qarab provokatsiya qiladi: ovoz yoki matn orqali javob berasiz.' },
  { icon: BrainCircuit, title: 'Real vaqt bahosi', text: 'Evaluator Agent har bir iborani etiket, huquqiy asos va barqarorlik boʻyicha baholaydi.' },
  { icon: GraduationCap, title: 'AI Ustoz', text: 'Qaysi ibora eskalatsiya qilgani va qaysi moddaga tayanish kerakligi koʻrsatiladi.' },
  { icon: Repeat, title: 'Takroriy mashq', text: '75% dan past natija — 3 kundan soʻng murakkablashtirilgan variant avtomatik rejalashtiriladi.' },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="container" aria-label="Qanday ishlaydi">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="panel-inset relative p-4">
              <span className="absolute right-4 top-3 font-mono text-[11px] text-slate-600">0{i + 1}</span>
              <s.icon className="h-5 w-5 text-cobalt-400" aria-hidden />
              <h3 className="mt-3 text-[14px] font-semibold">{s.title}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <TrainingSetup />
    </>
  );
}
