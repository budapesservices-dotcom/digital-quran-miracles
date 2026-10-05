const state = {
  data: null,
  selectedWord: null,
  evidenceIndex: 0,
  evidenceSurah: "all",
  language: detectInitialLanguage(),

  translationMaps: {
    id: new Map(),
    en: new Map(),
  },
};

const $ = (id) =>
  document.getElementById(id);

function t(key) {
  return I18N[state.language]?.[key]
    ?? I18N.en[key]
    ?? key;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderEvidenceText(
  text,
  tokenIndex
) {
  const tokens =
    String(text || "")
      .trim()
      .split(/\s+/);

  const targetIndex =
    Number(tokenIndex) - 1;

  return tokens
    .map((token, index) => {
      const safeToken =
        escapeHtml(token);

      if (
        index === targetIndex
      ) {
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

function renderEvidenceAudit(
  term,
  occurrence
) {
  const method =
    term.evidence?.method || {};

  const normalized =
    term.normalized_word
    || term.numerical
      ?.normalized_word
    || "";

  const matching =
    method.matching
    || "exact_normalized_token";

  const labels =
    state.language === "id"
      ? {
          term: "Term",
          normalized: "Bentuk ternormalisasi",
          rule: "Aturan pencocokan",
          position: "Posisi token",
        }
      : state.language === "ar"
        ? {
            term: "المصطلح",
            normalized: "الصيغة المطبّعة",
            rule: "قاعدة المطابقة",
            position: "موضع الرمز",
          }
        : {
            term: "Term",
            normalized: "Normalized form",
            rule: "Matching rule",
            position: "Token position",
          };

  return `
    <div class="evidence-audit">

      <div class="evidence-audit-item">

        <span class="evidence-audit-label">
          ${escapeHtml(
            labels.term
          )}
        </span>

        <strong
          class="evidence-audit-value"
          dir="rtl"
        >
          ${escapeHtml(
            term.word
          )}
        </strong>

      </div>


      <div class="evidence-audit-item">

        <span class="evidence-audit-label">
          ${escapeHtml(
            labels.normalized
          )}
        </span>

        <strong
          class="evidence-audit-value"
          dir="rtl"
        >
          ${escapeHtml(
            normalized
          )}
        </strong>

      </div>


      <div class="evidence-audit-item">

        <span class="evidence-audit-label">
          ${escapeHtml(
            labels.rule
          )}
        </span>

        <strong class="evidence-audit-value">
          ${escapeHtml(
            matching
          )}
        </strong>

      </div>


      <div class="evidence-audit-item">

        <span class="evidence-audit-label">
          ${escapeHtml(
            labels.position
          )}
        </span>

        <strong class="evidence-audit-value">
          ${formatNumber(
            Number(
              occurrence.token_index
            )
          )}
        </strong>

      </div>

    </div>
  `;
}

function formatNumber(value) {
  return new Intl.NumberFormat(
    state.language === "ar"
      ? "ar-EG"
      : state.language === "id"
        ? "id-ID"
        : "en-US"
  ).format(value);
}

function formatDecimal(
  value,
  maximumFractionDigits = 2
) {
  return new Intl.NumberFormat(
    state.language === "ar"
      ? "ar-EG"
      : state.language === "id"
        ? "id-ID"
        : "en-US",
    {
      maximumFractionDigits,
    }
  ).format(value);
}

function getSelectedTerm() {
  return state.data.terms.find(
    (term) =>
      term.word === state.selectedWord
  );
}

function getMeaning(term) {
  const metadata =
    term.metadata || {};

  const value =
    state.language === "ar"
      ? metadata.meaning_ar
      : state.language === "en"
        ? metadata.meaning_en
        : metadata.meaning_id;

  return value
    || metadata.meaning_id
    || metadata.meaning_en
    || metadata.meaning_ar
    || t("notAvailable");
}

function buildTranslationMap(data) {
  const map = new Map();

  for (const surah of data || []) {
    for (const verse of surah.verses || []) {
      map.set(
        `${surah.id}:${verse.id}`,
        verse.translation || ""
      );
    }
  }

  return map;
}

function getVerseTranslations(
  surah,
  ayah
) {
  const key =
    `${surah}:${ayah}`;

  return {
    id:
      state.translationMaps.id.get(key)
      || "",

    en:
      state.translationMaps.en.get(key)
      || "",
  };
}

function getVerseLabel() {
  return state.language === "id"
    ? "Ayat"
    : state.language === "ar"
      ? "الآية"
      : "Verse";
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
  const slug =
    SURAH_SLUGS[
      Number(surah)
    ];

  return slug
    ? `https://www.readquranforpeace.net/quran/${slug}`
    : "https://www.readquranforpeace.net/quran";
}

function getFilteredOccurrences(term) {
  const occurrences =
    term.evidence?.occurrences || [];

  if (
    state.evidenceSurah === "all"
  ) {
    return occurrences;
  }

  return occurrences.filter(
    (item) =>
      String(item.surah) ===
      state.evidenceSurah
  );
}

function renderLanguageSelector() {
  const selector =
    $("language-select");

  if (!selector) {
    return;
  }

  selector.innerHTML = `
    <option value="id">
      Bahasa Indonesia
    </option>

    <option value="en">
      English
    </option>

    <option value="ar">
      العربية
    </option>
  `;

  selector.value =
    state.language;
}

function setText(
  id,
  value
) {
  const element =
    $(id);

  if (element) {
    element.textContent =
      value;
  }
}

function getUxText(key) {
  const texts = {
    id: {
      whatObserved:
        "Apa yang kita amati?",

      whatObservedDescription:
        "Ringkasan hasil yang benar-benar terukur dari corpus yang dianalisis.",

      quranNavigation:
        "Navigasi Quran",

      surahExplorer:
        "Penjelajah Surah",

      surahExplorerDescription:
        "Lihat bagaimana term tersebar di 114 surah. Pilih titik untuk membuka evidence.",

      surahExplorerCaption:
        "Setiap titik mewakili satu Surah",

      behindObservation:
        "Di balik observasi",

      numbersBehindObservation:
        "Angka di balik observasi",

      methodGuide:
        "Panduan metode",

      traceResult:
        "Telusuri hasil",

      exploratoryComparison:
        "Perbandingan eksploratif",

      auditTrail:
        "Jejak audit",

        methodScope:
  "Ruang lingkup saat ini berfokus pada observasi matematis berbasis data. Struktur dataset dan alur evidence dirancang agar tema berikutnya dapat ditambahkan tanpa mengubah fondasi navigasi Quran.",

      surahs:
        "surah",

      openClient:
        "Buka di Read Quran for Peace ↗",

      exampleVerse:
        "Ayat contoh",

      translation:
        "Arti",

      translationSource:
        "Sumber terjemahan: QuranEnc · id-affairs",

      noEvidence:
        "Tidak ada evidence untuk pilihan ini.",

      noRecords:
        "Tidak ada record evidence.",

      allOccurrences:
        "semua occurrence",
    },

    en: {
      whatObserved:
        "What did we observe?",

      whatObservedDescription:
        "A summary of the results directly measured from the analyzed corpus.",

      quranNavigation:
        "Quran navigation",

      surahExplorer:
        "Surah Explorer",

      surahExplorerDescription:
        "See how the term is distributed across 114 surahs. Select a point to inspect evidence.",

      surahExplorerCaption:
        "Each point represents one Surah",

      behindObservation:
        "Behind the observation",

      numbersBehindObservation:
        "Numbers behind the observation",

      methodGuide:
        "Method guide",

      traceResult:
        "Trace the result",

      exploratoryComparison:
        "Exploratory comparison",

      auditTrail:
        "Audit trail",

        methodScope:
  "The current scope focuses on data-driven mathematical observations. The dataset structure and evidence flow are designed so future themes can be added without changing the Quran navigation foundation.",

      surahs:
        "surahs",

      openClient:
        "Open in Read Quran for Peace ↗",

      exampleVerse:
        "Example verse",

      translation:
        "Translation",

      translationSource:
        "Translation source: QuranEnc · en-saheeh",

      noEvidence:
        "No evidence for this selection.",

      noRecords:
        "No evidence records available.",

      allOccurrences:
        "all occurrences",
    },

    ar: {
      whatObserved:
        "ما الذي لاحظناه؟",

      whatObservedDescription:
        "ملخص للنتائج المقاسة مباشرة من مجموعة البيانات التي تم تحليلها.",

      quranNavigation:
        "التنقل في القرآن",

      surahExplorer:
        "مستكشف السور",

      surahExplorerDescription:
        "شاهد كيفية توزيع المصطلح عبر 114 سورة. اختر نقطة لفحص الدليل.",

      surahExplorerCaption:
        "كل نقطة تمثل سورة واحدة",

      behindObservation:
        "خلف الملاحظة",

      numbersBehindObservation:
        "الأرقام خلف الملاحظة",

      methodGuide:
        "دليل المنهج",

      traceResult:
        "تتبع النتيجة",

      exploratoryComparison:
        "مقارنة استكشافية",

      auditTrail:
        "مسار التدقيق",

        methodScope:
  "يركز النطاق الحالي على الملاحظات الرياضية المستندة إلى البيانات. وقد صُمم هيكل البيانات ومسار الدليل بحيث يمكن إضافة موضوعات مستقبلية دون تغيير أساس التنقل في القرآن.",

      surahs:
        "سور",

      openClient:
        "فتح في اقرأ القرآن للسلام ↗",

      exampleVerse:
        "الآية",

      translation:
        "الترجمة",

      translationSource:
        "مصادر الترجمة: QuranEnc",

      noEvidence:
        "لا توجد أدلة لهذا الاختيار.",

      noRecords:
        "لا توجد سجلات.",

      allOccurrences:
        "جميع مرات الظهور",
    },
  };

  return (
    texts[state.language]?.[key]
    ?? texts.en[key]
    ?? key
  );
}

function renderStaticText() {
  setText(
    "brand-kicker",
    t("brandKicker")
  );

  setText(
    "page-title",
    t("pageTitle")
  );

  setText(
    "page-subtitle",
    t("subtitle")
  );

  setText(
    "language-label",
    t("language")
  );

  setText(
    "analytical-terms-title",
    `${t("analyticalTerms")} (${
      state.data?.terms?.length || 0
    })`
  );

  setText(
    "feature-eyebrow",
    t("selectedObservation")
  );

  setText(
    "open-quran",
    t("openQuranIndex")
  );

  setText(
    "explore-evidence",
    t("exploreEvidence")
  );

  setText(
    "observation-kicker",
    getUxText("whatObserved")
  );

  setText(
    "observation-title",
    getUxText("whatObserved")
  );

  setText(
    "observation-description",
    getUxText(
      "whatObservedDescription"
    )
  );

  setText(
    "explorer-kicker",
    getUxText("quranNavigation")
  );

  setText(
    "distribution-title",
    getUxText("surahExplorer")
  );

  setText(
    "distribution-description",
    getUxText(
      "surahExplorerDescription"
    )
  );

  setText(
    "chart-caption",
    getUxText(
      "surahExplorerCaption"
    )
  );

  setText(
    "numerical-kicker",
    getUxText(
      "behindObservation"
    )
  );

  setText(
    "numerical-title",
    getUxText(
      "numbersBehindObservation"
    )
  );

  setText(
    "numerical-description",
    t("numericalDescription")
  );

  setText(
    "learn-kicker",
    getUxText(
      "methodGuide"
    )
  );

  setText(
    "evidence-kicker",
    getUxText(
      "traceResult"
    )
  );

  setText(
    "evidence-title",
    t("verseEvidence")
  );

  setText(
    "evidence-description",
    t("verseEvidenceDescription")
  );

  setText(
    "surah-label",
    t("surahDistribution")
  );

  setText(
    "jump-label",
    t("jumpOccurrence")
  );

  setText(
    "previous-evidence",
    `← ${t("previous")}`
  );

  setText(
    "next-evidence",
    `${t("next")} →`
  );

  setText(
    "pairs-kicker",
    getUxText(
      "exploratoryComparison"
    )
  );

  setText(
    "pairs-title",
    t("exploratoryPairs")
  );

  setText(
    "pairs-description",
    t("exploratoryPairsDescription")
  );

  setText(
    "methodology-kicker",
    getUxText(
      "auditTrail"
    )
  );

  setText(
    "methodology-title",
    t("methodology")
  );

  setText(
    "learn-title",
    t("learnMetrics")
  );

  setText(
    "learn-description",
    t("learnMetricsDescription")
  );

  const search =
    $("term-search");

  if (search) {
    search.placeholder =
      t("searchPlaceholder");

    search.dir =
      "auto";
  }
}

function renderTermList(
  filter = ""
) {
  const needle =
    filter.trim().toLowerCase();

  const matched =
    state.data.terms.filter(
      (term) => {
        const metadata =
          term.metadata || {};

        const searchable = [
          term.word,
          metadata.transliteration || "",
          metadata.meaning_id || "",
          metadata.meaning_en || "",
          metadata.meaning_ar || "",
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(
          needle
        );
      }
    );

  const categoryOrder = [
    "time",
    "life",
    "nature",
    "people",
    "faith",
  ];

  matched.sort((a, b) => {
    const ai =
      categoryOrder.indexOf(
        a.category
      );

    const bi =
      categoryOrder.indexOf(
        b.category
      );

    const categoryCompare =
      (ai === -1 ? 999 : ai)
      -
      (bi === -1 ? 999 : bi);

    if (
      categoryCompare !== 0
    ) {
      return categoryCompare;
    }

    return a.rank - b.rank;
  });

  const groups = {};

  for (const term of matched) {
    const category =
      term.category
      || "uncategorized";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(
      term
    );
  }

  let html = "";

  for (
    const category
    of categoryOrder
  ) {
    const terms =
      groups[category];

    if (!terms?.length) {
      continue;
    }

    const labelKey =
      `category_${category}`;

    html += `
      <div class="term-category-header">

        <span>
          ${escapeHtml(
            t(labelKey)
          )}
        </span>

        <span
          class="term-category-count"
        >
          ${formatNumber(
            terms.length
          )}
        </span>

      </div>
    `;

    html += terms
      .map((term) => {
        const metadata =
          term.metadata || {};

        return `
          <button
            class="term-button ${
              term.word ===
              state.selectedWord
                ? "active"
                : ""
            }"
            data-word="${escapeHtml(
              term.word
            )}"
            type="button"
          >

            <span class="term-copy">

              <span
                class="term-word"
              >
                ${escapeHtml(
                  term.word
                )}
              </span>

              <span
                class="term-latin"
              >
                ${escapeHtml(
                  metadata.transliteration
                  || ""
                )}
              </span>

              <span
                class="term-meaning"
              >
                ${escapeHtml(
                  getMeaning(term)
                )}
              </span>

            </span>

            <span class="term-count">
              ${formatNumber(
                term.count
              )}
            </span>

          </button>
        `;
      })
      .join("");
  }

  const list =
    $("term-list");

  if (!list) {
    return;
  }

  list.innerHTML =
    html;

  list
    .querySelectorAll(
      ".term-button"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          state.selectedWord =
            button.dataset.word;

          state.evidenceIndex =
            0;

          state.evidenceSurah =
            "all";

          render();

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      );
    });
}

function renderFeatureVerse(
  term,
  occurrence = null
) {
  const reference =
    $("feature-reference");

  if (!reference) {
    return;
  }

  let container =
    $("feature-verse");

  if (!container) {
    container =
      document.createElement(
        "div"
      );

    container.id =
      "feature-verse";

    container.className =
      "feature-verse";

    reference.insertAdjacentElement(
      "afterend",
      container
    );
  }

  if (!occurrence) {
    container.innerHTML =
      "";

    return;
  }

  const translations =
    getVerseTranslations(
      occurrence.surah,
      occurrence.ayah
    );

  let translationHtml =
    "";

  if (
    state.language === "id" &&
    translations.id
  ) {
    translationHtml = `
      <div
        class="feature-verse-translation-label"
      >
        ${getUxText(
          "translation"
        )}
      </div>

      <p
        class="feature-verse-translation"
        dir="ltr"
      >
        ${escapeHtml(
          translations.id
        )}
      </p>

      <div
        class="feature-verse-source"
      >
        ${escapeHtml(
          getUxText(
            "translationSource"
          )
        )}
      </div>
    `;
  }

  if (
    state.language === "en" &&
    translations.en
  ) {
    translationHtml = `
      <div
        class="feature-verse-translation-label"
      >
        ${getUxText(
          "translation"
        )}
      </div>

      <p
        class="feature-verse-translation"
        dir="ltr"
      >
        ${escapeHtml(
          translations.en
        )}
      </p>

      <div
        class="feature-verse-source"
      >
        ${escapeHtml(
          getUxText(
            "translationSource"
          )
        )}
      </div>
    `;
  }

  if (
    state.language === "ar" &&
    (
      translations.id ||
      translations.en
    )
  ) {
    translationHtml = `
      <div
        class="feature-verse-translation-label"
      >
        ${getUxText(
          "translation"
        )}
      </div>

      ${
        translations.id
          ? `
            <p
              class="feature-verse-translation"
              dir="ltr"
            >
              <strong>
                Bahasa Indonesia
              </strong>
              <br>
              ${escapeHtml(
                translations.id
              )}
            </p>
          `
          : ""
      }

      ${
        translations.en
          ? `
            <p
              class="feature-verse-translation"
              dir="ltr"
            >
              <strong>
                English
              </strong>
              <br>
              ${escapeHtml(
                translations.en
              )}
            </p>
          `
          : ""
      }

      <div
        class="feature-verse-source"
      >
        ${escapeHtml(
          getUxText(
            "translationSource"
          )
        )}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="feature-verse-heading">
      ${escapeHtml(
        getUxText(
          "exampleVerse"
        )
      )}
    </div>

    <div class="feature-verse-ref">
      Surah ${escapeHtml(
        occurrence.surah
      )}

      ·

      ${getVerseLabel()}

      ${escapeHtml(
        occurrence.ayah
      )}
    </div>

    <p
  class="feature-verse-arabic"
  dir="rtl"
>
  ${renderEvidenceText(
    occurrence.text,
    occurrence.token_index
  )}
</p>

    ${translationHtml}
  `;
}

function renderHero(term) {
  const metadata =
    term.metadata || {};

  const firstOccurrence =
    term.evidence
      ?.occurrences
      ?. [0];

  const surahCount =
    term.distribution
      .summary
      .surahs_with_occurrences;

  const totalSurahs =
    114;

  const count =
    term.count;

  $("feature-word")
    .textContent =
    term.word;

  $("feature-meta")
    .innerHTML = `
      <span
        class="feature-latin"
      >
        ${escapeHtml(
          metadata.transliteration
          || ""
        )}
      </span>

      <span
        class="feature-separator"
      >
        ·
      </span>

      <span
        class="feature-meaning"
      >
        ${escapeHtml(
          getMeaning(term)
        )}
      </span>
    `;

  $("feature-reference")
    .textContent =
    firstOccurrence
      ? `${t("firstRecorded")}: ` +
        `Surah ${firstOccurrence.surah}, ` +
        `${getVerseLabel()} ${firstOccurrence.ayah}`
      : "";

  renderFeatureVerse(
    term,
    firstOccurrence
  );

  const openQuran =
  $("open-quran");

if (openQuran) {
  openQuran.href =
    getClientSurahUrl(
      firstOccurrence?.surah
    );
}

  const observationTerm =
    $("observation-term");

  if (
    observationTerm
  ) {
    observationTerm.textContent =
      getMeaning(term);
  }

    const observationDescription =
    $("observation-description");

  if (observationDescription) {
    const digitSum =
      term.numerical
        ?.derived_metrics
        ?.digit_sum;

    const digitExpression =
      String(count)
        .split("")
        .join(" + ");

    observationDescription.textContent =
      state.language === "id"
        ? `Dalam corpus yang dianalisis, term ini muncul ${formatNumber(
            count
          )} kali dan ditemukan setidaknya sekali di ${formatNumber(
            surahCount
          )} dari ${formatNumber(
            totalSurahs
          )} surah. Sifat numeriknya: ${digitExpression} = ${formatNumber(
            digitSum
          )}.`
        : state.language === "ar"
          ? `في مجموعة البيانات التي تم تحليلها، ظهر هذا المصطلح ${formatNumber(
              count
            )} مرة وظهر في ${formatNumber(
              surahCount
            )} من أصل ${formatNumber(
              totalSurahs
            )} سورة. الخاصية الرقمية: ${digitExpression} = ${formatNumber(
              digitSum
            )}.`
          : `In the analyzed corpus, this term appears ${formatNumber(
              count
            )} times and occurs in ${formatNumber(
              surahCount
            )} of ${formatNumber(
              totalSurahs
            )} surahs. Its numerical property is ${digitExpression} = ${formatNumber(
              digitSum
            )}.`;
  }

  const stats =
    $("stats");

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
      ${t(
        "statOccurrencesTitle"
      )}
    </div>

    <div class="stat-unit">
      ${t(
        "statOccurrencesUnit"
      )}
    </div>

    <div class="stat-explanation">
      ${escapeHtml(
        t(
          "statOccurrencesDesc"
        )
      )}
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
      ${formatNumber(
        surahCount
      )}
    </div>

    <div class="stat-label">
      ${t(
        "statSurahTitle"
      )}
    </div>

    <div class="stat-unit">
      ${
        state.language === "id"
          ? `dari ${formatNumber(
              totalSurahs
            )} ${t(
              "statSurahUnit"
            )}`
          : state.language === "ar"
            ? `من ${formatNumber(
                totalSurahs
              )} ${t(
                "statSurahUnit"
              )}`
            : `of ${formatNumber(
                totalSurahs
              )} ${t(
                "statSurahUnit"
              )}`
      }
    </div>

    <div class="stat-explanation">
      ${escapeHtml(
        t(
          "statSurahDesc"
        )
      )}
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
      ${formatNumber(
        term.numerical
          .derived_metrics
          .digit_sum
      )}
    </div>

    <div class="stat-label">
      ${t(
        "statNumberPropertyTitle"
      )}
    </div>

    <div class="stat-unit">
      ${t(
        "statNumberPropertyUnit"
      )}
    </div>

    <div class="stat-explanation">
      ${escapeHtml(
        t(
          "statNumberPropertyDesc"
        )
      )}
    </div>

  </article>
`;
}


function renderNumerical(term) {
  const metrics =
    term.numerical?.derived_metrics || {};

  const rows = [
    [
      t("frequency"),
      formatNumber(term.count),
      t("metricFrequencyDesc"),
    ],

    [
      t("metricParity"),
      metrics.parity === "odd"
        ? (
          state.language === "ar"
            ? "فردي"
            : state.language === "id"
              ? "ganjil"
              : "odd"
        )
        : (
          state.language === "ar"
            ? "زوجي"
            : state.language === "id"
              ? "genap"
              : "even"
        ),
      t("metricParityDesc"),
    ],

    [
      t("digitSum"),
      formatNumber(metrics.digit_sum || 0),
      t("metricDigitSumDesc"),
    ],

    [
      t("per1000"),
      String(
        metrics.frequency_per_1000_tokens ?? 0
      ),
      t("metricPer1000Desc"),
    ],

    [
      t("metricVerseShare"),
      `${metrics.count_as_percentage_of_verse_total ?? 0}%`,
      t("metricVerseShareDesc"),
    ],
  ];

  const list =
    $("numerical-metrics");

  if (!list) {
    return;
  }

  list.innerHTML =
    rows
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
        `
      )
      .join("");

  list
    .querySelectorAll(".metric-info")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const row =
            button.closest(
              ".metric-row"
            );

          const help =
            row?.querySelector(
              ".metric-help"
            );

          if (!help) {
            return;
          }

          const expanded =
            button.getAttribute(
              "aria-expanded"
            ) === "true";

          button.setAttribute(
            "aria-expanded",
            String(!expanded)
          );

          help.hidden =
            expanded;

          row.classList.toggle(
            "metric-expanded",
            !expanded
          );
        }
      );
    });
}


