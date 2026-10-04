const state = {
  data: null,
  selectedWord: null,
  evidenceIndex: 0,
  evidenceSurah: "all",
  language: detectInitialLanguage(),
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

function formatNumber(value) {
  return new Intl.NumberFormat(
    state.language === "ar"
      ? "ar-EG"
      : state.language === "id"
        ? "id-ID"
        : "en-US"
  ).format(value);
}

function getSelectedTerm() {
  return state.data.terms.find(
    (term) =>
      term.word === state.selectedWord
  );
}

function getMeaning(term) {
  const metadata = term.metadata || {};

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
    <option value="id">Bahasa Indonesia</option>
    <option value="en">English</option>
    <option value="ar">العربية</option>
  `;

  selector.value =
    state.language;
}

function setText(id, value) {
  const element = $(id);

  if (element) {
    element.textContent = value;
  }
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
    "numerical-title",
    t("numericalObservation")
  );

  setText(
    "numerical-description",
    t("numericalDescription")
  );

  setText(
    "distribution-title",
    t("surahDistribution")
  );

  setText(
    "distribution-description",
    t("surahDistributionDescription")
  );

  setText(
    "chart-caption",
    t("interactiveD3")
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
    "pairs-title",
    t("exploratoryPairs")
  );

  setText(
    "pairs-description",
    t("exploratoryPairsDescription")
  );

  setText(
    "learn-title",
    t("learnMetrics")
  );

  setText(
    "learn-description",
    t("learnMetricsDescription")
  );

  setText(
    "methodology-title",
    t("methodology")
  );

  const search = $("term-search");

  if (search) {
    search.placeholder =
      t("searchPlaceholder");

    search.dir = "auto";
  }
}

function renderTermList(filter = "") {
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
    "faith"
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

    if (categoryCompare !== 0) {
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

    groups[category].push(term);
  }

  let html = "";

  for (const category of categoryOrder) {

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

        <span class="term-category-count">
          ${formatNumber(terms.length)}
        </span>
      </div>
    `;

    html += terms.map((term) => {

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

            <span class="term-word">
              ${escapeHtml(
                term.word
              )}
            </span>

            <span class="term-latin">
              ${escapeHtml(
                metadata.transliteration
                || ""
              )}
            </span>

            <span class="term-meaning">
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
    }).join("");
  }

  $("term-list").innerHTML =
    html;

  document
    .querySelectorAll(".term-button")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          state.selectedWord =
            button.dataset.word;

          state.evidenceIndex = 0;
          state.evidenceSurah =
            "all";

          render();
        }
      );
    });
}


function renderHero(term) {
  const metadata = term.metadata || {};

  const firstOccurrence =
    term.evidence?.occurrences?.[0];

  const surahCount =
    term.distribution.summary
      .surahs_with_occurrences;

  const totalSurahs = 114;

  const rate =
    term.numerical.derived_metrics
      .frequency_per_1000_tokens;

  const count =
    term.count;

  $("feature-word").textContent =
    term.word;

  $("feature-meta").innerHTML = `
    <span class="feature-latin">
      ${escapeHtml(
        metadata.transliteration || ""
      )}
    </span>

    <span class="feature-separator">
      ·
    </span>

    <span class="feature-meaning">
      ${escapeHtml(
        getMeaning(term)
      )}
    </span>
  `;

  $("feature-reference").textContent =
    firstOccurrence
      ? `${t("firstRecorded")}: ` +
        `Surah ${firstOccurrence.surah}, ` +
        `Ayah ${firstOccurrence.ayah}`
      : "";

  $("stats").innerHTML = `
    <div class="stat">
      <div class="stat-label">
        ${t("statOccurrencesTitle")}
      </div>

      <div class="stat-value">
        ${formatNumber(count)}
      </div>

      <div class="stat-unit">
        ${t("statOccurrencesUnit")}
      </div>

      <div class="stat-explanation">
        ${escapeHtml(
          t("statOccurrencesDesc")
        )}
      </div>
    </div>

    <div class="stat">
      <div class="stat-label">
        ${t("statSurahTitle")}
      </div>

      <div class="stat-value">
        ${formatNumber(surahCount)}
      </div>

      <div class="stat-unit">
        ${
          state.language === "id"
            ? `dari ${totalSurahs} ${t("statSurahUnit")}`
            : state.language === "ar"
              ? `من ${totalSurahs} ${t("statSurahUnit")}`
              : `of ${totalSurahs} ${t("statSurahUnit")}`
        }
      </div>

      <div class="stat-explanation">
        ${escapeHtml(
          t("statSurahDesc")
        )}
      </div>
    </div>

    <div class="stat">
      <div class="stat-label">
        ${t("statRateTitle")}
      </div>

      <div class="stat-value">
        ${rate}
      </div>

      <div class="stat-unit">
        ${t("statRateUnit")}
      </div>

      <div class="stat-explanation">
        ${escapeHtml(
          t("statRateDesc")
        )}
      </div>
    </div>

    <div class="stat stat-property">
      <div class="stat-label">
        ${t("statNumberPropertyTitle")}
      </div>

      <div class="stat-value compact">
        ${formatNumber(count)}
        <span class="arrow">→</span>
        ${term.numerical
          .derived_metrics
          .digit_sum}
      </div>

      <div class="stat-unit">
        ${t("statNumberPropertyUnit")}
      </div>

      <div class="stat-explanation">
        ${escapeHtml(
          t("statNumberPropertyDesc")
        )}
      </div>
    </div>
  `;
}


