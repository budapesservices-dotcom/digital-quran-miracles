import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent

INDEX_FILE = ROOT / "data" / "processed" / "frequency_index.json"
DISTRIBUTION_FILE = (
    ROOT / "data" / "processed" / "surah_distribution.json"
)
OUTPUT_FILE = ROOT / "data" / "processed" / "pair_analysis.json"


# Exploratory candidate pairs.
# These are observations to investigate, not predefined proofs.
PAIRS = [
    ("يوم", "اليوم"),
    ("الليل", "النهار"),
    ("الدنيا", "الآخرة"),
    ("الحياة", "الموت"),
]


def load_json(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(
            f"File tidak ditemukan: {path}"
        )

    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def build_term_lookup(index: dict) -> dict:
    return {
        item["word"]: item
        for item in index.get("terms", [])
    }


def build_distribution_lookup(distribution: dict) -> dict:
    return {
        item["word"]: item
        for item in distribution.get("terms", [])
    }


def calculate_pair(
    term_a: dict,
    term_b: dict,
    distribution_a: dict | None,
    distribution_b: dict | None,
) -> dict:

    count_a = term_a["count"]
    count_b = term_b["count"]

    difference = count_a - count_b
    total = count_a + count_b

    ratio = (
        round(count_a / count_b, 6)
        if count_b != 0
        else None
    )

    shared_surahs = None
    jaccard_overlap = None

    if distribution_a and distribution_b:

        surahs_a = {
            surah
            for surah, count
            in distribution_a["surahs"].items()
            if count > 0
        }

        surahs_b = {
            surah
            for surah, count
            in distribution_b["surahs"].items()
            if count > 0
        }

        intersection = surahs_a & surahs_b
        union = surahs_a | surahs_b

        shared_surahs = len(intersection)

        jaccard_overlap = (
            round(
                len(intersection) / len(union),
                6
            )
            if union
            else None
        )

    return {
        "term_a": term_a["word"],
        "term_b": term_b["word"],

        "counts": {
            "a": count_a,
            "b": count_b,
        },

        "derived": {
            "difference_a_minus_b": difference,
            "sum": total,
            "equal": count_a == count_b,
            "ratio_a_to_b": ratio,
        },

        "distribution": {
            "shared_surahs": shared_surahs,
            "jaccard_overlap": jaccard_overlap,
        },

        "evidence": {
            "term_a_file": term_a["evidence_file"],
            "term_b_file": term_b["evidence_file"],
        },

        "formulas": {
            "difference_a_minus_b":
                "count_a - count_b",
            "sum":
                "count_a + count_b",
            "ratio_a_to_b":
                "count_a / count_b",
            "jaccard_overlap":
                "|surahs_a ∩ surahs_b| / |surahs_a ∪ surahs_b|",
        },
    }


def main():

    print("Loading frequency index...")
    index = load_json(INDEX_FILE)

    print("Loading surah distribution...")
    distribution = load_json(DISTRIBUTION_FILE)

    term_lookup = build_term_lookup(index)
    distribution_lookup = build_distribution_lookup(
        distribution
    )

    findings = []

    print("Analyzing candidate pairs...")

    for word_a, word_b in PAIRS:

        if word_a not in term_lookup:
            raise ValueError(
                f"Term tidak ditemukan di frequency index: {word_a}"
            )

        if word_b not in term_lookup:
            raise ValueError(
                f"Term tidak ditemukan di frequency index: {word_b}"
            )

        finding = calculate_pair(
            term_lookup[word_a],
            term_lookup[word_b],
            distribution_lookup.get(word_a),
            distribution_lookup.get(word_b),
        )

        findings.append(finding)

    output = {
        "title": "Exploratory Term Pair Analysis",

        "status": "candidate_analysis",

        "warning": (
            "These are exploratory numerical observations. "
            "A numerical relationship does not by itself "
            "establish statistical significance, causation, "
            "or miraculous status."
        ),

        "method": {
            "frequency_source":
                "data/processed/frequency_index.json",
            "distribution_source":
                "data/processed/surah_distribution.json",
            "matching":
                "exact_normalized_token",
        },

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
    print("=" * 65)
    print("EVIDENCE-LINKED PAIR ANALYSIS")
    print("=" * 65)

    for item in findings:

        counts = item["counts"]
        derived = item["derived"]
        distribution = item["distribution"]

        print()
        print(
            f"{item['term_a']} "
            f"({counts['a']})"
            f"  vs  "
            f"{item['term_b']} "
            f"({counts['b']})"
        )

        print(
            f"  Difference       : "
            f"{derived['difference_a_minus_b']}"
        )

        print(
            f"  Sum              : "
            f"{derived['sum']}"
        )

        print(
            f"  Equal            : "
            f"{derived['equal']}"
        )

        print(
            f"  Ratio            : "
            f"{derived['ratio_a_to_b']}"
        )

        print(
            f"  Shared surahs    : "
            f"{distribution['shared_surahs']}"
        )

        print(
            f"  Jaccard overlap  : "
            f"{distribution['jaccard_overlap']}"
        )

        print(
            f"  Evidence A       : "
            f"{item['evidence']['term_a_file']}"
        )

        print(
            f"  Evidence B       : "
            f"{item['evidence']['term_b_file']}"
        )

    print()
    print(f"Output: {OUTPUT_FILE}")
    print("=" * 65)


if __name__ == "__main__":
    main()