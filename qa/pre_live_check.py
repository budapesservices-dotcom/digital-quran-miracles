import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

ANALYTICS = ROOT / "web/data/analytics.json"
CORPUS_COMPARISON = (
    ROOT
    / "data"
    / "processed"
    / "corpus_comparison.json"
)
INDEX_HTML = ROOT / "web/index.html"
APP_JS = ROOT / "web/app.js"
D3_JS = ROOT / "web/d3-chart.js"
STYLES = ROOT / "web/styles.css"
D3_STYLES = ROOT / "web/d3-chart.css"
README = ROOT / "README.md"
FAVICON = ROOT / "web/favicon.svg"

TRANSLATIONS = [
    ROOT / "web/data/translations/indonesian.json",
    ROOT / "web/data/translations/english.json",
]


errors = []
warnings = []


def check(condition, message):
    if not condition:
        errors.append(message)


def load_json(path):
    try:
        with path.open(encoding="utf-8") as handle:
            return json.load(handle)
    except Exception as exc:
        errors.append(f"Cannot read JSON: {path} ({exc})")
        return None


def say(label):
    print(f"[PASS] {label}")


def fail(label):
    print(f"[FAIL] {label}")


print()
print("========================================")
print(" DIGITAL QURAN MIRACLES — PRE-LIVE QA")
print("========================================")
print()


# --------------------------------------------------
# Required files
# --------------------------------------------------

required_files = [
    ANALYTICS,
    INDEX_HTML,
    APP_JS,
    D3_JS,
    STYLES,
    D3_STYLES,
    README,
    FAVICON,
    *TRANSLATIONS,
    CORPUS_COMPARISON,
]


for path in required_files:
    if path.exists():
        say(f"File exists: {path.relative_to(ROOT)}")
    else:
        errors.append(
            f"Missing required file: {path.relative_to(ROOT)}"
        )


# --------------------------------------------------
# Analytics dataset
# --------------------------------------------------

data = load_json(ANALYTICS)

if data:
    corpus = data.get("corpus", {})
    terms = data.get("terms", [])
    method = data.get("method", {})

    check(
        corpus.get("chapters") == 114,
        "Corpus chapters must equal 114",
    )

    check(
        corpus.get("verses") == 6236,
        "Corpus verses must equal 6236",
    )

    check(
        len(terms) == 32,
        f"Expected 32 terms, found {len(terms)}",
    )

    check(
        method.get("matching") == "exact_normalized_token",
        "Matching method must be exact_normalized_token",
    )

    check(
        method.get("root_analysis") is False,
        "Root analysis must be disabled",
    )

    check(
        method.get("morphological_analysis") is False,
        "Morphological analysis must be disabled",
    )

    check(
        method.get("substring_matching") is False,
        "Substring matching must be disabled",
    )

    say("Corpus metadata")
    say("32-term catalog")
    say("Exact normalized-token method")
    say("Root / morphology / substring restrictions")

    print()


# --------------------------------------------------
# Cross-corpus consistency verification
# --------------------------------------------------

comparison_data = load_json(
    CORPUS_COMPARISON
)

if comparison_data:

    comparison = comparison_data.get(
        "comparison",
        {}
    )

    term_results = comparison.get(
        "terms",
        []
    )

    discrepancies = comparison.get(
        "discrepancies",
        []
    )

    check(
        comparison.get(
            "all_structure_counts_match"
        )
        is True,
        "Cross-corpus structure verification failed",
    )

    check(
        comparison.get(
            "all_term_counts_match"
        )
        is True,
        "Cross-corpus term verification failed",
    )

    check(
        len(discrepancies) == 0,
        "Cross-corpus verification contains discrepancies",
    )

    check(
        len(term_results) == 32,
        "Cross-corpus verification must cover 32 terms",
    )

    for item in term_results:
        check(
            item.get("match") is True,
            "Cross-corpus mismatch: "
            + str(item.get("word")),
        )

    if not errors:
        say(
            "32-term cross-corpus verification"
        )

        say(
            "Simple-clean ↔ Uthmani: "
            "0 discrepancies"
        )

    print()


# --------------------------------------------------
# Per-term integrity
# --------------------------------------------------

if data:
    terms = data.get("terms", [])

    for term in terms:
        word = term.get("word", "<unknown>")

        count = int(term.get("count", 0) or 0)

        numerical_count = int(
            term.get("numerical", {})
            .get("count", count)
            or 0
        )

        distribution = (
            term.get("distribution", {})
            .get("surahs", {})
            or {}
        )

        occurrences = (
            term.get("evidence", {})
            .get("occurrences", [])
            or []
        )

        summary = (
            term.get("distribution", {})
            .get("summary", {})
            or {}
        )

        distribution_total = sum(
            int(value or 0)
            for value in distribution.values()
        )

        nonzero_surahs = sum(
            1
            for value in distribution.values()
            if int(value or 0) > 0
        )

        check(
            numerical_count == count,
            f"{word}: numerical count does not match count",
        )

        check(
            distribution_total == count,
            f"{word}: Surah distribution sum "
            f"{distribution_total} != count {count}",
        )

        check(
            len(occurrences) == count,
            f"{word}: evidence occurrence count "
            f"{len(occurrences)} != count {count}",
        )

        check(
            summary.get("surahs_with_occurrences", 0)
            == nonzero_surahs,
            f"{word}: Surah coverage summary mismatch",
        )

        for occurrence in occurrences:
            surah = occurrence.get("surah")
            ayah = occurrence.get("ayah")
            token_index = occurrence.get("token_index")
            text = occurrence.get("text", "")

            check(
                1 <= int(surah) <= 114,
                f"{word}: invalid Surah number {surah}",
            )

            check(
                int(ayah) >= 1,
                f"{word}: invalid Ayat number {ayah}",
            )

            check(
                int(token_index) >= 1,
                f"{word}: invalid token index {token_index}",
            )

            check(
                bool(str(text).strip()),
                f"{word}: empty evidence text",
            )

        if count == 0:
            check(
                len(occurrences) == 0,
                f"{word}: zero-frequency term has evidence",
            )

            check(
                distribution_total == 0,
                f"{word}: zero-frequency term has distribution",
            )

    if not errors:
        say("All 32 terms passed integrity checks")

    print()


