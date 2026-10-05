const I18N = {
  id: {
    language: "Bahasa",
    brandKicker: "DIGITAL QURAN MIRACLES",
    pageTitle: "Eksplorasi Matematis",
    subtitle:
      "Jelajahi pola frekuensi yang diamati dalam Al-Qur'an dan telusuri setiap hasil kembali ke evidence ayat dan metodologi.",
    analyticalTerms: "Istilah Analisis",
    searchPlaceholder: "Cari Arab, Latin, atau makna…",
    selectedObservation: "Observasi Terpilih",
    openQuranIndex: "Buka Indeks Quran",
    exploreEvidence: "Lihat Evidence",
    firstRecorded: "Kemunculan pertama",
    frequency: "Frequency",
    surahsWithTerm: "Surah yang memuat term",
    digitSum: "Digit sum",
    per1000: "Per 1.000 token",
    numericalObservation: "Observasi Numerik",
    numericalDescription:
      "Metric turunan menggambarkan data yang diamati. Angka ini tidak dengan sendirinya membuktikan signifikansi statistik atau klaim mukjizat.",
    surahDistribution: "Distribusi Surah",
    surahDistributionDescription:
      "Kemunculan digabungkan di seluruh 114 surah. Pilih batang untuk melihat evidence dari surah tersebut.",
    interactiveD3: "Visualisasi D3 interaktif",
    verseEvidence: "Evidence Tingkat Ayat",
    verseEvidenceDescription:
      "Setiap kemunculan berasal dari corpus yang dianalisis dan menyimpan surah, ayat, posisi token, serta teks ayat sumber.",
    allSurahs: "Semua surah",
    jumpOccurrence: "Occurrence saat ini",
    previous: "Sebelumnya",
    next: "Berikutnya",
    showingOccurrence: "Menampilkan occurrence",
    evidenceRecord: "Record evidence",
    occurrences: "occurrence",
    exploratoryPairs: "Pasangan Term Eksploratif",
    exploratoryPairsDescription:
      "Hubungan kandidat ditampilkan sebagai observasi numerik, bukan bukti yang sudah ditentukan sebelumnya.",
    methodology: "Metodologi",
    learnMetrics: "Belajar Membaca Angka",
    learnMetricsDescription:
      "Istilah berikut menjelaskan bagaimana dataset kita diukur.",
    metricFrequency: "Frequency",
    metricFrequencyDesc:
      "Berapa kali token yang sudah dinormalisasi secara exact muncul dalam corpus yang dianalisis.",
    metricDigitSum: "Digit sum",
    metricDigitSumDesc:
      "Jumlahkan digit desimal dari frequency. Contoh: 217 → 2 + 1 + 7 = 10.",
    metricParity: "Parity",
    metricParityDesc: "Menunjukkan apakah frequency genap atau ganjil.",
    metricPer1000: "Frequency per 1.000 token",
    metricPer1000Desc:
      "Frequency dibagi jumlah seluruh token, lalu dikali 1.000.",
    metricVerseShare: "Persentase terhadap total ayat",
    metricVerseShareDesc:
      "Frequency dinyatakan sebagai persentase dari jumlah seluruh ayat.",
    metricDifference: "Difference",
    metricDifferenceDesc: "Untuk pasangan term: jumlah A dikurangi jumlah B.",
    metricSum: "Sum",
    metricSumDesc: "Untuk pasangan term: jumlah A ditambah jumlah B.",
    metricRatio: "Ratio",
    metricRatioDesc: "Untuk pasangan term: jumlah A dibagi jumlah B.",
    metricSharedSurahs: "Shared surahs",
    metricSharedSurahsDesc:
      "Berapa surah yang memuat kedua term setidaknya satu kali.",
    metricJaccard: "Jaccard overlap",
    metricJaccardDesc:
      "Jumlah surah bersama dibagi seluruh surah yang memuat salah satu term.",
    matching: "Matching",
    diacritics: "Diakritik dihapus",
    tatweel: "Tatweel dihapus",
    alif: "Varian alif dinormalisasi",
    rootAnalysis: "Analisis akar kata",
    morphology: "Analisis morfologi",
    substring: "Pencocokan substring",
    trueValue: "Ya",
    falseValue: "Tidak",
    notAvailable: "Tidak tersedia",
    dataStatus:
      "Status data: presentasi observed-data. Frequency dan observasi numerik terikat pada corpus project dan aturan analisis yang terdokumentasi.",
  },

  en: {
    language: "Language",
    brandKicker: "DIGITAL QURAN MIRACLES",
    pageTitle: "Mathematical Exploration",
    subtitle:
      "Explore observed frequency patterns in the Quran and trace each result back to verse-level evidence and methodology.",
    analyticalTerms: "Analytical Terms",
    searchPlaceholder: "Search Arabic, Latin, or meaning…",
    selectedObservation: "Selected Observation",
    openQuranIndex: "Open Quran Index",
    exploreEvidence: "Explore Evidence",
    firstRecorded: "First recorded occurrence",
    frequency: "Frequency",
    surahsWithTerm: "Surahs with term",
    digitSum: "Digit sum",
    per1000: "Per 1,000 tokens",
    numericalObservation: "Numerical Observation",
    numericalDescription:
      "Derived metrics describe the observed dataset. They do not, by themselves, establish statistical significance or a miraculous claim.",
    surahDistribution: "Surah Distribution",
    surahDistributionDescription:
      "Occurrences aggregated across all 114 surahs. Select a bar to inspect evidence from that surah.",
    interactiveD3: "Interactive D3 visualization",
    verseEvidence: "Verse-Level Evidence",
    verseEvidenceDescription:
      "Every occurrence comes from the analyzed corpus and retains its surah, ayah, token position, and source verse text.",
    allSurahs: "All surahs",
    jumpOccurrence: "Current occurrence",
    previous: "Previous",
    next: "Next",
    showingOccurrence: "Showing occurrence",
    evidenceRecord: "Evidence record",
    occurrences: "occurrences",
    exploratoryPairs: "Exploratory Term Pairs",
    exploratoryPairsDescription:
      "Candidate relationships are shown as numerical observations, not predefined proof.",
    methodology: "Methodology",
    learnMetrics: "Learn the Metrics",
    learnMetricsDescription:
      "These terms describe how the dataset is being measured.",
    metricFrequency: "Frequency",
    metricFrequencyDesc:
      "How many times the exact normalized token appears in the analyzed corpus.",
    metricDigitSum: "Digit sum",
    metricDigitSumDesc:
      "Add the decimal digits of the frequency. Example: 217 → 2 + 1 + 7 = 10.",
    metricParity: "Parity",
    metricParityDesc: "Whether the frequency is even or odd.",
    metricPer1000: "Frequency per 1,000 tokens",
    metricPer1000Desc:
      "Frequency divided by total tokens, then multiplied by 1,000.",
    metricVerseShare: "Share of verse total",
    metricVerseShareDesc:
      "The frequency expressed as a percentage of the total verse count.",
    metricDifference: "Difference",
    metricDifferenceDesc: "For a pair: count A minus count B.",
    metricSum: "Sum",
    metricSumDesc: "For a pair: count A plus count B.",
    metricRatio: "Ratio",
    metricRatioDesc: "For a pair: count A divided by count B.",
    metricSharedSurahs: "Shared surahs",
    metricSharedSurahsDesc: "How many surahs contain both terms at least once.",
    metricJaccard: "Jaccard overlap",
    metricJaccardDesc:
      "Shared surahs divided by all surahs containing either term.",
    matching: "Matching",
    diacritics: "Diacritics removed",
    tatweel: "Tatweel removed",
    alif: "Alif variants normalized",
    rootAnalysis: "Root analysis",
    morphology: "Morphological analysis",
    substring: "Substring matching",
    trueValue: "Yes",
    falseValue: "No",
    notAvailable: "Not available",
    dataStatus:
      "Data status: observed-data presentation. Frequency and numerical observations are tied to the project corpus and documented analysis rules.",
  },

  ar: {
    language: "اللغة",
    brandKicker: "معجزات القرآن الرقمية",
    pageTitle: "الاستكشاف الرياضي",
    subtitle:
      "استكشف أنماط التكرار المرصودة في القرآن وتتبع كل نتيجة إلى دليل الآية والمنهجية.",
    analyticalTerms: "المصطلحات التحليلية",
    searchPlaceholder: "ابحث بالعربية أو النقل الصوتي أو المعنى…",
    selectedObservation: "الملاحظة المختارة",
    openQuranIndex: "فتح فهرس القرآن",
    exploreEvidence: "استعراض الأدلة",
    firstRecorded: "أول ظهور مسجل",
    frequency: "التكرار",
    surahsWithTerm: "السور التي يظهر فيها المصطلح",
    digitSum: "مجموع الأرقام",
    per1000: "لكل ١٠٠٠ رمز",
    numericalObservation: "الملاحظة الرقمية",
    numericalDescription:
      "هذه المقاييس تصف البيانات المرصودة، ولا تثبت وحدها الدلالة الإحصائية أو أي ادعاء بالمعجزة.",
    surahDistribution: "توزيع السور",
    surahDistributionDescription:
      "تجميع مرات الظهور عبر السور الـ١١٤. اختر عمودًا لفحص الدليل في تلك السورة.",
    interactiveD3: "تصور تفاعلي باستخدام D3",
    verseEvidence: "الأدلة على مستوى الآية",
    verseEvidenceDescription:
      "كل ظهور مأخوذ من corpus التحليل ويحتفظ بالسورة والآية وموضع الرمز ونص الآية المصدر.",
    allSurahs: "جميع السور",
    jumpOccurrence: "الظهور الحالي",
    previous: "السابق",
    next: "التالي",
    showingOccurrence: "عرض الظهور",
    evidenceRecord: "سجل الدليل",
    occurrences: "ظهور",
    exploratoryPairs: "الأزواج الاستكشافية",
    exploratoryPairsDescription:
      "تُعرض العلاقات المرشحة كملاحظات رقمية، وليست إثباتًا محددًا مسبقًا.",
    methodology: "المنهجية",
    learnMetrics: "تعلّم قراءة المقاييس",
    learnMetricsDescription: "هذه المصطلحات تشرح كيفية قياس مجموعة البيانات.",
    metricFrequency: "التكرار",
    metricFrequencyDesc:
      "عدد مرات ظهور الرمز المطبع المطابق تمامًا في corpus الذي تم تحليله.",
    metricDigitSum: "مجموع الأرقام",
    metricDigitSumDesc:
      "اجمع أرقام التكرار العشرية. مثال: ٢١٧ ← ٢ + ١ + ٧ = ١٠.",
    metricParity: "زوجي / فردي",
    metricParityDesc: "يوضح ما إذا كان التكرار زوجيًا أم فرديًا.",
    metricPer1000: "التكرار لكل 1000 رمز",
    metricPer1000Desc: "التكرار مقسومًا على إجمالي الرموز ثم مضروبًا في ١٠٠٠.",
    metricVerseShare: "النسبة من إجمالي الآيات",
    metricVerseShareDesc: "التكرار كنسبة مئوية من إجمالي عدد الآيات.",
    metricDifference: "الفرق",
    metricDifferenceDesc: "في الزوج: عدد A ناقص عدد B.",
    metricSum: "المجموع",
    metricSumDesc: "في الزوج: عدد A زائد عدد B.",
    metricRatio: "النسبة",
    metricRatioDesc: "في الزوج: عدد A مقسومًا على عدد B.",
    metricSharedSurahs: "السور المشتركة",
    metricSharedSurahsDesc:
      "عدد السور التي يظهر فيها المصطلحان مرة واحدة على الأقل.",
    metricJaccard: "تداخل Jaccard",
    metricJaccardDesc:
      "السور المشتركة مقسومة على جميع السور التي يظهر فيها أي من المصطلحين.",
    matching: "طريقة المطابقة",
    diacritics: "إزالة الحركات",
    tatweel: "إزالة التطويل",
    alif: "تطبيع أشكال الألف",
    rootAnalysis: "تحليل الجذر",
    morphology: "التحليل الصرفي",
    substring: "مطابقة السلسلة الجزئية",
    trueValue: "نعم",
    falseValue: "لا",
    notAvailable: "غير متاح",
    dataStatus:
      "حالة البيانات: عرض للبيانات المرصودة. التكرارات والملاحظات الرقمية مرتبطة بمجموعة البيانات وقواعد التحليل الموثقة.",
  },
};

