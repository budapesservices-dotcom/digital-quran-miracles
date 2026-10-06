const state = {
  data: null,
  selectedWord: null,
  evidenceIndex: 0,
  evidenceSurah: "all",
  language: detectInitialLanguage(),
  expandedCategory: null,

  translationMaps: {
    id: new Map(),
    en: new Map(),
    ar: new Map(),
  },
};

const $ = (id) => document.getElementById(id);

function t(key) {
  return I18N[state.language]?.[key] ?? I18N.en[key] ?? key;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderEvidenceText(text, tokenIndex) {
  const tokens = String(text || "")
    .trim()
    .split(/\s+/);

  const targetIndex = Number(tokenIndex) - 1;

  return tokens
    .map((token, index) => {
      const safeToken = escapeHtml(token);

      if (index === targetIndex) {
        return `
          <mark
            class="quran-token-highlight"
          >
            ${safeToken}
          </mark>
        `;
      }

      return safeToken;
    })
    .join(" ");
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  const formatted = new Intl.NumberFormat("en-US").format(number);

  if (state.language !== "ar") {
    return formatted;
  }

  return formatted.replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}

function formatDecimal(value, maximumFractionDigits = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return state.language === "ar" ? "٠" : "0";
  }

  return new Intl.NumberFormat(
    state.language === "ar"
      ? "ar-EG"
      : state.language === "id"
        ? "id-ID"
        : "en-US",
    {
      maximumFractionDigits,
    },
  ).format(number);
}

function getSelectedTerm() {
  return state.data.terms.find((term) => term.word === state.selectedWord);
}

function getMeaning(term) {
  const metadata = term.metadata || {};

  const value =
    state.language === "ar"
      ? metadata.meaning_ar
      : state.language === "en"
        ? metadata.meaning_en
        : metadata.meaning_id;

  return (
    value ||
    metadata.meaning_id ||
    metadata.meaning_en ||
    metadata.meaning_ar ||
    t("notAvailable")
  );
}

function buildTranslationMap(data) {
  const map = new Map();

  for (const surah of data || []) {
    for (const verse of surah.verses || []) {
      map.set(`${surah.id}:${verse.id}`, verse.translation || "");
    }
  }

  return map;
}

function getVerseTranslations(surah, ayah) {
  const key = `${surah}:${ayah}`;

  return {
    id: state.translationMaps.id.get(key) || "",

    en: state.translationMaps.en.get(key) || "",
  };
}

async function fetchArabicTranslation(surah, ayah) {
  const key = `${surah}:${ayah}`;

  const cached = state.translationMaps.ar.get(key);

  if (cached) {
    return cached;
  }

  const url =
    `https://quranenc.com/api/v1/translation/aya/` +
    `arabic_seraj/${Number(surah)}/${Number(ayah)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Arabic translation HTTP ${response.status}`);
  }

  const data = await response.json();

  const translation = String(data.translation || "").trim();

  if (translation) {
    state.translationMaps.ar.set(key, translation);
  }

  return translation;
}

function getVerseLabel() {
  return state.language === "id"
    ? "Ayat"
    : state.language === "ar"
      ? "الآية"
      : "Verse";
}

const SURAH_NAMES = {
  1: { latin: "Al-Fatihah", ar: "الفاتحة" },
  2: { latin: "Al-Baqarah", ar: "البقرة" },
  3: { latin: "Ali 'Imran", ar: "آل عمران" },
  4: { latin: "An-Nisa", ar: "النساء" },
  5: { latin: "Al-Ma'idah", ar: "المائدة" },
  6: { latin: "Al-An'am", ar: "الأنعام" },
  7: { latin: "Al-A'raf", ar: "الأعراف" },
  8: { latin: "Al-Anfal", ar: "الأنفال" },
  9: { latin: "At-Tawbah", ar: "التوبة" },
  10: { latin: "Yunus", ar: "يونس" },
  11: { latin: "Hud", ar: "هود" },
  12: { latin: "Yusuf", ar: "يوسف" },
  13: { latin: "Ar-Ra'd", ar: "الرعد" },
  14: { latin: "Ibrahim", ar: "إبراهيم" },
  15: { latin: "Al-Hijr", ar: "الحجر" },
  16: { latin: "An-Nahl", ar: "النحل" },
  17: { latin: "Al-Isra", ar: "الإسراء" },
  18: { latin: "Al-Kahf", ar: "الكهف" },
  19: { latin: "Maryam", ar: "مريم" },
  20: { latin: "Ta-Ha", ar: "طه" },
  21: { latin: "Al-Anbiya", ar: "الأنبياء" },
  22: { latin: "Al-Hajj", ar: "الحج" },
  23: { latin: "Al-Mu'minun", ar: "المؤمنون" },
  24: { latin: "An-Nur", ar: "النور" },
  25: { latin: "Al-Furqan", ar: "الفرقان" },
  26: { latin: "Ash-Shu'ara", ar: "الشعراء" },
  27: { latin: "An-Naml", ar: "النمل" },
  28: { latin: "Al-Qasas", ar: "القصص" },
  29: { latin: "Al-Ankabut", ar: "العنكبوت" },
  30: { latin: "Ar-Rum", ar: "الروم" },
  31: { latin: "Luqman", ar: "لقمان" },
  32: { latin: "As-Sajdah", ar: "السجدة" },
  33: { latin: "Al-Ahzab", ar: "الأحزاب" },
  34: { latin: "Saba", ar: "سبأ" },
  35: { latin: "Fatir", ar: "فاطر" },
  36: { latin: "Ya-Sin", ar: "يس" },
  37: { latin: "As-Saffat", ar: "الصافات" },
  38: { latin: "Sad", ar: "ص" },
  39: { latin: "Az-Zumar", ar: "الزمر" },
  40: { latin: "Ghafir", ar: "غافر" },
  41: { latin: "Fussilat", ar: "فصلت" },
  42: { latin: "Ash-Shura", ar: "الشورى" },
  43: { latin: "Az-Zukhruf", ar: "الزخرف" },
  44: { latin: "Ad-Dukhan", ar: "الدخان" },
  45: { latin: "Al-Jathiyah", ar: "الجاثية" },
  46: { latin: "Al-Ahqaf", ar: "الأحقاف" },
  47: { latin: "Muhammad", ar: "محمد" },
  48: { latin: "Al-Fath", ar: "الفتح" },
  49: { latin: "Al-Hujurat", ar: "الحجرات" },
  50: { latin: "Qaf", ar: "ق" },
  51: { latin: "Adh-Dhariyat", ar: "الذاريات" },
  52: { latin: "At-Tur", ar: "الطور" },
  53: { latin: "An-Najm", ar: "النجم" },
  54: { latin: "Al-Qamar", ar: "القمر" },
  55: { latin: "Ar-Rahman", ar: "الرحمن" },
  56: { latin: "Al-Waqi'ah", ar: "الواقعة" },
  57: { latin: "Al-Hadid", ar: "الحديد" },
  58: { latin: "Al-Mujadila", ar: "المجادلة" },
  59: { latin: "Al-Hashr", ar: "الحشر" },
  60: { latin: "Al-Mumtahanah", ar: "الممتحنة" },
  61: { latin: "As-Saff", ar: "الصف" },
  62: { latin: "Al-Jumu'ah", ar: "الجمعة" },
  63: { latin: "Al-Munafiqun", ar: "المنافقون" },
  64: { latin: "At-Taghabun", ar: "التغابن" },
  65: { latin: "At-Talaq", ar: "الطلاق" },
  66: { latin: "At-Tahrim", ar: "التحريم" },
  67: { latin: "Al-Mulk", ar: "الملك" },
  68: { latin: "Al-Qalam", ar: "القلم" },
  69: { latin: "Al-Haqqah", ar: "الحاقة" },
  70: { latin: "Al-Ma'arij", ar: "المعارج" },
  71: { latin: "Nuh", ar: "نوح" },
  72: { latin: "Al-Jinn", ar: "الجن" },
  73: { latin: "Al-Muzzammil", ar: "المزمل" },
  74: { latin: "Al-Muddaththir", ar: "المدثر" },
  75: { latin: "Al-Qiyamah", ar: "القيامة" },
  76: { latin: "Al-Insan", ar: "الإنسان" },
  77: { latin: "Al-Mursalat", ar: "المرسلات" },
  78: { latin: "An-Naba", ar: "النبأ" },
  79: { latin: "An-Nazi'at", ar: "النازعات" },
  80: { latin: "Abasa", ar: "عبس" },
  81: { latin: "At-Takwir", ar: "التكوير" },
  82: { latin: "Al-Infitar", ar: "الانفطار" },
  83: { latin: "Al-Mutaffifin", ar: "المطففين" },
  84: { latin: "Al-Inshiqaq", ar: "الانشقاق" },
  85: { latin: "Al-Buruj", ar: "البروج" },
  86: { latin: "At-Tariq", ar: "الطارق" },
  87: { latin: "Al-A'la", ar: "الأعلى" },
  88: { latin: "Al-Ghashiyah", ar: "الغاشية" },
  89: { latin: "Al-Fajr", ar: "الفجر" },
  90: { latin: "Al-Balad", ar: "البلد" },
  91: { latin: "Ash-Shams", ar: "الشمس" },
  92: { latin: "Al-Lail", ar: "الليل" },
  93: { latin: "Ad-Duha", ar: "الضحى" },
  94: { latin: "Ash-Sharh", ar: "الشرح" },
  95: { latin: "At-Tin", ar: "التين" },
  96: { latin: "Al-Alaq", ar: "العلق" },
  97: { latin: "Al-Qadr", ar: "القدر" },
  98: { latin: "Al-Bayyinah", ar: "البينة" },
  99: { latin: "Az-Zalzalah", ar: "الزلزلة" },
  100: { latin: "Al-Adiyat", ar: "العاديات" },
  101: { latin: "Al-Qari'ah", ar: "القارعة" },
  102: { latin: "At-Takathur", ar: "التكاثر" },
  103: { latin: "Al-Asr", ar: "العصر" },
  104: { latin: "Al-Humazah", ar: "الهمزة" },
  105: { latin: "Al-Fil", ar: "الفيل" },
  106: { latin: "Quraysh", ar: "قريش" },
  107: { latin: "Al-Ma'un", ar: "الماعون" },
  108: { latin: "Al-Kawthar", ar: "الكوثر" },
  109: { latin: "Al-Kafirun", ar: "الكافرون" },
  110: { latin: "An-Nasr", ar: "النصر" },
  111: { latin: "Al-Masad", ar: "المسد" },
  112: { latin: "Al-Ikhlas", ar: "الإخلاص" },
  113: { latin: "Al-Falaq", ar: "الفلق" },
  114: { latin: "An-Nas", ar: "الناس" },
};

