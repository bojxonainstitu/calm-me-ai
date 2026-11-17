import type { CitizenReply, SimulateRequest } from '../types';
import { clamp, emotionFor, hashString } from '../utils';
import { statusProvocation } from '../agencies';

/**
 * Demo AI Fuqaro — internet boʻlmasa ham ishlaydigan holat mashinasi.
 * Javob tanlovi: (1) kritik reaksiyalar, (2) maqomga qarab provokatsiya,
 * (3) agressiya darajasi va baholovchi hukmiga koʻra ssenariy hovuzi.
 */

const REACTIONS = {
  threat: [
    'Eshitdingizmi, odamlar? Tahdid qilyapti! Hammasi yozib olinyapti!',
    'Mana, oʻzingizni koʻrsatdingiz! Bu gaplaringiz uchun javob berasiz!',
    'Qoʻrqitmang meni! Men ham huquqlarimni bilaman!',
  ],
  insult: [
    'Nima dedingiz?! Meni haqorat qilishga haqqingiz yoʻq!',
    'Ana, ana! Xodim fuqaroni haqorat qilyapti — hamma guvoh!',
  ],
  sen: ['«Sen» demang menga! Men siz bilan tengqurmanmi?', 'Avval odobni oʻrganing, keyin menga «sen» deysiz!'],
  unlawful: [
    'Telefonimga tegmang! Qaysi qonunda tasvirga olish taqiqlangan, koʻrsating!',
    'Videoni oʻchirmayman! Bu mening huquqim!',
  ],
  corruption: [
    'Ana, endi tushunishdik... Hech kim bilmaydi, xotirjam boʻling.',
    'Mana, oʻzaro kelishdik-ku. Shunday qilib hamma rozi.',
  ],
};

/** Shu darajadan past agressiyada (kamida 3 javobdan soʻng) fuqaro hamkorlikka oʻtadi */
export const RESOLVE_THRESHOLD = 22;

function pick(pool: string[], used: Set<string>, seed: number, sequential = false) {
  const fresh = pool.filter((l) => !used.has(l));
  const list = fresh.length ? fresh : pool;
  return sequential ? list[0] : list[seed % list.length];
}

export function demoCitizenReply(req: SimulateRequest): CitizenReply {
  const { scenario, profile, history, aggression, evaluation, turnIndex } = req;
  const script = scenario.demoScript;
  const used = new Set(history.filter((h) => h.speaker === 'citizen').map((h) => h.text));
  const seed = hashString(`${scenario.id}:${turnIndex}:${Math.round(aggression)}`);
  const codes = new Set(evaluation.flags.map((f) => f.code));
  const a = clamp(aggression);

  const reply = (text: string, agg = a, tactic?: string): CitizenReply => ({
    text,
    aggression: Math.round(clamp(agg)),
    emotion: emotionFor(agg),
    tactic,
    source: 'demo',
  });

  if (codes.has('corruption')) return reply(pick(REACTIONS.corruption, used, seed), Math.min(a, 25), 'Korrupsiyaviy kelishuv');
  if (a >= 97) return reply(script.breakdown, 100, 'Nazoratdan chiqish');
  if (a <= RESOLVE_THRESHOLD && turnIndex >= 2) return reply(script.resolved, a, 'Hamkorlikka oʻtish');

  if (codes.has('insult')) return reply(pick(REACTIONS.insult, used, seed), a, 'Ommaviy ayblov');
  if (codes.has('threat')) return reply(pick(REACTIONS.threat, used, seed), a, 'Guvohlarni jalb qilish');
  if (codes.has('unlawful_demand')) return reply(pick(REACTIONS.unlawful, used, seed), a, 'Huquqiy qarshi hujum');
  if (codes.has('sen') && evaluation.verdict !== 'deescalate') return reply(pick(REACTIONS.sen, used, seed), a, 'Etiket xatosidan foydalanish');

  // Maqomga qarab provokatsiya: birinchi javobda (yoki ikkinchisida) xodimning «zaif nuqtasi» sinaladi
  const sp = statusProvocation(profile);
  const hookUsed = sp ? used.has(sp.line) : true;
  if (sp && !hookUsed && scenario.provocation !== 'emotional') {
    if ((turnIndex === 0 && evaluation.verdict !== 'deescalate') || (turnIndex === 1 && evaluation.verdict === 'neutral')) {
      return reply(sp.line, a, 'Maqomga qarab provokatsiya');
    }
  }

  let pool: string[];
  if (evaluation.verdict === 'escalate') pool = a < 30 ? script.neutral : script.escalate;
  else if (evaluation.verdict === 'deescalate') pool = a < 55 ? script.deescalate : script.neutral;
  else pool = a >= 70 ? script.escalate : a < 35 ? script.deescalate : script.neutral;

  const jitter = (seed % 5) - 2; // ±2 tabiiy tebranish
  // De-eskalatsiya hovuzi ketma-ket (hikoya rivoji), qolganlari aralash tanlanadi
  return reply(pick(pool, used, seed, pool === script.deescalate), a + jitter, scenario.tactics[seed % scenario.tactics.length]);
}