function renderNumerical(term) {
  const metrics =
    term.numerical.derived_metrics;

  const rows = [
    [
      t("frequency"),
      `${formatNumber(term.count)}`
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
        )
    ],
    [
      t("digitSum"),
      `${formatNumber(metrics.digit_sum)}`
    ],
    [
      t("per1000"),
      `${metrics.frequency_per_1000_tokens}`
    ],
    [
      t("metricVerseShare"),
      `${metrics.count_as_percentage_of_verse_total}%`
    ]
  ];

  $("numerical-metrics").innerHTML =
    rows.map(
      ([name, value]) => `
        <div class="metric-row">
          <span class="metric-name">
            ${escapeHtml(name)}
          </span>

          <span class="metric-value">
            ${escapeHtml(value)}
          </span>
        </div>
      `
    ).join("");
}


function renderDistribution(term) {
  const counts =
    term.distribution.surahs;

  const max =
    Math.max(
      ...Object.values(counts),
      1
    );

  $("distribution-bars").innerHTML =
    Object.entries(counts).map(
      ([surah, count]) => {

        const height =
          count === 0
            ? 2
            : Math.max(
                6,
                (count / max) * 180
              );

        const active =
          state.evidenceSurah ===
          String(surah);

        return `
          <button
            class="bar-button ${
              active ? "selected" : ""
            }"
            type="button"
            title="Surah ${surah}: ${count}"
            data-surah="${surah}"
            aria-label="Surah ${surah}: ${count}"
          >
            <span
              class="bar"
              style="height:${height}px"
            ></span>
          </button>
        `;
      }
    ).join("");

  document
    .querySelectorAll(".bar-button")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const surah =
            button.dataset.surah;

          const occurrences =
            term.evidence.occurrences
              .filter(
                (item) =>
                  String(item.surah) ===
                  surah
              );

          if (
            !occurrences.length
          ) {
            return;
          }

          state.evidenceSurah =
            surah;

          state.evidenceIndex = 0;

          renderEvidence(term);
          renderSurahFilter(term);
          renderD3Distribution(term);
        }
      );
    });
}

function renderSurahFilter(term) {
  const counts =
    term.distribution.surahs;

  const options = [
    `<option value="all">${
      t("allSurahs")
    }</option>`,
  ];

  Object.entries(counts)
    .forEach(
      ([surah, count]) => {

        if (count === 0) {
          return;
        }

        options.push(`
          <option
            value="${surah}"
            ${
              state.evidenceSurah ===
              surah
                ? "selected"
                : ""
            }
          >
            ${
              state.language === "ar"
                ? `السورة ${surah} — ${count}`
                : `Surah ${surah} — ${count}`
            }
          </option>
        `);
      }
    );

  $("surah-filter").innerHTML =
    options.join("");
}