function getSurahName(surah) {
  const info = SURAH_NAMES[Number(surah)];

  if (!info) {
    return state.language === "ar"
      ? "سورة " + formatNumber(Number(surah))
      : "Surah " + formatNumber(Number(surah));
  }

  return state.language === "ar" ? info.ar : info.latin;
}

const MADINAH_SURAHS = new Set([
  2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 55,
  57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 99, 110,
]);

function getRevelationLabel(surah) {
  const madinah = MADINAH_SURAHS.has(Number(surah));

  if (state.language === "id") {
    return madinah ? "Madaniyah" : "Makkiyah";
  }

  if (state.language === "ar") {
    return madinah ? "مدنية" : "مكية";
  }

  return madinah ? "Medinan" : "Meccan";
}

const SURAH_SLUGS = {
  1: "al-fateha",
  2: "al-baqarah",
  3: "al-imran",
  4: "an-nisa",
  5: "al-maeda",
  6: "al-anam",
  7: "al-araf",
  8: "al-anfal",
  9: "at-taubah",
  10: "yunus",
  11: "hud",
  12: "yusuf",
  13: "ar-rad",
  14: "ibrahim",
  15: "al-hijr",
  16: "an-nahl",
  17: "al-isra",
  18: "al-kahf",
  19: "maryam",
  20: "ta-ha",
  21: "al-anbiya",
  22: "al-hajj",
  23: "al-mumenoon",
  24: "an-nur",
  25: "al-furqan",
  26: "ash-shuara",
  27: "an-naml",
  28: "al-qasas",
  29: "al-ankaboot",
  30: "ar-rum",
  31: "luqman",
  32: "as-sajda",
  33: "al-ahzab",
  34: "saba",
  35: "fatir",
  36: "yaseen",
  37: "as-saffat",
  38: "sad",
  39: "az-zumar",
  40: "ghafir",
  41: "fussilat",
  42: "ash-shura",
  43: "az-zukhruf",
  44: "ad-dukhan",
  45: "al-jathiya",
  46: "al-ahqaf",
  47: "muhammad",
  48: "al-fath",
  49: "al-hujraat",
  50: "qaf",
  51: "adh-dhariyat",
  52: "at-tur",
  53: "an-najm",
  54: "al-qamar",
  55: "ar-rahman",
  56: "al-waqia",
  57: "al-hadid",
  58: "al-mujadila",
  59: "al-hashr",
  60: "al-mumtahina",
  61: "as-saff",
  62: "al-jumua",
  63: "al-munafiqoon",
  64: "at-taghabun",
  65: "at-talaq",
  66: "at-tahrim",
  67: "al-mulk",
  68: "al-qalam",
  69: "al-haaqqa",
  70: "al-maarij",
  71: "nuh",
  72: "al-jinn",
  73: "al-muzzammil",
  74: "al-muddathir",
  75: "al-qiyama",
  76: "al-insan",
  77: "al-mursalat",
  78: "an-naba",
  79: "an-naziat",
  80: "abasa",
  81: "at-takwir",
  82: "al-infitar",
  83: "al-mutaffifin",
  84: "al-inshiqaq",
  85: "al-burooj",
  86: "at-tariq",
  87: "al-ala",
  88: "al-ghashiya",
  89: "al-fajr",
  90: "al-balad",
  91: "ash-shams",
  92: "al-layl",
  93: "ad-duha",
  94: "al-inshirah",
  95: "at-tin",
  96: "al-alaq",
  97: "al-qadr",
  98: "al-bayyina",
  99: "al-zalzala",
  100: "al-adiyat",
  101: "al-qariah",
  102: "at-takathur",
  103: "al-asr",
  104: "al-humazah",
  105: "al-fil",
  106: "quraysh",
  107: "al-maun",
  108: "al-kawthar",
  109: "al-kafirun",
  110: "an-nasr",
  111: "al-masad",
  112: "al-ikhlas",
  113: "al-falaq",
  114: "an-nas",
};

function getClientSurahUrl(surah) {
  const slug = SURAH_SLUGS[Number(surah)];

  return slug
    ? `https://www.readquranforpeace.net/quran/${slug}`
    : "https://www.readquranforpeace.net/quran";
}

function getFilteredOccurrences(term) {
  return term.evidence?.occurrences || [];
}

