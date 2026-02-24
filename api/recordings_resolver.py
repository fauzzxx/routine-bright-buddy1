"""
Resolve animation requests from pre-recorded MP4 files in api/recordings.
No moviepy or heavy dependencies - only file matching and copy.
"""
import os
import shutil
import time
import logging

RECORDINGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "recordings")

# Preferred: snake_case filenames (brush_teeth.mp4, wake_up.mp4, etc.).
# Fallbacks: if preferred file is missing, try these (e.g. "brushing your teeth.mp4").
FALLBACK_FILES = {
    "brush_teeth.mp4": "brushing your teeth.mp4",
    "wake_up.mp4": "waking up.mp4",
    "eating_breakfast.mp4": "Eating breakfast.mp4",
    "get_dressed.mp4": "changing clothes.mp4",
    "reading_book.mp4": "reading a book.mp4",
    "wash_hands.mp4": None,  # no fallback; add wash_hands.mp4 to folder
    "night_clothes.mp4": "night clothes.mp4",
}

# Keyword (in prompt) -> primary filename in api/recordings. Matches README.
PROMPT_TO_VIDEO = {
    # Brush teeth
    "brushing teeth": "brush_teeth.mp4",
    "brush teeth": "brush_teeth.mp4",
    "brush your teeth": "brush_teeth.mp4",
    "teeth": "brush_teeth.mp4",
    "brush": "brush_teeth.mp4",
    "tooth": "brush_teeth.mp4",
    # Wake up / morning
    "waking up": "wake_up.mp4",
    "wake up": "wake_up.mp4",
    "wake": "wake_up.mp4",
    "morning": "wake_up.mp4",
    # Wash hands / face
    "wash hands": "wash_hands.mp4",
    "wash face": "wash_hands.mp4",
    "washing hands": "wash_hands.mp4",
    "washing face": "wash_hands.mp4",
    # Get dressed / clothes (morning)
    "changing clothes": "get_dressed.mp4",
    "change clothes": "get_dressed.mp4",
    "get dressed": "get_dressed.mp4",
    "put on clothes": "get_dressed.mp4",
    "dress": "get_dressed.mp4",
    "wear": "get_dressed.mp4",
    "clothes": "get_dressed.mp4",
    # Eating
    "eating breakfast": "eating_breakfast.mp4",
    "eat breakfast": "eating_breakfast.mp4",
    "breakfast": "eating_breakfast.mp4",
    "eat": "eating_breakfast.mp4",
    "lunch": "eating_breakfast.mp4",
    "dinner": "eating_breakfast.mp4",
    # Night clothes / pajamas
    "night clothes": "night_clothes.mp4",
    "pajamas": "night_clothes.mp4",
    "put on pajamas": "night_clothes.mp4",
    "night": "night_clothes.mp4",
    # Reading
    "reading a book": "reading_book.mp4",
    "read a book": "reading_book.mp4",
    "read": "reading_book.mp4",
    "book": "reading_book.mp4",
    "story": "reading_book.mp4",
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
