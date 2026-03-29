import { adminDb } from "./firebase-admin";

export const vocabData = [
  // A1 Level
  { dutch: "De krant", farsi: "روزنامه", type: "Noun", level: "A1", exampleSentence: "Ik lees de krant." },
  { dutch: "Het boek", farsi: "کتاب", type: "Noun", level: "A1", exampleSentence: "Dit is een goed boek." },
  { dutch: "Lopen", farsi: "راه رفتن", type: "Verb", level: "A1", exampleSentence: "Wij lopen naar school." },
  { dutch: "Praten", farsi: "صحبت کردن", type: "Verb", level: "A1", exampleSentence: "Zij praten veel." },
  { dutch: "De fiets", farsi: "دوچرخه", type: "Noun", level: "A1", exampleSentence: "Ik heb een nieuwe fiets." },
  { dutch: "Eten", farsi: "خوردن", type: "Verb", level: "A1", exampleSentence: "Wat wil je eten?" },
  { dutch: "Drinken", farsi: "نوشیدن", type: "Verb", level: "A1", exampleSentence: "Ik drink graag water." },
  { dutch: "Mooi", farsi: "زیبا", type: "Adjective", level: "A1", exampleSentence: "Dat is een mooi huis." },
  { dutch: "Snel", farsi: "سریع", type: "Adjective", level: "A1", exampleSentence: "De auto rijdt snel." },
  { dutch: "De stad", farsi: "شهر", type: "Noun", level: "A1", exampleSentence: "Amsterdam is een grote stad." },
  { dutch: "Het huis", farsi: "خانه", type: "Noun", level: "A1", exampleSentence: "Mijn huis is klein." },
  { dutch: "De boom", farsi: "درخت", type: "Noun", level: "A1", exampleSentence: "De boom is groen." },
  { dutch: "Het water", farsi: "آب", type: "Noun", level: "A1", exampleSentence: "Ik drink water." },
  { dutch: "Blij", farsi: "خوشحال", type: "Adjective", level: "A1", exampleSentence: "Ik ben blij." },
  { dutch: "Boos", farsi: "عصبانی", type: "Adjective", level: "A1", exampleSentence: "Hij is boos." },
  { dutch: "Moe", farsi: "خسته", type: "Adjective", level: "A1", exampleSentence: "Zij is moe." },
  { dutch: "Groot", farsi: "بزرگ", type: "Adjective", level: "A1", exampleSentence: "Het huis is groot." },
  { dutch: "Klein", farsi: "کوچک", type: "Adjective", level: "A1", exampleSentence: "De muis is klein." },
  { dutch: "Werken", farsi: "کار کردن", type: "Verb", level: "A1", exampleSentence: "Ik werk in Amsterdam." },
  { dutch: "Slapen", farsi: "خوابیدن", type: "Verb", level: "A1", exampleSentence: "Ik slaap acht uur." },
  { dutch: "Kopen", farsi: "خریدن", type: "Verb", level: "A1", exampleSentence: "Ik koop een krant." },
  { dutch: "Verkopen", farsi: "فروختن", type: "Verb", level: "A1", exampleSentence: "Hij verkoopt zijn auto." },
  { dutch: "Vinden", farsi: "پیدا کردن / فکر کردن", type: "Verb", level: "A1", exampleSentence: "Wat vind je van dit boek?" },
  { dutch: "De tafel", farsi: "میز", type: "Noun", level: "A1", exampleSentence: "De tafel is groot." },
  { dutch: "De stoel", farsi: "صندلی", type: "Noun", level: "A1", exampleSentence: "Ik zit op een stoel." },
  { dutch: "Hoe gaat het?", farsi: "حالت چطوره؟", type: "Phrase", level: "A1", exampleSentence: "Hallo, hoe gaat het met jou?" },
  { dutch: "Dank je wel", farsi: "ممنون", type: "Phrase", level: "A1", exampleSentence: "Dank je wel voor de hulp." },
  { dutch: "Alsjeblieft", farsi: "لطفا / بفرمایید", type: "Phrase", level: "A1", exampleSentence: "Een koffie, alsjeblieft." },

  // A2 Level
  { dutch: "Gezellig", farsi: "دنج / دلپذیر", type: "Adjective", level: "A2", exampleSentence: "Het is hier erg gezellig." },
  { dutch: "Begrijpen", farsi: "فهمیدن", type: "Verb", level: "A2", exampleSentence: "Ik begrijp het niet." },
  { dutch: "Belangrijk", farsi: "مهم", type: "Adjective", level: "A2", exampleSentence: "Dit is een belangrijke les." },
  { dutch: "Moeilijk", farsi: "سخت", type: "Adjective", level: "A2", exampleSentence: "De test was erg moeilijk." },
  { dutch: "Makkelijk", farsi: "آسان", type: "Adjective", level: "A2", exampleSentence: "Dat is een makkelijke vraag." },
  { dutch: "De afspraak", farsi: "قرار ملاقات", type: "Noun", level: "A2", exampleSentence: "Ik heb een afspraak bij de dokter." },
  { dutch: "Het ziekenhuis", farsi: "بیمارستان", type: "Noun", level: "A2", exampleSentence: "Hij werkt in het ziekenhuis." },
  { dutch: "De boodschappen", farsi: "خرید (روزمره)", type: "Noun", level: "A2", exampleSentence: "Ik doe de boodschappen in de supermarkt." },
  { dutch: "Vergeten", farsi: "فراموش کردن", type: "Verb", level: "A2", exampleSentence: "Ik ben mijn sleutels vergeten." },
  { dutch: "Onthouden", farsi: "به خاطر سپردن", type: "Verb", level: "A2", exampleSentence: "Kan je dat onthouden?" },
  { dutch: "Tot ziens", farsi: "به امید دیدار", type: "Phrase", level: "A2", exampleSentence: "Bedankt en tot ziens!" },
  { dutch: "Wat is er aan de hand?", farsi: "چه اتفاقی افتاده؟", type: "Phrase", level: "A2", exampleSentence: "Je kijkt boos, wat is er aan de hand?" },

  // B1 Level
  { dutch: "Onafhankelijk", farsi: "مستقل", type: "Adjective", level: "B1", exampleSentence: "Zij is een onafhankelijke vrouw." },
  { dutch: "De maatschappij", farsi: "جامعه", type: "Noun", level: "B1", exampleSentence: "We leven in een multiculturele maatschappij." },
  { dutch: "Ontwikkelen", farsi: "توسعه دادن", type: "Verb", level: "B1", exampleSentence: "Het bedrijf wil nieuwe producten ontwikkelen." },
  { dutch: "Verwachten", farsi: "انتظار داشتن", type: "Verb", level: "B1", exampleSentence: "Ik verwacht dat het morgen gaat regenen." },
  { dutch: "De ervaring", farsi: "تجربه", type: "Noun", level: "B1", exampleSentence: "Hij heeft veel ervaring in dit werk." },
  { dutch: "Tegelijkertijd", farsi: "همزمان", type: "Adverb", level: "B1", exampleSentence: "We kwamen tegelijkertijd aan." },
  { dutch: "Ondanks", farsi: "با وجود اینکه", type: "Preposition", level: "B1", exampleSentence: "Ondanks de regen gingen we wandelen." },
  { dutch: "Veroorzaken", farsi: "باعث شدن", type: "Verb", level: "B1", exampleSentence: "De storm heeft veel schade veroorzaakt." },
  { dutch: "De beslissing", farsi: "تصمیم", type: "Noun", level: "B1", exampleSentence: "Dat was een moeilijke beslissing." },
  { dutch: "Op de hoogte houden", farsi: "در جریان گذاشتن", type: "Phrase", level: "B1", exampleSentence: "Ik zal je op de hoogte houden van de ontwikkelingen." },
  { dutch: "Het komt goed", farsi: "درست میشه", type: "Phrase", level: "B1", exampleSentence: "Maak je geen zorgen, het komt goed." },

  // B2 Level
  { dutch: "Noodzakelijk", farsi: "ضروری", type: "Adjective", level: "B2", exampleSentence: "Het is noodzakelijk dat je op tijd bent." },
  { dutch: "De maatregel", farsi: "اقدام / تدبیر", type: "Noun", level: "B2", exampleSentence: "De regering heeft nieuwe maatregelen genomen." },
  { dutch: "Bevestigen", farsi: "تایید کردن", type: "Verb", level: "B2", exampleSentence: "Kunt u de afspraak per e-mail bevestigen?" },
  { dutch: "Aanzienlijk", farsi: "قابل توجه", type: "Adjective", level: "B2", exampleSentence: "Er is een aanzienlijk verschil tussen de twee." },
  { dutch: "Verantwoordelijkheid", farsi: "مسئولیت", type: "Noun", level: "B2", exampleSentence: "Hij neemt zijn verantwoordelijkheid serieus." },
  { dutch: "Overtuigen", farsi: "متقاعد کردن", type: "Verb", level: "B2", exampleSentence: "Hij probeerde me te overtuigen van zijn gelijk." },
  { dutch: "De invloed", farsi: "تاثیر", type: "Noun", level: "B2", exampleSentence: "Het weer heeft veel invloed op mijn humeur." },
  { dutch: "Geleidelijk", farsi: "به تدریج", type: "Adverb", level: "B2", exampleSentence: "De situatie verbetert geleidelijk." },
  { dutch: "Aan de ene kant... aan de andere kant", farsi: "از یک طرف... از طرف دیگر", type: "Phrase", level: "B2", exampleSentence: "Aan de ene kant wil ik gaan, aan de andere kant ben ik moe." },
  { dutch: "In het algemeen", farsi: "به طور کلی", type: "Phrase", level: "B2", exampleSentence: "In het algemeen zijn Nederlanders erg direct." },

  // C1 Level
  { dutch: "Onvermijdelijk", farsi: "اجتناب ناپذیر", type: "Adjective", level: "C1", exampleSentence: "Een conflict leek onvermijdelijk." },
  { dutch: "De nuance", farsi: "تفاوت ظریف", type: "Noun", level: "C1", exampleSentence: "Je mist de nuance in deze discussie." },
  { dutch: "Achterhalen", farsi: "پی بردن / کشف کردن", type: "Verb", level: "C1", exampleSentence: "De politie probeert de waarheid te achterhalen." },
  { dutch: "Tegenstrijdig", farsi: "متناقض", type: "Adjective", level: "C1", exampleSentence: "De getuigen gaven tegenstrijdige verklaringen." },
  { dutch: "De consensus", farsi: "اجماع", type: "Noun", level: "C1", exampleSentence: "Er is nog geen consensus bereikt over dit onderwerp." },
  { dutch: "Handhaven", farsi: "حفظ کردن / اجرا کردن", type: "Verb", level: "C1", exampleSentence: "De politie moet de orde handhaven." },
  { dutch: "Zich bewust zijn van", farsi: "آگاه بودن از", type: "Phrase", level: "C1", exampleSentence: "Ik ben me bewust van de risico's." },
  { dutch: "Met betrekking tot", farsi: "در رابطه با", type: "Phrase", level: "C1", exampleSentence: "Met betrekking tot uw vraag, stuur ik u deze e-mail." },

  // C2 Level
  { dutch: "Blijkens", farsi: "بر اساس / طبق", type: "Preposition", level: "C2", exampleSentence: "Blijkens het rapport is de situatie verslechterd." },
  { dutch: "De discrepantie", farsi: "اختلاف / تناقض", type: "Noun", level: "C2", exampleSentence: "Er is een grote discrepantie tussen theorie en praktijk." },
  { dutch: "Bagatelliseren", farsi: "کوچک شمردن", type: "Verb", level: "C2", exampleSentence: "Je moet dit probleem niet bagatelliseren." },
  { dutch: "Ondubbelzinnig", farsi: "صریح / بدون ابهام", type: "Adjective", level: "C2", exampleSentence: "Hij gaf een ondubbelzinnig antwoord." },
  { dutch: "De repercussie", farsi: "پیامد (منفی)", type: "Noun", level: "C2", exampleSentence: "Deze beslissing zal grote repercussies hebben." },
  { dutch: "Bij voorbaat", farsi: "از پیش", type: "Phrase", level: "C2", exampleSentence: "Bij voorbaat dank voor uw medewerking." },
  { dutch: "Naar behoren", farsi: "به درستی / آنطور که باید", type: "Phrase", level: "C2", exampleSentence: "Het systeem functioneert niet naar behoren." },
  { dutch: "Fietsen", farsi: "دوچرخه‌سواری کردن", type: "Verb", level: "A1", exampleSentence: "Ik fiets naar school." },
  { dutch: "De koffie", farsi: "قهوه", type: "Noun", level: "A1", exampleSentence: "Ik drink graag koffie." },
  { dutch: "De thee", farsi: "چای", type: "Noun", level: "A1", exampleSentence: "Wil je thee drinken?" },
  { dutch: "Koud", farsi: "سرد", type: "Adjective", level: "A1", exampleSentence: "Het is koud buiten." },
  { dutch: "Warm", farsi: "گرم", type: "Adjective", level: "A1", exampleSentence: "De soep is warm." },
  { dutch: "De winkel", farsi: "فروشگاه", type: "Noun", level: "A2", exampleSentence: "Ik ga naar de winkel." },
  { dutch: "Koken", farsi: "آشپزی کردن", type: "Verb", level: "A2", exampleSentence: "Hij kookt het eten." },
  { dutch: "De vriend", farsi: "دوست", type: "Noun", level: "A2", exampleSentence: "Hij is mijn beste vriend." },
  { dutch: "Bellen", farsi: "تماس گرفتن", type: "Verb", level: "A2", exampleSentence: "Ik bel mijn moeder." },
  { dutch: "Wachten", farsi: "منتظر ماندن", type: "Verb", level: "A2", exampleSentence: "Ik wacht op de bus." }
];