function renderLanguageSelector() {
  const switcher = $("language-switch");

  if (!switcher) {
    return;
  }

  switcher.querySelectorAll(".language-option").forEach((button) => {
    const active = button.dataset.language === state.language;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setText(id, value) {
  const element = $(id);

  if (element) {
    element.textContent = value;
  }
}

function getUxText(key) {
  const texts = {
    id: {
      whatObserved: "Apa yang kita amati?",

      whatObservedDescription:
        "Ringkasan hasil yang benar-benar terukur dari corpus yang dianalisis.",

      quranNavigation: "Navigasi Quran",

      surahExplorer: "Penjelajah Surah",

      surahExplorerDescription:
        "Lihat bagaimana term tersebar di 114 surah. Pilih titik untuk membuka evidence.",

      surahExplorerCaption: "Setiap titik mewakili satu Surah",

      behindObservation: "Di balik observasi",

      numbersBehindObservation: "Angka di balik observasi",

      methodGuide: "Panduan metode",

      traceResult: "Telusuri hasil",

      exploratoryComparison: "Perbandingan eksploratif",

      auditTrail: "Jejak metodologi",

      methodScope:
        "Ruang lingkup saat ini berfokus pada observasi matematis berbasis data. Struktur dataset dan alur evidence dirancang agar tema berikutnya dapat ditambahkan tanpa mengubah fondasi navigasi Quran.",

      surahs: "surah",

      evidencePathFinding: "Temuan",
      evidencePathVerse: "Ayat",
      evidencePathMatch: "Token cocok",
      evidencePathSource: "Sumber",
      evidenceJourney: "Alur evidence",
      evidenceAuditDataset: "Dataset",
      evidenceAuditNormalization: "Normalisasi",
      evidenceAuditRule: "Aturan hitung",
      evidenceAuditVerification: "Verifikasi",

      openClient: "Buka di Read Quran for Peace ↗",

      exampleVerse: "Ayat contoh",

      translation: "Arti",

      translationSource: "Sumber terjemahan: QuranEnc · id-affairs",

      noEvidence: "Tidak ada evidence untuk pilihan ini.",

      noRecords: "Tidak ada record evidence.",

      allOccurrences: "semua occurrence",
    },

    en: {
      whatObserved: "What did we observe?",

      whatObservedDescription:
        "A summary of the results directly measured from the analyzed corpus.",

      quranNavigation: "Quran navigation",

      surahExplorer: "Surah Explorer",

      surahExplorerDescription:
        "See how the term is distributed across 114 surahs. Select a point to inspect evidence.",

      surahExplorerCaption: "Each point represents one Surah",

      behindObservation: "Behind the observation",

      numbersBehindObservation: "Numbers behind the observation",

      methodGuide: "Method guide",

      traceResult: "Trace the result",

      exploratoryComparison: "Exploratory comparison",

      auditTrail: "Methodology trace",

      methodScope:
        "The current scope focuses on data-driven mathematical observations. The dataset and evidence flow are designed so future themes can be added without changing the Quran navigation foundation.",

      surahs: "surahs",

      evidencePathFinding: "Finding",
      evidencePathVerse: "Verse",
      evidencePathMatch: "Matched token",
      evidencePathSource: "Source",
      evidenceJourney: "Evidence journey",
      evidenceAuditDataset: "Dataset",
      evidenceAuditNormalization: "Normalization",
      evidenceAuditRule: "Counting rule",
      evidenceAuditVerification: "Verification",

      openClient: "Open in Read Quran for Peace ↗",

      exampleVerse: "Example verse",

      translation: "Translation",

      translationSource: "Translation source: QuranEnc · en-saheeh",

      noEvidence: "No evidence for this selection.",

      noRecords: "No evidence records available.",

      allOccurrences: "all occurrences",
    },

    ar: {
      whatObserved: "ما الذي لاحظناه؟",

      whatObservedDescription:
        "ملخص للنتائج المقاسة مباشرة من مجموعة البيانات التي تم تحليلها.",

      quranNavigation: "التنقل في القرآن",

      surahExplorer: "مستكشف السور",

      surahExplorerDescription:
        "شاهد كيفية توزيع المصطلح عبر ١١٤ سورة. اختر نقطة لفحص الدليل.",

      surahExplorerCaption: "كل نقطة تمثل سورة واحدة",

      behindObservation: "خلف الملاحظة",

      numbersBehindObservation: "الأرقام خلف الملاحظة",

      methodGuide: "دليل المنهج",

      traceResult: "تتبع النتيجة",

      exploratoryComparison: "مقارنة استكشافية",

      auditTrail: "مسار المنهجية",

      methodScope:
        "يركز النطاق الحالي على الملاحظات الرياضية المستندة إلى البيانات. وقد صُمم هيكل البيانات ومسار الدليل بحيث يمكن إضافة الموضوعات المستقبلية دون تغيير أساس التنقل في القرآن.",

      surahs: "سور",

      evidencePathFinding: "النتيجة",
      evidencePathVerse: "الآية",
      evidencePathMatch: "الرمز المطابق",
      evidencePathSource: "المصدر",
      evidenceJourney: "مسار الدليل",
      evidenceAuditDataset: "مجموعة البيانات",
      evidenceAuditNormalization: "التطبيع",
      evidenceAuditRule: "قاعدة العد",
      evidenceAuditVerification: "التحقق",

      openClient: "فتح في اقرأ القرآن للسلام ↗",

      exampleVerse: "الآية",

      translation: "الترجمة",

      translationSource: "مصادر الترجمة: QuranEnc",

      noEvidence: "لا توجد أدلة لهذا الاختيار.",

      noRecords: "لا توجد سجلات.",

      allOccurrences: "جميع مرات الظهور",
    },
  };

  return texts[state.language]?.[key] ?? texts.en[key] ?? key;
}

function renderStaticText() {
  setText("brand-kicker", t("brandKicker"));

  setText("page-title", t("pageTitle"));

  setText("page-subtitle", t("subtitle"));

  setText("language-label", t("language"));

  const corpus = state.data?.corpus;

  if (corpus) {
    const corpusBadge = $("corpus-badge");

    if (corpusBadge) {
      corpusBadge.textContent =
        state.language === "ar"
          ? `${formatNumber(corpus.chapters)} سورة · ${formatNumber(
              corpus.verses,
            )} آية`
          : state.language === "id"
            ? `${formatNumber(corpus.chapters)} surah · ${formatNumber(
                corpus.verses,
              )} ayat`
            : `${formatNumber(corpus.chapters)} surahs · ${formatNumber(
                corpus.verses,
              )} verses`;
    }
  }

  setText(
    "analytical-terms-title",
    `${t("analyticalTerms")} (${state.data?.terms?.length || 0})`,
  );

  const termsClose = $("terms-close");

  if (termsClose) {
    termsClose.setAttribute("aria-label", t("closeTerms"));
  }

  setText("feature-eyebrow", t("selectedObservation"));

  setText("open-quran", t("openQuranIndex"));

  setText("explore-evidence", t("exploreEvidence"));

  setText("observation-kicker", getUxText("whatObserved"));

  setText("observation-title", getUxText("whatObserved"));

  setText("observation-description", getUxText("whatObservedDescription"));

  setText("explorer-kicker", getUxText("quranNavigation"));

  setText("distribution-title", getUxText("surahExplorer"));

  setText("distribution-description", getUxText("surahExplorerDescription"));

  setText("chart-caption", getUxText("surahExplorerCaption"));

  setText("numerical-kicker", getUxText("behindObservation"));

  setText("numerical-title", getUxText("numbersBehindObservation"));

  setText("numerical-description", t("numericalDescription"));

  setText("learn-kicker", getUxText("methodGuide"));

  setText("evidence-kicker", getUxText("traceResult"));

  setText("evidence-title", t("verseEvidence"));

  setText("evidence-description", t("verseEvidenceDescription"));

  setText("surah-label", t("surahDistribution"));

  setText("jump-label", t("jumpOccurrence"));

  setText("previous-evidence", `← ${t("previous")}`);

  setText("next-evidence", `${t("next")} →`);

  setText("pairs-kicker", getUxText("exploratoryComparison"));

  setText("pairs-title", t("exploratoryPairs"));

  setText("pairs-description", t("exploratoryPairsDescription"));

  setText("methodology-kicker", getUxText("auditTrail"));

  setText("methodology-title", t("methodology"));

  setText("learn-title", t("learnMetrics"));

  setText("learn-description", t("learnMetricsDescription"));

  const search = $("term-search");

  if (search) {
    search.placeholder = t("searchPlaceholder");

    search.dir = "auto";
  }
}

function renderTermList(filter = "") {
  const needle = filter.trim().toLowerCase();

  const matched = state.data.terms.filter((term) => {
    const metadata = term.metadata || {};

    const searchable = [
      term.word,
      metadata.transliteration || "",
      metadata.meaning_id || "",
      metadata.meaning_en || "",
      metadata.meaning_ar || "",
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(needle);
  });

  const categoryOrder = ["time", "life", "nature", "people", "faith"];

  matched.sort((a, b) => {
    const ai = categoryOrder.indexOf(a.category);
    const bi = categoryOrder.indexOf(b.category);

    const categoryCompare = (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);

    if (categoryCompare !== 0) {
      return categoryCompare;
    }

    return a.rank - b.rank;
  });

  const groups = {};

  for (const term of matched) {
    const category = term.category || "uncategorized";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(term);
  }

  let html = "";

  for (const category of categoryOrder) {
    const terms = groups[category];

    if (!terms?.length) {
      continue;
    }

    const labelKey = `category_${category}`;
    const panelId = `term-category-${category}`;
    const searchOpen = Boolean(needle);
    const expanded = searchOpen || state.expandedCategory === category;

    html += `
      <section class="term-category">
        <button
          class="term-category-header"
          type="button"
          aria-expanded="${expanded}"
          aria-controls="${panelId}"
          data-category="${escapeHtml(category)}"
        >
          <span class="term-category-title">
            ${escapeHtml(t(labelKey))}
          </span>

          <span class="term-category-meta">
            <span class="term-category-count">
              ${formatNumber(terms.length)}
            </span>

            <span class="term-category-chevron" aria-hidden="true">⌄</span>
          </span>
        </button>

        <div
          id="${panelId}"
          class="term-category-items"
          ${expanded ? "" : "hidden"}
        >
          ${terms
            .map((term) => {
              const metadata = term.metadata || {};

              return `
                <button
                  class="term-button ${
                    term.word === state.selectedWord ? "active" : ""
                  }"
                  data-word="${escapeHtml(term.word)}"
                  data-category="${escapeHtml(category)}"
                  type="button"
                >
                  <span class="term-copy">
                    <span class="term-word">
                      ${escapeHtml(term.word)}
                    </span>

                    ${
                      state.language === "ar"
                        ? ""
                        : `
                    <span class="term-latin">
                      ${escapeHtml(metadata.transliteration || "")}
                    </span>
                  `
                    }

                    <span class="term-meaning">
                      ${escapeHtml(getMeaning(term))}
                    </span>
                  </span>

                  <span class="term-count">
                    ${formatNumber(term.count)}
                  </span>
                </button>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  const list = $("term-list");

  if (!list) {
    return;
  }

  list.innerHTML = html;

  list.querySelectorAll(".term-category-header").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;

      state.expandedCategory =
        state.expandedCategory === category ? null : category;

      renderTermList($("term-search")?.value || "");
    });
  });

  list.querySelectorAll(".term-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedWord = button.dataset.word;
      state.expandedCategory = button.dataset.category;
      state.evidenceIndex = 0;
      state.evidenceSurah = "all";

      render();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  });
}

