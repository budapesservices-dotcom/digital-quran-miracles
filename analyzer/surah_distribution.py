from importlib.metadata import distributions
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent

INDEX_FILE = ROOT / "data" / "processed" / "frequency_index.json"
OUTPUT_FILE = ROOT / "data" / "processed" / "surah_distribution.json"

TOTAL_SURAHS = 114


def load_json(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(
            f"File tidak ditemukan: {path}"
        )

    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def build_distribution(index: dict) -> dict:
    distributions = []

    for term in index["terms"]:
        word = term["word"]

        evidence_path = ROOT / term["evidence_file"]
        evidence = load_json(evidence_path)

        counts = {
            str(surah): 0
            for surah in range(1, TOTAL_SURAHS + 1)
        }

        for occurrence in evidence["occurrences"]:
            surah = occurrence.get("surah")

            if surah is None:
                continue

            surah_key = str(surah)

            if surah_key in counts:
                counts[surah_key] += 1

        occupied = [
            surah
            for surah, count in counts.items()
            if count > 0
        ]

        nonzero_counts = [
            count
            for count in counts.values()
            if count > 0
        ]

        max_count = max(
            counts.values()
        )

        max_surahs = (
            []
            if max_count == 0
            else [
                int(surah)
                for surah, count
                in counts.items()
                if count == max_count
            ]
        )

        distribution = {
            "word": word,
            "normalized_word":
                term["normalized_word"],
            "total_frequency":
                term["count"],
            "surahs":
                counts,
            "summary": {
                "surahs_with_occurrences":
                    len(occupied),

                "surahs_without_occurrences":
                    TOTAL_SURAHS - len(occupied),

                "maximum_occurrences_in_one_surah":
                    max_count,

                "surahs_with_maximum":
                    max_surahs,

                "minimum_nonzero_occurrences": (
                    min(nonzero_counts)
                    if nonzero_counts
                    else 0
                ),
            },
            "evidence_file":
                term["evidence_file"],
        }

        distributions.append(
            distribution
        )

    return {
        "title":
            "Per-Surah Frequency Distribution",

        "status":
            "observed_data_only",

        "method":
            "aggregate existing occurrence evidence by surah",

        "total_surahs":
            TOTAL_SURAHS,

        "terms":
            distributions,
    }

def main():
    print("Loading frequency index...")
    index = load_json(INDEX_FILE)

    print("Building per-surah distributions...")
    result = build_distribution(index)

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
    print("SURAH DISTRIBUTION")
    print("=" * 60)

    for term in result["terms"]:
        summary = term["summary"]

        print()
        print(f"Word: {term['word']}")
        print(f"Total frequency      : {term['total_frequency']}")
        print(
            "Surahs with matches  : "
            f"{summary['surahs_with_occurrences']}"
        )
        print(
            "Surahs without match : "
            f"{summary['surahs_without_occurrences']}"
        )
        print(
            "Maximum in one surah : "
            f"{summary['maximum_occurrences_in_one_surah']}"
        )
        print(
            "Surahs at maximum    : "
            f"{summary['surahs_with_maximum']}"
        )
        print(
            "Minimum nonzero      : "
            f"{summary['minimum_nonzero_occurrences']}"
        )

    print()
    print(f"Output: {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()