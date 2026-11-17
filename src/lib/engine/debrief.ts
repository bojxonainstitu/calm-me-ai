import type { ScheduleEntry, SessionRecord, Turn, HistoryItem, TraineeProfile } from '../types';
import { clamp, uid } from '../utils';
import { BASE_FOR_PROVOCATION, getScenario, harderId } from '../scenarios';
import { PROVOCATION_LABELS } from '../agencies';
import { FEEDBACK, evaluateUtterance, nextPoise } from './evaluator';
import { demoCitizenReply } from './citizen';

export interface Competencies {
  stability: number;
  legal: number;
  etiquette: number;
  speedSec: number;
  speedScore: number;
  overall: number;
  officerTurns: number;
  deescalations: number;
  escalations: number;
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function officerTurns(s: SessionRecord) {
  return s.turns.filter((t) => t.speaker === 'officer' && t.evaluation);
}

export function computeCompetencies(s: SessionRecord): Competencies {
  const ts = officerTurns(s);
  const stability = Math.round(avg(ts.map((t) => t.evaluation!.scores.stability)));
  const legalRaw = avg(ts.map((t) => t.evaluation!.scores.legal));
  const corruption = ts.some((t) => t.evaluation!.flags.some((f) => f.code === 'corruption'));
  const legal = Math.round(corruption ? Math.min(legalRaw, 20) : legalRaw);
  const etiquette = Math.round(avg(ts.map((t) => t.evaluation!.scores.etiquette)));
  const times = ts.map((t) => t.responseTimeSec ?? 0).filter((x) => x > 0);
  const speedSec = Math.round(avg(times) * 10) / 10 || 0;
  // 4 s va undan tez — 100%; har qoʻshimcha soniya −6%
  const speedScore = Math.round(clamp(100 - Math.max(0, speedSec - 4) * 6, 20, 100));
  let overall = 0.3 * stability + 0.3 * legal + 0.25 * etiquette + 0.15 * speedScore;
  if (s.outcome === 'resolved') overall += 5;
  if (s.outcome === 'failed') overall -= 10;
  return {
    stability,
    legal,
    etiquette,
    speedSec,
    speedScore,
    overall: Math.round(clamp(overall)),
    officerTurns: ts.length,
    deescalations: ts.filter((t) => t.evaluation!.verdict === 'deescalate').length,
    escalations: ts.filter((t) => t.evaluation!.verdict === 'escalate').length,
  };
}

export function radarData(c: Competencies) {
  return [
    { axis: 'Emotsional barqarorlik', value: c.stability, target: 75, raw: `${c.stability}%` },
    { axis: 'Huquqiy savodxonlik', value: c.legal, target: 75, raw: `${c.legal}%` },
    { axis: 'Nutq madaniyati', value: c.etiquette, target: 75, raw: `${c.etiquette}%` },
    { axis: 'Qaror tezligi', value: c.speedScore, target: 75, raw: `${c.speedSec.toFixed(1)} s` },
  ];
}

/**
 * Takroriy oʻrganish (spaced repetition): 75% dan past natija — 3 kundan soʻng
 * murakkablashtirilgan variant; 75–89% — 7 kundan soʻng takror; 90%+ — 14 kun.
 */
export function updateSchedule(existing: ScheduleEntry[], s: SessionRecord, c: Competencies): ScheduleEntry[] {
  const day = 86_400_000;
  const baseId = s.scenarioId.startsWith('vid-')
    ? BASE_FOR_PROVOCATION[s.provocation]
    : s.scenarioId.replace(/--hard$/, '');
  let entry: ScheduleEntry;
  const label = PROVOCATION_LABELS[s.provocation].toLowerCase();
  if (c.overall < 75) {
    entry = {
      id: uid('rep'),
      provocation: s.provocation,
      baseScenarioId: baseId,
      scenarioId: harderId(baseId),
      dueAt: s.endedAt + 3 * day,
      score: c.overall,
      reason: `«${label}» turi boʻyicha natija ${c.overall}% (75% dan past) — murakkablashtirilgan variant`,
      createdAt: Date.now(),
    };
  } else {
    const days = c.overall >= 90 ? 14 : 7;
    entry = {
      id: uid('rep'),
      provocation: s.provocation,
      baseScenarioId: baseId,
      scenarioId: baseId,
      dueAt: s.endedAt + days * day,
      score: c.overall,
      reason: `«${label}» turi boʻyicha natija ${c.overall}% — koʻnikmani mustahkamlash uchun ${days} kundan soʻng takror`,
      createdAt: Date.now(),
    };
  }
  return [...existing.filter((e) => e.provocation !== s.provocation), entry].sort((a, b) => a.dueAt - b.dueAt);
}

export interface UstozSummary {
  headline: string;
  tone: 'calm' | 'tense' | 'critical';
  paragraphs: string[];
  strengths: string[];
  growth: { label: string; tip: string }[];
  bestTurnId?: string;
  worstTurnId?: string;
}

export function ustozSummary(s: SessionRecord, c: Competencies): UstozSummary {
  const ts = officerTurns(s);
  const corruption = ts.some((t) => t.evaluation!.flags.some((f) => f.code === 'corruption'));
  let headline = 'Mashgʻulot yakunlandi';
  let tone: UstozSummary['tone'] = 'tense';
  if (corruption) {
    headline = 'Mashgʻulot toʻxtatildi: korrupsiya xavfi aniqlandi';
    tone = 'critical';
  } else if (s.outcome === 'resolved') {
    headline = 'Vaziyat muvaffaqiyatli de-eskalatsiya qilindi';
    tone = 'calm';
  } else if (s.outcome === 'failed') {
    headline = 'Vaziyat nazoratdan chiqdi';
    tone = 'critical';
  }

  const crit = [
    { k: 'emotsional barqarorlik', v: c.stability },
    { k: 'huquqiy savodxonlik', v: c.legal },
    { k: 'nutq madaniyati', v: c.etiquette },
  ].sort((a, b) => b.v - a.v);

  const paragraphs = [
    `Fuqaroning agressiya darajasi ${s.initialAggression} dan ${s.finalAggression} ga ${s.finalAggression <= s.initialAggression ? 'tushdi' : 'koʻtarildi'}. ${c.officerTurns} ta javobingizdan ${c.deescalations} tasi vaziyatni yumshatdi, ${c.escalations} tasi esa keskinlashtirdi.`,
    `Eng kuchli tomoningiz — ${crit[0].k} (${crit[0].v}%). Eng koʻp eʼtibor talab qiladigan mezon — ${crit[2].k} (${crit[2].v}%). Oʻrtacha javob vaqti ${c.speedSec.toFixed(1)} soniya.`,
  ];
  if (corruption) {
    paragraphs.push('Kelishuvga moyillik bildirilgan har qanday ibora real xizmatda jinoiy javobgarlikka olib kelishi mumkin. Pora taklifini darhol, qatʼiy va guvohlar oldida rad eting hamda holatni belgilangan tartibda xabar qiling.');
  }

  const posCount = new Map<string, number>();
  const negCount = new Map<string, { label: string; n: number }>();
  for (const t of ts) {
    for (const f of t.evaluation!.flags) {
      if (f.kind === 'positive') posCount.set(f.label, (posCount.get(f.label) ?? 0) + 1);
      else negCount.set(f.code, { label: f.label, n: (negCount.get(f.code)?.n ?? 0) + 1 });
    }
  }
  const strengths = Array.from(posCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([l]) => l);
  const growth = Array.from(negCount.entries())
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 4)
    .map(([code, v]) => ({ label: v.label, tip: FEEDBACK[code] ?? 'Ushbu holatni keyingi mashgʻulotda alohida mashq qiling.' }));