function renderFeatureVerse(term, occurrence = null) {
  const reference = $("feature-reference");

  if (!reference) {
    return;
  }

  let container = $("feature-verse");

  if (!container) {
    container = document.createElement("div");

    container.id = "feature-verse";

    container.className = "feature-verse";

    reference.insertAdjacentElement("afterend", container);
  }

  if (!occurrence) {
    container.innerHTML = "";

    return;
  }

  const translations = getVerseTranslations(occurrence.surah, occurrence.ayah);

  let translationHtml = "";

  /*
   * Indonesian mode
   */
  if (state.language === "id" && translations.id) {
    translationHtml = `
      <div
        class="feature-verse-translation-label"
      >
        ${escapeHtml(getUxText("translation"))}
      </div>

      <p
        class="feature-verse-translation"
        dir="ltr"
      >
        ${escapeHtml(translations.id)}
      </p>

      <div
        class="feature-verse-source"
      >
        ${escapeHtml(getUxText("translationSource"))}
      </div>
    `;
  }

  /*
   * English mode
   */
  if (state.language === "en" && translations.en) {
    translationHtml = `
      <div
        class="feature-verse-translation-label"
      >
        ${escapeHtml(getUxText("translation"))}
      </div>

      <p
        class="feature-verse-translation"
        dir="ltr"
      >
        ${escapeHtml(translations.en)}
      </p>

      <div
        class="feature-verse-source"
      >
        ${escapeHtml(getUxText("translationSource"))}
      </div>
    `;
  }

  /*
   * Arabic mode
   * The Arabic translation is loaded after the verse shell
   * has been rendered so it cannot block initial application load.
   */
  if (state.language === "ar") {
    translationHtml = `
      <div
        class="feature-verse-translation-label"
      >
        ${escapeHtml(getUxText("translation"))}
      </div>

      <p
        class="feature-verse-translation arabic-translation-content"
        dir="rtl"
      >
        جارٍ تحميل ترجمة المعاني…
      </p>

      <div
        class="feature-verse-source"
      >
        ${escapeHtml(getUxText("translationSource"))}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="feature-verse-heading">
      ${escapeHtml(getUxText("exampleVerse"))}
    </div>

    <div class="feature-verse-ref">
      ${
        state.language === "ar"
          ? `السورة ${formatNumber(Number(occurrence.surah))} · الآية ${formatNumber(
              Number(occurrence.ayah),
            )}`
          : `Surah ${formatNumber(Number(occurrence.surah))} · ${getVerseLabel()} ${formatNumber(
              Number(occurrence.ayah),
            )}`
      }
    </div>

    <div class="feature-verse-surah-name">
      <span>${escapeHtml(getSurahName(occurrence.surah))}</span>
      <span class="surah-revelation">${escapeHtml(getRevelationLabel(occurrence.surah))}</span>
    </div>

    <p
      class="feature-verse-arabic"
      dir="rtl"
    >
      ${renderEvidenceText(occurrence.text, occurrence.token_index)}
    </p>

    ${translationHtml}
  `;

  /*
   * Load Arabic translation only after the verse shell exists.
   */
  if (state.language === "ar") {
    const target = container.querySelector(".arabic-translation-content");

    if (target) {
      const requestedLanguage = state.language;
      const requestedTerm = term.word;
      const requestedSurah = Number(occurrence.surah);
      const requestedAyah = Number(occurrence.ayah);

      fetchArabicTranslation(requestedSurah, requestedAyah)
        .then((translation) => {
          if (
            state.language !== requestedLanguage ||
            state.selectedWord !== requestedTerm
          ) {
            return;
          }

          target.textContent = translation || "تعذر تحميل ترجمة المعاني.";
        })
        .catch(() => {
          if (
            state.language !== requestedLanguage ||
            state.selectedWord !== requestedTerm
          ) {
            return;
          }

          target.textContent = "تعذر تحميل ترجمة المعاني.";
        });
    }
  }
}

function renderHero(term) {
  const metadata = term.metadata || {};

  const firstOccurrence = term.evidence?.occurrences?.[0];

  const surahCount = term.distribution.summary.surahs_with_occurrences;

  const totalSurahs = 114;

  const count = term.count;

  $("feature-word").textContent = term.word;

  $("feature-meta").innerHTML =
    state.language === "ar"
      ? `
      <span class="feature-meaning">
        المعنى · ${escapeHtml(getMeaning(term))}
      </span>
    `
      : `
      <span class="feature-latin">
        ${escapeHtml(metadata.transliteration || "")}
      </span>

      <span class="feature-separator">
        ·
      </span>

      <span class="feature-meaning">
        ${escapeHtml(getMeaning(term))}
      </span>
    `;

  $("feature-reference").textContent = firstOccurrence
    ? state.language === "ar"
      ? `${t("firstRecorded")}: السورة ${formatNumber(
          firstOccurrence.surah,
        )} · الآية ${formatNumber(firstOccurrence.ayah)}`
      : `${t("firstRecorded")}: Surah ${formatNumber(
          firstOccurrence.surah,
        )} · ${getVerseLabel()} ${formatNumber(firstOccurrence.ayah)}`
    : "";

  const featureSignal = $("feature-signal");

  if (featureSignal) {
    const coverage =
      state.language === "ar"
        ? `${formatNumber(surahCount)} من ${formatNumber(
            totalSurahs,
          )} سورة`
        : state.language === "id"
          ? `${formatNumber(surahCount)} dari ${formatNumber(
              totalSurahs,
            )} surah`
          : `${formatNumber(surahCount)} of ${formatNumber(
              totalSurahs,
            )} surahs`;

    featureSignal.innerHTML = `
      <strong>${formatNumber(count)}×</strong>
      <span>${escapeHtml(t("observedOccurrences"))}</span>
      <span class="feature-signal-divider">·</span>
      <span>${escapeHtml(coverage)}</span>
    `;
  }

  const featureMethod = $("feature-method");

  if (featureMethod) {
    featureMethod.innerHTML = `
      <span class="feature-method-mark">✓</span>
      <span>${escapeHtml(t("methodBadge"))}</span>
    `;
  }

  const featureVerification = $("feature-verification");

  if (featureVerification) {
    const verification = state.data?.verification?.cross_corpus || {};
    const verified = Number(verification.terms_verified || 0);
    const discrepancies = Number(verification.discrepancies || 0);

    featureVerification.innerHTML = `
      <span class="feature-verification-mark">✓</span>
      <span>${escapeHtml(
        t("verificationBadge")
          .replace("{verified}", formatNumber(verified))
          .replace("{total}", formatNumber(32))
          .replace("{discrepancies}", formatNumber(discrepancies)),
      )}</span>
    `;
  }

  renderFeatureVerse(term, firstOccurrence);

  const openQuran = $("open-quran");

  if (openQuran) {
    openQuran.href = getClientSurahUrl(firstOccurrence?.surah);
  }

  const observationTerm = $("observation-term");

  if (observationTerm) {
    observationTerm.textContent = getMeaning(term);
  }

  const observationDescription = $("observation-description");

  if (observationDescription) {
    const digitSum = term.numerical?.derived_metrics?.digit_sum;

    const digitExpression = String(count)
    .split("")
    .map((digit) => formatNumber(digit))
    .join(" + ");

    observationDescription.textContent =
      state.language === "id"
        ? `Dalam corpus yang dianalisis, term ini muncul ${formatNumber(
            count,
          )} kali dan ditemukan setidaknya sekali di ${formatNumber(
            surahCount,
          )} dari ${formatNumber(
            totalSurahs,
          )} surah. Sifat numeriknya: ${digitExpression} = ${formatNumber(
            digitSum,
          )}.`
        : state.language === "ar"
          ? `في مجموعة البيانات التي تم تحليلها، ظهر هذا المصطلح ${formatNumber(
              count,
            )} مرة وظهر في ${formatNumber(surahCount)} من أصل ${formatNumber(
              totalSurahs,
            )} سورة. الخاصية الرقمية: ${digitExpression} = ${formatNumber(
              digitSum,
            )}.`
          : `In the analyzed corpus, this term appears ${formatNumber(
              count,
            )} times and occurs in ${formatNumber(
              surahCount,
            )} of ${formatNumber(
              totalSurahs,
            )} surahs. Its numerical property is ${digitExpression} = ${formatNumber(
              digitSum,
            )}.`;
  }

  const stats = $("stats");

  if (!stats) {
    return;
  }

  stats.innerHTML = `
  <article
    class="stat observation-stat"
  >

    <div
      class="
        stat-value
        observation-stat-number
      "
    >
      ${formatNumber(count)}×
    </div>

    <div class="stat-label">
      ${t("statOccurrencesTitle")}
    </div>

    <div class="stat-unit">
      ${t("statOccurrencesUnit")}
    </div>

    <div class="stat-explanation">
      ${escapeHtml(t("statOccurrencesDesc"))}
    </div>

  </article>


  <article
    class="stat observation-stat"
  >

    <div
      class="
        stat-value
        observation-stat-number
      "
    >
      ${formatNumber(surahCount)}
    </div>

    <div class="stat-label">
      ${t("statSurahTitle")}
    </div>

    <div class="stat-unit">
      ${
        state.language === "id"
          ? `dari ${formatNumber(totalSurahs)} ${t("statSurahUnit")}`
          : state.language === "ar"
            ? `من ${formatNumber(totalSurahs)} ${t("statSurahUnit")}`
            : `of ${formatNumber(totalSurahs)} ${t("statSurahUnit")}`
      }
    </div>

    <div class="stat-explanation">
      ${escapeHtml(t("statSurahDesc"))}
    </div>

  </article>


  <article
    class="stat observation-stat"
  >

    <div
      class="
        stat-value
        observation-stat-number
        stat-property-value
      "
    >
      ${formatNumber(count)}
      <span class="arrow">→</span>
      ${formatNumber(term.numerical.derived_metrics.digit_sum)}
    </div>

    <div class="stat-label">
      ${t("statNumberPropertyTitle")}
    </div>

    <div class="stat-unit">
      ${t("statNumberPropertyUnit")}
    </div>

    <div class="stat-explanation">
      ${escapeHtml(t("statNumberPropertyDesc"))}
    </div>

  </article>
`;
}

function renderNumerical(term) {
  const metrics = term.numerical?.derived_metrics || {};

  const rows = [
    [t("frequency"), formatNumber(term.count), t("metricFrequencyDesc")],

    [
      t("metricParity"),
      metrics.parity === "odd"
        ? state.language === "ar"
          ? "فردي"
          : state.language === "id"
            ? "ganjil"
            : "odd"
        : state.language === "ar"
          ? "زوجي"
          : state.language === "id"
            ? "genap"
            : "even",
      t("metricParityDesc"),
    ],

    [
      t("digitSum"),
      formatNumber(metrics.digit_sum || 0),
      t("metricDigitSumDesc"),
    ],

    [
      t("per1000"),
      formatDecimal(metrics.frequency_per_1000_tokens ?? 0, 4),
      t("metricPer1000Desc"),
    ],

    [
      t("metricVerseShare"),
      `${formatDecimal(metrics.count_as_percentage_of_verse_total ?? 0, 4)}٪`,
      t("metricVerseShareDesc"),
    ],
  ];

  const list = $("numerical-metrics");

  if (!list) {
    return;
  }

  list.innerHTML = rows
    .map(
      ([name, value, help]) => `
          <div class="metric-row">

            <div class="metric-name-wrap">

              <span class="metric-name">
                ${escapeHtml(name)}
              </span>

              <button
                class="metric-info"
                type="button"
                aria-expanded="false"
                aria-label="${escapeHtml(name)}"
              >
                i
              </button>

            </div>

            <span class="metric-value">
              ${escapeHtml(value)}
            </span>

            <div
              class="metric-help"
              hidden
            >
              ${escapeHtml(help)}
            </div>

          </div>
        `,
    )
    .join("");

  list.querySelectorAll(".metric-info").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".metric-row");

      const help = row?.querySelector(".metric-help");

      if (!help) {
        return;
      }

      const expanded = button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!expanded));

      help.hidden = expanded;

      row.classList.toggle("metric-expanded", !expanded);
    });
  });
}

