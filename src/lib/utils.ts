import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const round = (v: number, d = 0) => {
  const m = Math.pow(10, d);
  return Math.round(v * m) / m;
};

export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

/** Oʻzbekcha matnni solishtirish uchun normallashtirish: kichik harf, tutuq/oʻ-gʻ belgilarini birxillashtirish. */
export function normalizeUz(s: string) {
  return s
    .toLowerCase()
    .replace(/[ʻʼ‘’`´']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Agressiya rang shkalasi: Xotirjam (zumrad) → Tarang (amber) → Kritik (qizil)
const STOPS: [number, [number, number, number]][] = [
  [0, [16, 185, 129]],
  [50, [245, 158, 11]],
  [100, [239, 68, 68]],
];

export function aggressionRgb(a: number): [number, number, number] {
  const v = clamp(a);
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [p0, c0] = STOPS[i];
    const [p1, c1] = STOPS[i + 1];
    if (v <= p1) {
      const t = (v - p0) / (p1 - p0);
      return [lerp(c0[0], c1[0], t), lerp(c0[1], c1[1], t), lerp(c0[2], c1[2], t)].map(Math.round) as [
        number,
        number,
        number,
      ];
    }
  }
  return STOPS[STOPS.length - 1][1];
}

export function aggressionColor(a: number) {
  const [r, g, b] = aggressionRgb(a);
  return `rgb(${r}, ${g}, ${b})`;
}

export type AggressionTone = 'calm' | 'tense' | 'critical';

export function aggressionState(a: number): { label: string; tone: AggressionTone } {
  if (a < 34) return { label: 'Xotirjam', tone: 'calm' };
  if (a < 67) return { label: 'Tarang', tone: 'tense' };
  return { label: 'Kritik', tone: 'critical' };
}

export function emotionFor(a: number) {
  if (a < 20) return 'Xotirjam';
  if (a < 40) return 'Ehtiyotkor';
  if (a < 60) return 'Norozi';
  if (a < 80) return 'Asabiy';
  return 'Gʻazablangan';
}

const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

export function formatDateUz(ts: number | Date, withTime = false) {
  const d = typeof ts === 'number' ? new Date(ts) : ts;
  const base = `${d.getDate()}-${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
  if (!withTime) return base;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${base}, ${hh}:${mm}`;
}

export function formatClock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function formatTimestamp(sec: number) {
  const s = Math.max(0, Math.round(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function daysFromNow(ts: number) {
  return Math.ceil((ts - Date.now()) / 86_400_000);
}

/** Deterministik psevdo-tasodifiy son (demo maʼlumotlar uchun) */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function hashString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export async function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, timeoutMs = 9000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}
