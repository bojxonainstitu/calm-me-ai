import type { AgencyId, ProvocationType } from './types';

/**
 * Qoʻmondonlik markazi uchun SINTETIK (namunaviy) maʼlumotlar.
 * Real statistika emas — interfeys va tahlil imkoniyatlarini namoyish qilish uchun.
 */

export interface RegionStat {
  id: string;
  name: string;
  short: string;
  lat: number;
  lon: number;
  incidents: number;
  readiness: number;
  trained: number;
  topProvocation: ProvocationType;
}

export const REGIONS: RegionStat[] = [
  { id: 'qq', name: 'Qoraqalpogʻiston Respublikasi', short: 'QQR', lat: 42.9, lon: 59.0, incidents: 21, readiness: 68, trained: 142, topProvocation: 'refusal' },
  { id: 'xo', name: 'Xorazm viloyati', short: 'XOR', lat: 41.55, lon: 60.63, incidents: 17, readiness: 72, trained: 118, topProvocation: 'refusal' },
  { id: 'na', name: 'Navoiy viloyati', short: 'NAV', lat: 40.1, lon: 65.38, incidents: 12, readiness: 79, trained: 96, topProvocation: 'connections' },
  { id: 'bu', name: 'Buxoro viloyati', short: 'BUX', lat: 39.77, lon: 64.42, incidents: 19, readiness: 74, trained: 131, topProvocation: 'emotional' },
  { id: 'sa', name: 'Samarqand viloyati', short: 'SAM', lat: 39.65, lon: 66.96, incidents: 34, readiness: 70, trained: 214, topProvocation: 'filming' },
  { id: 'qa', name: 'Qashqadaryo viloyati', short: 'QSH', lat: 38.86, lon: 65.79, incidents: 22, readiness: 66, trained: 157, topProvocation: 'connections' },
  { id: 'su', name: 'Surxondaryo viloyati', short: 'SUR', lat: 37.22, lon: 67.28, incidents: 25, readiness: 64, trained: 139, topProvocation: 'refusal' },
  { id: 'ji', name: 'Jizzax viloyati', short: 'JIZ', lat: 40.12, lon: 67.84, incidents: 15, readiness: 73, trained: 102, topProvocation: 'crowd' },
  { id: 'si', name: 'Sirdaryo viloyati', short: 'SIR', lat: 40.49, lon: 68.78, incidents: 14, readiness: 76, trained: 88, topProvocation: 'connections' },
  { id: 'tv', name: 'Toshkent viloyati', short: 'TOV', lat: 41.0, lon: 70.1, incidents: 31, readiness: 71, trained: 236, topProvocation: 'refusal' },
  { id: 'ts', name: 'Toshkent shahri', short: 'TSH', lat: 41.31, lon: 69.28, incidents: 46, readiness: 77, trained: 412, topProvocation: 'filming' },
  { id: 'nm', name: 'Namangan viloyati', short: 'NAM', lat: 41.0, lon: 71.67, incidents: 27, readiness: 69, trained: 174, topProvocation: 'crowd' },
  { id: 'an', name: 'Andijon viloyati', short: 'AND', lat: 40.78, lon: 72.34, incidents: 33, readiness: 67, trained: 188, topProvocation: 'crowd' },
  { id: 'fa', name: 'Fargʻona viloyati', short: 'FAR', lat: 40.39, lon: 71.78, incidents: 38, readiness: 65, trained: 203, topProvocation: 'filming' },
];

export const PROVOCATION_TRENDS: { type: ProvocationType; share: number; change: number }[] = [
  { type: 'filming', share: 31, change: 6 },
  { type: 'refusal', share: 22, change: -2 },
  { type: 'connections', share: 17, change: 1 },
  { type: 'crowd', share: 13, change: 2 },
  { type: 'emotional', share: 10, change: -1 },
  { type: 'insult', share: 7, change: 0 },
];

export const AGENCY_READINESS: { agency: AgencyId; readiness: number }[] = [
  { agency: 'bojxona', readiness: 78 },
  { agency: 'mg', readiness: 74 },
  { agency: 'ppx', readiness: 71 },
  { agency: 'profilaktika', readiness: 69 },
  { agency: 'ypx', readiness: 66 },
];

export const POISE_WEEKLY = [61, 63, 62, 66, 68, 67, 71, 73].map((v, i) => ({ week: `${i + 1}-hafta`, value: v }));

export const COHORTS = [
  { name: '1-kurs · 1-vzvod', sessions: 184, score: 64, readiness: 52, weakest: 'Huquqiy asos' },
  { name: '1-kurs · 2-vzvod', sessions: 171, score: 68, readiness: 58, weakest: 'Huquqiy asos' },
  { name: '2-kurs · 1-vzvod', sessions: 203, score: 73, readiness: 66, weakest: 'Emotsional barqarorlik' },
  { name: '3-kurs · 1-vzvod', sessions: 226, score: 79, readiness: 74, weakest: 'Rasmiy etiket' },
  { name: '4-kurs · 2-vzvod', sessions: 198, score: 82, readiness: 81, weakest: 'Qaror tezligi' },
  { name: 'Malaka oshirish · amaldagi xodimlar', sessions: 302, score: 76, readiness: 70, weakest: 'Emotsional barqarorlik' },
];

/** Validatsiyadan oʻtgan bir rangli (amber) ketma-ket shkala: kam → koʻp (qorongʻi fonda yorqinroq = koʻproq) */
export const HEAT_RAMP = ['#92400E', '#B45309', '#D97706', '#F59E0B', '#FBBF24'];

export function heatColor(t: number) {
  const i = Math.min(HEAT_RAMP.length - 1, Math.max(0, Math.floor(t * HEAT_RAMP.length)));
  return HEAT_RAMP[i];
}
