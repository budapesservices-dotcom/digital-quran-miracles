import json
from pathlib import Path

from frequency import load_quran, normalize_arabic, tokenize


ROOT = Path(__file__).resolve().parent.parent

CORPORA = {
    "simple-clean": ROOT / "data" / "raw" / "simple-clean.json",
    "uthmani": ROOT / "data" / "raw" / "uthmani.json",
}

CATALOG_FILE = ROOT / "data" / "term_catalog.json"

OUTPUT_FILE = (
    ROOT
    / "data"
    / "processed"
    / "corpus_comparison.json"
)


def load_json(path: Path):
    if not path.exists():
        raise FileNotFoundError(
            f"File tidak ditemukan: {path}"
        )

    with path.open(
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def load_terms() -> list[str]:
    catalog = load_json(
        CATALOG_FILE
    )

    terms = catalog.get(
        "terms"
    )

    if not isinstance(
        terms,
        list
    ):
        raise ValueError(
            "Term catalog harus memiliki field 'terms' berupa list."
        )

    words = []
    seen = set()

    for entry in terms:
        word = entry.get("word")

        if not word:
            raise ValueError(
                "Setiap catalog term harus memiliki 'word'."
            )

        if word in seen:
            raise ValueError(
                f"Duplicate catalog term: {word}"
            )

        seen.add(word)
        words.append(word)

    return words


def analyze_catalog(
    quran: list,
    terms: list[str]
) -> dict:
    """
    Analyze all catalog terms against one Quran corpus.

    Each verse is tokenized once, making the comparison
    considerably more efficient than running the full
    corpus scan separately for every term.
    """

    normalized_lookup = {
        normalize_arabic(word): word
        for word in terms
    }

    counts = {
        word: 0
        for word in terms
    }

    total_verses = 0
    total_tokens = 0

    for chapter in quran:
        for verse in chapter.get(
            "verses",
            []
        ):
            total_verses += 1

            text = verse.get(
                "text",
                ""
            )

            if not isinstance(
                text,
                str
            ):
                continue

            tokens = tokenize(
                text
            )

            total_tokens += len(
                tokens
            )

            for token in tokens:
                original_word = normalized_lookup.get(
                    token
                )

                if original_word is not None:
                    counts[original_word] += 1

    return {
        "chapters": len(quran),
        "verses": total_verses,
        "tokens": total_tokens,
        "terms": {
            word: {
                "normalized_word": normalize_arabic(
                    word
                ),
                "count": counts[word],
            }
            for word in terms
        },
    }


def compare_results(
    simple_clean: dict,
    uthmani: dict
) -> dict:
    discrepancies = []

    structure_match = (
        simple_clean["chapters"]
        == uthmani["chapters"]
        and
        simple_clean["verses"]
        == uthmani["verses"]
    )

    if not structure_match:
        discrepancies.append(
            {
                "type": "structure",
                "simple_clean": {
                    "chapters":
                        simple_clean["chapters"],
                    "verses":
                        simple_clean["verses"],
                },
                "uthmani": {
                    "chapters":
                        uthmani["chapters"],
                    "verses":
                        uthmani["verses"],
                },
            }
        )

    term_results = []

    for word in simple_clean["terms"]:

        simple_count = simple_clean[
            "terms"
        ][word]["count"]

        uthmani_count = uthmani[
            "terms"
        ][word]["count"]

        difference = (
            simple_count
            - uthmani_count
        )

        match = (
            difference == 0
        )

        result = {
            "word": word,
            "normalized_word":
                simple_clean["terms"][word][
                    "normalized_word"
                ],
            "simple_clean":
                simple_count,
            "uthmani":
                uthmani_count,
            "difference":
                difference,
            "match":
                match,
        }

        term_results.append(
            result
        )

        if not match:
            discrepancies.append(
                {
                    "type":
                        "term_frequency",
                    "term":
                        word,
                    "simple_clean":
                        simple_count,
                    "uthmani":
                        uthmani_count,
                    "difference":
                        difference,
                }
            )

    all_term_counts_match = (
        len(
            [
                item
                for item in term_results
                if not item["match"]
            ]
        )
        == 0
    )

    return {
        "all_structure_counts_match":
            structure_match,

        "all_term_counts_match":
            all_term_counts_match,

        "terms":
            term_results,

        "discrepancies":
            discrepancies,
    }


def main():
    print()
    print("=" * 65)
    print("FULL CORPUS CONSISTENCY CHECK")
    print("=" * 65)

    terms = load_terms()

    print(
        f"Catalog terms: {len(terms)}"
    )

    results = {}

    for name, path in CORPORA.items():

        print()
        print(
            f"Loading corpus: {name}"
        )

        quran = load_quran(
            path
        )

        analysis = analyze_catalog(
            quran,
            terms
        )

        results[name] = {
            "file":
                str(
                    path.relative_to(
                        ROOT
                    )
                ),
            **analysis,
        }

        print(
            f"  Chapters : "
            f"{analysis['chapters']}"
        )

        print(
            f"  Verses   : "
            f"{analysis['verses']}"
        )

        print(
            f"  Tokens   : "
            f"{analysis['tokens']}"
        )

    comparison = compare_results(
        results["simple-clean"],
        results["uthmani"]
    )

    output = {
        "schema_version":
            "1.0.0",

        "title":
            "Full Corpus Consistency Comparison",

        "status":
            "verification",

        "analysis_method":
            "exact_normalized_token",

        "purpose": (
            "Verify that normalized-token frequencies "
            "remain consistent across the simple-clean "
            "and Uthmani representations of the Quran corpus."
        ),

        "catalog":
            "data/term_catalog.json",

        "corpora":
            results,

        "comparison":
            comparison,
    }

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            output,
            file,
            ensure_ascii=False,
            indent=2
        )

    print()
    print("=" * 65)
    print("RESULT")
    print("=" * 65)

    print(
        "Structure counts match : "
        f"{comparison['all_structure_counts_match']}"
    )

    print(
        "32-term counts match   : "
        f"{comparison['all_term_counts_match']}"
    )

    print(
        "Discrepancies           : "
        f"{len(comparison['discrepancies'])}"
    )

    if comparison["discrepancies"]:

        print()
        print("DISCREPANCIES")

        for item in comparison[
            "discrepancies"
        ]:
            print(
                f"  {item}"
            )

    print()
    print(
        f"Output: {OUTPUT_FILE}"
    )

    print("=" * 65)

    if not comparison[
        "all_structure_counts_match"
    ]:
        raise SystemExit(1)

    if not comparison[
        "all_term_counts_match"
    ]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()