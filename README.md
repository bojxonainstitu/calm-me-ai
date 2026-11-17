# CALM ME AI — Taktik De-eskalatsiya Simulyatori

Bojxona, YPX, PPX, Milliy gvardiya va profilaktika inspektorlari uchun AI asosidagi
de-eskalatsiya, taktik muloqot va psixologik barqarorlik trenajyori.

> **Shior:** Provokatsiyaga emas — qonunga tayaning.

---

## 0. Eng tez yoʻl — oflayn versiya (oʻrnatish va admin paroli shart emas)

`standalone/dist/CALM-ME-AI.html` — **bitta fayl**. Uni istalgan papkaga (masalan, Ish stoli)
nusxalang va ikki marta bosing: Microsoft Edge yoki Google Chrome’da ochiladi.

* Node.js, npm, internet va administrator huquqi **kerak emas**.
* Barcha 5 sahifa ishlaydi: landing, 3D simulyatsiya arenasi, Video → Ssenariy, AI Ustoz, Qoʻmondonlik markazi.
* AI dvigateli — loyihadagi oʻsha qoidaviy Evaluator Agent va Demo AI Fuqaro (bir xil kod).
* Natijalar brauzer xotirasida (`localStorage`) saqlanadi.
* Ovozli kiritish (nutqni tanish) uchun Edge/Chrome va internet kerak; matn rejimi va
  «Demo iboralar» toʻliq oflayn.
* Idora gerblarini koʻrsatish uchun fayl yoniga `logos/bojxona.png`, `logos/iiv.png`, `logos/mg.png` qoʻying.

Oflayn faylni qayta yigʻish (ixtiyoriy): `npm i -D esbuild && node standalone/build.mjs`.

## 0a. Onlayn versiya (Claude artefakti)

`online/` — Claude platformasida ishlaydigan toʻliq imkoniyatli versiya: AI Fuqaro va Evaluator Agent Claude orqali (pul toʻlanadigan API kaliti shart emas), ovozli diktovka, fuqaro ovozi (TTS), natijalar bulutda saqlanadi, Qoʻmondonlik markazi barcha foydalanuvchilarning agregat statistikasini jonli koʻrsatadi, video kadrlari AI tomonidan tahlil qilinadi, matndan ssenariy konstruktori, AI Ustoz chuqur tahlili va savol-javob, hisobotni HTML/CSV koʻrinishida yuklab olish.

```bash
node online/build.mjs      # → online/dist/index.html
```

Onlayn sahifada kamera ishlamaydi (platforma cheklovi) — tana tili tahlili oflayn versiyada qoladi. AI yoki baza mavjud boʻlmasa, sahifa avtomatik ravishda lokal qoidaviy dvigatel va brauzer xotirasiga oʻtadi.

## 1. Toʻliq Next.js versiyasi

Talablar: **Node.js 18.17+** (tavsiya: 20 LTS), npm.

