import type { Difficulty, ProvocationType, Scenario } from './types';

/**
 * Ssenariylar kutubxonasi. Har bir ssenariy:
 *  - AI Fuqaro personasi va manipulyatsiya taktikalari,
 *  - Demo rejim uchun oldindan yozilgan javoblar (internet boʻlmasa ham ishlaydi),
 *  - Namunaviy xodim iboralari ({lavozim}, {unvon}, {familiya} profilga moslab toʻldiriladi).
 */
export const SCENARIOS: Scenario[] = [
  {
    id: 'chegara-yuk',
    title: 'Chegara postida yuk tekshiruvidan bosh tortayotgan agressiv yoʻlovchi',
    shortTitle: 'Yuk tekshiruvi rad etildi',
    agencies: ['bojxona'],
    location: 'Avtomobil chegara bojxona posti · yoʻlovchilar zali, 07:40',
    difficulty: 2,
    provocation: 'refusal',
    tactics: ['Vaqt bosimi («avtobusim ketib qoladi»)', 'Navbatdagilarni oʻz tomoniga ogʻdirish', 'Kamsitishda ayblash'],
    citizen: {
      name: 'Rustam',
      age: 42,
      role: 'Mayda ulgurji savdogar, har oy chegaradan oʻtadi',
      temperament: 'Shoshqaloq, tez qiziydi, oʻzini haq deb biladi',
      goal: 'Sumkalarini ochmasdan oʻtib ketish',
      voice: { gender: 'erkak', pitch: 0.85, rate: 1.08 },
    },
    brief:
      'Yoʻlovchi ikkita katta sumka bilan «yashil yoʻlak»dan oʻtmoqchi. Rentgen tasvirida sumkalardan birida bir xil shakldagi koʻp sonli qadoqlar koʻrindi. Siz sumkani bojxona koʻzdan kechiruvi uchun ochishni soʻradingiz — yoʻlovchi keskin rad etdi va ovozini koʻtardi.',
    objective:
      'Yoʻlovchini kamsitmasdan, qonuniy asosni tushuntirgan holda koʻzdan kechiruvga rozi qilish; navbatdagi yoʻlovchilar oldida vaziyatni nazoratda saqlash.',
    initialAggression: 62,
    openingLine:
      'Nima, men kontrabandachimanmi?! Har oy shu yerdan oʻtaman, hech kim sumkamni titkilamagan! Avtobusim oʻn daqiqada ketadi, ochmayman!',
    legalRefIds: ['bk-21', 'dbx-24', 'dbx-8', 'dbx-14', 'yoriqnoma-3154'],
    demoScript: {
      deescalate: [
        'Xoʻp... Lekin nima uchun aynan mening sumkam? Boshqalarni ham tekshiryapsizmi?',
        'Mayli, tushundim. Faqat tezroq boʻlsin, avtobusim ketib qolmasin.',
        'Bu qadoqlar — doʻkonim uchun telefon gʻiloflari, hujjati ham bor. Koʻrsataymi?',
        'Yaxshi, ochaman. Lekin hammasini joyiga qaytarib qoʻyasiz-a?',
      ],
      neutral: [
        'Qanaqa qonun? Men oddiy savdogarman, hujjatlarim joyida!',
        'Hamma qarab turibdi, meni oʻgʻriga chiqarmoqchimisiz?',
        'Boshligʻingiz qani? Men u bilan gaplashaman.',
        'Oʻtgan oy ham shunaqa qilishgan edi, keyin hech narsa topishmadi.',
      ],
      escalate: [
        'Menga ovoz koʻtarmang! Men sizga bola emasman!',
        'Odamlar, qaranglar! Oddiy xalqni shunaqa kamsitishadi!',
        'Hozir hammasini telefonga olaman, ertaga butun internet koʻradi!',
        'Ochmayman dedimmi — ochmayman! Nima qilasiz, qamaysizmi?!',
      ],
      resolved: 'Mayli, sumkani ochaman. Hujjatlarni ham koʻrsataman — tushuntirib berganingiz uchun rahmat.',
      breakdown: 'Bas! Men ketdim! Sumkani shu yerda qoldiraman, oʻzingiz bilganingizni qiling!',
    },
    sampleOfficerLines: [
      {
        quality: 'good',
        text: 'Assalomu alaykum. Men {lavozim}, {unvon} {familiya}man. Vaqtingiz ziqligini tushunaman. Bojxona kodeksining 21-moddasiga koʻra bojxona nazorati barcha yoʻlovchilarga bir xil qoʻllanadi. Koʻzdan kechiruv sizning ishtirokingizda, taxminan besh daqiqada oʻtkaziladi.',
      },
      { quality: 'neutral', text: 'Sumkani ochishingiz kerak, bu tartib. Iltimos, stol ustiga qoʻying.' },
      { quality: 'bad', text: 'Sen menga ovoz koʻtarma! Ochmasang, hozir hammasini musodara qilaman!' },
    ],
  },
  {
    id: 'bloger-guvohnoma',
    title: 'Telefon kamerasiga olib, guvohnomani talab qilayotgan bloger',
    shortTitle: 'Jonli efirdagi bloger',
    agencies: ['ppx', 'ypx', 'profilaktika', 'mg', 'bojxona'],
    location: 'Shahar markazi, piyodalar yoʻlagi · kechki payt, 19:20',
    difficulty: 2,
    provocation: 'filming',
    tactics: ['Jonli efir orqali bosim', 'Ayblovchi savollar bilan ketma-ket hujum', 'Xodimni hissiy reaksiyaga undash («kontent» uchun)'],
    citizen: {
      name: 'Jasur',
      age: 27,
      role: 'Bloger, 120 ming obunachili kanal muallifi',
      temperament: 'Kinoyali, hisob-kitobli; kamera oldida oʻzini «huquq himoyachisi» qilib koʻrsatadi',
      goal: 'Xodimni qoʻpollikka undab, koʻp koʻriladigan video olish',
      voice: { gender: 'erkak', pitch: 1.05, rate: 1.12 },
    },
    brief:
      'Xizmat vazifasini bajarish chogʻida fuqarolar bilan suhbatlashayotgan edingiz. Bloger yaqinlashib, telefonini yuzingizga tutdi va jonli efirda «Bu xodim kim, nima huquq bilan odamlarni toʻxtatyapti?» deb soʻray boshladi.',
    objective:
      'Xotirjam oʻzini tanishtirish, talabga koʻra xizmat guvohnomasini koʻrsatish, tasvirga olishga toʻsqinlik qilmasdan vazifani davom ettirish va provokatsiyaga berilmaslik.',
    initialAggression: 48,
    openingLine:
      'Efirdamiz, doʻstlar! Mana, yana bir «qonun posboni». Xoʻsh, siz kimsiz? Guvohnomangizni kameraga koʻrsating — yoki koʻrsatolmaysizmi?',
    legalRefIds: ['iio-8', 'iio-10', 'pq10-kodeks', 'mjtk-194', 'dbx-14'],
    demoScript: {
      deescalate: [
        'Hmm... guvohnomani koʻrsatdingiz, yaxshi. Xoʻsh, bu odamlarni nima sababdan toʻxtatdingiz?',
        'Obunachilar, koʻryapsizlarmi, xodim tushuntirib berdi. Mayli, yana bitta savol...',
        'Yaxshi, demak, bu oddiy profilaktik suhbat ekan. Tushunarli.',
        'Mayli, efirda adolat bilan aytaman — xodim muloyim gapirdi.',
      ],
      neutral: [
        'Toʻgʻridan-toʻgʻri javob bering: sizga kim ruxsat berdi?',
        'Nega kameraga qaramayapsiz? Yashiradigan narsangiz bormi?',
        'Obunachilar soʻrayapti: maoshingizni soliq toʻlovchilar toʻlaydi-ku, toʻgʻrimi?',
        'Familiyangizni yana bir bor ayting, yaxshi eshitilmadi.',
      ],
      escalate: [
        'Ha-ha, mana! Koʻrdingizmi, asabiylashdi! Hammasi efirda!',
        'Telefonimga qoʻl tekkizmang! Bu mening huquqim!',
        'Demak, qonunni bilmaysiz. Shunaqa xodimlar bizni himoya qiladimi?',
        'Ovozingizni koʻtarmang, men sizdan qarzdor emasman!',
      ],
      resolved: 'Mayli, rahmat. Efirni shu yerda yakunlayman — hammasi qonun doirasida boʻldi, buni tan olaman.',
      breakdown: 'Tamom, bu video millionlab koʻriladi. Ertaga sizni butun respublika taniydi!',
    },
    sampleOfficerLines: [
      {
        quality: 'good',
        text: 'Assalomu alaykum. Men {lavozim}, {unvon} {familiya}man. Mana xizmat guvohnomam, marhamat, kameraga yaqinroq koʻrsataman. Tasvirga olishingizga eʼtirozim yoʻq. Hozir fuqarolar bilan profilaktik suhbat oʻtkazyapmiz — savolingiz boʻlsa, javob beraman.',
      },
      { quality: 'neutral', text: 'Guvohnomani koʻrsataman, lekin telefonni yuzimga bunchalik yaqin tutmang.' },
      { quality: 'bad', text: 'Telefoningni oʻchir! Kim senga meni suratga olishga ruxsat berdi?' },
    ],
  },
  {
    id: 'tanish-bosim',
    title: 'Tanish-bilishchilik bilan bosim oʻtkazayotgan haydovchi',
    shortTitle: '«Men falonchining odamiman»',
    agencies: ['ypx', 'bojxona', 'ppx'],
    location: 'Shahar chetidagi nazorat posti · tushdan keyin, 14:10',
    difficulty: 3,
    provocation: 'connections',
    tactics: ['Yuqori lavozimdagi «tanish» nomini ishlatish', 'Yashirin pora taklifi («choy-poy»)', 'Xizmat kelajagiga tahdid'],
    citizen: {
      name: 'Akmal aka',
      age: 51,
      role: 'Qurilish firmasi rahbari, qimmat avtomobil haydovchisi',
      temperament: 'Oʻziga ishongan; avval «doʻstona», rad javobini olgach tahdidli',
      goal: 'Bayonnoma tuzdirmasdan ketish',
      voice: { gender: 'erkak', pitch: 0.78, rate: 0.98 },
    },
    brief:
      'Haydovchining tezlikni sezilarli oshirgani qayd etildi va avtomobil toʻxtatildi. Hujjatlarni soʻraganingizda u telefonini chiqarib, «tanishi»ga qoʻngʻiroq qilishini aytdi va qoʻlingizga buklangan pul uzatmoqchi boʻldi.',
    objective:
      'Pora taklifini qatʼiy, ammo hurmat bilan rad etish; tahdidlarga berilmasdan qonuniy tartibni davom ettirish; holat yuzasidan belgilangan tartibda xabar berish.',
    initialAggression: 40,
    openingLine:
      'Uka, keling, gapni choʻzmaylik. Men sizning boshligʻingiz bilan yaqin tanishman. Mana, choy-poyingizga — bayonnomani yozib oʻtirmang, xoʻpmi?',
    legalRefIds: ['jk-211', 'jk-210', 'korr-419', 'iio-10', 'mjtk-194'],
    demoScript: {
      deescalate: [
        '...Xoʻp, xoʻp. Pulni qaytarib oldim. Hazillashdim, jahlingiz chiqmasin.',
        'Mayli, hujjatlar mana. Lekin jarimani kamroq qilib boʻlmaydimi?',
        'Tushundim, qonun hamma uchun bir. Bayonnomani yozing, imzolayman.',
        'Yaxshi... Rostini aytsam, shoshilib ketayotgan edim. Xato qildim.',
      ],
      neutral: [
        'Siz meni tanimayapsiz shekilli. Hozir bitta qoʻngʻiroq qilsam, oʻzingiz uzr soʻraysiz.',
        'Hamma shunaqa qiladi-ku, nega mendan muammo qilyapsiz?',
        'Boʻldi-da. Bir marta koʻz yuming, hech kim bilmaydi.',
        'Men faqat tezroq ketmoqchiman, xolos. Qancha boʻlsa ham, ayting.',
      ],
      escalate: [
        'Ha, shunaqami? Yaxshi, ismingizni yozib oldim. Ertaga ishda boʻlarmikansiz?!',
        'Siz bilan gaplashib boʻlmaydi! Boshligʻingizga hozir qoʻngʻiroq qilaman!',
        'Meni qoʻrqitmang! Men bu shaharda hammani taniyman!',
        'Bu tuhmat! Men hech qanaqa pul bermadim, isbotlay olmaysiz!',
      ],
      resolved: 'Mayli... Bayonnomani imzolayman. Siz haqiqatan ham qonun boʻyicha ishlayapsiz — hurmat qildim.',
      breakdown: 'Boʻldi! Men ketaman, toʻxtatib koʻring-chi! Ertaga koʻrishamiz!',
    },
    sampleOfficerLines: [
      {
        quality: 'good',
        text: 'Assalomu alaykum. Men {lavozim}, {unvon} {familiya}man. Pulingizni olib qoʻying, iltimos — pul taklif qilish Jinoyat kodeksining 211-moddasiga koʻra jinoiy javobgarlikka sabab boʻladi. Kimni tanishingizdan qatʼi nazar, tartib hamma uchun bir xil. Hujjatlaringizni koʻrsating.',
      },
      { quality: 'neutral', text: 'Bunaqa gaplar kerak emas. Hujjatlarni bering.' },
      { quality: 'bad', text: 'Bu yerda gaplashmaylik, chetroqqa yuring, kelishib olamiz.' },
    ],
  },
  {
    id: 'bozor-olomon',
    title: 'Bozorda olomon oldida janjal koʻtarayotgan sotuvchi',
    shortTitle: 'Bozordagi olomon',
    agencies: ['profilaktika', 'ppx', 'mg'],
    location: 'Dehqon bozori, savdo rastalari · ertalab, 10:30',
    difficulty: 2,
    provocation: 'crowd',
    tactics: ['Olomonni oʻz tomoniga ogʻdirish', 'Oilaviy ahvol orqali hissiy bosim', 'Xodimni «xalqqa qarshi» qilib koʻrsatish'],
    citizen: {
      name: 'Bahodir',
      age: 38,
      role: 'Evakuatsiya yoʻlagida savdo qilayotgan sotuvchi',
      temperament: 'Hissiyotli, gapni tomoshabinlarga qaratib gapiradi',
      goal: 'Savdo joyini boʻshatmaslik, olomon yordamida xodimni chekinishga majbur qilish',
      voice: { gender: 'erkak', pitch: 0.92, rate: 1.1 },
    },
    brief:
      'Evakuatsiya yoʻlagini toʻsib savdo qilayotgan sotuvchidan mahsulotini belgilangan rastaga olib oʻtishni soʻradingiz. U baqirib, atrofdagilarni chaqira boshladi; 10–15 kishi yigʻildi, ayrimlari telefonda tasvirga olmoqda.',
    objective:
      'Olomon oldida xotirjamlikni saqlash, sotuvchining ehtiyojini tan olish, aniq va qonuniy talabni tushuntirish, suhbatni yoʻlakdan chetga olib chiqish.',
    initialAggression: 66,
    openingLine:
      'Odamlar, qaranglar! Bolalarimni nima bilan boqaman? Bir kunlik nonimni ham koʻp koʻryapti! Hech qayoqqa ketmayman!',
    legalRefIds: ['iio-8', 'iio-10', 'pq10-kodeks', 'mjtk-194', 'mjtk-183'],
    demoScript: {
      deescalate: [
        '...Mayli, gapiring. Qayerga oʻtishim kerak oʻzi?',
        'Rastada joy bormi? Boʻlsa, oʻtaman, faqat mollarimni koʻtarishga yordam bering.',
        'Xoʻp, tushundim, bu yoʻlak odamlar oʻtishi uchun ekan. Boʻshataman.',
        'Odamlar, tarqalinglar, inspektor bilan oʻzim gaplashib olaman.',
      ],
      neutral: [
        'Hamma shu yerda savdo qiladi, nega faqat men?',
        'Rasta uchun pul toʻlashga qurbim yetmaydi, buni tushunasizmi?',
        'Siz ham birovning farzandisiz, insof qiling!',
        'Bozor maʼmuriyati bilan gaplashing, men bilan emas.',
      ],
      escalate: [
        'Ana, eshitdinglarmi? Bizni odam oʻrnida koʻrmaydi!',
        'Itarmang! Hamma koʻryapti, guvohlar bor!',
        'Bugun meni, ertaga sizlarni haydaydi! Jim turmanglar, odamlar!',
        'Kuchingiz faqat bizga yetadimi?!',
      ],
      resolved: 'Xoʻp, mollarimni rastaga olib oʻtaman. Odam bilan odamdek gaplashdingiz — rahmat.',
      breakdown: 'Bas! Hech qayoqqa ketmayman, kuch ishlatib koʻring-chi! Hamma tasvirga olsin!',
    },
    sampleOfficerLines: [
      {
        quality: 'good',
        text: 'Assalomu alaykum, aka. Men {lavozim}, {unvon} {familiya}man. Oilangizni boqish uchun ishlayotganingizni tushunaman. Bu yoʻlak favqulodda vaziyatda odamlar oʻtishi uchun boʻsh turishi shart. Keling, birgalikda rastadan joy topamiz — maʼmuriyat bilan oʻzim gaplashaman.',
      },
      { quality: 'neutral', text: 'Bu yerda savdo qilish mumkin emas. Mollaringizni olib oʻting.' },
      { quality: 'bad', text: 'Hozir hammangni tarqataman! Sen esa mollaringni yigʻ, tez!' },
    ],
  },
  {
    id: 'aeroport-korik',
    title: 'Aeroportda qoʻshimcha koʻrikdan norozi yoʻlovchi',
    shortTitle: 'Kamsitilganlik hissi',
    agencies: ['bojxona'],
    location: 'Xalqaro aeroport · kelish zali, «qizil yoʻlak», 02:15',
    difficulty: 2,
    provocation: 'emotional',
    tactics: ['Kamsitish va adolatsizlikda ayblash', 'Koʻz yoshlari orqali hissiy bosim', 'Shikoyat va ijtimoiy tarmoq bilan tahdid'],
    citizen: {
      name: 'Dilnoza',
      age: 34,
      role: 'Shifokor, uzoq parvozdan charchab kelgan',
      temperament: 'Charchagan, oʻzini kamsitilgan his qiladi, adolatsizlikka sezgir',
      goal: 'Koʻrikdan qochish emas — hurmat va aniq tushuntirish olish',
      voice: { gender: 'ayol', pitch: 1.15, rate: 1.05 },
    },
    brief:
      'Yoʻlovchining bagajida deklaratsiyada koʻrsatilmagan dori vositalari aniqlandi. Qoʻshimcha koʻrik zarurligini aytganingizda u yigʻlab yubordi va «Meni jinoyatchidek koʻryapsizlar» deb baland ovozda shikoyat qila boshladi.',
    objective:
      'Hissiyotni tan olish, koʻrik sababi va tartibini aniq tushuntirish, yoʻlovchining huquqlarini (shu jumladan shikoyat qilish huquqini) maʼlum qilish, qadr-qimmatini saqlagan holda jarayonni yakunlash.',
    initialAggression: 55,
    openingLine:
      'Men shifokorman! Bu dorilar bemorlarim uchun! Nega meni hamma oldida jinoyatchidek tekshiryapsizlar? Bu kamsitish!',
    legalRefIds: ['bk-21', 'dbx-8', 'dbx-24', 'bk-4', 'yoriqnoma-3154'],
    demoScript: {
      deescalate: [
        '...Kechirasiz, juda charchadim. Qancha vaqt oladi bu?',
        'Retseptlarim telefonimda bor. Koʻrsatsam boʻladimi?',
        'Yaxshi, endi tushundim — bu hammaga bir xil tartib ekan.',
        'Mayli, qoʻshimcha koʻrikka roziman. Tushuntirganingiz uchun rahmat.',
      ],
      neutral: [
        'Boshqalar oʻtib ketyapti-ku, nega aynan men?',
        'Men hech narsani yashirmadim, shunchaki deklaratsiyani tushunmadim.',
        'Bu yerda ayol xodim yoʻqmi?',
        'Qayerga shikoyat qilsam boʻladi? Familiyangizni ayting.',
      ],
      escalate: [
        'Menga baqirmang! Men jinoyatchi emasman!',
        'Hammasini ijtimoiy tarmoqqa yozaman, bunday muomalani hamma bilsin!',
        'Sizlarda odamning qadri yoʻq ekan!',
        'Narsalarimga tegmang! Hech narsani imzolamayman!',
      ],
      resolved: 'Rahmat, tushunarli qilib tushuntirdingiz. Qoʻshimcha koʻrikdan oʻtaman — faqat iltimos, ayol xodim ishtirokida.',
      breakdown: 'Yetar! Advokatim kelmaguncha bir ogʻiz ham gapirmayman!',
    },
    sampleOfficerLines: [
      {
        quality: 'good',
        text: 'Hurmatli opa, sizni tushunaman — uzoq yoʻldan charchab keldingiz. Men {lavozim}, {unvon} {familiya}man. Deklaratsiyada koʻrsatilmagan dori vositalari boʻlgani uchun qoʻshimcha koʻrik oʻtkaziladi — bu tartib barcha yoʻlovchilarga bir xil. Xohlasangiz, koʻrik alohida xonada, ayol xodim ishtirokida oʻtkaziladi. Harakatlarimizdan norozi boʻlsangiz, shikoyat qilish huquqingiz bor.',
      },
      { quality: 'neutral', text: 'Qoʻshimcha koʻrik majburiy. Iltimos, anavi xonaga oʻting.' },
      { quality: 'bad', text: 'Yigʻlashni bas qiling, bunaqa nayranglar menga taʼsir qilmaydi.' },
    ],
  },
  {
    id: 'stadion-muxlis',
    title: 'Ommaviy tadbirda nazoratdan oʻtishga urinayotgan qizishgan muxlis',
    shortTitle: 'Stadion kirish nazorati',
    agencies: ['mg', 'ppx'],
    location: 'Stadion, sharqiy kirish nazorat nuqtasi · oʻyin boshlanishiga 20 daqiqa',
    difficulty: 3,
    provocation: 'insult',
    tactics: ['Haqorat va jismoniy yaqinlashish', 'Guruh bosimi (ortidagi doʻstlari)', '«Chiptam bor» deb tartibni inkor etish'],
    citizen: {
      name: 'Sardor',
      age: 24,
      role: 'Futbol muxlisi, doʻstlari bilan',
      temperament: 'Qizishgan, guruh oldida oʻzini koʻrsatishga intiladi',
      goal: 'Pirotexnika vositasi bilan nazoratdan oʻtish',
      voice: { gender: 'erkak', pitch: 1.0, rate: 1.18 },
    },
    brief:
      'Koʻrik chogʻida muxlisning sumkasida pirotexnika vositasi aniqlandi. Uni olib kirish mumkin emasligini tushuntirganingizda u haqoratli soʻzlar bilan toʻsiq tomon yurdi; ortida 6–7 doʻsti qichqirib turibdi.',
    objective:
      'Shaxsiy masofani saqlash, haqoratga shaxsiy javob qaytarmaslik, aniq va qisqa koʻrsatma berish, suhbatni guruhdan ajratib olib borish.',
    initialAggression: 72,
    openingLine: 'Hey, qoʻlingni tort! Chiptam bor, oʻtaman! Sen kim boʻlibsanki, meni toʻxtatasan?!',
    legalRefIds: ['mjtk-194-1', 'mjtk-185-1', 'mjtk-183', 'mg-6', 'mjtk-41'],
    demoScript: {
      deescalate: [
        '...Xoʻp, xoʻp, baqirmayapman. Pirotexnikani nima qilasiz endi?',
        'Bolalar, jim turinglar! ...Mayli, gapiring.',
        'Oʻyin boshlanishiga ulguramanmi? Faqat shuni bilmoqchiman.',
        'Yaxshi, uni topshiraman. Keyin oʻtkazasizmi?',
      ],
      neutral: [
        'Hamma olib kiradi-ku, nima boʻpti bitta mashʼala?',
        'Chipta pulini kim qaytaradi? Siz qaytarasizmi?',
        'Boshligʻingizni chaqiring, siz bilan gaplashmayman.',
        'Doʻstlarim oʻtib ketdi, men nega qolishim kerak?',
      ],
      escalate: [
        'Menga qoʻl tekkizma! Bolalar, koʻryapsizlarmi?!',
        'Qoʻrqitma meni! Hammamiz birga kiramiz, toʻxtatib koʻr!',
        'Formangga ishonma, sen ham oddiy odamsan!',
        'Ha, nima qilasan? Qani, qoʻl koʻtarib koʻr-chi!',
      ],
      resolved: 'Mayli... pirotexnikani topshirdim. Endi oʻtsam boʻladimi? ...Rahmat.',
      breakdown: 'Bolalar, ketdik! Toʻsiqni yorib oʻtamiz!',
    },
    sampleOfficerLines: [
      {
        quality: 'good',
        text: 'Toʻxtang, iltimos, bir qadam orqaga. Men {lavozim}, {unvon} {familiya}man. Chiptangiz borligini koʻrdim — oʻyinga kirish huquqingiz saqlanadi. Pirotexnika vositasini olib kirish mumkin emas; uni topshirsangiz, nazoratdan oʻtkazamiz. Keling, doʻstlaringizdan bir chetga chiqib gaplashaylik.',
      },
      { quality: 'neutral', text: 'Pirotexnika taqiqlangan. Topshiring yoki orqaga qayting.' },
      { quality: 'bad', text: 'Yana bir marta «sen» desang, hozir yotqizib qoʻyaman!' },
    ],
  },
];