export const grammarData = [
  { 
    dutch: "V2 Rule", 
    farsi: "قانون V2", 
    content: "در جملات اصلی هلندی، فعل مزدوج همیشه در جایگاه دوم قرار می‌گیرد.", 
    examples: [
      { dutch: "Vandaag ga ik naar school.", farsi: "امروز من به مدرسه می‌روم." },
      { dutch: "Morgen eten wij pizza.", farsi: "فردا ما پیتزا می‌خوریم." },
      { dutch: "In de zomer is het warm.", farsi: "در تابستان هوا گرم است." }
    ],
    detailedExamples: [
      { dutch: "Gisteren las ik een boek.", farsi: "دیروز من یک کتاب خواندم.", explanation: "فعل 'las' در جایگاه دوم است." },
      { dutch: "Nu drink ik koffie.", farsi: "الان من قهوه می‌نوشم.", explanation: "فعل 'drink' در جایگاه دوم است." }
    ],
    commonMistakes: [
      { mistake: "Vandaag ik ga naar school.", correction: "Vandaag ga ik naar school.", explanation: "فعل باید در جایگاه دوم باشد، نه بعد از فاعل." }
    ]
  },
  { 
    dutch: "De vs Het", 
    farsi: "De در مقابل Het", 
    content: "هلندی دو حرف تعریف معین دارد. اکثر کلمات از 'de' استفاده می‌کنند. کلمات تصغیری همیشه از 'het' استفاده می‌کنند.", 
    examples: [
      { dutch: "De man leest een boek.", farsi: "مرد یک کتاب می‌خواند." },
      { dutch: "Het meisje fietst naar huis.", farsi: "دختر به خانه دوچرخه‌سواری می‌کند." },
      { dutch: "De hond en het katje spelen.", farsi: "سگ و بچه گربه بازی می‌کنند." }
    ],
    detailedExamples: [
      { dutch: "De tafel is groot.", farsi: "میز بزرگ است.", explanation: "'tafel' یک اسم با 'de' است." },
      { dutch: "Het huis is mooi.", farsi: "خانه زیبا است.", explanation: "'huis' یک اسم با 'het' است." }
    ],
    commonMistakes: [
      { mistake: "Het man.", correction: "De man.", explanation: "کلمات مربوط به افراد معمولاً 'de' می‌گیرند." }
    ]
  },
  { 
    dutch: "Plurals", 
    farsi: "جمع بستن", 
    content: "اکثر کلمات هلندی با اضافه کردن -en یا -s جمع بسته می‌شوند.", 
    examples: [
      { dutch: "Ik heb twee boeken.", farsi: "من دو کتاب دارم." },
      { dutch: "Er staan drie tafels in de kamer.", farsi: "سه میز در اتاق وجود دارد." },
      { dutch: "De appels zijn erg lekker.", farsi: "سیب‌ها خیلی خوشمزه هستند." }
    ]
  },
  { 
    dutch: "Personal Pronouns", 
    farsi: "ضمایر شخصی", 
    content: "Ik (من), Jij/Je (تو), Hij (او - مذکر), Zij/Ze (او - مونث), Het (آن), Wij/We (ما), Jullie (شما), Zij/Ze (آنها).", 
    examples: [
      { dutch: "Ik ben een student.", farsi: "من یک دانشجو هستم." },
      { dutch: "Zij wonen in Amsterdam.", farsi: "آنها در آمستردام زندگی می‌کنند." },
      { dutch: "Jullie spreken goed Nederlands.", farsi: "شما (جمع) هلندی خوب صحبت می‌کنید." }
    ]
  },
  { 
    dutch: "Present Tense", 
    farsi: "زمان حال", 
    content: "برای ساختن زمان حال، ریشه فعل را پیدا کنید و پسوندهای مناسب را اضافه کنید: - (ik), -t (jij/hij/zij/het), -en (wij/jullie/zij).", 
    examples: [
      { dutch: "Ik loop elke dag.", farsi: "من هر روز راه می‌روم." },
      { dutch: "Hij werkt in een ziekenhuis.", farsi: "او در یک بیمارستان کار می‌کند." },
      { dutch: "Wij drinken koffie.", farsi: "ما قهوه می‌نوشیم." }
    ]
  },
  { 
    dutch: "Negation (Niet/Geen)", 
    farsi: "منفی کردن", 
    content: "از 'geen' برای نفی کلماتی که حرف تعریف ندارند یا حرف تعریف 'een' دارند استفاده می‌شود. از 'niet' برای نفی بقیه موارد استفاده می‌شود.", 
    examples: [
      { dutch: "Ik heb geen auto.", farsi: "من ماشین ندارم." },
      { dutch: "Hij is niet thuis.", farsi: "او در خانه نیست." },
      { dutch: "Wij spreken geen Frans.", farsi: "ما فرانسوی صحبت نمی‌کنیم." }
    ]
  },
  { 
    dutch: "Inversion", 
    farsi: "وارونگی", 
    content: "وقتی جمله با چیزی غیر از فاعل شروع می‌شود، جای فاعل و فعل عوض می‌شود.", 
    examples: [
      { dutch: "Morgen ga ik naar Amsterdam.", farsi: "فردا من به آمستردام می‌روم." },
      { dutch: "Gisteren was hij ziek.", farsi: "دیروز او بیمار بود." },
      { dutch: "Daarom blijf ik thuis.", farsi: "به همین دلیل من در خانه می‌مانم." }
    ]
  }
];