```bash
npm install
cp .env.example .env.local     # ixtiyoriy: OpenAI yoki Gemini kaliti
npm run dev                    # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

> `npm install` va birinchi `build` uchun internet kerak (paketlar va Google Fonts shriftlari
> yuklanadi). Shundan soʻng sahnada ilova Demo rejimda tarmoqsiz ishlaydi.

Kalitlarsiz ham ilova **toʻliq ishlaydi** (Demo rejim): qoidalarga asoslangan baholovchi va
oldindan yozilgan oʻzbekcha AI Fuqaro javoblari brauzerning oʻzida bajariladi.

| Buyruq | Vazifa |
|---|---|
| `npm run dev` | ishlab chiqish serveri |
| `npm run build` | production build (lint/tip ogohlantirishlari build’ni toʻxtatmaydi) |
| `STRICT_BUILD=1 npm run build` | qatʼiy build: lint + TypeScript xatolari build’ni toʻxtatadi |
| `npm run typecheck` | toʻliq TypeScript tekshiruvi |
| `npm run lint` | ESLint |

## 2. Muhit oʻzgaruvchilari (`.env.local`)

| Oʻzgaruvchi | Standart | Izoh |
|---|---|---|
| `AI_PROVIDER` | `auto` | `auto` / `openai` / `gemini` |
| `OPENAI_API_KEY` | — | OpenAI kaliti |
| `OPENAI_MODEL` | `gpt-4.1-mini` | JSON rejimi va rasm kirishini qoʻllaydigan istalgan model |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Azure / proksi uchun |
| `GEMINI_API_KEY` | — | Google Gemini kaliti |
| `GEMINI_MODEL` | `gemini-2.5-flash` | |
| `AI_TIMEOUT_MS` | `8000` | shu vaqtdan soʻng avtomatik Demo dvigatelga oʻtiladi |
| `DEMO_MODE` | `off` | `on` — serverda AI butunlay oʻchiriladi |

Model nomlari tez-tez yangilanadi — amaldagi nomni provayder hujjatlaridan tekshiring.

## 3. Sahifalar

| Yoʻl | Tavsif |
|---|---|
| `/` | Landing + **Rol matritsasi** (idora, maqom, lavozim, kiyim, jins, nutq tili) va ssenariy kutubxonasi. «Maqomga qarab provokatsiya» profilga koʻra oldindan koʻrsatiladi. |
| `/simulate/[scenarioId]` | **3D Simulyatsiya arenasi**: Neural Acoustic Core (Three.js shader), push-to-talk va uzluksiz mikrofon, jonli toʻlqin + pitch, Agressiya hisoblagichi, Vazminlik indeksi, 3 mezonli Evaluator Agent, AI Ustoz tezkor maslahati, RAG huquqiy panel, ixtiyoriy biometrik monitor. |
| `/video-to-sim` | **Video → Ssenariy**: Privacy Shield (brauzerda mozaika) → Trigger Extraction (eskalatsiya nuqtasi + taktika) → bir bosishda simulyatsiya. |
| `/debrief` | **AI Ustoz**: transkript tahlili (eskalatsiya/de-eskalatsiya iboralari belgilangan), har bir javob uchun huquqiy havola, 4 oʻqli radar, agressiya yoʻli, takroriy oʻrganish jadvali. |
| `/admin` | **Qoʻmondonlik markazi**: 3D hududiy issiqlik xaritasi, provokatsiya trendlari, idora va vzvod kesimida tayyorgarlik (sintetik maʼlumotlar). |

API: `POST /api/simulate`, `POST /api/evaluate`, `POST /api/video-to-sim`, `GET /api/health`.

## 4. Arxitektura

```
src/
├─ app/                      Next.js App Router sahifalari va API route’lar
│  └─ api/{simulate,evaluate,video-to-sim,health}/route.ts
├─ lib/
│  ├─ types.ts               umumiy turlar
│  ├─ scenarios.ts           6 ta ssenariy + demo skriptlar + murakkablashtirilgan variantlar
│  ├─ legal.ts               huquqiy bilimlar bazasi (RAG manbasi, lex.uz havolalari)
│  ├─ agencies.ts            idoralar, unvonlar, maqomga qarab provokatsiya
│  ├─ engine/
│  │  ├─ evaluator.ts        Evaluator Agent (qoidaviy) + LLM bilan gibrid birlashtirish
│  │  ├─ citizen.ts          Demo AI Fuqaro holat mashinasi
│  │  ├─ prompts.ts          oʻzbekcha tizim promptlari
│  │  ├─ llm.ts              OpenAI / Gemini REST adapteri (taymaut + fallback)
│  │  ├─ debrief.ts          kompetensiyalar, AI Ustoz xulosasi, spaced repetition
│  │  └─ video.ts            namunaviy kliplar, evristik tahlil, ssenariy generatsiyasi
│  ├─ client-api.ts          server → xato boʻlsa lokal dvigatel (Wi-Fi uzilsa ham ishlaydi)
│  ├─ video-client.ts        kadr ajratish va lokal anonimlashtirish
│  └─ storage.ts             localStorage (natijalar faqat qurilmada)
├─ hooks/                    useSpeech (STT/TTS), useMicAnalyser (RMS, waveform, pitch)
└─ components/               three/, sim/, debrief/, video/, admin/, landing/, ui/ (shadcn uslubi)
```

### AI konveyeri

1. Xodim javobi → **`/api/evaluate`**: qoidaviy baholovchi har doim ishlaydi; kalit boʻlsa LLM bahosi
   bilan birlashtiriladi (65/35). **Korrupsiya, haqorat, tahdid** kabi kritik belgilar LLM javobidan
   qatʼi nazar saqlanadi.
2. Baholovchi `aggressionDelta` beradi → yangi agressiya «langari».
3. **`/api/simulate`**: AI Fuqaro javobi; LLM agressiyani langardan faqat ±8 ga oʻzgartira oladi —
   sahnadagi koʻrsatkichlar izchil qoladi.
4. Har bir chaqiruv taymaut bilan cheklangan; xato yoki sekin tarmoqda brauzer aynan shu mantiqni
   lokal bajaradi.

Sessiya tugash shartlari: agressiya ≤ 22 (kamida 3 javobdan soʻng) — muvaffaqiyat; ≥ 97 — nazoratdan
chiqish; korrupsiyaga moyillik — darhol toʻxtatish; 8 ta javob — yakun.

## 5. Sahna uchun xavfsiz namoyish (3 daqiqa)

1. Sarlavhadagi **«Demo rejim»**ni yoqing — barcha hisob-kitob brauzerda, tarmoq kerak emas.
2. `/` → **Bojxona inspektori**, **Ayol**, **Kursant** ni tanlang — «Maqomga qarab provokatsiya» kartasi oʻzgaradi.
3. «Chegara postida yuk tekshiruvidan bosh tortayotgan…» → **Matn rejimida** boshlang.
4. **«Xato»** demo iborasini bosing → yadro qizaradi, agressiya keskin oshadi, AI Ustoz xatoni tushuntiradi.
5. **«Namuna»** iborasini bosing (yoki tavsiya etilgan iborani «Matn maydoniga qoʻyish») → yadro yashilga qaytadi.
6. **Yakunlash** → **AI Ustoz tahlili**: belgilangan iboralar, modda havolalari, radar, 3 kunlik takroriy mashq.
7. `/video-to-sim` → namunaviy klip → **Avtomatik tahlil** → **Simulyatsiyani boshlash**.
8. `/admin` → 3D xaritada hududni bosing.

> Ovozli kiritish (Web Speech API) Chrome/Edge’da ishlaydi va nutqni tanish uchun brauzerning
> bulut xizmatidan foydalanadi — tarmoq yoʻq boʻlsa, matn rejimi va demo iboralardan foydalaning.
> Fuqaro ovozi: `uz` ovozi boʻlmasa turk (`tr`) ovozi, u ham boʻlmasa ovozsiz animatsiya.

## 6. Huquqiy baza (`src/lib/legal.ts`)

Har bir yozuv qisqacha **oʻquv bayoni** — rasmiy matn emas. Raqam va nomlar 2026-yil noyabr holatida
lex.uz va rasmiy axborot manbalari bilan solishtirilgan.

| ID | Hujjat | Modda | Holat |
|---|---|---|---|
| `iio-8` | «Ichki ishlar organlari toʻgʻrisida»gi Qonun (OʻRQ-407) | 8 | tasdiqlangan |
| `iio-10` | oʻsha | 10 | tasdiqlangan |
| `pq10-kodeks` | IIO xodimlarining kasbiy madaniyat va xizmat intizomi kodeksi (PQ-10, 20.01.2023) | 5, 7, 8-bandlar | tasdiqlangan |
| `mjtk-194` / `mjtk-194-1` | MJtK | 194, 194¹ | tasdiqlangan |
| `mjtk-183`, `mjtk-185-1`, `mjtk-41` | MJtK | 183, 185¹, 41 | tasdiqlangan |
| `bk-21`, `bk-4` | Bojxona kodeksi (OʻRQ-400) | 21, 4 | tasdiqlangan |
| `dbx-24`, `dbx-14`, `dbx-8` | «Davlat bojxona xizmati toʻgʻrisida»gi Qonun (OʻRQ-502 tahriri) | 24, 14, 8 | tasdiqlangan |
| `jk-210`, `jk-211` | Jinoyat kodeksi | 210, 211 | tasdiqlangan |
| `korr-419` | «Korrupsiyaga qarshi kurashish toʻgʻrisida»gi Qonun (OʻRQ-419) | 4 | tasdiqlangan |
| `mg-6` | «Milliy gvardiya toʻgʻrisida»gi Qonun | 6 | **instruktor tasdiqlashi tavsiya etiladi** |
| `yoriqnoma-3154` | Bojxona koʻzdan kechiruvi va koʻrigi yoʻriqnomasi (AV 3154) | — | **amaldagi tahririni tekshiring** |

## 7. Maxfiylik

* Video serverga yuklanmaydi: brauzer 6 ta kadr ajratadi va **yuborishdan oldin** mozaikalaydi
  (FaceDetector/TextDetector mavjud boʻlsa — yuz va matn zonalari; boʻlmasa — butun kadr).
* Biometrik monitor faqat brauzerda 64×48 kanvasda ishlaydi; kadrlar hech qayerga yuborilmaydi.
  Koʻrsatkichlar **taxminiy** (kadrlar farqi evristikasi) — tibbiy yoki psixologik diagnostika vositasi emas.
* Sessiya natijalari faqat `localStorage`da saqlanadi.

## 8. Cheklovlar va keyingi qadamlar

* Qoʻmondonlik markazidagi statistika **sintetik**. Real integratsiya uchun `lib/analytics-demo.ts` oʻrniga API ulang.
* Idora emblemalari uchun `public/logos/` papkasiga ruxsat etilgan PNG fayllarni joylang.
* Keyingi bosqich: MediaPipe Face Mesh bilan aniq koʻz qisish va mimika tahlili; huquqiy bazani
  vektor qidiruv (embedding) bilan kengaytirish; instruktor paneli va guruh reytinglari uchun server bazasi.
