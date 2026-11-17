import type { AgencyId, ProvocationType, Scenario, VideoAnalysis, VideoToSimResponse, CitizenPersona } from '../types';
import { BASE_FOR_PROVOCATION, getScenario } from '../scenarios';
import { clamp, hashString, normalizeUz, seeded, uid } from '../utils';
import { LEGAL_REFS } from '../legal';

export interface SampleClip {
  id: string;
  title: string;
  source: string;
  scene: 'road' | 'street' | 'border';
  durationSec: number;
  agencies: AgencyId[];
  provocation: ProvocationType;
  faces: number;
  plates: number;
  triggerSec: number;
  triggerDescription: string;
  tactic: string;
  quote: string;
  summary: string;
  openingLine: string;
  citizen: Partial<CitizenPersona>;
}

/** Namunaviy kliplar — sintetik tavsiflar (real shaxslar va voqealar emas). */
export const SAMPLE_CLIPS: SampleClip[] = [
  {
    id: 'sample-ypx-bodycam',
    title: 'YPX postida «tanish» orqali bosim',
    source: 'Bodikamera · namunaviy',
    scene: 'road',
    durationSec: 48,
    agencies: ['ypx'],
    provocation: 'connections',
    faces: 2,
    plates: 1,
    triggerSec: 21,
    triggerDescription: 'Haydovchi xodimning familiyasini yozib olib, «ertaga ishda boʻlmaysiz» deb tahdid qildi — shu nuqtadan ohang keskinlashdi.',
    tactic: 'Karyera tahdidi + tanish-bilishchilik',
    quote: '«Ismingizni yozib oldim, ertaga koʻrishamiz»',
    summary: 'Tezlikni oshirgan haydovchi toʻxtatilgan; hujjat soʻralganda yuqori lavozimdagi tanishini tilga olib, bosim oʻtkazgan.',
    openingLine: 'Ismingizni yozib oldim. Bilasizmi, men kim bilan ishlayman? Bayonnomani yozsangiz, ertaga oʻzingiz pushaymon boʻlasiz.',
    citizen: { name: 'Shuhrat aka', age: 47, role: 'Xususiy firma rahbari' },
  },
  {
    id: 'sample-social-bloger',
    title: '«Xodim telefonni urib tushirdi» — ijtimoiy tarmoq klipi',
    source: 'Ijtimoiy tarmoq · namunaviy',
    scene: 'street',
    durationSec: 63,
    agencies: ['ppx', 'profilaktika', 'mg'],
    provocation: 'filming',
    faces: 3,
    plates: 0,
    triggerSec: 34,
    triggerDescription: 'Bloger telefonni xodimning yuziga 20 sm gacha yaqinlashtirdi; xodim kamerani qoʻli bilan itarib yubordi — klip shu lahzadan «viral» boʻldi.',
    tactic: 'Shaxsiy hududni buzish orqali reaksiya qoʻzgʻatish',
    quote: '«Qoʻl tekkizdi! Hammangiz koʻrdingiz!»',
    summary: 'Jonli efir olib borayotgan bloger xodimdan guvohnoma talab qilgan va ketma-ket ayblovchi savollar bergan.',
    openingLine: 'Doʻstlar, efirdamiz! Mana, kamerani yaqinroq olib kelaman — xodim, nega yuzingizni yashiryapsiz? Guvohnomangiz qani?',
    citizen: { name: 'Otabek', age: 25, role: 'Bloger, jonli efir muallifi' },
  },
  {
    id: 'sample-border-queue',
    title: 'Chegara postida navbatdagi janjal',
    source: 'Kuzatuv kamerasi · namunaviy',
    scene: 'border',
    durationSec: 75,
    agencies: ['bojxona'],
    provocation: 'refusal',
    faces: 6,
    plates: 2,
    triggerSec: 42,
    triggerDescription: 'Yoʻlovchi navbatdagilarga murojaat qilib, xodimni ommaviy ravishda «poraxoʻr» deb atadi — olomon unga qoʻshila boshladi.',
    tactic: 'Olomonni jalb qilish va ommaviy tuhmat',
    quote: '«Odamlar, bular faqat pul kutib turibdi!»',
    summary: 'Yuk koʻzdan kechiruvidan bosh tortgan yoʻlovchi navbatdagilarni oʻz tomoniga ogʻdirishga uringan.',
    openingLine: 'Odamlar, eshityapsizlarmi? Ular faqat sumka ochtirib, pul kutib turishibdi! Men ochmayman!',
    citizen: { name: 'Nodir', age: 39, role: 'Yoʻlovchi, kichik savdo bilan shugʻullanadi' },
  },
];

export function makeTimeline(durationSec: number, triggerSec: number) {
  const n = 28;
  const rnd = seeded(Math.round(durationSec * 1000 + triggerSec));
  return Array.from({ length: n }, (_, i) => {
    const t = (durationSec * i) / (n - 1);
    const before = t < triggerSec;
    const ramp = before ? 25 + (t / Math.max(1, triggerSec)) * 30 : 70 + Math.min(25, (t - triggerSec) * 2.2);
    return { t: Math.round(t * 10) / 10, level: Math.round(clamp(ramp + (rnd() - 0.5) * 10)) };
  });
}

const KEYWORDS: Record<ProvocationType, string[]> = {
  filming: ['bloger', 'telefon', 'kamera', 'efir', 'suratga', 'tasvir', 'video', 'snim', 'блогер', 'камер'],
  connections: ['tanish', 'pora', 'pul', 'boshliq', 'choy', "qo'ng'iroq", 'falonchi', 'взятк', 'знаком'],
  crowd: ['olomon', 'bozor', 'odamlar', "to'da", "yig'il", 'navbat', 'толп'],
  emotional: ["yig'la", 'kamsit', 'aeroport', 'shifokor', 'ona', 'bola', 'плач'],
  insult: ['haqorat', "so'k", 'muxlis', 'stadion', 'mast', 'urish', 'itar', 'оскорб'],
  refusal: ['rad', 'bosh tort', 'sumka', 'yuk', 'ochmay', 'tekshiruv', 'chegara', 'bojxona', 'отказ'],
};

