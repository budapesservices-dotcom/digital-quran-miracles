import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent

PROCESSED_DIR = ROOT / "data" / "processed"
WEB_DATA_DIR = ROOT / "web" / "data"
METADATA_FILE = WEB_DATA_DIR / "term_metadata.json"

FILES = {
    "frequency_index": "frequency_index.json",
    "numerical_findings": "numerical_findings.json",
    "surah_distribution": "surah_distribution.json",
    "pair_analysis": "pair_analysis.json",
    "corpus_comparison": "corpus_comparison.json",
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


def load_term_metadata() -> dict:
    if not METADATA_FILE.exists():
        raise FileNotFoundError(
            f"Term metadata tidak ditemukan: {METADATA_FILE}"
        )

    with METADATA_FILE.open(
        "r",
        encoding="utf-8"
    ) as file:
        metadata = json.load(file)

    if not isinstance(metadata, dict):
        raise ValueError(
            "Format term metadata harus berupa object."
        )

    return metadata


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

    term_metadata = {
        item["word"]: item.get(
            "metadata",
            {}
        )
        for item in frequency_index.get(
            "terms",
            []
        )
    }

    METADATA_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with METADATA_FILE.open(
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            term_metadata,
            file,
            ensure_ascii=False,
            indent=2
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

    corpus_comparison = load_json(
        PROCESSED_DIR / FILES["corpus_comparison"]
    )

    frequency_words = {
        item["word"]
        for item in frequency_index.get("terms", [])
    }

    numerical_words = {
        item["word"]
        for item in numerical_findings.get("findings", [])
    }

    distribution_words = {
        item["word"]
        for item in surah_distribution.get("terms", [])
    }

    missing_numerical = sorted(
        frequency_words - numerical_words
    )

    missing_distribution = sorted(
        frequency_words - distribution_words
    )

    if missing_numerical:
        raise ValueError(
            "Frequency terms missing from numerical findings: "
            + ", ".join(missing_numerical)
        )

    if missing_distribution:
        raise ValueError(
            "Frequency terms missing from surah distribution: "
            + ", ".join(missing_distribution)
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

    missing_metadata = sorted(
        frequency_words - set(term_metadata.keys())
    )

    if missing_metadata:
        raise ValueError(
            "Frequency terms missing metadata: "
            + ", ".join(missing_metadata)
        )

    for word, frequency in frequency_lookup.items():

        terms.append(
            {
                "word": word,

                "category":
                    frequency.get(
                        "category",
                        "uncategorized"
                    ),

                "metadata":
                    term_metadata[word],

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

    comparison = corpus_comparison.get(
        "comparison",
        {}
    )

    comparison_terms = comparison.get(
        "terms",
        []
    )

    comparison_discrepancies = comparison.get(
        "discrepancies",
        []
    )

    if not comparison.get(
        "all_structure_counts_match",
        False
    ):
        raise ValueError(
            "Cross-corpus structure verification failed."
        )

    if not comparison.get(
        "all_term_counts_match",
        False
    ):
        raise ValueError(
            "Cross-corpus term verification failed."
        )

    if comparison_discrepancies:
        raise ValueError(
            "Cross-corpus verification contains discrepancies."
        )

    if len(comparison_terms) != len(frequency_words):
        raise ValueError(
            "Cross-corpus verification does not cover all frequency terms."
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
            "uthmani_compatibility":
    True,
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

    "provider":
        "Tanzil Project",

    "text_type":
        "Simple Clean",

    "license":
        "Creative Commons Attribution 3.0",

    "attribution_url":
        "https://tanzil.net/",

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
                        "corpus_comparison":
                FILES["corpus_comparison"],
        },

                "verification": {
            "status":
                "verified",

            "cross_corpus": {
                "method":
                    "exact_normalized_token",

                "simple_clean":
                    "data/raw/simple-clean.json",

                "uthmani":
                    "data/raw/uthmani.json",

                "chapters_match":
                    comparison[
                        "all_structure_counts_match"
                    ],

                "term_counts_match":
                    comparison[
                        "all_term_counts_match"
                    ],

                "terms_verified":
                    len(comparison_terms),

                "discrepancies":
                    len(comparison_discrepancies),
            },
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