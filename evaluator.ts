import type {
  CriteriaScores,
  EvalFlag,
  Evaluation,
  EvaluateRequest,
  Highlight,
  Scenario,
} from '../types';
import { clamp, normalizeUz } from '../utils';
import { fillTemplate } from '../agencies';
import { getLegalRef } from '../legal';

/**
 * Evaluator Agent (qoidalarga asoslangan qatlam).
 *
 * 1) Demo rejimda yagona baholovchi sifatida ishlaydi (internet shart emas).
 * 2) LLM rejimda «himoya qatlami» — korrupsiya, haqorat, tahdid kabi kritik
 *    belgilar hech qachon eʼtibordan chetda qolmasligini kafolatlaydi.
 *
 * Uch mezon: Rasmiy etiket · Huquqiy asos · Emotsional barqarorlik.
 */

type Crit = keyof CriteriaScores;

interface Rule {
  code: string;
  label: string;
  kind: 'positive' | 'negative';
  re: RegExp;
  w: Partial<Record<Crit, number>>;
  aggr: number;
  critical?: boolean;
}

// Unicode harf chegaralari (Safariʼda ham ishlashi uchun lookbehind ishlatilmaydi)
const B = "(?:^|[^\\p{L}\\p{N}'])";
const E = "(?=$|[^\\p{L}\\p{N}'])";
const words = (list: string[]) => new RegExp(`${B}(${list.join('|')})${E}`, 'u');
const stems = (list: string[]) => new RegExp(`${B}(${list.join('|')})`, 'u');

/** Xodimning OʻZ xizmat guvohnomasi (haydovchilik guvohnomasini soʻrash bilan adashtirmaslik uchun) */
const ID_RE = /((?:xizmat guvohnoma\p{L}*)|(?:guvohnomam\p{L}*)|(?:mana,? guvohnoma\p{L}*)|(?:guvohnoma\p{L}*\s+(?:ko'rsataman|ko'rsatdim|mana))|(?:jeton\p{L}*)|(?:удостоверени\p{L}*))/u;