function renderSurahExplorerSummary(term) {
  const element = $("surah-explorer-summary");

  if (!element) {
    return;
  }

  const summary = term.distribution?.summary || {};

  const matched = summary.surahs_with_occurrences || 0;

  const frequency = term.count || 0;

  element.innerHTML = `
    <strong>
      ${formatNumber(matched)}
    </strong>

    <span>
      ${escapeHtml(getUxText("surahs"))}
    </span>

    <small>
      ${formatNumber(frequency)}
      ${escapeHtml(t("occurrences"))}
    </small>
  `;
}

function getEvidenceLocationLabel(occurrence) {
  if (!occurrence) {
    return "—";
  }

  if (state.language === "ar") {
    return `السورة ${formatNumber(occurrence.surah)} · الآية ${formatNumber(occurrence.ayah)}`;
  }

  if (state.language === "id") {
    return `Surah ${formatNumber(occurrence.surah)} · Ayat ${formatNumber(occurrence.ayah)}`;
  }

  return `Surah ${formatNumber(occurrence.surah)} · Verse ${formatNumber(occurrence.ayah)}`;
}

function updateSurahFilterDisplay(occurrence = null) {
  const display = $("surah-filter-display");
  const target = occurrence || getFilteredOccurrences(getSelectedTerm())[state.evidenceIndex];

  if (display) {
    display.textContent = getEvidenceLocationLabel(target);
  }
}

function renderSurahFilter(term) {
  const counts = term.distribution?.surahs || {};

  const options = [
    `<option value="all">
      ${escapeHtml(t("allSurahs"))}
    </option>`,
  ];

  Object.entries(counts).forEach(([surah, count]) => {
    if (count === 0) {
      return;
    }

    const name = getSurahName(surah);

    options.push(`
        <option
          value="${escapeHtml(surah)}"
          ${state.evidenceSurah === surah ? "selected" : ""}
        >
          ${escapeHtml(name)} · ${formatNumber(count)}
        </option>
      `);
  });

  const select = $("surah-filter");

  if (select) {
    select.innerHTML = options.join("");
  }

  updateSurahFilterDisplay();
}