  let best: Turn | undefined;
  let worst: Turn | undefined;
  for (const t of ts) {
    const d = t.evaluation!.aggressionDelta;
    if (!best || d < best.evaluation!.aggressionDelta) best = t;
    if (!worst || d > worst.evaluation!.aggressionDelta) worst = t;
  }
  return {
    headline,
    tone,
    paragraphs,
    strengths,
    growth,
    bestTurnId: best && best.evaluation!.aggressionDelta < 0 ? best.id : undefined,
    worstTurnId: worst && worst.evaluation!.aggressionDelta > 0 ? worst.id : undefined,
  };
}

/** Sahna namoyishi uchun namunaviy sessiya — qoidaviy dvigatel orqali real vaqtda hisoblanadi. */
export function buildSampleSession(): SessionRecord {
  const scenario = getScenario('bloger-guvohnoma')!;
  const profile: TraineeProfile = { agency: 'ppx', status: 'kursant', level: 'quyi', attire: 'forma', gender: 'erkak', lang: 'uz-UZ' };
  const lines: { text: string; rt: number; mic?: number }[] = [
    { text: 'Nima kerak sizga? Telefoningni olib qoʻy, bu yerda suratga olish mumkin emas!', rt: 2.4, mic: 0.41 },
    { text: 'Kechirasiz, keskin gapirib yubordim. Men patrul-post xizmati inspektori, serjant Karimovman. Mana xizmat guvohnomam, marhamat.', rt: 6.8 },
    { text: 'Tasvirga olishingizga eʼtirozim yoʻq. «Ichki ishlar organlari toʻgʻrisida»gi Qonunning 8-moddasiga koʻra murojaat sababini tushuntiraman: bu fuqarolar bilan profilaktik suhbat.', rt: 5.1 },
    { text: 'Savolingiz boʻlsa, marhamat. Harakatlarimdan norozi boʻlsangiz, yuqori turuvchi organga shikoyat qilish huquqingiz bor. Keling, suhbatni xotirjam davom ettiramiz.', rt: 4.2 },
  ];
  const startedAt = Date.now() - 6 * 60_000;
  let t = 1500;
  let aggression = scenario.initialAggression;
  let poise = 70;
  const turns: Turn[] = [{ id: uid('t'), speaker: 'citizen', text: scenario.openingLine, t: 0, aggressionAfter: aggression, emotion: 'Asabiy' }];
  const history: HistoryItem[] = [{ speaker: 'citizen', text: scenario.openingLine }];
  const prevOfficer: string[] = [];
  lines.forEach((l, i) => {
    t += l.rt * 1000;
    const evaluation = evaluateUtterance({ scenario, profile, utterance: l.text, history, aggression, turnIndex: i, micPeak: l.mic }, prevOfficer);
    aggression = clamp(aggression + evaluation.aggressionDelta);
    poise = nextPoise(poise, evaluation, l.mic);
    turns.push({ id: uid('t'), speaker: 'officer', text: l.text, t, responseTimeSec: l.rt, micPeak: l.mic, evaluation, aggressionAfter: aggression });
    history.push({ speaker: 'officer', text: l.text });
    prevOfficer.push(l.text);
    const reply = demoCitizenReply({ scenario, profile, history, aggression, evaluation, turnIndex: i });
    aggression = reply.aggression;
    t += 3200;
    turns.push({ id: uid('t'), speaker: 'citizen', text: reply.text, t, aggressionAfter: aggression, emotion: reply.emotion });
    history.push({ speaker: 'citizen', text: reply.text });
  });
  return {
    id: 'sample-session',
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    provocation: scenario.provocation,
    difficulty: scenario.difficulty,
    profile,
    startedAt,
    endedAt: startedAt + t + 2000,
    turns,
    outcome: aggression <= 25 ? 'resolved' : 'ended',
    initialAggression: scenario.initialAggression,
    finalAggression: aggression,
    poiseIndex: poise,
    mode: 'demo',
    isSample: true,
  };
}