const RULES: Rule[] = [
  // ─── Ijobiy belgilar ───────────────────────────────────────────
  {
    code: 'greet', label: 'Salomlashdi', kind: 'positive',
    re: words(['assalomu alaykum', 'assalom', 'salom', 'xayrli kun', 'xayrli tong', 'xayrli kech', 'здравствуйте', 'добрый день', 'добрый вечер']),
    w: { etiquette: 10 }, aggr: -3,
  },
  {
    code: 'id_offer', label: 'Xizmat guvohnomasini koʻrsatdi', kind: 'positive',
    re: ID_RE,
    w: { etiquette: 6, legal: 10 }, aggr: -5,
  },
  {
    code: 'polite', label: 'Xushmuomala soʻzlar', kind: 'positive',
    re: words(['iltimos', 'rahmat', 'marhamat', 'uzr', 'kechirasiz', 'пожалуйста', 'спасибо', 'извините']),
    w: { etiquette: 8 }, aggr: -3,
  },
  {
    code: 'empathy', label: 'Hamdardlik va faol tinglash', kind: 'positive',
    re: stems(['tushunaman', 'tushunyapman', 'tushunib turibman', 'xavotir', 'charchag', 'noqulay', 'haqlisiz', 'his qil', 'qiyin', 'bezovta', 'понимаю']),
    w: { stability: 12, etiquette: 5 }, aggr: -8,
  },
  {
    code: 'reason', label: 'Sababni tushuntirdi', kind: 'positive',
    re: words(['sababi', 'chunki', 'maqsadi', 'maqsadimiz', 'shuning uchun', 'tartib', "tartibga ko'ra", 'asosida', 'потому что', 'причина']),
    w: { legal: 8 }, aggr: -3,
  },
  {
    code: 'legal_cite', label: 'Huquqiy asosga tayandi', kind: 'positive',
    re: stems(['\\d{1,3}(?:\\s*-\\s*1|¹)?\\s*-?\\s*modda', 'modda', 'kodeks', 'qonun', 'mjtk', "ma'muriy javobgarlik", 'статья', 'статьи', 'кодекс', 'закон']),
    w: { legal: 18 }, aggr: -4,
  },
  {
    code: 'rights', label: 'Fuqaroning huquqlarini tushuntirdi', kind: 'positive',
    re: stems(['huquqingiz', 'huquqlaringiz', 'shikoyat qil', 'shikoyat ber', 'prokuratura', 'sudga', 'yuqori turuvchi', 'ishonch telefon', 'advokat', 'вправе', 'обжалова']),
    w: { legal: 12, etiquette: 4 }, aggr: -5,
  },
  {
    code: 'collab', label: 'Hamkorlik va tanlov taklif qildi', kind: 'positive',
    re: words(['keling', 'birgalikda', 'birga', 'yordam beraman', 'taklif qilaman', 'xohlasangiz', 'imkoniyat', 'tanlashingiz', 'давайте']),
    w: { stability: 8 }, aggr: -6,
  },
  {
    code: 'next_step', label: 'Aniq keyingi qadamni aytdi', kind: 'positive',
    re: words(['avval', "so'ng", 'keyin', 'bir necha daqiqa', 'besh daqiqa', 'daqiqa', 'daqiqada', 'qisqa vaqt']),
    w: { stability: 4 }, aggr: -2,
  },
  {
    code: 'refuse_bribe', label: 'Pora taklifini rad etdi', kind: 'positive',
    re: stems(["pulingizni olib qo'y", "pulni olib qo'y", 'pulingizni qaytar', 'pul olmayman', 'pul qabul qilmayman', 'pora', 'taklifingizni rad', 'взятк']),
    w: { legal: 20, stability: 8 }, aggr: 0,
  },
  {
    code: 'distance', label: 'Masofa va izolyatsiya taktikasi', kind: 'positive',
    re: stems(["bir qadam orqaga", 'masofa', 'chetga chiq', 'chetroqqa', 'alohida xona', 'alohida']),
    w: { stability: 6 }, aggr: -4,
  },
  {
    code: 'filming_ok', label: 'Tasvirga olish huquqini tan oldi', kind: 'positive',
    re: /((?:tasvirga|suratga|videoga|yozib) ol\p{L}*[^.!?]{0,30}(?:e'tirozim yo'q|qarshi emasman|huquqingiz bor|davom etavering|mumkin(?! emas)))/u,
    w: { legal: 10, stability: 8 }, aggr: -6,
  },

  // ─── Salbiy belgilar ───────────────────────────────────────────
  {
    code: 'sen', label: '«Sen» deb murojaat qildi', kind: 'negative',
    re: words(['sen', 'seni', 'senga', 'sening', 'sendan', 'senda', "o'zing", "o'zingni", "o'zingga", 'ты', 'тебя', 'тебе']),
    w: { etiquette: -22 }, aggr: 10,
  },
  {
    code: 'insult', label: 'Haqorat', kind: 'negative', critical: true,
    re: words(['ahmoq', 'axmoq', 'tentak', 'jinni', 'befahm', 'nodon', 'hayvon', 'itdek', "la'nati", 'xunasa', 'ablah', 'дурак', 'идиот', 'урод', 'тупой']),
    w: { etiquette: -30, stability: -30 }, aggr: 26,
  },
  {
    code: 'threat', label: 'Tahdid / vakolatdan tashqari bosim', kind: 'negative', critical: true,
    re: stems(['qamayman', 'qamatib', "qamab qo'y", 'turmaga', "yotqizib qo'y", "ko'rsatib qo'y", "ko'rasan", 'ishdan haydat', 'ezib tashla', 'urib', 'musodara qilaman', 'посажу', 'закрою', 'уничтожу']),
    w: { legal: -18, stability: -28 }, aggr: 22,
  },
  {
    code: 'unlawful_demand', label: 'Asossiz taqiq yoki telefonni olib qoʻyish talabi', kind: 'negative',
    re: /((?:telefon\p{L}*\s+(?:o'chir|ber|olib qo'yaman|olaman|tortib))|(?:video\p{L}*\s+o'chir)|(?:o'chirib tashla)|(?:(?:tasvirga|suratga|videoga) olish\p{L}*\s+(?:mumkin emas|taqiqlan))|снимать нельзя|выключи)/u,
    w: { legal: -22, stability: -6 }, aggr: 14,
  },
  {
    code: 'command_calm', label: '«Tinchlaning» buyrugʻi', kind: 'negative',
    re: words(['tinchlaning', 'tinchlan', 'asabiylashmang', 'baqirmang', 'успокойтесь', 'успокойся']),
    w: { stability: -8 }, aggr: 6,
  },
  {
    code: 'dismissive', label: 'Mensimaslik va qoʻpol buyruq', kind: 'negative',
    re: stems(['menga baribir', 'bilganingni qil', 'bilganingizni qiling', 'gapirma', "jim bo'l", "yo'qol", 'ket bu yerdan', 'chiq bu yerdan', 'заткнись', 'молчи']),
    w: { etiquette: -18, stability: -15 }, aggr: 15,
  },
  {
    code: 'corruption', label: 'Korrupsiyaviy kelishuvga moyillik', kind: 'negative', critical: true,
    re: stems(['kelishib olamiz', 'kelishamiz', 'kelishib olsak', 'choy puli', 'choy-poy', 'qancha berasiz', 'qancha bera olasiz', "ko'z yumaman", 'bir martaga mayli', 'pulni bering', 'договоримся', 'сколько дадите']),
    w: { legal: -100, stability: -20 }, aggr: -12,
  },
  {
    code: 'personal', label: 'Shaxsiy toʻqnashuvga kirdi', kind: 'negative',
    re: stems(["o'zingiz kimsiz", "kim bo'libsiz", 'bilasizmi men kim', 'men kimligimni', 'ha-ha', 'haha', 'хаха']),
    w: { stability: -12 }, aggr: 8,
  },
];

