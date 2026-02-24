# Pre-recorded animation videos

Place MP4 files here to use them instead of generated animations. No moviepy/setuptools required.

**Naming (preferred snake_case):** Videos are matched to step titles as follows:
- `brush_teeth.mp4` – "Brush your teeth", "Brush teeth"
- `wake_up.mp4` – "Wake up", "Morning"
- `wash_hands.mp4` – "Wash hands", "Wash face"
- `get_dressed.mp4` – "Get dressed", "Put on clothes"
- `reading_book.mp4` – "Read a book", "Story"
- `eating_breakfast.mp4` – "Eat breakfast", "Lunch", "Dinner"

If you use the older names (e.g. `brushing your teeth.mp4`, `waking up.mp4`), the resolver will use them as fallbacks when the snake_case file is missing. Add more mappings in `recordings_resolver.py` (PROMPT_TO_VIDEO / FALLBACK_FILES) if needed.
