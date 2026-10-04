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
RAW_FILE = ROOT / "data" / "raw" / "simple-clean.json"
OUTPUT_FILE = ROOT / "data" / "processed" / "frequency_index.json"


def build_index(quran: list, words: list[str]) -> dict:
    """
    Build a compact frequency index.

    The index stores summary information for each word,
    while detailed occurrence evidence remains in its
    dedicated JSON file.
    """

    results = []

    for word in words:
        word = word.strip()

        if not word:
            continue

        result = analyze_word(quran, word)
        evidence_file = save_result(result, word)

        results.append(
            {
                "word": word,
                "normalized_word": normalize_arabic(word),
                "count": result["count"],
                "evidence_file": str(
                    evidence_file.relative_to(ROOT)
                ),
            }
        )

    # Highest frequency first
    results.sort(
        key=lambda item: item["count"],
        reverse=True
    )

    # Add rank after sorting
    for rank, item in enumerate(results, start=1):
        item["rank"] = rank

    return {
        "dataset": "data/raw/simple-clean.json",
        "total_chapters": len(quran),
        "total_terms": len(results),
        "matching_method": "exact_normalized_token",
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
    if len(sys.argv) < 2:
        print(
            "Usage:\n"
            "  python analyzer/build_index.py <word1> <word2> ...\n\n"
            "Example:\n"
            "  python analyzer/build_index.py يوم اليوم"
        )
        sys.exit(1)

    words = sys.argv[1:]

    print("Loading Quran corpus...")
    quran = load_quran(RAW_FILE)

    print(f"Building frequency index for {len(words)} term(s)...")

    index = build_index(quran, words)

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        json.dump(
            index,
            file,
            ensure_ascii=False,
            indent=2
        )

    print()
    print("=" * 50)
    print("FREQUENCY INDEX")
    print("=" * 50)

    for item in index["terms"]:
        print(
            f"{item['rank']:>2}. "
            f"{item['word']} "
            f"-> {item['count']}"
        )

    print()
    print(f"Terms analyzed : {index['total_terms']}")
    print(f"Output file    : {OUTPUT_FILE}")
    print("=" * 50)


if __name__ == "__main__":
    main()