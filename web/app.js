const state = {
  data: null,
  selectedWord: null,
  evidenceIndex: 0,
  evidenceSurah: "all",
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

function getFilteredOccurrences(term) {
  const occurrences = term.evidence?.occurrences || [];

  if (state.evidenceSurah === "all") {
    return occurrences;
  }

  return occurrences.filter(
    (item) => String(item.surah) === state.evidenceSurah
  );
}

function renderTermList(filter = "") {
  const normalizedFilter = filter.trim();

  const terms = state.data.terms.filter((term) =>
    term.word.includes(normalizedFilter)
  );

  $("term-list").innerHTML = terms.map((term) => `
    <button
      class="term-button ${
        term.word === state.selectedWord ? "active" : ""
      }"
      data-word="${escapeHtml(term.word)}"
      type="button"
    >
      <span class="term-word">
        ${escapeHtml(term.word)}
      </span>

      <span class="term-count">
        ${formatNumber(term.count)}
      </span>
    </button>
  `).join("");

  document.querySelectorAll(".term-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedWord = button.dataset.word;
      state.evidenceIndex = 0;
      state.evidenceSurah = "all";
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
      <div class="stat-value">
        ${formatNumber(term.count)}
      </div>
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
        ${
          term.numerical
            .derived_metrics
            .frequency_per_1000_tokens
        }
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
  const counts = term.distribution.surahs;
  const max = Math.max(...Object.values(counts), 1);

  $("distribution-bars").innerHTML =
    Object.entries(counts).map(([surah, count]) => {

      const height = count === 0
        ? 2
        : Math.max(6, (count / max) * 180);

      const active =
        state.evidenceSurah === String(surah);

      return `
        <button
          class="bar-button ${active ? "selected" : ""}"
          type="button"
          title="Surah ${surah}: ${count} occurrence(s)"
          data-surah="${surah}"
          aria-label="Surah ${surah}: ${count} occurrence(s)"
        >
          <span
            class="bar"
            style="height:${height}px"
          ></span>
        </button>
      `;
    }).join("");

  document.querySelectorAll(".bar-button").forEach(
    (button) => {
      button.addEventListener("click", () => {

        const surah = button.dataset.surah;

        const occurrences =
          term.evidence.occurrences.filter(
            (item) => String(item.surah) === surah
          );

        if (!occurrences.length) {
          return;
        }

        state.evidenceSurah = surah;
        state.evidenceIndex = 0;

        renderEvidence(term);
        renderDistribution(term);
      });
    }
  );
}

function renderSurahFilter(term) {
  const counts = term.distribution.surahs;

  const options = [
    `<option value="all">All surahs</option>`,
  ];

  Object.entries(counts).forEach(
    ([surah, count]) => {

      if (count === 0) {
        return;
      }

      options.push(`
        <option
          value="${surah}"
          ${state.evidenceSurah === surah ? "selected" : ""}
        >
          Surah ${surah} — ${count} occurrence${
            count === 1 ? "" : "s"
          }
        </option>
      `);
    }
  );

  $("surah-filter").innerHTML = options.join("");
}

function renderEvidence(term) {
  const filtered = getFilteredOccurrences(term);

  const total = filtered.length;

  if (!total) {
    $("evidence-counter").textContent = "0 occurrences";
    $("evidence-summary").textContent =
      "No occurrences for this selection.";

    $("evidence-list").innerHTML = `
      <div class="evidence-item">
        No evidence records available for the selected surah.
      </div>
    `;

    $("evidence-jump").value = 0;
    $("previous-evidence").disabled = true;
    $("next-evidence").disabled = true;

    return;
  }

  if (state.evidenceIndex >= total) {
    state.evidenceIndex = total - 1;
  }

  const current = filtered[state.evidenceIndex];

  $("evidence-counter").textContent =
    `${formatNumber(total)} occurrence${
      total === 1 ? "" : "s"
    }`;

  $("evidence-summary").textContent =
    `Showing occurrence ${
      state.evidenceIndex + 1
    } of ${total}`;

  $("evidence-jump").value =
    state.evidenceIndex + 1;

  $("previous-evidence").disabled =
    state.evidenceIndex === 0;

  $("next-evidence").disabled =
    state.evidenceIndex === total - 1;

  $("evidence-list").innerHTML = `
    <article class="evidence-item featured-evidence">

      <div class="evidence-ref">
        Surah ${escapeHtml(current.surah)}
        · Ayah ${escapeHtml(current.ayah)}
        · Token ${escapeHtml(current.token_index)}
      </div>

      <p class="evidence-text">
        ${escapeHtml(current.text)}
      </p>

      <div class="evidence-index">
        Evidence record ${
          state.evidenceIndex + 1
        } of ${total}
      </div>

    </article>
  `;
}

function renderPairs() {
  const pairs = state.data.pair_analysis.pairs || [];

  $("pair-list").innerHTML = pairs.map((pair) => `
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
        Counts:
        ${formatNumber(pair.counts.a)}
        vs
        ${formatNumber(pair.counts.b)}
        · Difference:
        ${formatNumber(
          pair.derived.difference_a_minus_b
        )}
        · Ratio:
        ${pair.derived.ratio_a_to_b}
        · Shared surahs:
        ${pair.distribution.shared_surahs}
        · Jaccard:
        ${pair.distribution.jaccard_overlap}
      </div>

    </article>
  `).join("");

  document.querySelectorAll(".pair-select").forEach(
    (button) => {
      button.addEventListener("click", () => {
        state.selectedWord = button.dataset.word;
        state.evidenceIndex = 0;
        state.evidenceSurah = "all";
        render();

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }
  );
}

function renderMethodology() {
  const method = state.data.method;

  $("method-matching").textContent =
    method.matching;

  $("method-diacritics").textContent =
    method.diacritics_removed;

  $("method-tatweel").textContent =
    method.tatweel_removed;

  $("method-alif").textContent =
    method.alif_variants_normalized;

  $("method-root").textContent =
    method.root_analysis;

  $("method-morphology").textContent =
    method.morphological_analysis;

  $("method-substring").textContent =
    method.substring_matching;
}

function render() {
  const term = getSelectedTerm();

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
}

function setupEvidenceControls() {
  $("surah-filter").addEventListener(
    "change",
    (event) => {

      state.evidenceSurah = event.target.value;
      state.evidenceIndex = 0;

      renderEvidence(
        getSelectedTerm()
      );

      renderDistribution(
        getSelectedTerm()
      );
    }
  );

  $("previous-evidence").addEventListener(
    "click",
    () => {

      if (state.evidenceIndex <= 0) {
        return;
      }

      state.evidenceIndex -= 1;

      renderEvidence(
        getSelectedTerm()
      );
    }
  );

  $("next-evidence").addEventListener(
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

  $("evidence-jump").addEventListener(
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

      state.evidenceIndex = requested;

      renderEvidence(
        getSelectedTerm()
      );
    }
  );
}

async function loadAnalytics() {
  try {

    const response =
      await fetch("./data/analytics.json");

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    state.data =
      await response.json();

    state.selectedWord =
      state.data.terms[0].word;

    $("corpus-badge").textContent =
      `${state.data.corpus.chapters} chapters · ` +
      `${state.data.corpus.verses} verses`;

    $("term-search").addEventListener(
      "input",
      () => {
        renderTermList(
          $("term-search").value
        );
      }
    );

    setupEvidenceControls();
    render();

  } catch (error) {

    $("corpus-badge").textContent =
      "Data unavailable";

    document.querySelector(".main").innerHTML = `
      <section class="panel">
        <h2>Unable to load analytical data.</h2>
        <p>
          ${escapeHtml(error.message)}
        </p>
      </section>
    `;

    console.error(error);
  }
}

loadAnalytics();
