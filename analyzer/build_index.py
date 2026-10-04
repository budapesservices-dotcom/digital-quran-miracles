import json
import sys
from pathlib import Path

from frequency import (
    load_quran,
    normalize_arabic,
    analyze_word,
    save_result,
)


ROOT = Path(__file__).resolve().parent.parent

RAW_FILE = (
    ROOT
    / "data"
    / "raw"
    / "simple-clean.json"
)

CATALOG_FILE = (
    ROOT
    / "data"
    / "term_catalog.json"
)

OUTPUT_FILE = (
    ROOT
    / "data"
    / "processed"
    / "frequency_index.json"
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


def load_catalog() -> list[dict]:
    data = load_json(CATALOG_FILE)

    terms = data.get("terms")

    if not isinstance(terms, list):
        raise ValueError(
            "Catalog harus memiliki field 'terms' berupa list."
        )

    seen = set()

    for term in terms:

        word = term.get("word")

        if not word:
            raise ValueError(
                "Setiap catalog term harus memiliki 'word'."
            )

        if word in seen:
            raise ValueError(
                f"Duplicate catalog term: {word}"
            )

        seen.add(word)

    return terms


def build_index(
    quran: list,
    catalog: list[dict]
) -> dict:

    results = []

    for entry in catalog:

        word = entry["word"]

        print(
            f"Analyzing {word}..."
        )

        result = analyze_word(
            quran,
            word
        )

        evidence_file = save_result(
            result,
            word
        )

        results.append(
            {
                "word": word,

                "normalized_word":
                    normalize_arabic(word),

                "category":
                    entry["category"],

                "rank": None,

                "count":
                    result["count"],

                "metadata": {
                    "transliteration":
                        entry["transliteration"],

                    "meaning_id":
                        entry["meaning_id"],

                    "meaning_en":
                        entry["meaning_en"],

                    "meaning_ar":
                        entry["meaning_ar"],

                    "meaning_note":
                        entry.get(
                            "meaning_note",
                            ""
                        ),
                },

                "evidence_file":
                    str(
                        evidence_file.relative_to(
                            ROOT
                        )
                    ),
            }
        )

    results.sort(
        key=lambda item: item["count"],
        reverse=True
    )

    for rank, item in enumerate(
        results,
        start=1
    ):
        item["rank"] = rank

    return {
        "schema_version": "1.0.0",

        "dataset":
            "data/raw/simple-clean.json",

        "catalog":
            "data/term_catalog.json",

        "total_chapters":
            len(quran),

        "total_terms":
            len(results),

        "matching_method":
            "exact_normalized_token",

        "analysis_rules": {
            "diacritics_removed": True,
            "tatweel_removed": True,
            "alif_variants_normalized": True,
            "alif_maqsura_normalized": True,
            "root_analysis": False,
            "morphological_analysis": False,
            "substring_matching": False,
        },

        "terms": results,
    }


def main():

    # Optional term filtering remains available:
    #
    # python analyzer/build_index.py يوم اليوم
    #
    # Without arguments, the entire catalog is analyzed.

    catalog = load_catalog()

    if len(sys.argv) > 1:

        requested = set(
            sys.argv[1:]
        )

        catalog = [
            term
            for term in catalog
            if term["word"] in requested
        ]

        missing = sorted(
            requested
            - {
                term["word"]
                for term in catalog
            }
        )

        if missing:
            raise ValueError(
                "Terms not found in catalog: "
                + ", ".join(missing)
            )

    print(
        f"Catalog terms to analyze: "
        f"{len(catalog)}"
    )

    print(
        "Loading Quran corpus..."
    )

    quran = load_quran(
        RAW_FILE
    )

    print(
        "Building frequency index..."
    )

    index = build_index(
        quran,
        catalog
    )

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            index,
            file,
            ensure_ascii=False,
            indent=2
        )

    print()
    print("=" * 60)
    print("FREQUENCY INDEX")
    print("=" * 60)

    for item in index["terms"]:

        print(
            f"{item['rank']:>2}. "
            f"{item['word']} "
            f"-> {item['count']} "
            f"[{item['category']}]"
        )

    print()
    print(
        f"Terms analyzed : "
        f"{index['total_terms']}"
    )

    print(
        f"Output file    : "
        f"{OUTPUT_FILE}"
    )

    print("=" * 60)


if __name__ == "__main__":
    main()
