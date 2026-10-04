import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"


def load_json(filename: str) -> list:
    path = RAW_DIR / filename

    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def verify(filename: str) -> None:
    chapters = load_json(filename)

    total_chapters = len(chapters)
    total_verses = sum(
        len(chapter["verses"])
        for chapter in chapters
    )

    print(f"\n{filename}")
    print("-" * len(filename))
    print(f"Chapters : {total_chapters}")
    print(f"Verses   : {total_verses}")

    # Basic structural checks
    first_chapter = chapters[0]
    last_chapter = chapters[-1]

    print(
        f"First chapter : {first_chapter['id']} "
        f"({len(first_chapter['verses'])} verses)"
    )

    print(
        f"Last chapter  : {last_chapter['id']} "
        f"({len(last_chapter['verses'])} verses)"
    )


def main() -> None:
    verify("uthmani.json")
    verify("simple-clean.json")


if __name__ == "__main__":
    main()