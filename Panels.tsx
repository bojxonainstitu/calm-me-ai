'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenCheck, Check, ChevronDown, ExternalLink, GraduationCap, Lightbulb, MapPin, Target, UserRound, X } from 'lucide-react';
import type { Evaluation, Scenario } from '@/lib/types';
import { getLegalRefs, legalShort } from '@/lib/legal';
import { PROVOCATION_LABELS } from '@/lib/agencies';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ScenarioBrief({ scenario }: { scenario: Scenario }) {
  return (
    <div className="panel p-4">
      <span className="hud-label">Vaziyat brifingi</span>
      <p className="mt-2 flex items-start gap-1.5 text-[12px] text-slate-400">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        {scenario.location}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-200">{scenario.brief}</p>
      <div className="mt-3 rounded-lg bg-white/[0.03] p-3">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-200">
          <UserRound className="h-3.5 w-3.5 text-brass" aria-hidden /> {scenario.citizen.name}, {scenario.citizen.age} yosh
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
          {scenario.citizen.role}. {scenario.citizen.temperament}.
        </p>
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[12.5px] leading-relaxed text-slate-300">
        <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cobalt-400" aria-hidden />
        {scenario.objective}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="brass">{PROVOCATION_LABELS[scenario.provocation]}</Badge>
        {scenario.tactics.map((t) => (
          <Badge key={t} variant="outline" className="whitespace-normal">
            {t}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function LegalQuickRef({ ids, cited }: { ids: string[]; cited: Set<string> }) {
  const [open, setOpen] = useState<string | null>(null);
  const refs = getLegalRefs(ids);
  return (
    <div className="panel p-4">
      <span className="hud-label flex items-center gap-1.5">
        <BookOpenCheck className="h-3 w-3" aria-hidden /> Huquqiy asos (RAG)
      </span>
      <ul className="mt-2 divide-y divide-line">
        {refs.map((r) => {
          const isOpen = open === r.id;
          const used = cited.has(r.id);
          return (
            <li key={r.id} className="py-2">
              <button type="button" onClick={() => setOpen(isOpen ? null : r.id)} aria-expanded={isOpen} className="flex w-full items-start justify-between gap-2 text-left">
                <span>
                  <span className="font-mono text-[11.5px] text-amber-200">{legalShort(r)}</span>
                  {used && (
                    <span className="ml-2 inline-flex items-center gap-0.5 rounded bg-calm/15 px-1 font-mono text-[10px] text-emerald-200">
                      <Check className="h-2.5 w-2.5" aria-hidden /> qoʻllandi
                    </span>
                  )}
                  <span className="mt-0.5 block text-[12px] leading-snug text-slate-300">{r.title}</span>
                </span>
                <ChevronDown className={cn('mt-1 h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform', isOpen && 'rotate-180')} aria-hidden />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">{r.summary}</p>
                    <a href={r.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-blue-300 hover:text-blue-200">
                      lex.uz <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function UstozHint({ evaluation, onUseSuggestion }: { evaluation: Evaluation | null; onUseSuggestion: (s: string) => void }) {
  return (
    <div className="panel p-4">
      <span className="hud-label flex items-center gap-1.5">
        <GraduationCap className="h-3 w-3" aria-hidden /> AI Ustoz · tezkor maslahat
      </span>
      {!evaluation ? (
        <p className="mt-2 text-[12.5px] leading-relaxed text-slate-400">
          Birinchi javobingizdan soʻng Evaluator Agent uni uch mezon boʻyicha baholaydi va shu yerda maslahat beradi.
        </p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={evaluation.feedback} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-200">{evaluation.feedback}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {evaluation.flags.slice(0, 6).map((f) => (
                <span
                  key={f.code}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]',
                    f.kind === 'positive' ? 'border-calm/30 text-emerald-200' : f.critical ? 'border-critical/60 bg-critical/15 text-red-100' : 'border-critical/30 text-red-200',
                  )}
                >
                  {f.kind === 'positive' ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
                  {f.label}
                </span>
              ))}
            </div>
            {evaluation.suggestion && (
              <div className="mt-3 rounded-lg border border-brass/30 bg-brass/[0.07] p-3">
                <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-amber-200">
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden /> Tavsiya etilgan ibora
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-slate-200">{evaluation.suggestion}</p>
                <button type="button" onClick={() => onUseSuggestion(evaluation.suggestion!)} className="mt-2 text-[11.5px] font-medium text-amber-300 hover:text-amber-200">
                  Matn maydoniga qoʻyish →
                </button>
              </div>
            )}
            <p className="mt-2 font-mono text-[10px] text-slate-600">manba: {evaluation.source === 'rules' ? 'qoidaviy dvigatel' : evaluation.source === 'hybrid' ? 'LLM + qoidaviy himoya' : 'LLM'}</p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