const IIO_AGENCIES = new Set(['ypx', 'ppx', 'profilaktika']);

export const FEEDBACK: Record<string, string> = {
  corruption:
    'KRITIK: kelishuvga moyillik — korrupsiyaviy huquqbuzarlik belgisi. Taklifni darhol rad eting va holat haqida belgilangan tartibda xabar bering (JK 210–211-moddalar).',
  insult:
    'Haqorat fuqaroni emas, sizni himoyasiz qoldiradi va videoda «dalil»ga aylanadi. Shaxsga emas, xatti-harakatga javob bering.',
  threat:
    'Tahdid vakolatdan tashqari bosim sifatida baholanadi. Oqibatni tahdid emas, qonuniy maʼlumot sifatida, xotirjam ohangda ayting.',
  unlawful_demand:
    'Tasvirga olishni taqiqlash yoki telefonni olib qoʻyish uchun qonuniy asos koʻrsatilmadi. Fuqaroning tasvirga olishiga toʻsqinlik qilmang — oʻz harakatlaringiz qonuniy boʻlsin.',
  dismissive: 'Mensimaslik ohangi qarshilikni kuchaytiradi. Buyruq oʻrniga aniq iltimos va sababni ayting.',
  sen: '«Sen» deb murojaat qilish rasmiy etiketga zid. Doimo «Siz» shaklidan foydalaning — bu vaziyatni sovitishning eng oddiy vositasi.',
  shout: 'Undov va baland ohang eskalatsiyani tezlashtiradi. Pastroq va sekinroq gapiring — fuqaro sizning tempingizga moslashadi.',
  loud: 'Mikrofon ovoz balandligining keskin oshganini qayd etdi. Nafasni rostlang, pastroq tembrda gapiring.',
  command_calm:
    '«Tinchlaning» kabi buyruqlar odatda aksincha taʼsir qiladi. Uning oʻrniga hissiyotni nomlang: «Sizni nima bezovta qilayotganini tushunmoqchiman».',
  personal: 'Shaxsiy bahsga kirmang: suhbatni vaziyatga va qonuniy talabga qaytaring.',
  no_intro: 'Birinchi murojaatda oʻzingizni tanishtiring: lavozim, unvon, familiya — ishonchning birinchi gʻishti shu.',
  no_id: 'Fuqaro guvohnomani talab qilmoqda — uni xotirjam koʻrsatish provokatsiyani darhol zaiflashtiradi.',
  bribe_unaddressed: 'Pora taklifiga darhol va aniq munosabat bildiring: rad eting va oqibatini tushuntiring.',
  curt: 'Javob juda quruq. Qisqa sabab va keyingi qadamni qoʻshing.',
  monologue: 'Nutq juda uzun. Keskin vaziyatda 2–3 qisqa gap samaraliroq.',
};