export const lessonData = [
  { 
    id: "v2_intro",
    title: "The V2 Rule", 
    content: "In Dutch, the conjugated verb always comes second in a main sentence. This is called the V2 rule.", 
    exercise: "Translate: 'Today I go to school.' (Vandaag ... ik naar school.)",
    nextLesson: "de_het_intro"
  },
  { 
    id: "de_het_intro",
    title: "Articles: De vs Het", 
    content: "Dutch has two definite articles: 'de' and 'het'. Most words use 'de'. Diminutives (-je) always use 'het'.", 
    exercise: "Which article for 'meisje'?",
    nextLesson: "plural_intro"
  },
  {
    id: "plural_intro",
    title: "Plural Nouns",
    content: "Most Dutch nouns form their plural by adding -en. If the noun ends in a silent -e, it usually adds -s.",
    exercise: "What is the plural of 'boek'?",
    nextLesson: "verbs_present"
  },
  {
    id: "verbs_present",
    title: "Present Tense Verbs",
    content: "To conjugate a verb in the present tense, start with the stem (the infinitive minus -en). Add -t for jij/hij/zij/het, and keep the infinitive for plurals.",
    exercise: "Conjugate 'lopen' for 'hij'.",
    nextLesson: "pronouns_intro"
  },
  {
    id: "pronouns_intro",
    title: "Personal Pronouns",
    content: "Learn the basic pronouns: Ik, Jij, Hij, Zij, Het, Wij, Jullie, Zij.",
    exercise: "What is 'we' in Dutch?",
    nextLesson: "negation_intro"
  },
  {
    id: "negation_intro",
    title: "Negation: Niet vs Geen",
    content: "Learn when to use 'niet' and when to use 'geen'.",
    exercise: "Translate: 'I have no book.'",
    nextLesson: null
  }
];