function renderEvidence(term) {
  const filtered = getFilteredOccurrences(term);

  const total = filtered.length;

  const trace = $("evidence-trace");

  if (trace) {
    trace.innerHTML = "";
  }

  if (!total) {
    renderFeatureVerse(term, null);

    setText("evidence-counter", `0 ${t("occurrences")}`);

    setText("evidence-summary", getUxText("noEvidence"));

    const list = $("evidence-list");

    if (list) {
      list.innerHTML = `
        <div
          class="evidence-item"
        >
          ${escapeHtml(getUxText("noRecords"))}
        </div>
      `;
    }

    const jump = $("evidence-jump");

    if (jump) {
      jump.value = 0;
    }

    updateEvidenceNavigation(0);
    return;
  }

  if (state.evidenceIndex >= total) {
    state.evidenceIndex = total - 1;
  }

  const current = filtered[state.evidenceIndex];

  const directUrl = getClientSurahUrl(current.surah);

  if (trace) {
    const verseReference =
      state.language === "ar"
        ? `السورة ${formatNumber(current.surah)} · ${formatNumber(current.ayah)}`
        : `Surah ${formatNumber(current.surah)} · ${getVerseLabel()} ${formatNumber(current.ayah)}`;

    const auditVerification = state.data?.verification?.cross_corpus || {};
    const method = term.method || state.data?.method || {};
    const totalTokens = Number(term.total_tokens_analyzed || 0);

    const normalizationItems = [];

    if (method.diacritics_removed) {
      normalizationItems.push(
        state.language === "id"
          ? "tashkeel"
          : state.language === "ar"
            ? "التشكيل"
            : "diacritics",
      );
    }

    if (method.tatweel_removed) {
      normalizationItems.push(
        state.language === "ar" ? "التطويل" : "tatweel",
      );
    }

    if (method.alif_variants_normalized) {
      normalizationItems.push(
        state.language === "id"
          ? "varian alif"
          : state.language === "ar"
            ? "أشكال الألف"
            : "alif variants",
      );
    }

    if (method.alif_maqsura_normalized) {
      normalizationItems.push(
        state.language === "id"
          ? "alif maqsura"
          : state.language === "ar"
            ? "الألف المقصورة"
            : "alif maqsura",
      );
    }

    const normalizationText =
      normalizationItems.join(" · ") ||
      (state.language === "id"
        ? "Aturan normalisasi terdokumentasi"
        : state.language === "ar"
          ? "قواعد التطبيع موثقة"
          : "Documented normalization rules");

    const countingRule =
      state.language === "id"
        ? "Exact normalized-token · tanpa substring"
        : state.language === "ar"
          ? "مطابقة الرمز المطبع تمامًا · دون مطابقة جزئية"
          : "Exact normalized-token · no substring matching";

    const datasetText =
      state.language === "id"
        ? `Simple Clean · ${formatNumber(totalTokens)} token`
        : state.language === "ar"
          ? `Simple Clean · ${formatNumber(totalTokens)} رمز`
          : `Simple Clean · ${formatNumber(totalTokens)} tokens`;

    const verificationText =
      state.language === "id"
        ? `${formatNumber(auditVerification.terms_verified || 0)}/32 term · ${formatNumber(auditVerification.discrepancies || 0)} discrepancy`
        : state.language === "ar"
          ? `${formatNumber(auditVerification.terms_verified || 0)}/32 · ${formatNumber(auditVerification.discrepancies || 0)} فروق`
          : `${formatNumber(auditVerification.terms_verified || 0)}/32 terms · ${formatNumber(auditVerification.discrepancies || 0)} discrepancies`;

    trace.innerHTML = `
      <div
        class="evidence-signature"
        aria-label="${escapeHtml(getUxText("evidenceJourney"))}"
      >
        <div class="evidence-signature-flow">
          <div class="evidence-signature-step evidence-signature-finding">
            <span>${escapeHtml(getUxText("evidencePathFinding"))}</span>
            <strong>${formatNumber(term.count || 0)}× <b dir="rtl">${escapeHtml(term.word)}</b></strong>
          </div>

          <span class="evidence-signature-arrow" aria-hidden="true">→</span>

          <div class="evidence-signature-step">
            <span>${escapeHtml(getUxText("evidencePathVerse"))}</span>
            <strong>${escapeHtml(verseReference)}</strong>
          </div>

          <span class="evidence-signature-arrow" aria-hidden="true">→</span>

          <div class="evidence-signature-step evidence-signature-match">
            <span>${escapeHtml(getUxText("evidencePathMatch"))}</span>
            <strong dir="rtl">${escapeHtml(term.word)}</strong>
          </div>

          <span class="evidence-signature-arrow" aria-hidden="true">→</span>

          <div class="evidence-signature-step evidence-signature-source">
            <span>${escapeHtml(getUxText("evidencePathSource"))}</span>
            <a href="${directUrl}" target="_blank" rel="noopener noreferrer">
              Read Quran for Peace ↗
            </a>
          </div>
        </div>

        <details class="evidence-method-details">
          <summary>${escapeHtml(getUxText("evidenceHowCounted"))}</summary>

          <div class="evidence-method-grid">
            <div>
              <span>${escapeHtml(getUxText("evidenceAuditDataset"))}</span>
              <strong>${escapeHtml(datasetText)}</strong>
            </div>

            <div>
              <span>${escapeHtml(getUxText("evidenceAuditNormalization"))}</span>
              <strong>${escapeHtml(normalizationText)}</strong>
            </div>

            <div>
              <span>${escapeHtml(getUxText("evidenceAuditRule"))}</span>
              <strong>${escapeHtml(countingRule)}</strong>
            </div>

            <div>
              <span>${escapeHtml(getUxText("evidenceAuditVerification"))}</span>
              <strong>${escapeHtml(verificationText)}</strong>
            </div>
          </div>
        </details>
      </div>

      <span class="evidence-trace-text">
        ${escapeHtml(
          t("evidenceTrace")
            .replace("{term}", term.word)
            .replace("{count}", formatNumber(term.count || 0)),
        )}
      </span>
    `;
  }



  const translations = getVerseTranslations(current.surah, current.ayah);

  let translation = "";

  if (state.language === "id") {
    translation = translations.id;
  }

  if (state.language === "en") {
    translation = translations.en;
  }

  setText("evidence-counter", `${formatNumber(total)} ${t("occurrences")}`);

  setText(
    "evidence-summary",
    `${t("showingOccurrence")} ${formatNumber(state.evidenceIndex + 1)} ${
      state.language === "ar" ? "من" : "of"
    } ${formatNumber(total)}`,
  );

  const jump = $("evidence-jump");

  if (jump) {
    jump.value = formatNumber(state.evidenceIndex + 1);
  }

  updateEvidenceNavigation(total);
  updateSurahFilterDisplay(current);

  let translationHtml = "";

  if (translation) {
    translationHtml = `
      <div
        class="
          evidence-translation-label
        "
      >
        ${escapeHtml(getUxText("translation"))}
      </div>

      <p
        class="evidence-translation"
        dir="ltr"
      >
        ${escapeHtml(translation)}
      </p>

      <div
        class="evidence-source"
      >
        ${escapeHtml(getUxText("translationSource"))}
      </div>
    `;
  }

  if (state.language === "ar") {
    translationHtml = `
    <div class="evidence-translation-label">
      الترجمة
    </div>

    <p
      class="evidence-translation arabic-translation-content"
      dir="rtl"
    >
      جارٍ تحميل ترجمة المعاني…
    </p>

    <div class="evidence-source">
      ${escapeHtml(getUxText("translationSource"))}
    </div>
  `;
  }

  const list = $("evidence-list");

  if (!list) {
    return;
  }

  list.innerHTML = `
    <article
      class="
        evidence-item
        featured-evidence
      "
    >

      <div class="evidence-ref">
  ${
    state.language === "ar"
      ? `السورة ${formatNumber(current.surah)} · الآية ${formatNumber(current.ayah)}`
      : `Surah ${formatNumber(current.surah)} · ${getVerseLabel()} ${formatNumber(current.ayah)}`
  }
</div>

<div class="evidence-surah-name">
  <span>${escapeHtml(getSurahName(current.surah))}</span>
  <span class="surah-revelation">${escapeHtml(getRevelationLabel(current.surah))}</span>
</div>

<p
  class="evidence-text"
  dir="rtl"
>
  ${renderEvidenceText(current.text, current.token_index)}
</p>


      ${translationHtml}


      <div
        class="evidence-actions"
      >

        <a
          class="
            action
            primary
          "
          href="${directUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${escapeHtml(getUxText("openClient"))}
        </a>

      </div>


      <div
        class="evidence-index"
      >
        ${
          state.language === "ar"
            ? `سجل الدليل ${formatNumber(state.evidenceIndex + 1)} من ${formatNumber(total)}`
            : state.language === "id"
              ? `Record evidence ${formatNumber(state.evidenceIndex + 1)} dari ${formatNumber(total)}`
              : `Evidence record ${formatNumber(state.evidenceIndex + 1)} of ${formatNumber(total)}`
        }
      </div>

    </article>
  `;
  if (state.language === "ar") {
    const target = list.querySelector(".arabic-translation-content");

    if (target) {
      const requestedLanguage = state.language;
      const requestedTerm = term.word;
      const requestedSurah = Number(current.surah);
      const requestedAyah = Number(current.ayah);

      fetchArabicTranslation(requestedSurah, requestedAyah)
        .then((translation) => {
          if (
            state.language !== requestedLanguage ||
            state.selectedWord !== requestedTerm
          ) {
            return;
          }

          target.textContent = translation || "تعذر تحميل ترجمة المعاني.";
        })
        .catch(() => {
          target.textContent = "تعذر تحميل ترجمة المعاني.";
        });
    }
  }
}

