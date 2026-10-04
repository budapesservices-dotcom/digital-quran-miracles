import json
from pathlib import Path

from frequency import load_quran, analyze_word


ROOT = Path(__file__).resolve().parent.parent

QURAN_FILE = ROOT / "data" / "raw" / "simple-clean.json"
OUTPUT_FILE = ROOT / "data" / "processed" / "pair_analysis.json"


# Candidate pairs are explicitly exploratory.
# They are NOT treated as proofs or confirmed miracles.
PAIRS = [
    ("يوم", "اليوم"),
    ("الليل", "النهار"),
    ("الدنيا", "الآخرة"),
    ("الحياة", "الموت"),
]


def analyze_pair(quran: list, word_a: str, word_b: str) -> dict:
    result_a = analyze_word(quran, word_a)
    result_b = analyze_word(quran, word_b)

    count_a = result_a["count"]
    count_b = result_b["count"]

    if count_b != 0:
        ratio_a_to_b = round(count_a / count_b, 6)
    else:
        ratio_a_to_b = None

    return {
        "term_a": word_a,
        "term_b": word_b,
        "count_a": count_a,
        "count_b": count_b,
        "derived": {
            "difference_a_minus_b": count_a - count_b,
            "sum": count_a + count_b,
            "equal": count_a == count_b,
            "ratio_a_to_b": ratio_a_to_b,
        },
    }


def main():
    print("Loading Quran corpus...")
    quran = load_quran(QURAN_FILE)

    findings = []

    print("Analyzing candidate pairs...")

    for word_a, word_b in PAIRS:
        result = analyze_pair(
            quran,
            word_a,
            word_b
        )

        findings.append(result)

    output = {
        "title": "Exploratory Term Pair Analysis",
        "status": "candidate_analysis",
        "warning": (
            "Pairs are exploratory observations. "
            "Numerical relationships do not by themselves "
            "establish significance or miraculous status."
        ),
        "method": "exact_normalized_token",
        "pairs": findings,
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
    print("=" * 60)
    print("CANDIDATE PAIR ANALYSIS")
    print("=" * 60)

    for item in findings:
        derived = item["derived"]

        print()
        print(
            f"{item['term_a']} "
            f"({item['count_a']})"
            f"  vs  "
            f"{item['term_b']} "
            f"({item['count_b']})"
        )

        print(
            f"  Difference : "
            f"{derived['difference_a_minus_b']}"
        )
        print(
            f"  Sum        : "
            f"{derived['sum']}"
        )
        print(
            f"  Equal      : "
            f"{derived['equal']}"
        )
        print(
            f"  Ratio      : "
            f"{derived['ratio_a_to_b']}"
        )

    print()
    print(f"Output: {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()