# --------------------------------------------------
# Pair-analysis integrity
# --------------------------------------------------

if data:
    pair_analysis = data.get(
        "pair_analysis",
        {},
    )

    pairs = pair_analysis.get(
        "pairs",
        [],
    )

    check(
        bool(pairs),
        "Exploratory pair analysis is empty",
    )

    for pair in pairs:
        a = pair.get("counts", {}).get("a", 0)
        b = pair.get("counts", {}).get("b", 0)

        derived = pair.get(
            "derived",
            {},
        )

        expected_difference = a - b

        check(
            derived.get("difference_a_minus_b")
            == expected_difference,
            f"Pair {pair.get('term_a')} ↔ "
            f"{pair.get('term_b')}: difference mismatch",
        )

    if pairs:
        say(
            f"Exploratory pair analysis: "
            f"{len(pairs)} pair(s)"
        )

    print()


# --------------------------------------------------
# Frontend wiring
# --------------------------------------------------

html = (
    INDEX_HTML.read_text(encoding="utf-8")
    if INDEX_HTML.exists()
    else ""
)

app = (
    APP_JS.read_text(encoding="utf-8")
    if APP_JS.exists()
    else ""
)

d3 = (
    D3_JS.read_text(encoding="utf-8")
    if D3_JS.exists()
    else ""
)

styles = (
    STYLES.read_text(encoding="utf-8")
    if STYLES.exists()
    else ""
)


frontend_checks = {
    "Quran source attribution":
    "Tanzil Project" in app
    and "tanzil.net" in app
    and "Simple Clean" in app,

"Quran source metadata":
    data.get("corpus", {}).get(
        "provider"
    ) == "Tanzil Project"
    and data.get("corpus", {}).get(
        "text_type"
    ) == "Simple Clean",

"Uthmani compatibility metadata":
    data.get("method", {}).get(
        "uthmani_compatibility"
    ) is True,

    "Analytics JSON loaded":
        'fetch("./data/analytics.json")' in app,

    "D3 renderer wired":
        "renderD3Distribution" in d3
        and "renderD3Distribution" in app,

    "Evidence renderer wired":
        "renderEvidence" in app,

    "Token highlighting wired":
        "renderEvidenceText" in app,

    "Evidence model wired":
        "renderEvidence" in app
        and "evidence" in app
        and "token_index" in app,

    "Read Quran client integration":
        "readquranforpeace.net/quran" in app,

    "Surah slug mapping":
        "SURAH_SLUGS" in app,

    "Methodology scope":
        "method-scope" in html
        and "methodScope" in app,

    "Favicon":
        "./favicon.svg" in html
        and FAVICON.exists(),

    "D3 insight":
        "d3-insight" in d3
        and "d3-insight" in styles,

    "Pair observations":
        "pair-observation" in app
        and "pair-observation" in styles,
}


for label, condition in frontend_checks.items():
    if condition:
        say(label)
    else:
        errors.append(
            f"Frontend wiring failed: {label}"
        )

print()


# --------------------------------------------------
# Surah URL mapping
# --------------------------------------------------

slug_block = re.search(
    r"const\s+SURAH_SLUGS\s*=\s*\{(.*?)\};",
    app,
    re.S,
)

if slug_block:
    entries = re.findall(
        r"^\s*(\d+)\s*:\s*[\"']([^\"']+)[\"']\s*,?",
        slug_block.group(1),
        re.M,
    )

    slug_numbers = {
        int(number)
        for number, _ in entries
    }

    check(
        len(entries) == 114,
        f"Expected 114 Surah slugs, found {len(entries)}",
    )

    check(
        slug_numbers == set(range(1, 115)),
        "Surah slug mapping must cover 1–114",
    )

    if not errors:
        say("114 Surah client routes mapped")

else:
    errors.append(
        "SURAH_SLUGS mapping not found"
    )

print()


# --------------------------------------------------
# README
# --------------------------------------------------

readme = (
    README.read_text(encoding="utf-8")
    if README.exists()
    else ""
)

readme_checks = [
    "Evidence Model",
    "Methodology",
    "Adding a New Analytical Theme",
    "Read Quran for Peace Integration",
    "Local Development",
]

for heading in readme_checks:
    if heading in readme:
        say(f"README: {heading}")
    else:
        warnings.append(
            f"README section missing: {heading}"
        )

print()


# --------------------------------------------------
# Result
# --------------------------------------------------

print("========================================")

if errors:
    for message in errors:
        fail(message)

    print()
    print(
        f"PRE-LIVE QA: FAILED "
        f"({len(errors)} error(s))"
    )

    if warnings:
        print(
            f"Warnings: {len(warnings)}"
        )

    sys.exit(1)


print("PRE-LIVE QA: PASS")

if warnings:
    print(
        f"Warnings: {len(warnings)}"
    )

print("========================================")
print()