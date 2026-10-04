import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent

PROCESSED_DIR = ROOT / "data" / "processed"
WEB_DATA_DIR = ROOT / "web" / "data"

FILES = {
    "frequency_index": "frequency_index.json",
    "numerical_findings": "numerical_findings.json",
    "surah_distribution": "surah_distribution.json",
    "pair_analysis": "pair_analysis.json",
}


def load_json(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(
            f"Required file tidak ditemukan: {path}"
        )

    with path.open(
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def load_evidence_files(frequency_index: dict) -> dict:
    evidence = {}

    for term in frequency_index.get("terms", []):

        word = term["word"]
        evidence_file = ROOT / term["evidence_file"]

        evidence[word] = load_json(
            evidence_file
        )

    return evidence


def build_contract() -> dict:
    frequency_index = load_json(
        PROCESSED_DIR / FILES["frequency_index"]
    )

    numerical_findings = load_json(
        PROCESSED_DIR / FILES["numerical_findings"]
    )

    surah_distribution = load_json(
        PROCESSED_DIR / FILES["surah_distribution"]
    )

    pair_analysis = load_json(
        PROCESSED_DIR / FILES["pair_analysis"]
    )

    evidence = load_evidence_files(
        frequency_index
    )

    terms = []

    frequency_lookup = {
        item["word"]: item
        for item in frequency_index.get("terms", [])
    }

    numerical_lookup = {
        item["word"]: item
        for item in numerical_findings.get(
            "findings",
            []
        )
    }

    distribution_lookup = {
        item["word"]: item
        for item in surah_distribution.get(
            "terms",
            []
        )
    }

    for word, frequency in frequency_lookup.items():

        terms.append(
            {
                "word": word,

                "normalized_word":
                    frequency["normalized_word"],

                "rank":
                    frequency["rank"],

                "count":
                    frequency["count"],

                "evidence_file":
                    frequency["evidence_file"],

                "numerical":
                    numerical_lookup.get(word),

                "distribution":
                    distribution_lookup.get(word),

                "evidence":
                    evidence.get(word),
            }
        )

    terms.sort(
        key=lambda item: item["rank"]
    )

    return {
        "schema_version": "1.0.0",

        "title":
            "Digital Quran Miracles Analytics Dataset",

        "status":
            "observed_data_only",

        "description": (
            "A static data contract connecting "
            "Quran frequency analysis, numerical "
            "observations, surah distributions, "
            "candidate pair analysis, and "
            "verse-level evidence."
        ),

        "method": {
            "matching":
                "exact_normalized_token",

            "diacritics_removed": True,

            "tatweel_removed": True,

            "alif_variants_normalized": True,

            "alif_maqsura_normalized": True,

            "root_analysis": False,

            "morphological_analysis": False,

            "substring_matching": False,
        },

        "corpus": {
            "source":
                "data/raw/simple-clean.json",

            "chapters": 114,

            "verses": 6236,
        },

        "terms": terms,

        "pair_analysis": pair_analysis,

        "sources": {
            "frequency_index":
                FILES["frequency_index"],

            "numerical_findings":
                FILES["numerical_findings"],

            "surah_distribution":
                FILES["surah_distribution"],

            "pair_analysis":
                FILES["pair_analysis"],
        },
    }


def main():

    print("Building web data contract...")

    contract = build_contract()

    WEB_DATA_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    output_file = (
        WEB_DATA_DIR
        / "analytics.json"
    )

    with output_file.open(
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            contract,
            file,
            ensure_ascii=False,
            indent=2
        )

    print()
    print("=" * 60)
    print("WEB DATA CONTRACT")
    print("=" * 60)

    print(
        f"Schema version : "
        f"{contract['schema_version']}"
    )

    print(
        f"Terms          : "
        f"{len(contract['terms'])}"
    )

    print(
        f"Corpus verses  : "
        f"{contract['corpus']['verses']}"
    )

    print(
        f"Pair findings  : "
        f"{len(contract['pair_analysis'].get('pairs', []))}"
    )

    print(
        f"Output         : "
        f"{output_file}"
    )

    print("=" * 60)


if __name__ == "__main__":
    main()