function renderEvidence(term) {
  const filtered =
    getFilteredOccurrences(term);

  const total =
    filtered.length;

  if (!total) {

    $("evidence-counter")
      .textContent =
      "0 occurrences";

    $("evidence-summary")
      .textContent =
      state.language === "ar"
        ? "لا توجد أدلة لهذا الاختيار."
        : state.language === "id"
          ? "Tidak ada evidence untuk pilihan ini."
          : "No evidence for this selection.";

    $("evidence-list")
      .innerHTML = `
        <div class="evidence-item">
          ${
            state.language === "ar"
              ? "لا توجد سجلات."
              : state.language === "id"
                ? "Tidak ada record evidence."
                : "No evidence records available."
          }
        </div>
      `;

    $("evidence-jump").value = 0;
    $("previous-evidence").disabled = true;
    $("next-evidence").disabled = true;

    return;
  }

  if (
    state.evidenceIndex >= total
  ) {
    state.evidenceIndex =
      total - 1;
  }

  const current =
    filtered[state.evidenceIndex];

  $("evidence-counter")
    .textContent =
    `${formatNumber(total)} ${t("occurrences")}`;

  $("evidence-summary")
    .textContent =
    `${t("showingOccurrence")} ${
      state.evidenceIndex + 1
    } ${state.language === "ar" ? "من" : "of"} ${total}`;

  $("evidence-jump").value =
    state.evidenceIndex + 1;

  $("previous-evidence").disabled =
    state.evidenceIndex === 0;

  $("next-evidence").disabled =
    state.evidenceIndex === total - 1;

  $("evidence-list")
    .innerHTML = `
      <article class="evidence-item featured-evidence">

        <div class="evidence-ref">
          ${
            state.language === "ar"
              ? `السورة ${current.surah} · الآية ${current.ayah} · الرمز ${current.token_index}`
              : `Surah ${current.surah} · Ayah ${current.ayah} · Token ${current.token_index}`
          }
        </div>

        <p class="evidence-text">
          ${escapeHtml(current.text)}
        </p>

        <div class="evidence-index">
          ${
            state.language === "ar"
              ? `سجل الدليل ${state.evidenceIndex + 1} من ${total}`
              : state.language === "id"
                ? `Record evidence ${state.evidenceIndex + 1} dari ${total}`
                : `Evidence record ${state.evidenceIndex + 1} of ${total}`
          }
        </div>

      </article>
    `;
}

function renderPairs() {
  const pairs =
    state.data.pair_analysis
      .pairs || [];

  $("pair-list")
    .innerHTML =
    pairs.map(
      (pair) => `
        <article class="pair-card">

          <div class="pair-words">

            <button
              class="pair-select"
              type="button"
              data-word="${escapeHtml(pair.term_a)}"
            >
              <span class="pair-word">
                ${escapeHtml(pair.term_a)}
              </span>
            </button>

            <span>↔</span>

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

          <div class="pair-data">
            ${
              t("frequency")
            }:
            ${formatNumber(pair.counts.a)}
            vs
            ${formatNumber(pair.counts.b)}
            · ${t("metricDifference")}:
            ${formatNumber(
              pair.derived
                .difference_a_minus_b
            )}
            · ${t("metricRatio")}:
            ${pair.derived.ratio_a_to_b}
            · ${t("metricSharedSurahs")}:
            ${pair.distribution.shared_surahs}
            · ${t("metricJaccard")}:
            ${pair.distribution.jaccard_overlap}
          </div>

        </article>
      `
    ).join("");

  document
    .querySelectorAll(".pair-select")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          state.selectedWord =
            button.dataset.word;

          state.evidenceIndex = 0;
          state.evidenceSurah = "all";

          render();

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      );
    });
}

