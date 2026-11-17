import type { LegalRef } from './types';

/**
 * Huquqiy bilimlar bazasi (RAG manbasi).
 *
 * Har bir yozuvdagi modda raqami va nomi 2026-yil noyabr holatida lex.uz va rasmiy
 * axborot manbalari bilan solishtirilgan. `summary` — oʻquv maqsadidagi qisqacha bayon,
 * rasmiy matn oʻrnini bosmaydi. `confidence: 'review'` belgisi qoʻyilgan yozuvlarni
 * instruktor amaldagi tahrir bilan qayta tasdiqlashi tavsiya etiladi.
 */
export const LEGAL_REFS: LegalRef[] = [
  {
    id: 'iio-8',
    act: '«Ichki ishlar organlari toʻgʻrisida»gi Qonun (OʻRQ-407, 16.09.2016)',
    article: '8-modda',
    title: 'Fuqarolarning huquqlari, erkinliklari va qonuniy manfaatlariga rioya etish hamda ularni hurmat qilish prinsipi',
    summary:
      'Xodim fuqaroga murojaat qilganda oʻz lavozimi, unvoni, familiyasi, ismi va otasining ismini aytishi, murojaat sababini tushuntirishi, fuqaroning talabiga koʻra xizmat guvohnomasini koʻrsatishi shart. Inson qadr-qimmatini kamsituvchi muomala taqiqlanadi.',
    url: 'https://lex.uz/docs/-3027843',
    confidence: 'verified',
    match: ['8'],
  },
  {
    id: 'iio-10',
    act: '«Ichki ishlar organlari toʻgʻrisida»gi Qonun (OʻRQ-407, 16.09.2016)',
    article: '10-modda',
    title: 'Ichki ishlar organi xodimi qonuniy talablari bajarilishining majburiyligi',
    summary:
      'Xodimning qonuniy talablari barcha davlat organlari, tashkilotlar, mansabdor shaxslar va fuqarolar uchun majburiy. Talab ustidan shikoyat qilinishi uning bajarilishini toʻxtatib turmaydi.',
    url: 'https://lex.uz/docs/-3027843',
    confidence: 'verified',
    match: ['10'],
  },
  {
    id: 'pq10-kodeks',
    act: 'Ichki ishlar organlari xodimlarining kasbiy madaniyat va xizmat intizomi kodeksi (PQ-10, 20.01.2023, 1-ilova)',
    article: '5, 7, 8-bandlar',
    title: 'Fuqarolar bilan muomala madaniyati',
    summary:
      'Xodim fuqarolar bilan muloqotda xushmuomala, kamtar va bosiq boʻlishi, sabr-toqat va hurmat koʻrsatishi lozim; qoʻpollik, kamsitish va asossiz ruhiy yoki jismoniy bosim oʻtkazish taqiqlanadi.',
    url: 'https://lex.uz/acts/-6364837',
    confidence: 'verified',
    match: [],
  },
  {
    id: 'mjtk-194',
    act: 'Maʼmuriy javobgarlik toʻgʻrisidagi kodeks (MJtK)',
    article: '194-modda',
    title: 'Ichki ishlar organlari xodimining qonuniy talablarini bajarmaslik',
    summary:
      'Huquqbuzarlikni toʻxtatish, hujjatlarni tekshirish uchun taqdim etish, ichki ishlar organiga borish kabi qonuniy talablarni bajarmaslik maʼmuriy javobgarlikka sabab boʻladi (2025-yilda jazo choralari kuchaytirilgan).',
    url: 'https://lex.uz/acts/-97664',
    confidence: 'verified',
    match: ['194'],
  },
  {
    id: 'mjtk-194-1',
    act: 'Maʼmuriy javobgarlik toʻgʻrisidagi kodeks (MJtK)',
    article: '194¹-modda',
    title: 'Milliy gvardiya harbiy xizmatchisining (xodimining) qonuniy talablarini bajarmaslik',
    summary:
      'Milliy gvardiya harbiy xizmatchisining qonuniy talablarini bajarmaslik maʼmuriy javobgarlikka sabab boʻladi; jazo choralari 194-modda bilan bir xil darajada kuchaytirilgan.',
    url: 'https://lex.uz/acts/-97664',
    confidence: 'verified',
    match: ['194-1', '194¹', '1941'],
  },
  {
    id: 'mjtk-183',
    act: 'Maʼmuriy javobgarlik toʻgʻrisidagi kodeks (MJtK)',
    article: '183-modda',
    title: 'Mayda bezorilik',
    summary:
      'Jamoat joylarida soʻkinish, fuqarolarga haqoratomuz shilqimlik qilish va jamoat tartibi hamda osoyishtaligini buzuvchi shunga oʻxshash harakatlar. Faqat tegishli belgilar mavjud boʻlganda qoʻllanadi.',
    url: 'https://lex.uz/acts/-97664',
    confidence: 'verified',
    match: ['183'],
  },
  {
    id: 'mjtk-185-1',
    act: 'Maʼmuriy javobgarlik toʻgʻrisidagi kodeks (MJtK)',
    article: '185¹-modda',
    title: 'Pirotexnika buyumlarining qonunga xilof muomalasi',
    summary: 'Pirotexnika buyumlarini qonunga xilof ravishda olib yurish, saqlash yoki ishlatish uchun maʼmuriy javobgarlik.',
    url: 'https://lex.uz/acts/-97664',
    confidence: 'verified',
    match: ['185-1', '185¹', '1851'],
  },
  {
    id: 'mjtk-41',
    act: 'Maʼmuriy javobgarlik toʻgʻrisidagi kodeks (MJtK)',
    article: '41-modda',
    title: 'Haqorat qilish',
    summary: 'Shaxsning shaʼni va qadr-qimmatini qasddan kamsitish. Xodimni ham, fuqaroni ham himoya qiladi.',
    url: 'https://lex.uz/acts/-97664',
    confidence: 'verified',
    match: ['41'],
  },
  {
    id: 'mg-6',
    act: '«Oʻzbekiston Respublikasi Milliy gvardiyasi toʻgʻrisida»gi Qonun (yangi tahrir)',
    article: '6-modda',
    title: 'Fuqarolarning huquqlari, erkinliklari va qonuniy manfaatlariga rioya qilish hamda ularni hurmat qilish prinsipi',
    summary:
      'Harbiy xizmatchi (xodim) fuqaroga murojaat qilganda oʻzini tanishtirishi, shuningdek fuqaroning huquq va majburiyatlarini tushuntirishi lozim.',
    url: 'https://lex.uz/acts/-5128310',
    confidence: 'review',
    match: ['6'],
  },
  {
    id: 'bk-21',
    act: 'Bojxona kodeksi (OʻRQ-400, 20.01.2016)',
    article: '21-modda',
    title: 'Bojxona nazorati va bojxona rasmiylashtiruvi',
    summary:
      'Bojxona chegarasidan olib oʻtilayotgan tovarlar va transport vositalari bojxona nazoratidan oʻtkaziladi. Bojxona organlari mansabdor shaxslari qonunda nazarda tutilmagan taqiq va cheklovlarni belgilashga haqli emas.',
    url: 'https://lex.uz/acts/-2876354',
    confidence: 'verified',
    match: ['21'],
  },
  {
    id: 'bk-4',
    act: 'Bojxona kodeksi (OʻRQ-400, 20.01.2016)',
    article: '4-modda',
    title: 'Tashqi iqtisodiy faoliyat ishtirokchisi huquqlarining ustuvorligi',
    summary: 'Bojxona qonunchiligidagi barcha bartaraf etib boʻlmaydigan ziddiyat va noaniqliklar ishtirokchi foydasiga talqin qilinadi.',
    url: 'https://lex.uz/acts/-2876354',
    confidence: 'verified',
    match: ['4'],
  },
  {
    id: 'dbx-24',
    act: '«Davlat bojxona xizmati toʻgʻrisida»gi Qonun (yangi tahrir, OʻRQ-502, 18.10.2018)',
    article: '24-modda',
    title: 'Bojxona organlari xodimlarini huquqiy himoya qilish kafolatlari',
    summary:
      'Mansabdor shaxsning oʻz vakolati doirasidagi qonuniy talablari barcha jismoniy va yuridik shaxslar uchun majburiy; xodimning qonuniy faoliyatiga aralashish taqiqlanadi. Xodimning qarori va harakati ustidan yuqori turuvchi organga, prokuraturaga yoki sudga shikoyat qilinishi mumkin.',
    url: 'https://lex.uz/acts/4000638',
    confidence: 'verified',
    match: ['24'],
  },
  {
    id: 'dbx-14',
    act: '«Davlat bojxona xizmati toʻgʻrisida»gi Qonun (yangi tahrir, OʻRQ-502, 18.10.2018)',
    article: '14-modda',
    title: 'Bojxona organlari xodimlari',
    summary: 'Bojxona organi xodimiga xizmat guvohnomasi va shaxsiy raqamli jeton beriladi.',
    url: 'https://lex.uz/acts/4000638',
    confidence: 'verified',
    match: ['14'],
  },
  {
    id: 'dbx-8',
    act: '«Davlat bojxona xizmati toʻgʻrisida»gi Qonun (yangi tahrir, OʻRQ-502, 18.10.2018)',
    article: '8-modda',
    title: 'Bojxona organlarining majburiyatlari',
    summary:
      'Bojxona organlari, jumladan, tovarlarni olib oʻtish va chegarani kesib oʻtishda shaxslarni ularning huquq va majburiyatlari toʻgʻrisida xabardor qilishi shart.',
    url: 'https://lex.uz/acts/4000638',
    confidence: 'verified',
    match: ['8'],
  },
  {
    id: 'yoriqnoma-3154',
    act: 'Tovarlarni bojxona koʻzdan kechiruvi va bojxona koʻrigidan oʻtkazishda bojxona tartib-taomillarini amalga oshirish toʻgʻrisidagi yoʻriqnoma (AV, 3154-son, 19.04.2019)',
    article: 'Yoʻriqnoma',
    title: 'Bojxona koʻzdan kechiruvi va bojxona koʻrigi tartibi',
    summary:
      'Koʻzdan kechiruv va koʻrikni oʻtkazish, namuna olish va natijalarni rasmiylashtirish tartibini belgilaydi. Amaldagi tahririni lex.uz dan tekshiring.',
    url: 'https://lex.uz/docs/-4294054',
    confidence: 'review',
    match: ['3154'],
  },
  {
    id: 'jk-211',
    act: 'Jinoyat kodeksi',
    article: '211-modda',
    title: 'Pora berish',
    summary:
      'Mansabdor shaxsga uning xizmat mavqeidan foydalanib muayyan harakatni bajarishi yoki bajarmasligi evaziga moddiy qimmatlik berish jinoiy javobgarlikka sabab boʻladi.',
    url: 'https://lex.uz/acts/-111453',
    confidence: 'verified',
    match: ['211'],
  },
  {
    id: 'jk-210',
    act: 'Jinoyat kodeksi',
    article: '210-modda',
    title: 'Pora olish',
    summary:
      'Mansabdor shaxsning pora beruvchi manfaatini koʻzlab harakat qilishi yoki qilmasligi evaziga moddiy qimmatlik olishi — ogʻir jinoyat; xodim uchun eng yuqori xavfli toʻqnashuv nuqtasi.',
    url: 'https://lex.uz/acts/-111453',
    confidence: 'verified',
    match: ['210'],
  },
  {
    id: 'korr-419',
    act: '«Korrupsiyaga qarshi kurashish toʻgʻrisida»gi Qonun (OʻRQ-419, 03.01.2017)',
    article: '4-modda',
    title: 'Korrupsiyaga qarshi kurashishning asosiy prinsiplari',
    summary:
      'Qonuniylik, fuqarolar huquqlarining ustuvorligi, ochiqlik va shaffoflik, javobgarlikning muqarrarligi. Manfaatlar toʻqnashuvi va korrupsiyaga undash holatlari belgilangan tartibda xabar qilinadi.',
    url: 'https://lex.uz/docs/-3088008',
    confidence: 'verified',
    match: [],
  },
];

const BY_ID = new Map(LEGAL_REFS.map((r) => [r.id, r]));

export function getLegalRef(id: string): LegalRef | undefined {
  return BY_ID.get(id);
}

export function getLegalRefs(ids: string[]): LegalRef[] {
  return ids.map((id) => BY_ID.get(id)).filter((r): r is LegalRef => Boolean(r));
}

export function legalShort(ref: LegalRef) {
  const actShort = ref.act
    .replace(/\s*\(.*\)$/, '')
    .replace('Maʼmuriy javobgarlik toʻgʻrisidagi kodeks', 'MJtK')
    .replace('Jinoyat kodeksi', 'JK');
  return `${actShort}, ${ref.article}`;
}

/** Legal ID-lardan LLM uchun qisqa kontekst bloki */
export function legalContext(ids: string[]) {
  return getLegalRefs(ids)
    .map((r) => `- [${r.id}] ${r.act}, ${r.article} «${r.title}»: ${r.summary}`)
    .join('\n');
}
