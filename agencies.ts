import type { AgencyId, Attire, Gender, PositionLevel, TraineeProfile, TraineeStatus, ProvocationType } from './types';

export interface AgencyInfo {
  id: AgencyId;
  label: string;
  short: string;
  org: string;
  emblem: string;
  emblemFallback: string;
  /** Xodim oʻzini tanishtirishda ishlatadigan lavozim nomi */
  position: string;
}

export const AGENCIES: AgencyInfo[] = [
  { id: 'bojxona', label: 'Bojxona inspektori', short: 'Bojxona', org: 'Bojxona qoʻmitasi', emblem: '/logos/bojxona.png', emblemFallback: 'BQ', position: 'bojxona inspektori' },
  { id: 'ypx', label: 'YPX inspektori', short: 'YPX', org: 'IIV · Yoʻl harakati xavfsizligi xizmati', emblem: '/logos/iiv.png', emblemFallback: 'YPX', position: 'yoʻl harakati xavfsizligi xizmati inspektori' },
  { id: 'ppx', label: 'Patrul-post xizmati (PPX)', short: 'PPX', org: 'IIV · Patrul-post xizmati', emblem: '/logos/iiv.png', emblemFallback: 'PPX', position: 'patrul-post xizmati inspektori' },
  { id: 'mg', label: 'Milliy gvardiya', short: 'MG', org: 'Oʻzbekiston Respublikasi Milliy gvardiyasi', emblem: '/logos/mg.png', emblemFallback: 'MG', position: 'Milliy gvardiya harbiy xizmatchisi' },
  { id: 'profilaktika', label: 'Profilaktika inspektori', short: 'Profilaktika', org: 'IIV · Huquqbuzarliklar profilaktikasi xizmati', emblem: '/logos/iiv.png', emblemFallback: 'HP', position: 'profilaktika inspektori' },
];

export const STATUS_OPTIONS: { id: TraineeStatus; label: string }[] = [
  { id: 'kursant', label: 'Kursant' },
  { id: 'tinglovchi', label: 'Tinglovchi' },
  { id: 'xodim', label: 'Amaldagi xodim' },
];

export const LEVEL_OPTIONS: { id: PositionLevel; label: string; hint: string }[] = [
  { id: 'quyi', label: 'Quyi', hint: 'serjant / inspektor' },
  { id: 'orta', label: 'Oʻrta', hint: 'post boshligʻi' },
  { id: 'yuqori', label: 'Yuqori', hint: 'rahbar' },
];

export const ATTIRE_OPTIONS: { id: Attire; label: string }[] = [
  { id: 'forma', label: 'Formada' },
  { id: 'fuqarolik', label: 'Fuqarolik kiyimida' },
];

export const GENDER_OPTIONS: { id: Gender; label: string }[] = [
  { id: 'erkak', label: 'Erkak' },
  { id: 'ayol', label: 'Ayol' },
];

export const PROVOCATION_LABELS: Record<ProvocationType, string> = {
  refusal: 'Qonuniy talabni rad etish',
  filming: 'Kamera orqali provokatsiya',
  connections: 'Tanish-bilish va pora bosimi',
  crowd: 'Olomonni jalb qilish',
  emotional: 'Hissiy bosim va ayblov',
  insult: 'Haqorat va jismoniy bosim',
};

export const DEFAULT_PROFILE: TraineeProfile = {
  agency: 'bojxona',
  status: 'kursant',
  level: 'quyi',
  attire: 'forma',
  gender: 'erkak',
  lang: 'uz-UZ',
};

export function getAgency(id: AgencyId): AgencyInfo {
  return AGENCIES.find((a) => a.id === id) ?? AGENCIES[0];
}

