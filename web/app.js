const state = {
  data: null,
  selectedWord: null,
};

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getSelectedTerm() {
  return state.data.terms.find(
    (term) => term.word === state.selectedWord
  );
}

function renderTermList(filter = "") {
  const normalizedFilter = filter.trim();

  const terms = state.data.terms.filter((term) =>
    term.word.includes(normalizedFilter)
  );

  $("term-list").innerHTML = terms.map((term) => `
    <button
      class="term-button ${term.word === state.selectedWord ? "active" : ""}"
      data-word="${escapeHtml(term.word)}"
      type="button"
    >
      <span class="term-word">${escapeHtml(term.word)}</span>
      <span class="term-count">${formatNumber(term.count)}</span>
    </button>
  `).join("");

  document.querySelectorAll(".term-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedWord = button.dataset.word;
      render();
    });
  });
}

function renderHero(term) {
  const firstOccurrence = term.evidence?.occurrences?.[0];

  $("feature-word").textContent = term.word;

  $("feature-reference").textContent = firstOccurrence
    ? `First recorded occurrence: Surah ${firstOccurrence.surah}, Ayah ${firstOccurrence.ayah}`
    : "No occurrence reference available.";

  $("stats").innerHTML = `
    <div class="stat">
      <div class="stat-label">Frequency</div>
      <div class="stat-value">${formatNumber(term.count)}</div>
    </div>

    <div class="stat">
      <div class="stat-label">Surahs with term</div>
      <div class="stat-value">
        ${formatNumber(
          term.distribution.summary.surahs_with_occurrences
        )}
      </div>
    </div>

    <div class="stat">
      <div class="stat-label">Digit sum</div>
      <div class="stat-value">
        ${formatNumber(
          term.numerical.derived_metrics.digit_sum
        )}
      </div>
    </div>

    <div class="stat">
      <div class="stat-label">Per 1,000 tokens</div>
      <div class="stat-value">
        ${term.numerical.derived_metrics.frequency_per_1000_tokens}
      </div>
    </div>
  `;
}

function renderNumerical(term) {
  const metrics = term.numerical.derived_metrics;

  const rows = [
    ["Frequency", formatNumber(term.count)],
    ["Parity", metrics.parity],
    ["Digit sum", metrics.digit_sum],
    [
      "Frequency / 1,000 tokens",
      metrics.frequency_per_1000_tokens,
    ],
    [
      "Share of verse total",
      `${metrics.count_as_percentage_of_verse_total}%`,
    ],
  ];

  $("numerical-metrics").innerHTML = rows.map(
    ([name, value]) => `
      <div class="metric-row">
        <span class="metric-name">${escapeHtml(name)}</span>
        <span class="metric-value">${escapeHtml(value)}</span>
      </div>
    `
  ).join("");
}

function renderDistribution(term) {
  const counts = term.distribution.surahs;
  const max = Math.max(...Object.values(counts), 1);

  $("distribution-bars").innerHTML =
    Object.entries(counts).map(([surah, count]) => {
      const height = count === 0
        ? 2
        : Math.max(6, (count / max) * 180);

      return `
        <div
          class="bar"
          title="Surah ${surah}: ${count} occurrence(s)"
          style="height:${height}px"
        ></div>
      `;
    }).join("");
}

function renderEvidence(term) {
  const occurrences =
    term.evidence?.occurrences?.slice(0, 8) || [];

  if (!occurrences.length) {
    $("evidence-list").innerHTML =
      "<div class='evidence-item'>No evidence records available.</div>";
    return;
  }

  $("evidence-list").innerHTML = occurrences.map(
    (item) => `
      <article class="evidence-item">
        <div class="evidence-ref">
          Surah ${escapeHtml(item.surah)}
          · Ayah ${escapeHtml(item.ayah)}
          · Token ${escapeHtml(item.token_index)}
        </div>

        <p class="evidence-text">
          ${escapeHtml(item.text)}
        </p>
      </article>
    `
  ).join("");
}

function renderPairs() {
  const pairs = state.data.pair_analysis.pairs || [];

  $("pair-list").innerHTML = pairs.map((pair) => `
    <article class="pair-card">
      <div class="pair-words">
        <span class="pair-word">${escapeHtml(pair.term_a)}</span>
        <span>↔</span>
        <span class="pair-word">${escapeHtml(pair.term_b)}</span>
      </div>

      <div class="pair-data">
        Counts: ${formatNumber(pair.counts.a)}
        vs ${formatNumber(pair.counts.b)}
        · Difference:
        ${formatNumber(pair.derived.difference_a_minus_b)}
        · Ratio:
        ${pair.derived.ratio_a_to_b}
        · Shared surahs:
        ${pair.distribution.shared_surahs}
        · Jaccard:
        ${pair.distribution.jaccard_overlap}
      </div>
    </article>
  `).join("");
}

function renderMethodology() {
  const method = state.data.method;

  $("method-matching").textContent = method.matching;
  $("method-diacritics").textContent = method.diacritics_removed;
  $("method-tatweel").textContent = method.tatweel_removed;
  $("method-alif").textContent = method.alif_variants_normalized;
  $("method-root").textContent = method.root_analysis;
  $("method-morphology").textContent = method.morphological_analysis;
  $("method-substring").textContent = method.substring_matching;
}

function render() {
  const term = getSelectedTerm();

  renderTermList($("term-search").value);
  renderHero(term);
  renderNumerical(term);
  renderDistribution(term);
  renderEvidence(term);
  renderPairs();
  renderMethodology();
}

async function loadAnalytics() {
  try {
    const response = await fetch("./data/analytics.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    state.data = await response.json();
    state.selectedWord = state.data.terms[0].word;

    $("corpus-badge").textContent =
      `${state.data.corpus.chapters} chapters · ` +
      `${state.data.corpus.verses} verses`;

    $("term-search").addEventListener("input", () => {
      renderTermList($("term-search").value);
    });

    render();
  } catch (error) {
    $("corpus-badge").textContent = "Data unavailable";

    document.querySelector(".main").innerHTML = `
      <section class="panel">
        <h2>Unable to load analytical data.</h2>
        <p>${escapeHtml(error.message)}</p>
      </section>
    `;

    console.error(error);
  }
}

loadAnalytics();