function renderMethodology() {
  const method =
    state.data.method;

  const value = (v) =>
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
    value(method.diacritics_removed)
  );

  setText(
    "method-tatweel",
    value(method.tatweel_removed)
  );

  setText(
    "method-alif",
    value(method.alif_variants_normalized)
  );

  setText(
    "method-root",
    value(method.root_analysis)
  );

  setText(
    "method-morphology",
    value(method.morphological_analysis)
  );

  setText(
    "method-substring",
    value(method.substring_matching)
  );

  setText(
    "footer-text",
    t("dataStatus")
  );
}

function renderLearnMetrics() {
  const cards = [
    [
      t("metricFrequency"),
      t("metricFrequencyDesc")
    ],
    [
      t("metricToken"),
      t("metricTokenDesc")
    ],
    [
      t("metricExactMatch"),
      t("metricExactMatchDesc")
    ],
    [
      t("metricDigitSum"),
      t("metricDigitSumDesc")
    ],
    [
      t("metricParity"),
      t("metricParityDesc")
    ],
    [
      t("metricPer1000"),
      t("metricPer1000Desc")
    ],
    [
      t("metricDifference"),
      t("metricDifferenceDesc")
    ],
    [
      t("metricRatio"),
      t("metricRatioDesc")
    ],
    [
      t("metricSharedSurahs"),
      t("metricSharedSurahsDesc")
    ],
    [
      t("metricJaccard"),
      t("metricJaccardDesc")
    ]
  ];

  $("learn-metrics")
    .innerHTML =
    cards.map(
      ([title, description]) => `
        <article class="learn-card">
          <h3>
            ${escapeHtml(title)}
          </h3>

          <p>
            ${escapeHtml(description)}
          </p>
        </article>
      `
    ).join("");
}

function renderD3Safe() {
  const term =
    getSelectedTerm();

  if (
    window.renderD3Distribution
  ) {
    window.renderD3Distribution(term);
  }
}

function render() {
  if (!state.data) {
    return;
  }

  const term =
    getSelectedTerm();

  renderLanguageSelector();
  renderStaticText();
  renderTermList(
    $("term-search").value
  );
  renderHero(term);
  renderNumerical(term);
  renderDistribution(term);
  renderSurahFilter(term);
  renderEvidence(term);
  renderPairs();
  renderMethodology();
  renderLearnMetrics();
  renderD3Safe();
}

function setupEvidenceControls() {

  $("surah-filter")
    .addEventListener(
      "change",
      (event) => {

        state.evidenceSurah =
          event.target.value;

        state.evidenceIndex = 0;

        renderEvidence(
          getSelectedTerm()
        );

        renderDistribution(
          getSelectedTerm()
        );

        renderD3Safe();
      }
    );

  $("previous-evidence")
    .addEventListener(
      "click",
      () => {

        if (
          state.evidenceIndex <= 0
        ) {
          return;
        }

        state.evidenceIndex -= 1;

        renderEvidence(
          getSelectedTerm()
        );
      }
    );

  $("next-evidence")
    .addEventListener(
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

        state.evidenceIndex += 1;

        renderEvidence(
          getSelectedTerm()
        );
      }
    );

  $("evidence-jump")
    .addEventListener(
      "change",
      (event) => {

        const filtered =
          getFilteredOccurrences(
            getSelectedTerm()
          );

        const requested =
          Number(event.target.value) - 1;

        if (
          Number.isNaN(requested) ||
          requested < 0 ||
          requested >= filtered.length
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

    state.selectedWord =
      state.data.terms[0].word;

    $("corpus-badge")
      .textContent =
      `${state.data.corpus.chapters} chapters · ` +
      `${state.data.corpus.verses} verses`;

    $("term-search")
      .addEventListener(
        "input",
        () => {
          renderTermList(
            $("term-search").value
          );
        }
      );

    $("language-select")
      .addEventListener(
        "change",
        (event) => {

          state.language =
            setLanguage(
              event.target.value
            );

          render();
        }
      );

    setupEvidenceControls();
    render();

  } catch (error) {

    $("corpus-badge")
      .textContent =
      "Data unavailable";

    document
      .querySelector(".main")
      .innerHTML = `
        <section class="panel">
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

    console.error(error);
  }
}

loadAnalytics();