function detectInitialLanguage() {
  const saved = localStorage.getItem("dqm-language");

  if (saved && I18N[saved]) {
    return saved;
  }

  const browser = navigator.language?.toLowerCase() || "en";

  if (browser.startsWith("id")) {
    return "id";
  }

  if (browser.startsWith("ar")) {
    return "ar";
  }

  return "en";
}

function setLanguage(language) {
  if (!I18N[language]) {
    language = "en";
  }

  localStorage.setItem("dqm-language", language);

  document.documentElement.lang = language;

  /*
   * IMPORTANT:
   * Keep the application layout LTR.
   * Arabic content gets RTL direction locally
   * through CSS / element-level direction.
   */
  document.documentElement.dir = "ltr";

  document.documentElement.dataset.language = language;

  return language;
}

Object.assign(I18N.id, {
  statOccurrencesTitle: "Muncul sebanyak",
  statOccurrencesUnit: "kali",
  statOccurrencesDesc:
    "Jumlah kemunculan term ini dalam seluruh corpus yang dihitung.",
  statSurahTitle: "Tersebar di",
  statSurahUnit: "surah",
  statSurahDesc:
    "Term ini ditemukan setidaknya sekali di jumlah surah tersebut dari total 114 surah.",
  statRateTitle: "Tingkat kemunculan",
  statRateUnit: "per 1.000 unit teks",
  statRateDesc:
    "Ukuran untuk melihat seberapa sering term muncul dibanding seluruh potongan teks yang dihitung.",
  statNumberPropertyTitle: "Penjumlahan angka",
  statNumberPropertyUnit: "hasil penjumlahan",
  statNumberPropertyDesc:
    "217 → 2 + 1 + 7 = 10. Ini hanya sifat matematis tambahan, bukan bukti mukjizat.",
  metricToken: "Token",
  metricTokenDesc:
    "Potongan teks yang dihitung komputer setelah aturan pemrosesan diterapkan.",
  metricExactMatch: "Exact match",
  metricExactMatchDesc:
    "Komputer hanya menghitung token yang sama persis setelah normalisasi; bagian dari kata lain tidak otomatis ikut dihitung.",
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
  auditTrail: "Jejak audit",
  surahs: "surah",
});

