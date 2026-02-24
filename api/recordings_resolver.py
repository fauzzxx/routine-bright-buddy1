"""
Resolve animation requests from pre-recorded MP4 files in api/recordings.
No moviepy or heavy dependencies - only file matching and copy.
"""
import os
import shutil
import time
import logging

RECORDINGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "recordings")

# Your exact filenames -> flashcard step. No fallbacks needed.
# brushing your teeth.mp4 -> brush teeth
# changing clothes.mp4 -> change clothes
# Eating breakfast.mp4 -> eat breakfast
# night clothes.mp4 -> night clothes
# wakingup.mp4 -> wake up
# reading a book.mp4 -> read a book
FALLBACK_FILES = {}

PROMPT_TO_VIDEO = {
    # Brush teeth -> brushing your teeth.mp4
    "brushing teeth": "brushing your teeth.mp4",
    "brush teeth": "brushing your teeth.mp4",
    "brush your teeth": "brushing your teeth.mp4",
    "teeth": "brushing your teeth.mp4",
    "brush": "brushing your teeth.mp4",
    "tooth": "brushing your teeth.mp4",
    # Wake up -> wakingup.mp4
    "waking up": "wakingup.mp4",
    "wake up": "wakingup.mp4",
    "wake": "wakingup.mp4",
    "morning": "wakingup.mp4",
    # Change clothes -> changing clothes.mp4
    "changing clothes": "changing clothes.mp4",
    "change clothes": "changing clothes.mp4",
    "get dressed": "changing clothes.mp4",
    "put on clothes": "changing clothes.mp4",
    "dress": "changing clothes.mp4",
    "wear": "changing clothes.mp4",
    "clothes": "changing clothes.mp4",
    # Eat breakfast -> Eating breakfast.mp4
    "eating breakfast": "Eating breakfast.mp4",
    "eat breakfast": "Eating breakfast.mp4",
    "breakfast": "Eating breakfast.mp4",
    "eat": "Eating breakfast.mp4",
    "lunch": "Eating breakfast.mp4",
    "dinner": "Eating breakfast.mp4",
    # Night clothes -> night clothes.mp4
    "night clothes": "night clothes.mp4",
    "pajamas": "night clothes.mp4",
    "put on pajamas": "night clothes.mp4",
    "night": "night clothes.mp4",
    # Read a book -> reading a book.mp4
    "reading a book": "reading a book.mp4",
    "read a book": "reading a book.mp4",
    "read": "reading a book.mp4",
    "book": "reading a book.mp4",
    "story": "reading a book.mp4",
}


def resolve_recording(prompt: str, out_dir: str, filename_prefix: str = "animation") -> str | None:
    """
    If a matching MP4 exists in api/recordings, copy it to out_dir and return the destination path.
    Otherwise return None (caller can fall back to HF/moviepy).
    """
    if not os.path.isdir(RECORDINGS_DIR):
        os.makedirs(RECORDINGS_DIR, exist_ok=True)
        return None

    prompt_lower = prompt.lower().strip()
    matched_file = None

    # 1) Explicit keyword mapping (longer phrases first); try primary then fallback filename
    for keyword, video_file in sorted(PROMPT_TO_VIDEO.items(), key=lambda x: -len(x[0])):
        if keyword in prompt_lower:
            candidate = os.path.join(RECORDINGS_DIR, video_file)
            if os.path.isfile(candidate):
                matched_file = video_file
                break
            fallback = FALLBACK_FILES.get(video_file)
            if fallback:
                candidate_fb = os.path.join(RECORDINGS_DIR, fallback)
                if os.path.isfile(candidate_fb):
                    matched_file = fallback
                    break
    if matched_file:
        src = os.path.join(RECORDINGS_DIR, matched_file)
        ts = int(time.time())
        safe = "".join(c for c in prompt_lower if c.isalnum() or c in ("-", "_"))[:40]
        dest_name = f"{filename_prefix}-{safe}-{ts}.mp4"
        dest_path = os.path.join(out_dir, dest_name)
        shutil.copy2(src, dest_path)
        logging.info("Serving recording: %s -> %s", src, dest_path)
        return dest_path

    # 2) Scan recordings folder: match by filename (e.g. brush_teeth.mp4 <-> "brush teeth")
    try:
        for fname in os.listdir(RECORDINGS_DIR):
            if not fname.lower().endswith(".mp4"):
                continue
            base = fname[:-4].replace("_", " ").replace("-", " ")
            if base in prompt_lower or any(word in prompt_lower for word in base.split() if len(word) > 2):
                src = os.path.join(RECORDINGS_DIR, fname)
                if os.path.isfile(src):
                    ts = int(time.time())
                    safe = "".join(c for c in prompt_lower if c.isalnum() or c in ("-", "_"))[:40]
                    dest_name = f"{filename_prefix}-{safe}-{ts}.mp4"
                    dest_path = os.path.join(out_dir, dest_name)
                    shutil.copy2(src, dest_path)
                    logging.info("Serving recording (scan): %s -> %s", src, dest_path)
                    return dest_path
    except OSError as e:
        logging.warning("Recordings scan failed: %s", e)

    return None