export const exerciseData = [
  {
    id: "ex_v2_1",
    type: "reorder",
    question: "امروز من به مدرسه می‌روم.",
    answer: "Vandaag ga ik naar school",
    dutch: "Vandaag ga ik naar school",
    farsi: "امروز من به مدرسه می‌روم.",
    explanation: "در هلندی، فعل (ga) در جایگاه دوم قرار می‌گیرد."
  },
  {
    id: "ex_v2_2",
    type: "reorder",
    question: "فردا ما به آمستردام می‌رویم.",
    answer: "Morgen gaan wij naar Amsterdam",
    dutch: "Morgen gaan wij naar Amsterdam",
    farsi: "فردا ما به آمستردام می‌رویم.",
    explanation: "وارونگی: وقتی جمله با Morgen شروع می‌شود، فعل (gaan) قبل از فاعل (wij) می‌آید."
  },
  {
    id: "ex_de_het_1",
    type: "mcq",
    question: "meisje",
    answer: "het",
    options: ["de", "het"],
    dutch: "het meisje",
    farsi: "دختر",
    explanation: "کلمات تصغیری (که به -je ختم می‌شوند) همیشه از het استفاده می‌کنند."
  },
  {
    id: "ex_de_het_2",
    type: "mcq",
    question: "man",
    answer: "de",
    options: ["de", "het"],
    dutch: "de man",
    farsi: "مرد",
    explanation: "اکثر کلمات مربوط به افراد از de استفاده می‌کنند."
  },
  {
    id: "ex_vocab_1",
    type: "flashcard",
    question: "De krant",
    answer: "روزنامه",
    dutch: "De krant",
    farsi: "روزنامه",
    explanation: "یک کلمه رایج برای اخبار روزانه."
  },
  {
    id: "ex_vocab_2",
    type: "flashcard",
    question: "Gezellig",
    answer: "دنج / دلپذیر",
    dutch: "Gezellig",
    farsi: "دنج / دلپذیر",
    explanation: "یک کلمه منحصر به فرد هلندی برای توصیف یک فضای خوب."
  },
  {
    id: "ex_cloze_1",
    type: "cloze",
    question: "Ik ___ naar school.",
    answer: "ga",
    dutch: "Ik ga naar school.",
    farsi: "من به مدرسه می‌روم.",
    explanation: "فعل 'ga' (رفتن) برای اول شخص مفرد استفاده می‌شود."
  },
  {
    id: "ex_cloze_2",
    type: "cloze",
    question: "Zij ___ veel.",
    answer: "praten",
    dutch: "Zij praten veel.",
    farsi: "آنها زیاد صحبت می‌کنند.",
    explanation: "برای جمع (zij - آنها)، از شکل کامل فعل استفاده می‌کنیم."
  },
  {
    id: "ex_v2_guided_001",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "beginner",
    topicId: "inversion_vandaag_school",
    instruction: "Build the correct Dutch sentence.",
    hint: "Find the verb and place it in slot 2.",
    explanation: "When 'Vandaag' comes first, Dutch keeps the finite verb in second position, so the subject comes after the verb.",
    dutch: "Vandaag ga ik naar school.",
    farsi: "امروز من به مدرسه میروم.",
    question: "امروز من به مدرسه میروم.",
    answer: "Vandaag ga ik naar school",
    tokens: [
      { id: "t1", text: "Vandaag", role: "time" },
      { id: "t2", text: "ik", role: "subject" },
      { id: "t3", text: "ga", role: "verb" },
      { id: "t4", text: "naar school", role: "place" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_v2_guided_002",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "beginner",
    topicId: "inversion_morgen_boodschappen",
    instruction: "Build the correct Dutch sentence.",
    hint: "The verb should be in slot 2.",
    explanation: "Because 'Morgen' is first, the verb 'doe' must come before the subject 'ik'.",
    dutch: "Morgen doe ik de boodschappen.",
    farsi: "فردا من خرید روزمره را انجام میدهم.",
    question: "فردا من خرید روزمره را انجام میدهم.",
    answer: "Morgen doe ik de boodschappen",
    tokens: [
      { id: "t1", text: "Morgen", role: "time" },
      { id: "t2", text: "ik", role: "subject" },
      { id: "t3", text: "doe", role: "verb" },
      { id: "t4", text: "de boodschappen", role: "object" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_v2_guided_003",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "intermediate",
    topicId: "inversion_ziekenhuis_werkt",
    instruction: "Build the correct Dutch sentence.",
    hint: "A place phrase in slot 1 still forces the verb into slot 2.",
    explanation: "When the sentence starts with 'In het ziekenhuis', Dutch uses inversion: the verb 'werkt' comes before the subject 'hij'.",
    dutch: "In het ziekenhuis werkt hij.",
    farsi: "در بیمارستان او کار میکند.",
    question: "در بیمارستان او کار میکند.",
    answer: "In het ziekenhuis werkt hij",
    tokens: [
      { id: "t1", text: "In het ziekenhuis", role: "place" },
      { id: "t2", text: "hij", role: "subject" },
      { id: "t3", text: "werkt", role: "verb" }
    ],
    correctOrder: ["t1", "t3", "t2"]
  },
  {
    id: "ex_v2_guided_004",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "beginner",
    topicId: "inversion_gisteren_krant",
    instruction: "Build the correct Dutch sentence.",
    hint: "Start with the time word, then put the verb in slot 2.",
    explanation: "With 'Gisteren' in slot 1, the verb 'las' must be second, before the subject 'ik'.",
    dutch: "Gisteren las ik de krant.",
    farsi: "دیروز من روزنامه را خواندم.",
    question: "دیروز من روزنامه را خواندم.",
    answer: "Gisteren las ik de krant",
    tokens: [
      { id: "t1", text: "Gisteren", role: "time" },
      { id: "t2", text: "ik", role: "subject" },
      { id: "t3", text: "las", role: "verb" },
      { id: "t4", text: "de krant", role: "object" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_v2_guided_005",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "intermediate",
    topicId: "inversion_daarom_thuis",
    instruction: "Build the correct Dutch sentence.",
    hint: "When 'Daarom' starts the sentence, the verb still goes second.",
    explanation: "The adverb 'Daarom' takes slot 1. That forces the finite verb 'blijf' into slot 2, and the subject 'ik' comes after it.",
    dutch: "Daarom blijf ik thuis.",
    farsi: "به همین دلیل من در خانه میمانم.",
    question: "به همین دلیل من در خانه میمانم.",
    answer: "Daarom blijf ik thuis",
    tokens: [
      { id: "t1", text: "Daarom", role: "adverb" },
      { id: "t2", text: "ik", role: "subject" },
      { id: "t3", text: "blijf", role: "verb" },
      { id: "t4", text: "thuis", role: "place" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_v2_guided_006",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "beginner",
    topicId: "grammar_inversion_time_nu",
    instruction: "Build the correct Dutch sentence.",
    hint: "Put the finite verb in slot 2.",
    explanation: "When 'Nu' comes first, the verb must stay in second position.",
    dutch: "Nu drink ik koffie.",
    farsi: "الان من قهوه مینوشم.",
    question: "الان من قهوه مینوشم.",
    answer: "Nu drink ik koffie",
    tokens: [
      { id: "t1", text: "Nu", role: "time" },
      { id: "t2", text: "ik", role: "subject" },
      { id: "t3", text: "drink", role: "verb" },
      { id: "t4", text: "koffie", role: "object" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_v2_guided_007",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "beginner",
    topicId: "grammar_inversion_time_straks",
    instruction: "Build the correct Dutch sentence.",
    hint: "A time word in slot 1 pushes the verb into slot 2.",
    explanation: "With 'Straks' first, Dutch inversion places the verb before the subject.",
    dutch: "Straks lees ik het boek.",
    farsi: "کمی بعد من کتاب را میخوانم.",
    question: "کمی بعد من کتاب را میخوانم.",
    answer: "Straks lees ik het boek",
    tokens: [
      { id: "t1", text: "Straks", role: "time" },
      { id: "t2", text: "ik", role: "subject" },
      { id: "t3", text: "lees", role: "verb" },
      { id: "t4", text: "het boek", role: "object" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_v2_guided_008",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "beginner",
    topicId: "grammar_inversion_place_keuken",
    instruction: "Build the correct Dutch sentence.",
    hint: "The place phrase comes first, but the verb still goes second.",
    explanation: "A place phrase like 'In de keuken' fills slot 1, so the verb must come in slot 2.",
    dutch: "In de keuken kook ik.",
    farsi: "در آشپزخانه من آشپزی میکنم.",
    question: "در آشپزخانه من آشپزی میکنم.",
    answer: "In de keuken kook ik",
    tokens: [
      { id: "t1", text: "In de keuken", role: "place" },
      { id: "t2", text: "ik", role: "subject" },
      { id: "t3", text: "kook", role: "verb" }
    ],
    correctOrder: ["t1", "t3", "t2"]
  },
  {
    id: "ex_v2_guided_009",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "intermediate",
    topicId: "grammar_inversion_place_bibliotheek",
    instruction: "Build the correct Dutch sentence.",
    hint: "Multi-word place phrases still count as slot 1.",
    explanation: "The full phrase 'In de bibliotheek' is one slot-1 unit. The verb must come second.",
    dutch: "In de bibliotheek studeert zij.",
    farsi: "در کتابخانه او درس میخواند.",
    question: "در کتابخانه او درس میخواند.",
    answer: "In de bibliotheek studeert zij",
    tokens: [
      { id: "t1", text: "In de bibliotheek", role: "place" },
      { id: "t2", text: "zij", role: "subject" },
      { id: "t3", text: "studeert", role: "verb" }
    ],
    correctOrder: ["t1", "t3", "t2"]
  },
  {
    id: "ex_v2_guided_010",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "intermediate",
    topicId: "grammar_inversion_adverb_snel",
    instruction: "Build the correct Dutch sentence.",
    hint: "An adverb in slot 1 also triggers inversion.",
    explanation: "When 'Snel' comes first, the verb must remain in second position.",
    dutch: "Snel rent hij naar huis.",
    farsi: "او سریع به خانه میدود.",
    question: "او سریع به خانه میدود.",
    answer: "Snel rent hij naar huis",
    tokens: [
      { id: "t1", text: "Snel", role: "adverb" },
      { id: "t2", text: "hij", role: "subject" },
      { id: "t3", text: "rent", role: "verb" },
      { id: "t4", text: "naar huis", role: "place" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_v2_guided_011",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "intermediate",
    topicId: "grammar_inversion_adverb_graag",
    instruction: "Build the correct Dutch sentence.",
    hint: "The verb should come right after slot 1.",
    explanation: "With 'Graag' first, the finite verb 'drinkt' stays in slot 2, before the subject.",
    dutch: "Graag drinkt hij thee.",
    farsi: "او با میل چای مینوشد.",
    question: "او با میل چای مینوشد.",
    answer: "Graag drinkt hij thee",
    tokens: [
      { id: "t1", text: "Graag", role: "adverb" },
      { id: "t2", text: "hij", role: "subject" },
      { id: "t3", text: "drinkt", role: "verb" },
      { id: "t4", text: "thee", role: "object" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_v2_guided_012",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "intermediate",
    topicId: "grammar_inversion_object_boek",
    instruction: "Build the correct Dutch sentence.",
    hint: "The object is in slot 1, so the verb still goes second.",
    explanation: "When 'Dat boek' is emphasized in slot 1, the verb must stay second and the subject comes after it.",
    dutch: "Dat boek lees ik morgen.",
    farsi: "آن کتاب را من فردا میخوانم.",
    question: "آن کتاب را من فردا میخوانم.",
    answer: "Dat boek lees ik morgen",
    tokens: [
      { id: "t1", text: "Dat boek", role: "object" },
      { id: "t2", text: "ik", role: "subject" },
      { id: "t3", text: "lees", role: "verb" },
      { id: "t4", text: "morgen", role: "time" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_v2_guided_013",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "intermediate",
    topicId: "grammar_inversion_object_krant",
    instruction: "Build the correct Dutch sentence.",
    hint: "Object-first emphasis still keeps the verb in slot 2.",
    explanation: "Putting 'De krant' first emphasizes the object, but the verb remains second.",
    dutch: "De krant leest hij elke dag.",
    farsi: "او روزنامه را هر روز میخواند.",
    question: "او روزنامه را هر روز میخواند.",
    answer: "De krant leest hij elke dag",
    tokens: [
      { id: "t1", text: "De krant", role: "object" },
      { id: "t2", text: "hij", role: "subject" },
      { id: "t3", text: "leest", role: "verb" },
      { id: "t4", text: "elke dag", role: "time" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_v2_guided_014",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "advanced",
    topicId: "grammar_inversion_reason_regen",
    instruction: "Build the correct Dutch sentence.",
    hint: "A long reason phrase still counts as slot 1.",
    explanation: "The whole phrase 'Vanwege de regen' occupies slot 1, so the verb must immediately follow in slot 2.",
    dutch: "Vanwege de regen blijf ik thuis.",
    farsi: "به خاطر باران من در خانه میمانم.",
    question: "به خاطر باران من در خانه میمانم.",
    answer: "Vanwege de regen blijf ik thuis",
    tokens: [
      { id: "t1", text: "Vanwege de regen", role: "other" },
      { id: "t2", text: "ik", role: "subject" },
      { id: "t3", "text": "blijf", role: "verb" },
      { id: "t4", text: "thuis", role: "place" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_v2_guided_015",
    type: "reorder",
    subtype: "v2_guided_slots",
    sourceType: "grammar",
    sourceId: "grammar_inversion",
    difficulty: "advanced",
    topicId: "grammar_inversion_reason_afspraak",
    instruction: "Build the correct Dutch sentence.",
    hint: "Even with a longer phrase first, the verb stays in slot 2.",
    explanation: "The reason phrase takes slot 1. Dutch V2 then requires 'mis' in slot 2, before the subject.",
    dutch: "Door de afspraak mis ik de les.",
    farsi: "به خاطر قرار ملاقات من کلاس را از دست میدهم.",
    question: "به خاطر قرار ملاقات من کلاس را از دست میدهم.",
    answer: "Door de afspraak mis ik de les",
    tokens: [
      { id: "t1", text: "Door de afspraak", role: "other" },
      { id: "t2", text: "ik", role: "subject" },
      { id: "t3", "text": "mis", role: "verb" },
      { id: "t4", text: "de les", role: "object" }
    ],
    correctOrder: ["t1", "t3", "t2", "t4"]
  },
  {
    id: "ex_de_het_3",
    type: "mcq",
    question: "tafel",
    answer: "de",
    options: ["de", "het"],
    dutch: "de tafel",
    farsi: "میز",
    explanation: "اکثر کلمات هلندی از 'de' استفاده می‌کنند."
  },
  {
    id: "ex_de_het_4",
    type: "cloze",
    question: "___ huis is groot.",
    answer: "Het",
    dutch: "Het huis is groot.",
    farsi: "خانه بزرگ است.",
    explanation: "'huis' یک اسم با 'het' is."
  }
];

export async function seedDatabase() {
  const batch = adminDb.batch();

  // Seed vocabulary
  vocabData.forEach((item, index) => {
    const ref = adminDb.collection("vocabulary").doc(`v_${index}`);
    batch.set(ref, item);
  });

  // Seed grammar
  grammarData.forEach((item, index) => {
    const ref = adminDb.collection("grammar").doc(`g_${index}`);
    batch.set(ref, item);
  });

  // Seed lessons
  lessonData.forEach((item) => {
    const ref = adminDb.collection("lessons").doc(item.id);
    batch.set(ref, item);
  });

  // Seed exercises
  exerciseData.forEach((item) => {
    const ref = adminDb.collection("practice_exercises").doc(item.id);
    batch.set(ref, item);
  });

  await batch.commit();
  console.log("Database seeded successfully with initial data.");
}