export function detectProvocation(text: string): ProvocationType {
  const t = normalizeUz(text || '');
  let best: ProvocationType = 'refusal';
  let bestScore = 0;
  (Object.keys(KEYWORDS) as ProvocationType[]).forEach((k) => {
    const score = KEYWORDS[k].reduce((acc, kw) => acc + (t.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      best = k;
      bestScore = score;
    }
  });
  return best;
}

interface ScenarioOverrides {
  title?: string;
  brief?: string;
  objective?: string;
  openingLine?: string;
  tactics?: string[];
  citizen?: Partial<CitizenPersona>;
  agencies?: AgencyId[];
  legalRefIds?: string[];
  initialAggression?: number;
}

const VALID_AGENCIES: AgencyId[] = ['bojxona', 'ypx', 'ppx', 'mg', 'profilaktika'];
const VALID_REF_IDS = new Set(LEGAL_REFS.map((r) => r.id));

export function buildScenarioFromAnalysis(a: VideoAnalysis, o: ScenarioOverrides = {}): Scenario {
  const base = getScenario(BASE_FOR_PROVOCATION[a.provocation]) ?? getScenario('chegara-yuk')!;
  const agencies = (o.agencies ?? []).filter((x) => VALID_AGENCIES.includes(x));
  const refs = (o.legalRefIds ?? []).filter((id) => VALID_REF_IDS.has(id));
  return {
    ...base,
    id: uid('vid'),
    source: 'video',
    title: o.title?.trim() || `Videodan: ${a.title}`,
    shortTitle: a.tactic.length > 42 ? `${a.tactic.slice(0, 40)}…` : a.tactic,
    agencies: agencies.length ? agencies : base.agencies,
    brief: o.brief?.trim() || `${a.summary} Eskalatsiya nuqtasi (${Math.round(a.triggerTimestampSec)}-soniya): ${a.triggerDescription}`,
    objective: o.objective?.trim() || base.objective,
    openingLine: o.openingLine?.trim() || base.openingLine,
    tactics: o.tactics?.length ? o.tactics.slice(0, 4) : [a.tactic, ...base.tactics.slice(0, 2)],
    citizen: { ...base.citizen, ...Object.fromEntries(Object.entries(o.citizen ?? {}).filter(([, v]) => v !== undefined && v !== '')) } as CitizenPersona,
    legalRefIds: refs.length ? refs : base.legalRefIds,
    initialAggression: Math.round(clamp(o.initialAggression ?? base.initialAggression + 6, 30, 85)),
    videoTrigger: { timestampSec: a.triggerTimestampSec, description: a.triggerDescription },
  };
}

export function analysisFromSample(id: string): VideoToSimResponse | null {
  const c = SAMPLE_CLIPS.find((x) => x.id === id);
  if (!c) return null;
  const analysis: VideoAnalysis = {
    title: c.title,
    summary: c.summary,
    durationSec: c.durationSec,
    triggerTimestampSec: c.triggerSec,
    triggerDescription: c.triggerDescription,
    tactic: c.tactic,
    quote: c.quote,
    provocation: c.provocation,
    facesBlurred: c.faces,
    platesBlurred: c.plates,
    privacyMethod: 'synthetic',
    timeline: makeTimeline(c.durationSec, c.triggerSec),
  };
  const scenario = buildScenarioFromAnalysis(analysis, {
    title: `Videodan: ${c.title}`,
    openingLine: c.openingLine,
    citizen: c.citizen,
    agencies: c.agencies,
    tactics: [c.tactic],
  });
  return { analysis, scenario, source: 'demo' };
}

export function heuristicAnalysis(input: {
  note?: string;
  durationSec?: number;
  fileName?: string;
  facesBlurred?: number;
  platesBlurred?: number;
  privacyMethod?: VideoAnalysis['privacyMethod'];
}): VideoToSimResponse {
  const duration = Math.max(5, Math.round(input.durationSec || 45));
  const provocation = detectProvocation(`${input.note ?? ''} ${input.fileName ?? ''}`);
  const base = getScenario(BASE_FOR_PROVOCATION[provocation])!;
  const rnd = seeded(hashString(`${input.fileName}:${duration}`));
  const trigger = Math.round(duration * (0.45 + rnd() * 0.2));
  const analysis: VideoAnalysis = {
    title: input.note?.trim() ? input.note.trim().slice(0, 70) : base.shortTitle,
    summary: `Yuklangan video (${duration} s) instruktor izohi va kalit belgilar asosida tahlil qilindi. Aniqlangan provokatsiya turi asosida «${base.shortTitle}» shabloni moslashtirildi.`,
    durationSec: duration,
    triggerTimestampSec: trigger,
    triggerDescription: `Taxminiy eskalatsiya nuqtasi: ovoz balandligi va harakat faolligi keskin oshgan lahza (${trigger}-soniya). AI kalitlari ulanganda kadrlar boʻyicha aniq tahlil qilinadi.`,
    tactic: base.tactics[0],
    provocation,
    facesBlurred: input.facesBlurred ?? 0,
    platesBlurred: input.platesBlurred ?? 0,
    privacyMethod: input.privacyMethod ?? 'heuristic',
    timeline: makeTimeline(duration, trigger),
  };
  return { analysis, scenario: buildScenarioFromAnalysis(analysis), source: 'demo' };
}