function renderPairs() {
  const pairs = state.data.pair_analysis?.pairs || [];

  const list = $("pair-list");

  if (!list) {
    return;
  }

  list.innerHTML = pairs
    .map((pair) => {
      const countA = Number(pair.counts?.a || 0);

      const countB = Number(pair.counts?.b || 0);

      const difference = Number(pair.derived?.difference_a_minus_b || 0);

      const ratio = Number(pair.derived?.ratio_a_to_b || 0);

      const sharedSurahs = Number(pair.distribution?.shared_surahs || 0);

      const jaccard = Number(pair.distribution?.jaccard_overlap || 0);

      const jaccardPercent = formatDecimal(jaccard * 100, 1);

      const observation =
        state.language === "id"
          ? `Dalam corpus ini, ${pair.term_a} muncul ${formatNumber(
              countA,
            )} kali dan ${pair.term_b} ${formatNumber(
              countB,
            )} kali. Keduanya muncul dalam ${formatNumber(
              sharedSurahs,
            )} surah yang sama; overlap surah sebesar ${jaccardPercent}%.`
          : state.language === "ar"
            ? `في مجموعة البيانات هذه، ظهر ${pair.term_a} ${formatNumber(
                countA,
              )} مرة وظهر ${pair.term_b} ${formatNumber(
                countB,
              )} مرة. وظهر المصطلحان في ${formatNumber(
                sharedSurahs,
              )} سورة مشتركة؛ وبلغ تداخل السور ${jaccardPercent}٪.`
            : `In this corpus, ${pair.term_a} appears ${formatNumber(
                countA,
              )} times and ${pair.term_b} ${formatNumber(
                countB,
              )} times. The two terms appear in ${formatNumber(
                sharedSurahs,
              )} of the same surahs, with ${jaccardPercent}% surah overlap.`;

      const observationNote =
        state.language === "id"
          ? "Ini adalah observasi deskriptif; hubungan numerik tidak dengan sendirinya membuktikan sebab, makna khusus, atau status mukjizat."
          : state.language === "ar"
            ? "هذه ملاحظة وصفية؛ والعلاقة العددية وحدها لا تثبت السببية أو المعنى الخاص أو صفة الإعجاز."
            : "This is a descriptive observation; a numerical relationship alone does not establish causation, special meaning, or miraculous status.";

      return `
            <article class="pair-card">

              <div class="pair-header">

                <button
                  class="pair-select"
                  type="button"
                  data-word="${escapeHtml(pair.term_a)}"
                >
                  <span class="pair-word">
                    ${escapeHtml(pair.term_a)}
                  </span>
                </button>

                <span class="pair-arrow">
                  ↔
                </span>

                <button
                  class="pair-select"
                  type="button"
                  data-word="${escapeHtml(pair.term_b)}"
                >
                  <span class="pair-word">
                    ${escapeHtml(pair.term_b)}
                  </span>
                </button>

              </div>


              <div class="pair-frequency">

  <div class="pair-frequency-item">

    <span class="pair-frequency-value">
      ${formatNumber(countA)}
    </span>

    <span class="pair-frequency-label">
      ${escapeHtml(pair.term_a)}
      · ${t("frequency")}
    </span>

  </div>


  <div class="pair-frequency-divider">
    ${state.language === "ar" ? "مقابل" : "vs"}
  </div>


  <div class="pair-frequency-item">

    <span class="pair-frequency-value">
      ${formatNumber(countB)}
    </span>

    <span class="pair-frequency-label">
      ${escapeHtml(pair.term_b)}
      · ${t("frequency")}
    </span>

  </div>

</div>


              <div class="pair-metrics">

                <div class="pair-metric">

                  <span class="pair-metric-label">
                    ${t("metricDifference")}
                  </span>

                  <strong class="pair-metric-value">
                    ${formatNumber(difference)}
                  </strong>

                </div>


                <div class="pair-metric">

                  <span class="pair-metric-label">
                    ${t("metricRatio")}
                  </span>

                  <strong class="pair-metric-value">
  ${formatDecimal(ratio, 6)}
</strong>
                </div>


                <div class="pair-metric">

                  <span class="pair-metric-label">
                    ${t("metricSharedSurahs")}
                  </span>

                  <strong class="pair-metric-value">
                    ${formatNumber(sharedSurahs)}
                  </strong>

                </div>


                <div class="pair-metric">

                  <span class="pair-metric-label">
                    ${t("metricJaccard")}
                  </span>

                  <strong class="pair-metric-value">
  ${formatDecimal(jaccard, 6)}
</strong>
                </div>

              </div>


              <div class="pair-observation">

                <p>
                  ${escapeHtml(observation)}
                </p>

                <small>
                  ${escapeHtml(observationNote)}
                </small>

              </div>

            </article>
          `;
    })
    .join("");

  list.querySelectorAll(".pair-select").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedWord = button.dataset.word;

      const selectedTerm = state.data.terms.find(
        (term) => term.word === state.selectedWord,
      );

      state.expandedCategory = selectedTerm?.category || null;

      state.evidenceIndex = 0;

      state.evidenceSurah = "all";

      render();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  });
}

function renderMethodology() {
  const method = state.data.method;

  const value = (v) => (v ? t("trueValue") : t("falseValue"));

  const footerSource = $("footer-source");

  if (footerSource) {
    const sourceText =
      state.language === "id"
        ? "Teks Quran: Tanzil Project · Simple Clean · CC BY 3.0"
        : state.language === "ar"
          ? "نص القرآن: مشروع تنزيل · Simple Clean · CC BY 3.0"
          : "Quran text: Tanzil Project · Simple Clean · CC BY 3.0";

    footerSource.innerHTML = `
    <span>
      ${escapeHtml(sourceText)}
    </span>

    <a
      href="https://tanzil.net/"
      target="_blank"
      rel="noopener noreferrer"
    >
      tanzil.net ↗
    </a>
  `;
  }

  setText("method-matching-label", `${t("matching")}:`);

  setText("method-diacritics-label", `${t("diacritics")}:`);

  setText("method-tatweel-label", `${t("tatweel")}:`);

  setText("method-alif-label", `${t("alif")}:`);

  setText("method-root-label", `${t("rootAnalysis")}:`);

  setText("method-morphology-label", `${t("morphology")}:`);

  setText("method-substring-label", `${t("substring")}:`);

  setText(
    "method-matching",
    state.language === "ar" ? "مطابقة رمز مطبّع تمامًا" : method.matching,
  );

  setText("method-diacritics", value(method.diacritics_removed));

  setText("method-tatweel", value(method.tatweel_removed));

  setText("method-alif", value(method.alif_variants_normalized));

  setText("method-root", value(method.root_analysis));

  setText("method-morphology", value(method.morphological_analysis));

  setText("method-substring", value(method.substring_matching));

  const scope = $("method-scope");

  const verification = state.data?.verification?.cross_corpus || {};

  const verificationLabel =
    state.language === "id"
      ? "Verifikasi silang corpus"
      : state.language === "ar"
        ? "التحقق المتقاطع من corpus"
        : "Cross-corpus verification";

  const verificationText =
    state.language === "id"
      ? `${formatNumber(
          verification.terms_verified || 0,
        )}/32 term cocok antara simple-clean dan Uthmani setelah normalisasi.`
      : state.language === "ar"
        ? `${formatNumber(
            verification.terms_verified || 0,
          )}/${formatNumber(32)} مصطلحًا متطابقًا بين النصين بعد التطبيع.`
        : `${formatNumber(
            verification.terms_verified || 0,
          )}/32 terms match between simple-clean and Uthmani after normalization.`;

  const verificationStatus =
    verification.term_counts_match &&
    verification.chapters_match &&
    Number(verification.discrepancies || 0) === 0;

  if (scope) {
    const corpusSource =
      state.data?.corpus?.source || "data/raw/simple-clean.json";

    const translationSource =
      state.language === "id"
        ? "QuranEnc · id-affairs"
        : state.language === "ar"
          ? "QuranEnc"
          : "QuranEnc · en-saheeh";

    const evidenceSource =
      state.data?.sources?.frequency_index || "frequency_index.json";

    const distributionSource =
      state.data?.sources?.surah_distribution || "surah_distribution.json";

    const futureThemes =
      state.language === "id"
        ? "Tema lanjutan: komposisi cincin, sains terpilih, linguistik, peristiwa masa lalu, dan prediksi tekstual."
        : state.language === "ar"
          ? "الموضوعات المستقبلية: التركيب الحلقي، وموضوعات علمية مختارة، والبلاغة واللغة، والأحداث الماضية، والتنبؤات النصية."
          : "Future themes: ring composition, selected scientific topics, linguistic brilliance, verified past events, and textual predictions.";

    const labels =
      state.language === "id"
        ? {
            scope: "Ruang lingkup",
            source: "Provenance data",
            corpus: "Corpus",
            analytics: "Index frekuensi",
            distribution: "Distribusi Surah",
            translation: "Terjemahan",
            current:
              "Ruang lingkup saat ini berfokus pada observasi matematis berbasis data. Struktur dataset dan alur evidence dirancang agar tema berikutnya dapat ditambahkan tanpa mengubah fondasi navigasi Quran.",
          }
        : state.language === "ar"
          ? {
              scope: "النطاق",
              source: "مصدر البيانات",
              corpus: "مجموعة البيانات",
              analytics: "فهرس التكرار",
              distribution: "توزيع السور",
              translation: "الترجمة",
              current:
                "يركز النطاق الحالي على الملاحظات الرياضية المستندة إلى البيانات. وقد صُمم هيكل البيانات ومسار الدليل بحيث يمكن إضافة الموضوعات المستقبلية دون تغيير أساس التنقل في القرآن.",
            }
          : {
              scope: "Scope",
              source: "Data provenance",
              corpus: "Corpus",
              analytics: "Frequency index",
              distribution: "Surah distribution",
              translation: "Translation",
              current:
                "The current scope focuses on data-driven mathematical observations. The dataset and evidence flow are designed so future themes can be added without changing the Quran navigation foundation.",
            };

    scope.innerHTML = `
    <div class="method-scope-label">
      ${escapeHtml(labels.scope)}
    </div>

    <p>
      ${escapeHtml(labels.current)}
    </p>

    <small>
      ${escapeHtml(futureThemes)}
    </small>

          <div class="method-verification">

        <div class="method-verification-heading">

          <span>
            ${escapeHtml(verificationLabel)}
          </span>

          <strong
            class="${verificationStatus ? "verified" : "failed"}"
          >
            ${
              verificationStatus
                ? state.language === "id"
                  ? "TERVERIFIKASI"
                  : state.language === "ar"
                    ? "موثّق"
                    : "VERIFIED"
                : state.language === "id"
                  ? "PERIKSA"
                  : state.language === "ar"
                    ? "تحقق"
                    : "CHECK"
            }
          </strong>

        </div>

        <p>
          ${escapeHtml(verificationText)}
        </p>

      </div>

    <div class="method-provenance">

      <div class="method-provenance-title">
        ${escapeHtml(labels.source)}
      </div>

      <div class="method-provenance-grid">

        <div>
          <span>
            ${escapeHtml(labels.corpus)}
          </span>
          <strong>
            ${escapeHtml(corpusSource)}
          </strong>
        </div>

        <div>
          <span>
            ${escapeHtml(labels.analytics)}
          </span>
          <strong>
            ${escapeHtml(evidenceSource)}
          </strong>
        </div>

        <div>
          <span>
            ${escapeHtml(labels.distribution)}
          </span>
          <strong>
            ${escapeHtml(distributionSource)}
          </strong>
        </div>

        <div>
          <span>
            ${escapeHtml(labels.translation)}
          </span>
          <strong>
            ${escapeHtml(translationSource)}
          </strong>
        </div>

      </div>

    </div>
  `;
  }
}