const NEG_PRIORITY = ['corruption', 'insult', 'threat', 'unlawful_demand', 'dismissive', 'sen', 'loud', 'shout', 'personal', 'command_calm', 'no_intro', 'no_id', 'bribe_unaddressed', 'monologue', 'curt'];

function countWords(s: string) {
  return s.split(/\s+/).filter(Boolean).length;
}

function findCited(text: string, scenario: Scenario) {
  const cited = new Set<string>();
  const tokens = new Set<string>();
  const re = /(\d{1,3})\s*(?:(-\s*1|¹))?\s*-?\s*(?:modda|статья|статьи)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    tokens.add(m[2] ? `${m[1]}-1` : m[1]);
  }
  // «статья 194» shakli
  const re2 = /(?:статья|статьи|modda)\s*(\d{1,3})/gu;
  while ((m = re2.exec(text)) !== null) tokens.add(m[1]);

  for (const id of scenario.legalRefIds) {
    if (id === 'korr-419' && /korrupsiya/u.test(text)) cited.add(id);
    if (id === 'pq10-kodeks' && /kasbiy madaniyat/u.test(text)) cited.add(id);
  }
  if (tokens.size === 0) return Array.from(cited);
  for (const id of scenario.legalRefIds) {
    const ref = getLegalRef(id);
    if (ref && ref.match.some((m) => tokens.has(m.replace('¹', '-1')))) cited.add(id);
  }
  return Array.from(cited);
}

