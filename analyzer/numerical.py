import json
from pathlib import Path

from frequency import load_quran, tokenize


ROOT = Path(__file__).resolve().parent.parent

QURAN_FILE = ROOT / "data" / "raw" / "simple-clean.json"
INDEX_FILE = ROOT / "data" / "processed" / "frequency_index.json"
OUTPUT_FILE = ROOT / "data" / "processed" / "numerical_findings.json"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def count_verses(quran: list) -> int:
    return sum(
        len(chapter.get("verses", []))
        for chapter in quran
    )


def count_tokens(quran: list) -> int:
    total = 0

    for chapter in quran:
        for verse in chapter.get("verses", []):
            text = verse.get("text", "")

            if isinstance(text, str):
                total += len(tokenize(text))

    return total


def digit_sum(number: int) -> int:
    return sum(
        int(digit)
        for digit in str(abs(number))
    )


def parity(number: int) -> str:
    return "even" if number % 2 == 0 else "odd"


def build_findings(quran: list, index: dict) -> dict:
    total_verses = count_verses(quran)
    total_tokens = count_tokens(quran)

    findings = []

    for term in index["terms"]:
        word = term["word"]
        count = term["count"]

        frequency_per_1000 = (
            count / total_tokens * 1000
            if total_tokens
            else 0
        )

        verse_percentage = (
            count / total_verses * 100
            if total_verses
            else 0
        )

        findings.append(
            {
                "word": word,
                "normalized_word": term["normalized_word"],
                "count": count,
                "derived_metrics": {
                    "parity": parity(count),
                    "digit_sum": digit_sum(count),
                    "frequency_per_1000_tokens": round(
                        frequency_per_1000,
                        4
                    ),
                    "count_as_percentage_of_verse_total": round(
                        verse_percentage,
                        4
                    ),
                },
                "formulas": {
                    "frequency_per_1000_tokens":
                        "count / total_tokens * 1000",
                    "count_as_percentage_of_verse_total":
                        "count / total_verses * 100",
                    "digit_sum":
                        "sum of decimal digits in count",
                    "parity":
                        "count modulo 2",
                },
                "evidence_file": term["evidence_file"],
            }
        )

    return {
        "title": "Numerical Pattern Findings",
        "status": "observed_data_only",
        "warning": (
            "Derived numerical properties are descriptive observations "
            "and are not, by themselves, evidence of significance."
        ),
        "dataset": "data/raw/simple-clean.json",
        "corpus": {
            "chapters": len(quran),
            "verses": total_verses,
            "tokens": total_tokens,
        },
        "method": "exact_normalized_token",
        "findings": findings,
    }


def main():
    print("Loading Quran corpus...")
    quran = load_quran(QURAN_FILE)

    print("Loading frequency index...")
    index = load_json(INDEX_FILE)

    print("Calculating numerical findings...")

    result = build_findings(
        quran,
        index
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
            result,
            file,
            ensure_ascii=False,
            indent=2
        )

    print()
    print("=" * 60)
    print("NUMERICAL PATTERN FINDINGS")
    print("=" * 60)

    print(
        f"Corpus: "
        f"{result['corpus']['chapters']} chapters, "
        f"{result['corpus']['verses']} verses, "
        f"{result['corpus']['tokens']} tokens"
    )

    print()

    for finding in result["findings"]:
        metrics = finding["derived_metrics"]

        print(
            f"{finding['word']}: "
            f"count={finding['count']}, "
            f"parity={metrics['parity']}, "
            f"digit_sum={metrics['digit_sum']}, "
            f"per_1000={metrics['frequency_per_1000_tokens']}"
        )

    print()
    print(f"Output: {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()