function renderLearnMetrics() {
  const cards = [
    [t("metricFrequency"), t("metricFrequencyDesc")],

    [t("metricToken"), t("metricTokenDesc")],

    [t("metricExactMatch"), t("metricExactMatchDesc")],

    [t("metricDigitSum"), t("metricDigitSumDesc")],

    [t("metricParity"), t("metricParityDesc")],

    [t("metricPer1000"), t("metricPer1000Desc")],

    [t("metricDifference"), t("metricDifferenceDesc")],

    [t("metricRatio"), t("metricRatioDesc")],

    [t("metricSharedSurahs"), t("metricSharedSurahsDesc")],

    [t("metricJaccard"), t("metricJaccardDesc")],
  ];

  const list = $("learn-metrics");

  if (!list) {
    return;
  }

  list.innerHTML = cards
    .map(
      ([title, description]) => `
          <article
            class="learn-card"
          >

            <h3>
              ${escapeHtml(title)}
            </h3>

            <p>
              ${escapeHtml(description)}
            </p>

          </article>
        `,
    )
    .join("");
}

function renderD3Safe() {
  const term = getSelectedTerm();

  if (typeof window.renderD3Distribution === "function") {
    window.renderD3Distribution(term);
  }
}

function render() {
  if (!state.data) {
    return;
  }

  const term = getSelectedTerm();

  if (!term) {
    return;
  }

  renderLanguageSelector();

  renderStaticText();
  const corpus = state.data?.corpus;

  if (corpus) {
    const corpusBadge = $("corpus-badge");

    if (corpusBadge) {
      corpusBadge.textContent =
        state.language === "ar"
          ? `${formatNumber(corpus.chapters)} سورة · ${formatNumber(
              corpus.verses,
            )} آية`
          : state.language === "id"
            ? `${formatNumber(corpus.chapters)} surah · ${formatNumber(
                corpus.verses,
              )} ayat`
            : `${formatNumber(corpus.chapters)} surahs · ${formatNumber(
                corpus.verses,
              )} verses`;
    }
  }

  renderTermList($("term-search")?.value || "");

  renderHero(term);

  renderNumerical(term);

  renderSurahExplorerSummary(term);

  renderSurahFilter(term);

  renderEvidence(term);

  renderPairs();

  renderMethodology();

  renderLearnMetrics();

  renderD3Safe();
}

function updateEvidenceNavigation(total) {
  const previous = $("previous-evidence");
  const next = $("next-evidence");

  if (!previous || !next) {
    return;
  }

  const atStart = state.evidenceIndex <= 0;
  const atEnd = state.evidenceIndex >= total - 1;
  const noNavigation = total <= 1;

  previous.style.visibility = atStart || noNavigation ? "hidden" : "visible";

  next.style.visibility = atEnd || noNavigation ? "hidden" : "visible";
}

function setupMobileTermsDrawer() {
  const sidebar = $("terms-sidebar");
  const toggle = $("mobile-terms-toggle");
  const closeButton = $("terms-close");
  const backdrop = $("terms-backdrop");

  if (!sidebar || !toggle || !closeButton || !backdrop) {
    return;
  }

  const isMobile = () =>
    window.matchMedia("(max-width: 760px)").matches;

  const sync = () => {
    if (!isMobile()) {
      document.body.classList.remove("terms-drawer-open");
      sidebar.classList.remove("mobile-open");
    }

    const open =
      isMobile() && sidebar.classList.contains("mobile-open");

    toggle.setAttribute("aria-expanded", String(open));

    sidebar.setAttribute(
      "aria-hidden",
      String(isMobile() ? !open : false),
    );

    backdrop.setAttribute("aria-hidden", String(!open));
  };

  const close = () => {
    sidebar.classList.remove("mobile-open");
    document.body.classList.remove("terms-drawer-open");
    sync();
  };

  const open = () => {
    if (!isMobile()) {
      return;
    }

    sidebar.classList.add("mobile-open");
    document.body.classList.add("terms-drawer-open");
    sync();
  };

  toggle.addEventListener("click", () => {
    if (sidebar.classList.contains("mobile-open")) {
      close();
    } else {
      open();
    }
  });

  closeButton.addEventListener("click", close);

  backdrop.addEventListener("click", close);

  sidebar.addEventListener("click", (event) => {
    if (event.target.closest(".term-button")) {
      close();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("mobile-open")) {
      close();
    }
  });

  sync();
  window.addEventListener("resize", sync);
}

function setupEvidenceControls() {
  const surahFilter = $("surah-filter");

  if (surahFilter) {
    surahFilter.addEventListener("change", (event) => {
      const selectedSurah = String(event.target.value);
      const occurrences = getSelectedTerm()?.evidence?.occurrences || [];

      state.evidenceSurah = selectedSurah;

      if (selectedSurah === "all") {
        state.evidenceIndex = 0;
      } else {
        const targetIndex = occurrences.findIndex(
          (occurrence) => String(occurrence.surah) === selectedSurah,
        );

        if (targetIndex >= 0) {
          state.evidenceIndex = targetIndex;
        }
      }

      render();
    });
  }

  const previous = $("previous-evidence");

  if (previous) {
    previous.addEventListener("click", () => {
      if (state.evidenceIndex <= 0) {
        return;
      }

      state.evidenceIndex -= 1;

      renderEvidence(getSelectedTerm());
    });
  }

  const next = $("next-evidence");

  if (next) {
    next.addEventListener("click", () => {
      const filtered = getFilteredOccurrences(getSelectedTerm());

      if (state.evidenceIndex >= filtered.length - 1) {
        return;
      }

      state.evidenceIndex += 1;

      renderEvidence(getSelectedTerm());
    });
  }
}

async function loadAnalytics() {
  try {
    state.language = setLanguage(state.language) ? state.language : "en";

    const response = await fetch("./data/analytics.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    state.data = await response.json();

    const [indonesianResponse, englishResponse] = await Promise.all([
      fetch("./data/translations/indonesian.json"),

      fetch("./data/translations/english.json"),
    ]);

    if (!indonesianResponse.ok) {
      throw new Error(
        `Indonesian translation HTTP ${indonesianResponse.status}`,
      );
    }

    if (!englishResponse.ok) {
      throw new Error(`English translation HTTP ${englishResponse.status}`);
    }

    state.translationMaps.id = buildTranslationMap(
      await indonesianResponse.json(),
    );

    state.translationMaps.en = buildTranslationMap(
      await englishResponse.json(),
    );

    if (!state.data.terms?.length) {
      throw new Error("Analytics dataset contains no terms.");
    }

    state.selectedWord = state.data.terms[0].word;
    state.expandedCategory = state.data.terms[0].category || "time";

    const mobileTermsCount = $("mobile-terms-count");

    if (mobileTermsCount) {
      mobileTermsCount.textContent = formatNumber(state.data.terms.length);
    }

    const search = $("term-search");

    if (search) {
      search.addEventListener("input", () => {
        renderTermList(search.value);
      });
    }

    const languageSwitch = $("language-switch");

    if (languageSwitch) {
      languageSwitch.querySelectorAll(".language-option").forEach((button) => {
        button.addEventListener("click", () => {
          state.language = setLanguage(button.dataset.language);

          render();
        });
      });
    }

    setupMobileTermsDrawer();

    setupEvidenceControls();

    render();
  } catch (error) {
    const badge = $("corpus-badge");

    if (badge) {
      badge.textContent = "Data unavailable";
    }

    const main = document.querySelector(".main");

    if (main) {
      main.innerHTML = `
        <section
          class="panel"
        >

          <h2>
            Unable to load analytical data.
          </h2>

          <p>
            ${escapeHtml(error.message)}
          </p>

        </section>
      `;
    }

    console.error(error);
  }
}

loadAnalytics();