function renderSurahExplorerSummary(
  term
) {
  const element =
    $("surah-explorer-summary");

  if (!element) {
    return;
  }

  const summary =
    term.distribution?.summary
    || {};

  const matched =
    summary.surahs_with_occurrences
    || 0;

  const frequency =
    term.count || 0;

  element.innerHTML = `
    <strong>
      ${formatNumber(
        matched
      )}
    </strong>

    <span>
      ${escapeHtml(
        getUxText(
          "surahs"
        )
      )}
    </span>

    <small>
      ${formatNumber(
        frequency
      )}
      ${escapeHtml(
        t("occurrences")
      )}
    </small>
  `;
}

function renderSurahFilter(term) {
  const counts =
    term.distribution?.surahs
    || {};

  const names =
    new Map();

  for (
    const occurrence
    of term.evidence?.occurrences || []
  ) {
    if (
      !names.has(
        String(
          occurrence.surah
        )
      )
    ) {
      names.set(
        String(
          occurrence.surah
        ),
        occurrence.surah_name
          || ""
      );
    }
  }

  const options = [
    `<option value="all">
      ${escapeHtml(
        t("allSurahs")
      )}
    </option>`,
  ];

  Object.entries(
    counts
  ).forEach(
    ([surah, count]) => {
      if (count === 0) {
        return;
      }

      const name =
        names.get(
          String(surah)
        ) || "";

      options.push(`
        <option
          value="${escapeHtml(
            surah
          )}"
          ${
            state.evidenceSurah ===
            surah
              ? "selected"
              : ""
          }
        >
          ${
            state.language === "ar"
              ? `السورة ${surah}`
              : `Surah ${surah}`
          }

          ${
            name
              ? ` · ${escapeHtml(
                  name
                )}`
              : ""
          }

          — ${formatNumber(
            count
          )}
        </option>
      `);
    }
  );

  const select =
    $("surah-filter");

  if (select) {
    select.innerHTML =
      options.join("");
  }
}