const RANKS: Record<'iio' | 'bojxona' | 'mg', Record<PositionLevel, string>> = {
  iio: { quyi: 'serjant', orta: 'kapitan', yuqori: 'podpolkovnik' },
  mg: { quyi: 'serjant', orta: 'kapitan', yuqori: 'podpolkovnik' },
  bojxona: { quyi: 'bojxona xizmati leytenanti', orta: 'bojxona xizmati kapitani', yuqori: 'bojxona xizmati podpolkovnigi' },
};

export function rankFor(profile: TraineeProfile) {
  const group = profile.agency === 'bojxona' ? 'bojxona' : profile.agency === 'mg' ? 'mg' : 'iio';
  if (profile.agency === 'profilaktika' && profile.level === 'quyi') return 'leytenant';
  return RANKS[group][profile.level];
}

export function surnameFor(profile: TraineeProfile) {
  return profile.gender === 'ayol' ? 'Karimova' : 'Karimov';
}

/** Namunaviy iboralardagi {lavozim}, {unvon}, {familiya} oʻrnini profilga moslab toʻldiradi */
export function fillTemplate(text: string, profile: TraineeProfile) {
  return text
    .replace(/\{lavozim\}/g, getAgency(profile.agency).position)
    .replace(/\{unvon\}/g, rankFor(profile))
    .replace(/\{familiya\}/g, surnameFor(profile));
}

export function profileSummary(p: TraineeProfile) {
  const status = STATUS_OPTIONS.find((s) => s.id === p.status)?.label ?? '';
  const level = LEVEL_OPTIONS.find((l) => l.id === p.level);
  const attire = ATTIRE_OPTIONS.find((a) => a.id === p.attire)?.label ?? '';
  const gender = GENDER_OPTIONS.find((g) => g.id === p.gender)?.label ?? '';
  return `${getAgency(p.agency).label} · ${status} · ${level?.label} (${level?.hint}) · ${attire} · ${gender}`;
}

/**
 * Maqomga qarab provokatsiya: AI Fuqaro xodimning tashqi koʻrinishi, maqomi va
 * jinsiga qarab qanday «zaif nuqta»ni sinashini belgilaydi.
 */
export function statusProvocation(p: TraineeProfile): { line: string; hint: string } | null {
  if (p.attire === 'fuqarolik')
    return {
      line: 'Formangiz ham yoʻq-ku! Qayerdan bilay, balki siz umuman xodim emasdirsiz? Avval kimligingizni isbotlang!',
      hint: 'Xodim fuqarolik kiyimida — fuqaro uning vakolatiga shubha qiladi; guvohnomani taklif qilish kutiladi.',
    };
  if (p.gender === 'ayol')
    return {
      line: 'Erkak xodim yoʻqmi bu yerda? Men siz bilan gaplashmayman, kattaroq odamni chaqiring!',
      hint: 'Fuqaro xodimning jinsiga qarab uning vakolatini kamsitmoqchi; xotirjam va qatʼiy pozitsiya kutiladi.',
    };
  if (p.status === 'kursant')
    return {
      line: 'Siz hali juda yosh ekansiz, kursantmisiz? Tajribaliroq odamni chaqiring, men siz bilan bahslashmayman!',
      hint: 'Fuqaro xodimning yoshi va tajribasini kamsitmoqda; oʻz vakolatini bosiq tasdiqlash kutiladi.',
    };
  if (p.level === 'yuqori')
    return {
      line: 'Siz rahbar ekansiz-ku, tartib-partibni qoʻying, oʻzingiz bir ogʻiz soʻz bilan hal qilib qoʻya qoling!',
      hint: 'Fuqaro rahbardan «istisno» kutmoqda; qonun hamma uchun bir xilligini tushuntirish kutiladi.',
    };
  if (p.level === 'orta')
    return {
      line: 'Post boshligʻi siz boʻlsangiz, avval xodimlaringizni tartibga chaqiring, keyin mendan talab qiling!',
      hint: 'Fuqaro javobgarlikni xodimlarga burmoqchi; mavzuni vaziyatga qaytarish kutiladi.',
    };
  return null;
}
