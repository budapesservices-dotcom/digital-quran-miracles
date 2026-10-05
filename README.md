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
├── analyzer/
│   └── analysis scripts
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
│   ├── d3-chart.js
│   ├── d3-chart.css
│   ├── i18n.js
│   ├── app.js
│   ├── favicon.svg
│   │
│   └── data/
│       ├── analytics.json
│       └── translations/
│
└── README.md
Frontend

The interface uses:

HTML
CSS
JavaScript
D3.js

The main interaction flow is:

select a Quran term
inspect its frequency and distribution
explore Surah-level occurrence patterns
inspect numerical metrics
inspect verse-level evidence
open the corresponding Surah in
Read Quran for Peace
explore candidate term-pair relationships

The application keeps the primary experience focused on the Quran text
and uses data visualisation to support inspection rather than replace it.

Data Contract

web/data/analytics.json acts as the frontend analytical data contract.

It currently contains:

corpus metadata
methodology metadata
term catalog
frequencies
numerical metrics
Surah distributions
verse-level evidence
exploratory pair analysis
source references

The frontend reads this contract instead of performing the heavy corpus
analysis in the browser.

This keeps the interface lightweight and makes the analytical pipeline
replaceable.

Updating the Term Catalog

To add another analytical term:

add the term to the source term catalog
run the analysis pipeline
regenerate the processed frequency data
regenerate Surah distributions
regenerate verse-level evidence
regenerate web/data/analytics.json
refresh the frontend

The frontend automatically reads the available term records and does not
require a new hard-coded UI section for every term.

Adding a New Analytical Theme

Future analytical themes should follow the same principle:

Theme
↓
Analyzer
↓
Processed dataset
↓
Analytics contract
↓
Frontend renderer
↓
Verse / Quran evidence

A future theme should provide:

a clear data schema
a documented method
source data
reproducible calculations
evidence references
a user-facing explanation

This allows future categories such as linguistic analysis or ring
composition to reuse the existing navigation and evidence architecture.

Numerical Metrics

Current numerical observations include:

frequency
parity
digit sum
frequency per 1,000 tokens
share of total verses

Exploratory term-pair analysis currently includes:

frequency difference
ratio
shared Surahs
Jaccard overlap

These metrics are presented as observations.

A numerical relationship is not automatically treated as proof of a
miracle, causation, statistical significance, or intended design.

Internationalisation

The interface currently supports:

Bahasa Indonesia
English
Arabic

The Quran analytical structure remains the same across languages while
interface text and explanations are translated independently.

Arabic content is rendered locally with RTL direction while the main
application layout remains stable.

Read Quran for Peace Integration

The project links analytical evidence back to the existing
Read Quran for Peace Quran reader.

The integration uses the detected Surah number to construct the
corresponding client Quran route.

This makes the analytical interface a companion layer:

Analyze → Inspect → Verify in Quran

rather than a separate Quran reading experience.

Local Development

Run the frontend from the repository root:

python -m http.server 8000 --directory web

Then open:

http://localhost:8000
Validation

Before committing frontend changes:

node --check web/app.js
node --check web/d3-chart.js
git diff --check
python qa/pre_live_check.py

The pre-live QA script validates:

required files
corpus metadata
all 32 terms
frequency/distribution/evidence consistency
zero-frequency behavior
exploratory pair calculations
frontend wiring
114 Surah client mappings
README structure
Design Principles
Quran-first

The Quran text and verse evidence remain the primary reference point.

Evidence-first

Every important numerical result should have a traceable route back to
the underlying text and dataset.

Observed-data language

The interface distinguishes measured observations from stronger claims.

Accessible analysis

Technical methodology is available without requiring visitors to already
understand NLP or Quranic studies.

Extensible architecture

New analytical themes should be added as data and analyzers rather than
forcing a new application structure.

Respectful presentation

The visual and linguistic treatment is intended to remain calm,
informative, and respectful of sacred material.

Project Status

Current milestone:

Mathematical Observations

Implemented:

32-term analytical catalog
Quran frequency counts
Surah distribution explorer
numerical metrics
verse-level evidence
normalized-token audit trail
multilingual interface
exploratory term-pair analysis
Read Quran for Peace Surah linking

The architecture is prepared for future analytical themes while keeping
the current mathematical layer independently understandable.

## Public Deployment

The frontend is a static site served from the `web/` directory.

A GitHub Actions workflow at
`.github/workflows/deploy-pages.yml` publishes the current `web/`
directory to GitHub Pages whenever `main` changes.

To enable the public contest demo, open **Settings → Pages** and set
**Build and deployment → Source** to **GitHub Actions**.

The resulting GitHub Pages URL is intended as the stable public demo for
contest review.

## Quran Text Attribution

The Quran text used by this project is sourced from the
**Tanzil Project**.

Primary analytical representation:

- Tanzil Simple Clean
- 114 chapters
- 6,236 verses

A Uthmani representation is additionally used for
cross-corpus consistency verification.

Tanzil's text license requires clear attribution to the
Tanzil Project and a link to `tanzil.net`.

Source:

https://tanzil.net/

License:

Creative Commons Attribution 3.0

License / Attribution

This project is prepared as a contest showcase and analytical companion
concept for Read Quran for Peace.

Source datasets and translation sources should remain documented in the
corresponding data files and application metadata.
```