Object.assign(I18N.en, {
  statOccurrencesTitle: "Appears",
  statOccurrencesUnit: "times",
  statOccurrencesDesc:
    "The total number of times this term appears in the analyzed corpus.",
  statSurahTitle: "Found in",
  statSurahUnit: "surahs",
  statSurahDesc:
    "The term appears at least once in this many of the 114 surahs.",
  statRateTitle: "Occurrence rate",
  statRateUnit: "per 1,000 text units",
  statRateDesc:
    "A normalized way to see how often the term appears relative to the text being counted.",
  statNumberPropertyTitle: "Sum of digits",
  statNumberPropertyUnit: "calculated result",
  statNumberPropertyDesc:
    "217 → 2 + 1 + 7 = 10. This is only an additional mathematical property, not proof of a miracle.",
  metricToken: "Token",
  metricTokenDesc:
    "A piece of text counted by the computer after the processing rules are applied.",
  metricExactMatch: "Exact match",
  metricExactMatchDesc:
    "The computer counts only an exact normalized token; a token containing the same letters is not automatically included.",
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
  auditTrail: "Audit trail",
  surahs: "surahs",
});

Object.assign(I18N.ar, {
  statOccurrencesTitle: "ظهر",
  statOccurrencesUnit: "مرة",
  statOccurrencesDesc:
    "عدد مرات ظهور هذا المصطلح في مجموعة البيانات التي تم تحليلها.",
  statSurahTitle: "ظهر في",
  statSurahUnit: "سورة",
  statSurahDesc:
    "ظهر المصطلح مرة واحدة على الأقل في هذا العدد من أصل ١١٤ سورة.",
  statRateTitle: "معدل الظهور",
  statRateUnit: "لكل ١٠٠٠ وحدة نصية",
  statRateDesc:
    "طريقة موحدة لمعرفة مدى تكرار المصطلح بالنسبة إلى النص الذي تم عده.",
  statNumberPropertyTitle: "مجموع الأرقام",
  statNumberPropertyUnit: "النتيجة المحسوبة",
  statNumberPropertyDesc:
    "٢١٧ ← ٢ + ١ + ٧ = ١٠. هذه خاصية رياضية إضافية فقط وليست إثباتًا لمعجزة.",
  metricToken: "الرمز",
  metricTokenDesc: "جزء من النص يقوم الكمبيوتر بعدّه بعد تطبيق قواعد المعالجة.",
  metricExactMatch: "مطابقة تامة",
  metricExactMatchDesc:
    "يقوم الكمبيوتر بعدّ الرمز المطبع المطابق تمامًا؛ ولا يتم احتساب كلمة أخرى لمجرد احتوائها على الحروف نفسها.",
  whatObserved: "ما الذي لاحظناه؟",
  whatObservedDescription:
    "ملخص للنتائج المقاسة مباشرة من مجموعة البيانات التي تم تحليلها.",
  quranNavigation: "التنقل في القرآن",
  surahExplorer: "مستكشف السور",
  surahExplorerDescription:
    "شاهد كيفية توزيع المصطلح عبر 114 سورة. اختر نقطة لفحص الدليل.",
  surahExplorerCaption: "كل نقطة تمثل سورة واحدة",
  behindObservation: "خلف الملاحظة",
  numbersBehindObservation: "الأرقام خلف الملاحظة",
  methodGuide: "دليل المنهج",
  traceResult: "تتبع النتيجة",
  exploratoryComparison: "مقارنة استكشافية",
  auditTrail: "مسار التدقيق",
  surahs: "سور",
});

Object.assign(I18N.id, {
  category_time: "Waktu",
  category_life: "Kehidupan & Akhirat",
  category_nature: "Alam",
  category_people: "Manusia & Masyarakat",
  category_faith: "Iman & Ibadah",
});

Object.assign(I18N.en, {
  category_time: "Time",
  category_life: "Life & Hereafter",
  category_nature: "Nature",
  category_people: "People & Society",
  category_faith: "Faith & Practice",
});

Object.assign(I18N.ar, {
  category_time: "الزمن",
  category_life: "الحياة والآخرة",
  category_nature: "الطبيعة",
  category_people: "الإنسان والمجتمع",
  category_faith: "الإيمان والعبادة",
});
