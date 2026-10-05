# Digital Quran Miracles

Interactive, data-driven Quran numerical analysis showcase for
**Read Quran for Peace**.

This project is designed as a companion analytical layer for the
existing Digital Quran platform, not as an independent Quran reader.

---

## Purpose

The project presents measurable observations found in the analyzed Quran
corpus through an accessible interactive interface.

The first implementation focuses on:

- frequency counts
- numerical properties
- Surah distribution
- verse-level evidence
- exploratory term-pair analysis

The architecture is intentionally extensible so additional research
themes can be introduced later without rebuilding the Quran navigation
foundation.

Planned future themes include:

- ring composition
- selected scientific observations
- linguistic and rhetorical analysis
- verified historical events
- textual predictions

---

## Current Data Scope

Corpus:

- 114 chapters
- 6,236 verses
- 78,248 normalized tokens

Current analytical catalog:

- 32 Quran terms
- grouped into Time, Life & Hereafter, Nature,
  People & Society, and Faith & Practice

Current terms are analyzed using exact normalized-token matching.

---

## Methodology

The current matching method is:

`exact_normalized_token`

Normalization:

1. remove diacritics
2. remove tatweel
3. normalize common alif variants
4. normalize alif maqsura

The current implementation does **not** use:

- root extraction
- morphological expansion
- substring matching

This distinction is important because the displayed frequencies are
observed results of a documented computational rule rather than broad
semantic searches.

---

## Evidence Model

Every analytical result follows the same traceable path:

`Finding`
→ `Observed Result`
→ `Dataset`
→ `Normalization`
→ `Counting Rule`
→ `Surah`
→ `Ayat`
→ `Token`
→ `Read Quran for Peace`

Verse-level evidence records include:

- Surah number
- Surah label
- Ayat number
- token position
- original verse text
- translation
- normalized target form
- matching method

The interface highlights the detected token directly inside the verse
so users can visually inspect the occurrence.

---

## Application Structure

```text
digital-quran-miracles/
│
├── data/
│   ├── raw/
│   │   ├── uthmani.json
│   │   └── simple-clean.json
│   │
│   ├── processed/
│   │   ├── frequency_index.json
│   │   ├── numerical_findings.json
│   │   ├── surah_distribution.json
│   │   └── pair_analysis.json
│   │
│   └── ...
│
├── web/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── d3-chart.js
│   ├── d3-chart.css
│   ├── i18n.js
│   │
│   └── data/
│       ├── analytics.json
│       └── translations/
│
└── README.md