export const BASE_FOR_PROVOCATION: Record<ProvocationType, string> = {
  refusal: 'chegara-yuk',
  filming: 'bloger-guvohnoma',
  connections: 'tanish-bosim',
  crowd: 'bozor-olomon',
  emotional: 'aeroport-korik',
  insult: 'stadion-muxlis',
};

const HARD_SUFFIX = '--hard';

export function harderId(id: string) {
  return id.endsWith(HARD_SUFFIX) ? id : `${id}${HARD_SUFFIX}`;
}

/** Kutubxonadagi (yoki murakkablashtirilgan) ssenariyni topadi. Videodan yaratilganlar storage orqali olinadi. */
export function getScenario(id: string): Scenario | undefined {
  if (id.endsWith(HARD_SUFFIX)) {
    const base = getScenario(id.slice(0, -HARD_SUFFIX.length));
    return base ? makeHarder(base) : undefined;
  }
  return SCENARIOS.find((s) => s.id === id);
}

export function makeHarder(base: Scenario): Scenario {
  return {
    ...base,
    id: harderId(base.id),
    title: `${base.title} (murakkablashtirilgan)`,
    shortTitle: `${base.shortTitle} · II bosqich`,
    difficulty: Math.min(3, base.difficulty + 1) as Difficulty,
    initialAggression: Math.min(85, base.initialAggression + 15),
    harderVariantOf: base.id,
  };
}

export function scenariosForAgency(agency: Scenario['agencies'][number]) {
  return SCENARIOS.filter((s) => s.agencies.includes(agency));
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = { 1: 'Boshlangʻich', 2: 'Oʻrta', 3: 'Yuqori' };