function renderEvidence(term) {
  const filtered =
    getFilteredOccurrences(
      term
    );

  const total =
    filtered.length;

  if (!total) {
    renderFeatureVerse(
      term,
      null
    );

    setText(
      "evidence-counter",
      `0 ${t(
        "occurrences"
      )}`
    );

    setText(
      "evidence-summary",
      getUxText(
        "noEvidence"
      )
    );

    const list =
      $("evidence-list");

    if (list) {
      list.innerHTML = `
        <div
          class="evidence-item"
        >
          ${escapeHtml(
            getUxText(
              "noRecords"
            )
          )}
        </div>
      `;
    }

    const jump =
      $("evidence-jump");

    if (jump) {
      jump.value = 0;
    }

    const previous =
      $("previous-evidence");

    const next =
      $("next-evidence");

    if (previous) {
      previous.disabled =
        true;
    }

    if (next) {
      next.disabled =
        true;
    }

    return;
  }

  if (
    state.evidenceIndex >=
    total
  ) {
    state.evidenceIndex =
      total - 1;
  }

  const current =
    filtered[
      state.evidenceIndex
    ];

  const translations =
    getVerseTranslations(
      current.surah,
      current.ayah
    );

  let translation = "";

  if (
    state.language === "id"
  ) {
    translation =
      translations.id;
  }

  if (
    state.language === "en"
  ) {
    translation =
      translations.en;
  } 

const directUrl =
  getClientSurahUrl(
    current.surah
  ); ``

  setText(
    "evidence-counter",
    `${formatNumber(
      total
    )} ${t(
      "occurrences"
    )}`
  );

  setText(
    "evidence-summary",
    `${t(
      "showingOccurrence"
    )} ${
      formatNumber(
        state.evidenceIndex + 1
      )
    } ${
      state.language === "ar"
        ? "من"
        : "of"
    } ${
      formatNumber(
        total
      )
    }`
  );

  const jump =
    $("evidence-jump");

  if (jump) {
    jump.value =
      state.evidenceIndex + 1;
  }

  const previous =
    $("previous-evidence");

  const next =
    $("next-evidence");

  if (previous) {
    previous.disabled =
      state.evidenceIndex === 0;
  }

  if (next) {
    next.disabled =
      state.evidenceIndex ===
      total - 1;
  }

  const reference =
    state.language === "ar"
      ? `السورة ${current.surah} · الآية ${current.ayah} · الرمز ${current.token_index}`
      : state.language === "id"
        ? `Surah ${current.surah} · Ayat ${current.ayah} · Token ${current.token_index}`
        : `Surah ${current.surah} · Verse ${current.ayah} · Token ${current.token_index}`;

  let translationHtml =
    "";

  if (translation) {
    translationHtml = `
      <div
        class="
          evidence-translation-label
        "
      >
        ${escapeHtml(
          getUxText(
            "translation"
          )
        )}
      </div>

      <p
        class="evidence-translation"
        dir="ltr"
      >
        ${escapeHtml(
          translation
        )}
      </p>

      <div
        class="evidence-source"
      >
        ${escapeHtml(
          getUxText(
            "translationSource"
          )
        )}
      </div>
    `;
  }

  

  if (
    state.language === "ar" &&
    (
      translations.id ||
      translations.en
    )
  ) {
    translationHtml = `
      <div
        class="
          evidence-translation-label
        "
      >
        الترجمة
      </div>

      ${
        translations.id
          ? `
            <p
              class="evidence-translation"
              dir="ltr"
            >
              <strong>
                Bahasa Indonesia
              </strong>
              <br>
              ${escapeHtml(
                translations.id
              )}
            </p>
          `
          : ""
      }

      ${
        translations.en
          ? `
            <p
              class="evidence-translation"
              dir="ltr"
            >
              <strong>
                English
              </strong>
              <br>
              ${escapeHtml(
                translations.en
              )}
            </p>
          `
          : ""
      }

      <div
        class="evidence-source"
      >
        ${escapeHtml(
          getUxText(
            "translationSource"
          )
        )}
      </div>
    `;
  }

  const list =
    $("evidence-list");

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
  ${escapeHtml(
    current.surah_name
      || `Surah ${current.surah}`
  )}

  ·

  ${getVerseLabel()}

  ${escapeHtml(
    current.ayah
  )}
</div>

<div class="evidence-trace">
  ${escapeHtml(reference)}
</div>


      ${renderEvidenceAudit(
  term,
  current
)}

<p
  class="evidence-text"
  dir="rtl"
>
  ${renderEvidenceText(
    current.text,
    current.token_index
  )}
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
          ${escapeHtml(
            getUxText(
              "openClient"
            )
          )}
        </a>

      </div>


      <div
        class="evidence-index"
      >
        ${
          state.language === "ar"
            ? `سجل الدليل ${
                state.evidenceIndex + 1
              } من ${total}`
            : state.language === "id"
              ? `Record evidence ${
                  state.evidenceIndex + 1
                } dari ${total}`
              : `Evidence record ${
                  state.evidenceIndex + 1
                } of ${total}`
        }
      </div>

    </article>
  `;
}

function renderPairs() {
  const pairs =
    state.data.pair_analysis?.pairs || [];

  const list =
    $("pair-list");

  if (!list) {
    return;
  }

  list.innerHTML =
    pairs
      .map(
        (pair) => {
          const countA =
            Number(
              pair.counts?.a || 0
            );

          const countB =
            Number(
              pair.counts?.b || 0
            );

          const difference =
            Number(
              pair.derived
                ?.difference_a_minus_b || 0
            );

          const ratio =
            Number(
              pair.derived
                ?.ratio_a_to_b || 0
            );

          const sharedSurahs =
            Number(
              pair.distribution
                ?.shared_surahs || 0
            );

          const jaccard =
            Number(
              pair.distribution
                ?.jaccard_overlap || 0
            );

          const jaccardPercent =
            formatDecimal(
              jaccard * 100,
              1
            );

          const observation =
            state.language === "id"
              ? `Dalam corpus ini, ${pair.term_a} muncul ${formatNumber(
                  countA
                )} kali dan ${pair.term_b} ${formatNumber(
                  countB
                )} kali. Keduanya muncul dalam ${formatNumber(
                  sharedSurahs
                )} surah yang sama; overlap surah sebesar ${jaccardPercent}%.`
              : state.language === "ar"
                ? `في مجموعة البيانات هذه، ظهر ${pair.term_a} ${formatNumber(
                    countA
                  )} مرة وظهر ${pair.term_b} ${formatNumber(
                    countB
                  )} مرة. وظهر المصطلحان في ${formatNumber(
                    sharedSurahs
                  )} سورة مشتركة؛ وبلغ تداخل السور ${jaccardPercent}٪.`
                : `In this corpus, ${pair.term_a} appears ${formatNumber(
                    countA
                  )} times and ${pair.term_b} ${formatNumber(
                    countB
                  )} times. The two terms appear in ${formatNumber(
                    sharedSurahs
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
                  data-word="${escapeHtml(
                    pair.term_a
                  )}"
                >
                  <span class="pair-word">
                    ${escapeHtml(
                      pair.term_a
                    )}
                  </span>
                </button>

                <span class="pair-arrow">
                  ↔
                </span>

                <button
                  class="pair-select"
                  type="button"
                  data-word="${escapeHtml(
                    pair.term_b
                  )}"
                >
                  <span class="pair-word">
                    ${escapeHtml(
                      pair.term_b
                    )}
                  </span>
                </button>

              </div>


              <div class="pair-frequency">

                <div class="pair-frequency-item">

                  <span class="pair-frequency-value">
                    ${formatNumber(
                      countA
                    )}
                  </span>

                  <span class="pair-frequency-label">
                    ${escapeHtml(
                      pair.term_a
                    )}
                    · ${t("frequency")}
                  </span>

                </div>


                <div class="pair-frequency-divider">
                  vs
                </div>


                <div class="pair-frequency-item">

                  <span class="pair-frequency-value">
                    ${formatNumber(
                      countB
                    )}
                  </span>

                  <span class="pair-frequency-label">
                    ${escapeHtml(
                      pair.term_b
                    )}
                    · ${t("frequency")}
                  </span>

                </div>

              </div>


              <div class="pair-metrics">

                <div class="pair-metric">

                  <span class="pair-metric-label">
                    ${t(
                      "metricDifference"
                    )}
                  </span>

                  <strong class="pair-metric-value">
                    ${formatNumber(
                      difference
                    )}
                  </strong>

                </div>


                <div class="pair-metric">

                  <span class="pair-metric-label">
                    ${t(
                      "metricRatio"
                    )}
                  </span>

                  <strong class="pair-metric-value">
                    ${ratio}
                  </strong>

                </div>


                <div class="pair-metric">

                  <span class="pair-metric-label">
                    ${t(
                      "metricSharedSurahs"
                    )}
                  </span>

                  <strong class="pair-metric-value">
                    ${formatNumber(
                      sharedSurahs
                    )}
                  </strong>

                </div>


                <div class="pair-metric">

                  <span class="pair-metric-label">
                    ${t(
                      "metricJaccard"
                    )}
                  </span>

                  <strong class="pair-metric-value">
                    ${jaccard}
                  </strong>

                </div>

              </div>


              <div class="pair-observation">

                <p>
                  ${escapeHtml(
                    observation
                  )}
                </p>

                <small>
                  ${escapeHtml(
                    observationNote
                  )}
                </small>

              </div>

            </article>
          `;
        }
      )
      .join("");


  list
    .querySelectorAll(
      ".pair-select"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            state.selectedWord =
              button.dataset.word;

            state.evidenceIndex =
              0;

            state.evidenceSurah =
              "all";

            render();

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });

          }
        );

      }
    );
}

function renderMethodology() {
  const method =
    state.data.method;

  const value =
    (v) =>
      v
        ? t("trueValue")
        : t("falseValue");

  setText(
    "method-matching-label",
    `${t("matching")}:`
  );

  setText(
    "method-diacritics-label",
    `${t("diacritics")}:`
  );

  setText(
    "method-tatweel-label",
    `${t("tatweel")}:`
  );

  setText(
    "method-alif-label",
    `${t("alif")}:`
  );

  setText(
    "method-root-label",
    `${t("rootAnalysis")}:`
  );

  setText(
    "method-morphology-label",
    `${t("morphology")}:`
  );

  setText(
    "method-substring-label",
    `${t("substring")}:`
  );

  setText(
    "method-matching",
    method.matching
  );

  setText(
    "method-diacritics",
    value(
      method.diacritics_removed
    )
  );

  setText(
    "method-tatweel",
    value(
      method.tatweel_removed
    )
  );

  setText(
    "method-alif",
    value(
      method.alif_variants_normalized
    )
  );

  setText(
    "method-root",
    value(
      method.root_analysis
    )
  );

  setText(
    "method-morphology",
    value(
      method.morphological_analysis
    )
  );

  setText(
    "method-substring",
    value(
      method.substring_matching
    )
  );

  const scope =
    $("method-scope");

  if (scope) {
    const futureThemes =
      state.language === "id"
        ? "Tema lanjutan: komposisi cincin, sains terpilih, linguistik, peristiwa masa lalu, dan prediksi tekstual."
        : state.language === "ar"
          ? "الموضوعات المستقبلية: التركيب الحلقي، وموضوعات علمية مختارة، والبلاغة واللغة، والأحداث الماضية، والتنبؤات النصية."
          : "Future themes: ring composition, selected scientific topics, linguistic brilliance, verified past events, and textual predictions.";

    scope.innerHTML = `
      <div class="method-scope-label">
        ${escapeHtml(
          state.language === "id"
            ? "Ruang lingkup"
            : state.language === "ar"
              ? "النطاق"
              : "Scope"
        )}
      </div>

      <p>
        ${escapeHtml(
          getUxText(
            "methodScope"
          )
        )}
      </p>

      <small>
        ${escapeHtml(
          futureThemes
        )}
      </small>
    `;
  }

  setText(
    "footer-text",
    t("dataStatus")
  );
}

function renderLearnMetrics() {
  const cards = [
    [
      t("metricFrequency"),
      t("metricFrequencyDesc"),
    ],

    [
      t("metricToken"),
      t("metricTokenDesc"),
    ],

    [
      t("metricExactMatch"),
      t("metricExactMatchDesc"),
    ],

    [
      t("metricDigitSum"),
      t("metricDigitSumDesc"),
    ],

    [
      t("metricParity"),
      t("metricParityDesc"),
    ],

    [
      t("metricPer1000"),
      t("metricPer1000Desc"),
    ],

    [
      t("metricDifference"),
      t("metricDifferenceDesc"),
    ],

    [
      t("metricRatio"),
      t("metricRatioDesc"),
    ],

    [
      t("metricSharedSurahs"),
      t("metricSharedSurahsDesc"),
    ],

    [
      t("metricJaccard"),
      t("metricJaccardDesc"),
    ],
  ];

  const list =
    $("learn-metrics");

  if (!list) {
    return;
  }

  list.innerHTML =
    cards
      .map(
        ([title, description]) => `
          <article
            class="learn-card"
          >

            <h3>
              ${escapeHtml(
                title
              )}
            </h3>

            <p>
              ${escapeHtml(
                description
              )}
            </p>

          </article>
        `
      )
      .join("");
}

function renderD3Safe() {
  const term =
    getSelectedTerm();

  if (
    typeof window
      .renderD3Distribution ===
    "function"
  ) {
    window.renderD3Distribution(
      term
    );
  }
}

function render() {
  if (!state.data) {
    return;
  }

  const term =
    getSelectedTerm();

  if (!term) {
    return;
  }

  renderLanguageSelector();

  renderStaticText();

  renderTermList(
    $("term-search")
      ?.value || ""
  );

  renderHero(term);

  renderNumerical(term);

  renderSurahExplorerSummary(
    term
  );

  renderSurahFilter(
    term
  );

  renderEvidence(
    term
  );

  renderPairs();

  renderMethodology();

  renderLearnMetrics();

  renderD3Safe();
}

function setupEvidenceControls() {
  const surahFilter =
    $("surah-filter");

  if (surahFilter) {
    surahFilter.addEventListener(
      "change",
      (event) => {
        state.evidenceSurah =
          event.target.value;

        state.evidenceIndex =
          0;

        renderEvidence(
          getSelectedTerm()
        );

        renderD3Safe();
      }
    );
  }

  const previous =
    $("previous-evidence");

  if (previous) {
    previous.addEventListener(
      "click",
      () => {
        if (
          state.evidenceIndex <=
          0
        ) {
          return;
        }

        state.evidenceIndex -=
          1;

        renderEvidence(
          getSelectedTerm()
        );
      }
    );
  }

  const next =
    $("next-evidence");

  if (next) {
    next.addEventListener(
      "click",
      () => {
        const filtered =
          getFilteredOccurrences(
            getSelectedTerm()
          );

        if (
          state.evidenceIndex >=
          filtered.length - 1
        ) {
          return;
        }

        state.evidenceIndex +=
          1;

        renderEvidence(
          getSelectedTerm()
        );
      }
    );
  }

  const jump =
    $("evidence-jump");

  if (jump) {
    jump.addEventListener(
      "change",
      (event) => {
        const filtered =
          getFilteredOccurrences(
            getSelectedTerm()
          );

        const requested =
          Number(
            event.target.value
          ) - 1;

        if (
          Number.isNaN(
            requested
          ) ||
          requested < 0 ||
          requested >=
            filtered.length
        ) {
          event.target.value =
            state.evidenceIndex + 1;

          return;
        }

        state.evidenceIndex =
          requested;

        renderEvidence(
          getSelectedTerm()
        );
      }
    );
  }
}

async function loadAnalytics() {
  try {
    state.language =
      setLanguage(
        state.language
      )
        ? state.language
        : "en";

    const response =
      await fetch(
        "./data/analytics.json"
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    state.data =
      await response.json();

    const [
      indonesianResponse,
      englishResponse,
    ] = await Promise.all([
      fetch(
        "./data/translations/indonesian.json"
      ),

      fetch(
        "./data/translations/english.json"
      ),
    ]);

    if (
      !indonesianResponse.ok
    ) {
      throw new Error(
        `Indonesian translation HTTP ${indonesianResponse.status}`
      );
    }

    if (
      !englishResponse.ok
    ) {
      throw new Error(
        `English translation HTTP ${englishResponse.status}`
      );
    }

    state.translationMaps.id =
      buildTranslationMap(
        await indonesianResponse.json()
      );

    state.translationMaps.en =
      buildTranslationMap(
        await englishResponse.json()
      );

    if (
      !state.data.terms?.length
    ) {
      throw new Error(
        "Analytics dataset contains no terms."
      );
    }

    state.selectedWord =
      state.data.terms[0].word;

    const corpus =
      state.data.corpus;

    $("corpus-badge")
      .textContent =
      `${corpus.chapters} chapters · ` +
      `${corpus.verses} verses`;

    const search =
      $("term-search");

    if (search) {
      search.addEventListener(
        "input",
        () => {
          renderTermList(
            search.value
          );
        }
      );
    }

    const languageSelect =
      $("language-select");

    if (languageSelect) {
      languageSelect.addEventListener(
        "change",
        (event) => {
          state.language =
            setLanguage(
              event.target.value
            );

          render();
        }
      );
    }

    setupEvidenceControls();

    render();

  } catch (error) {
    const badge =
      $("corpus-badge");

    if (badge) {
      badge.textContent =
        "Data unavailable";
    }

    const main =
      document.querySelector(
        ".main"
      );

    if (main) {
      main.innerHTML = `
        <section
          class="panel"
        >

          <h2>
            Unable to load analytical data.
          </h2>

          <p>
            ${escapeHtml(
              error.message
            )}
          </p>

        </section>
      `;
    }

    console.error(
      error
    );
  }
}

loadAnalytics();