export function evaluateUtterance(req: EvaluateRequest, previousOfficerTexts: string[] = []): Evaluation {
  const { scenario, profile, utterance, turnIndex, micPeak, aggression } = req;
  const raw = utterance.trim();
  const text = normalizeUz(raw);
  const prev = previousOfficerTexts.map(normalizeUz).join(' \n ');

  const flags: EvalFlag[] = [];
  const highlights: Highlight[] = [];
  const scores: CriteriaScores = { etiquette: 55, legal: 45, stability: 66 };
  let aggr = 0;
  const hit = new Set<string>();

  const apply = (code: string, label: string, kind: 'positive' | 'negative', w: Partial<Record<Crit, number>>, a: number, critical?: boolean, match?: string) => {
    if (hit.has(code)) return;
    hit.add(code);
    flags.push({ kind, code, label, critical });
    (Object.keys(w) as Crit[]).forEach((k) => (scores[k] += w[k] ?? 0));
    aggr += a;
    if (match) {
      const trimmed = match.trim();
      if (trimmed.length > 1) highlights.push({ text: trimmed, kind });
    }
  };

  for (const r of RULES) {
    const m = text.match(r.re);
    if (!m) continue;
    if (r.code === 'filming_ok' && hit.has('unlawful_demand')) continue;
    apply(r.code, r.label, r.kind, r.w, r.aggr, r.critical, m[1] ?? m[0]);
  }
  // unlawful_demand filming_okʼdan keyin aniqlansa, filming_okʼni bekor qilamiz
  if (hit.has('unlawful_demand') && hit.has('filming_ok')) {
    const idx = flags.findIndex((f) => f.code === 'filming_ok');
    if (idx >= 0) {
      flags.splice(idx, 1);
      scores.legal -= 10;
      scores.stability -= 8;
      aggr += 6;
    }
  }

  // «Siz» shakli: olmosh yoki egalik/buyruq qoʻshimchalari
  const sizRe = words(['siz', 'sizni', 'sizga', 'sizning', 'sizdan', 'sizlar', 'sizlarga', 'sizlarni', 'вы', 'вас', 'вам']);
  const sizSuffix = /(\p{L}{2,}(?:ingiz|ngiz)(?:ni|ga|ning|dan)?)(?=$|[^\p{L}'])/u;
  const sizM = text.match(sizRe) ?? text.match(sizSuffix);
  if (sizM && !hit.has('sen')) apply('formal_siz', '«Siz» shaklida murojaat', 'positive', { etiquette: 10 }, -2, false, sizM[1]);

  // Oʻzini tanishtirish: «men» + lavozim/unvon
  const selfRe = words(['men', 'mening', 'ismim', 'familiyam', 'я']);
  const roleRe = stems(['inspektor', 'serjant', 'leytenant', 'kapitan', 'mayor', 'podpolkovnik', 'polkovnik', 'xizmatchi', 'xodim', "boshlig'i", 'kursant', 'инспектор', 'сержант', 'лейтенант', 'капитан', 'майор']);
  const roleM = text.match(roleRe);
  if (roleM && selfRe.test(text)) apply('intro', 'Oʻzini tanishtirdi', 'positive', { etiquette: 20, legal: 6, stability: 2 }, -6, false, roleM[1]);

  // Ovoz/ohang
  const exclam = (raw.match(/!/g) ?? []).length;
  const capsWords = (raw.match(/\b[A-ZА-ЯЁ]{3,}\b/g) ?? []).length;
  if (exclam >= 2 || capsWords >= 2) apply('shout', 'Baland ohang (undov / katta harflar)', 'negative', { stability: -12 }, 8);
  if (typeof micPeak === 'number' && micPeak > 0.32) apply('loud', 'Ovoz balandligi keskin oshdi (mikrofon)', 'negative', { stability: -10 }, 6);

  const wc = countWords(text);
  if (wc <= 3 && !hit.has('polite') && !hit.has('greet')) apply('curt', 'Juda qisqa, quruq javob', 'negative', { etiquette: -6 }, 2);
  if (wc > 75) apply('monologue', 'Juda uzun nutq', 'negative', { stability: -4 }, 1);

  // Vaziyatga xos kutilmalar
  const needsIntroLaw = IIO_AGENCIES.has(profile.agency) || profile.agency === 'mg';
  if (turnIndex === 0 && !hit.has('intro')) {
    apply('no_intro', needsIntroLaw ? 'Oʻzini tanishtirmadi (qonun talabi)' : 'Oʻzini tanishtirmadi', 'negative', { etiquette: -10, legal: needsIntroLaw ? -6 : 0 }, 3);
  }
  if (scenario.provocation === 'filming' && turnIndex >= 1 && !hit.has('id_offer') && !ID_RE.test(prev)) {
    apply('no_id', 'Guvohnoma hali koʻrsatilmadi', 'negative', { legal: -10 }, 5);
  }
  if (scenario.provocation === 'connections' && turnIndex <= 1 && !hit.has('refuse_bribe') && !hit.has('corruption') && !/pora|pul(ingiz|ni) (olib qo'y|qaytar)|pul olmayman/u.test(prev)) {
    apply('bribe_unaddressed', 'Pora taklifiga munosabat bildirilmadi', 'negative', { legal: -8 }, 2);
  }

  // Ballarni hisoblash
  const corruption = hit.has('corruption');
  if (corruption && hit.has('distance')) {
    // Pora kontekstida «chetga chiqish» — de-eskalatsiya emas, yashirin kelishuvga tayyorgarlik
    const i = flags.findIndex((f) => f.code === 'distance');
    if (i >= 0) flags.splice(i, 1);
    scores.stability -= 6;
    for (let k = highlights.length - 1; k >= 0; k--) if (highlights[k].kind === 'positive' && /chet|masofa|alohida/i.test(highlights[k].text)) highlights[k] = { ...highlights[k], kind: 'negative' };
  }
  scores.etiquette = Math.round(clamp(scores.etiquette, 3, 100));
  scores.stability = Math.round(clamp(scores.stability, 3, 100));
  scores.legal = corruption ? 0 : Math.round(clamp(scores.legal, 3, 100));

  const anyMarker = flags.length > 0;
  if (!anyMarker) aggr += 3; // hech qanday belgi yoʻq — fuqaro oʻjarligicha qoladi
  if (aggr < 0) aggr *= 0.78; // ishonch sekin tiklanadi, tez buziladi
  const quality = 0.4 * scores.stability + 0.35 * scores.etiquette + 0.25 * scores.legal;
  aggr += (55 - quality) * 0.15;

  const d = scenario.difficulty;
  if (aggr > 0) aggr *= 1 + 0.15 * (d - 1);
  else aggr *= 1 - 0.12 * (d - 1);
  if (aggression > 80 && aggr < 0) aggr *= 0.8;
  if (aggr < 0) aggr = Math.min(0, aggr + d); // fuqaroning oʻjarligi (qiyinlik darajasiga koʻra)
  const aggressionDelta = Math.round(clamp(aggr, -28, 32));

  const verdict: Evaluation['verdict'] = corruption
    ? 'escalate'
    : aggressionDelta <= -4
      ? 'deescalate'
      : aggressionDelta >= 4
        ? 'escalate'
        : 'neutral';

  // Fikr-mulohaza
  const negatives = flags.filter((f) => f.kind === 'negative');
  const positives = flags.filter((f) => f.kind === 'positive');
  let feedback: string;
  const topNeg = NEG_PRIORITY.find((c) => negatives.some((f) => f.code === c));
  if (topNeg) {
    feedback = FEEDBACK[topNeg] ?? negatives[0].label;
    if (topNeg === 'no_intro' && needsIntroLaw) {
      feedback += IIO_AGENCIES.has(profile.agency)
        ? ' («Ichki ishlar organlari toʻgʻrisida»gi Qonun, 8-modda)'
        : ' (Milliy gvardiya toʻgʻrisidagi Qonun, 6-modda)';
    }
  } else {
    const good = positives.slice(0, 3).map((f) => f.label.toLowerCase()).join(', ');
    let tip = 'shu ohang va tempni saqlang.';
    if (!hit.has('legal_cite')) tip = 'qonuniy asosni (hujjat va moddani) aniq ayting.';
    else if (!hit.has('empathy')) tip = 'fuqaroning hissiyotini nomlang — bu qarshilikni tezroq pasaytiradi.';
    else if (!hit.has('collab')) tip = 'tanlov yoki hamkorlik taklif qiling: «Xohlasangiz, ...».';
    feedback = good ? `Yaxshi: ${good}. Keyingi qadam: ${tip}` : `Neytral javob. Keyingi qadam: ${tip}`;
  }

  const goodLine = scenario.sampleOfficerLines.find((l) => l.quality === 'good');
  const suggestion = (negatives.length > 0 || verdict !== 'deescalate') && goodLine ? fillTemplate(goodLine.text, profile) : undefined;

  const citedRefIds = findCited(text, scenario);
  const legalRefIds = scenario.legalRefIds.filter((id) => !citedRefIds.includes(id)).slice(0, 2);
  if (corruption) {
    for (const id of ['jk-210', 'korr-419']) if (!legalRefIds.includes(id)) legalRefIds.unshift(id);
  }

  const overall = Math.round(0.35 * scores.stability + 0.35 * scores.etiquette + 0.3 * scores.legal);

  return {
    scores,
    overall,
    aggressionDelta,
    verdict,
    flags,
    highlights: dedupeHighlights(highlights, raw),
    feedback,
    suggestion,
    citedRefIds,
    legalRefIds: legalRefIds.slice(0, 3),
    source: 'rules',
  };
}

/** Normallashtirilgan matndan topilgan iboralarni asl matndagi koʻrinishiga qaytaradi */
function dedupeHighlights(list: Highlight[], raw: string): Highlight[] {
  const out: Highlight[] = [];
  const seen = new Set<string>();
  const rawNorm = normalizeUz(raw);
  for (const h of list) {
    const idx = rawNorm.indexOf(normalizeUz(h.text));
    if (idx < 0) continue;
    let end = idx + h.text.length;
    while (end < raw.length && /[\p{L}'ʻʼ‘’-]/u.test(raw[end])) end++;
    const original = raw.slice(idx, end);
    const key = original.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text: original, kind: h.kind });
  }
  return out;
}

export interface LLMEvaluation {
  etiquette?: number;
  legal?: number;
  stability?: number;
  aggressionDelta?: number;
  flags?: { kind?: string; code?: string; label?: string }[];
  highlights?: { text?: string; kind?: string }[];
  feedback?: string;
  suggestion?: string;
  legalRefIds?: string[];
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

/** LLM bahosini qoidaviy baho bilan birlashtiradi (gibrid baholovchi). */
export function mergeEvaluations(rules: Evaluation, llm: LLMEvaluation, utterance: string, scenario: Scenario): Evaluation {
  const blend = (r: number, l: number | null) => (l === null ? r : Math.round(clamp(0.65 * l + 0.35 * r, 0, 100)));
  const corruption = rules.flags.some((f) => f.code === 'corruption');
  const scores: CriteriaScores = {
    etiquette: blend(rules.scores.etiquette, num(llm.etiquette)),
    legal: corruption ? 0 : blend(rules.scores.legal, num(llm.legal)),
    stability: blend(rules.scores.stability, num(llm.stability)),
  };

  const flags: EvalFlag[] = [...rules.flags];
  for (const f of llm.flags ?? []) {
    if (!f?.code || !f.label) continue;
    if (flags.some((x) => x.code === f.code)) continue;
    flags.push({ kind: f.kind === 'positive' ? 'positive' : 'negative', code: String(f.code).slice(0, 40), label: String(f.label).slice(0, 120) });
  }

  const lower = utterance.toLowerCase();
  const highlights: Highlight[] = [...rules.highlights];
  for (const h of llm.highlights ?? []) {
    if (!h?.text) continue;
    const t = String(h.text);
    const idx = lower.indexOf(t.toLowerCase());
    if (idx < 0 || highlights.some((x) => x.text.toLowerCase() === t.toLowerCase())) continue;
    highlights.push({ text: utterance.slice(idx, idx + t.length), kind: h.kind === 'positive' ? 'positive' : 'negative' });
  }

  const llmDelta = num(llm.aggressionDelta);
  let aggressionDelta = llmDelta === null ? rules.aggressionDelta : Math.round(clamp(0.6 * llmDelta + 0.4 * rules.aggressionDelta, -28, 32));
  const hasCriticalEscalation = rules.flags.some((f) => f.code === 'insult' || f.code === 'threat');
  if (hasCriticalEscalation) aggressionDelta = Math.max(aggressionDelta, rules.aggressionDelta);
  if (corruption) aggressionDelta = rules.aggressionDelta;

  const verdict: Evaluation['verdict'] = corruption ? 'escalate' : aggressionDelta <= -4 ? 'deescalate' : aggressionDelta >= 4 ? 'escalate' : 'neutral';
  const criticalFirst = rules.flags.some((f) => f.critical);
  const llmRefs = (llm.legalRefIds ?? []).filter((id) => scenario.legalRefIds.includes(id) || id === 'jk-210' || id === 'korr-419');

  return {
    scores,
    overall: Math.round(0.35 * scores.stability + 0.35 * scores.etiquette + 0.3 * scores.legal),
    aggressionDelta,
    verdict,
    flags,
    highlights,
    feedback: criticalFirst || !llm.feedback ? rules.feedback : String(llm.feedback).slice(0, 400),
    suggestion: llm.suggestion ? String(llm.suggestion).slice(0, 600) : rules.suggestion,
    citedRefIds: rules.citedRefIds,
    legalRefIds: llmRefs.length ? llmRefs.slice(0, 3) : rules.legalRefIds,
    source: 'hybrid',
  };
}

/** Poise Index (Vazminlik indeksi) — eksponensial silliqlangan koʻrsatkich */
export function nextPoise(prev: number, ev: Evaluation, micPeak?: number) {
  const target = 0.5 * ev.scores.stability + 0.25 * ev.scores.etiquette + 0.25 * ev.scores.legal;
  let p = 0.6 * prev + 0.4 * target;
  if (typeof micPeak === 'number' && micPeak > 0.32) p -= 4;
  if (ev.flags.some((f) => f.critical)) p -= 6;
  return Math.round(clamp(p));
}
