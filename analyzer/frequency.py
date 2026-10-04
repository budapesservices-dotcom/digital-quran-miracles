import json
import re
import sys
import unicodedata
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"

QURAN_FILE = RAW_DIR / "simple-clean.json"


# ============================================================
# ARABIC NORMALIZATION
# ============================================================

def normalize_arabic(text: str) -> str:
    """
    Normalize Arabic text for exact-token analysis.

    Rules:
    - Remove Arabic diacritics / tashkeel
    - Remove tatweel
    - Normalize common alif variants -> ا
    - Normalize alif maqsura -> ي
    """

    # Unicode normalization
    text = unicodedata.normalize("NFKC", text)

    # Remove tatweel
    text = text.replace("ـ", "")

    # Normalize common alif variants
    text = text.replace("أ", "ا")
    text = text.replace("إ", "ا")
    text = text.replace("آ", "ا")
    text = text.replace("ٱ", "ا")

    # Normalize alif maqsura
    text = text.replace("ى", "ي")

    # Remove Arabic diacritics / combining marks
    text = "".join(
        char for char in text
        if unicodedata.category(char) != "Mn"
    )

    return text


# ============================================================
# TOKENIZATION
# ============================================================

ARABIC_TOKEN_PATTERN = re.compile(
    r"[^\u0621-\u064A\u0660-\u0669]+"
)


def tokenize(text: str) -> list[str]:
    """
    Convert verse text into normalized tokens.
    """

    normalized = normalize_arabic(text)

    # Replace anything outside Arabic letters/numbers with spaces
    normalized = ARABIC_TOKEN_PATTERN.sub(" ", normalized)

    # Split into tokens
    tokens = normalized.split()

    return tokens


# ============================================================
# DATA LOADING
# ============================================================

def load_quran(path: Path) -> list:
    """
    Load Quran JSON corpus.
    """

    if not path.exists():
        raise FileNotFoundError(
            f"Quran dataset tidak ditemukan: {path}"
        )

    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError(
            "Format dataset tidak sesuai: root JSON harus berupa list."
        )

    return data


# ============================================================
# FREQUENCY ANALYSIS
# ============================================================

def analyze_word(quran: list, target_word: str) -> dict:
    """
    Count exact occurrences of a normalized token
    and collect verse-level evidence.
    """

    target = normalize_arabic(target_word).strip()

    if not target:
        raise ValueError("Target word tidak boleh kosong.")

    occurrences = []

    total_verses = 0
    total_tokens = 0

    for chapter_index, chapter in enumerate(quran, start=1):

        chapter_id = chapter.get("id", chapter_index)
        chapter_name = chapter.get(
            "name",
            f"Chapter {chapter_id}"
        )

        verses = chapter.get("verses", [])

        for verse_index, verse in enumerate(verses, start=1):

            total_verses += 1

            verse_id = verse.get("id", verse_index)

            # Different quran-json variants may use "text"
            text = verse.get("text", "")

            if not isinstance(text, str):
                continue

            tokens = tokenize(text)
            total_tokens += len(tokens)

            for token_index, token in enumerate(tokens, start=1):

                if token == target:

                    occurrences.append(
                        {
                            "surah": chapter_id,
                            "surah_name": chapter_name,
                            "ayah": verse_id,
                            "token_index": token_index,
                            "text": text,
                        }
                    )

    return {
        "target_word": target_word,
        "normalized_word": target,
        "count": len(occurrences),
        "total_verses_analyzed": total_verses,
        "total_tokens_analyzed": total_tokens,
        "method": {
            "matching": "exact_normalized_token",
            "diacritics_removed": True,
            "tatweel_removed": True,
            "alif_variants_normalized": True,
            "alif_maqsura_normalized": True,
            "root_analysis": False,
            "morphological_analysis": False,
            "substring_matching": False,
        },
        "occurrences": occurrences,
    }


# ============================================================
# SAVE RESULT
# ============================================================

def save_result(result: dict, target_word: str) -> Path:
    """
    Save analysis result as JSON.
    """

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    safe_name = re.sub(
        r"[^\u0621-\u064A\w-]+",
        "_",
        target_word.strip()
    )

    if not safe_name:
        safe_name = "word"

    output_file = PROCESSED_DIR / f"frequency_{safe_name}.json"

    with output_file.open("w", encoding="utf-8") as file:
        json.dump(
            result,
            file,
            ensure_ascii=False,
            indent=2
        )

    return output_file


# ============================================================
# MAIN
# ============================================================

def main():
    if len(sys.argv) < 2:
        print(
            "Usage:\n"
            "  python analyzer/frequency.py <arabic_word>\n\n"
            "Example:\n"
            "  python analyzer/frequency.py يوم"
        )
        sys.exit(1)

    target_word = sys.argv[1]

    print("Loading Quran corpus...")
    quran = load_quran(QURAN_FILE)

    print(f"Analyzing word: {target_word}")

    result = analyze_word(
        quran,
        target_word
    )

    output_file = save_result(
        result,
        target_word
    )

    print()
    print("=" * 50)
    print("FREQUENCY RESULT")
    print("=" * 50)
    print(f"Target word      : {result['target_word']}")
    print(f"Normalized word  : {result['normalized_word']}")
    print(f"Frequency        : {result['count']}")
    print(f"Verses analyzed  : {result['total_verses_analyzed']}")
    print(f"Tokens analyzed  : {result['total_tokens_analyzed']}")
    print(f"Output file      : {output_file}")
    print("=" * 50)


if __name__ == "__main__":
    main()