import json
from pathlib import Path

from frequency import load_quran, analyze_word


ROOT = Path(__file__).resolve().parent.parent

CORPORA = {
    "simple-clean": ROOT / "data" / "raw" / "simple-clean.json",
    "uthmani": ROOT / "data" / "raw" / "uthmani.json",
}

TERMS = [
    "يوم",
    "اليوم",
]


def count_verses(quran: list) -> int:
    return sum(
        len(chapter.get("verses", []))
        for chapter in quran
    )


def count_tokens(quran: list) -> int:
    from frequency import tokenize

    total = 0

    for chapter in quran:
        for verse in chapter.get("verses", []):
            text = verse.get("text", "")

            if isinstance(text, str):
                total += len(tokenize(text))

    return total


def compare_corpus(name: str, path: Path) -> dict:
    print(f"Loading {name}...")

    quran = load_quran(path)

    result = {
        "corpus": name,
        "file": str(path.relative_to(ROOT)),
        "chapters": len(quran),
        "verses": count_verses(quran),
        "tokens": count_tokens(quran),
        "terms": {},
    }

    for term in TERMS:
        analysis = analyze_word(quran, term)

        result["terms"][term] = {
            "count": analysis["count"],
        }

    return result


def main():
    results = []

    for name, path in CORPORA.items():
        results.append(
            compare_corpus(name, path)
        )

    output = {
        "analysis_method": "exact_normalized_token",
        "corpora": results,
    }

    output_file = (
        ROOT
        / "data"
        / "processed"
        / "corpus_comparison.json"
    )

    output_file.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with output_file.open(
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
    print("CORPUS COMPARISON")
    print("=" * 60)

    for corpus in results:
        print()
        print(f"Corpus : {corpus['corpus']}")
        print(f"Chapters : {corpus['chapters']}")
        print(f"Verses   : {corpus['verses']}")
        print(f"Tokens   : {corpus['tokens']}")

        for term, data in corpus["terms"].items():
            print(
                f"  {term} -> {data['count']}"
            )

    print()
    print(f"Output: {output_file}")
    print("=" * 60)


if __name__ == "__main__":
    main()