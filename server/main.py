import os
import logging
from dotenv import load_dotenv

# Load env before importing modules that read env at import time
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Lazy-load animation/storage to avoid pulling in moviepy/imageio_ffmpeg at startup
# (fixes pkg_resources not found in uvicorn --reload subprocess on some Windows/Python 3.13 setups)
_generate_animation = None
_upload_video_and_get_public_url = None
_animation_import_error = None


def _get_animation_deps():
    global _generate_animation, _upload_video_and_get_public_url, _animation_import_error
    if _animation_import_error is not None:
        raise _animation_import_error
    if _generate_animation is not None:
        return _generate_animation, _upload_video_and_get_public_url
    try:
        try:
            from .huggingface_client import generate_animation
            from .storage import upload_video_and_get_public_url
        except ImportError:
            from huggingface_client import generate_animation
            from storage import upload_video_and_get_public_url
        _generate_animation = generate_animation
        _upload_video_and_get_public_url = upload_video_and_get_public_url
        return _generate_animation, _upload_video_and_get_public_url
    except Exception as e:
        _animation_import_error = e
        raise

app = FastAPI(title="Routine Bright Animation Backend")

BACKEND_CORS_ORIGIN = os.getenv("BACKEND_CORS_ORIGIN", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[BACKEND_CORS_ORIGIN, "http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated videos and recordings as static files so the frontend can play them
VIDEOS_DIR = os.path.join(os.path.dirname(__file__), "videos")
os.makedirs(VIDEOS_DIR, exist_ok=True)
app.mount("/videos", StaticFiles(directory=VIDEOS_DIR), name="videos")

# Recordings resolver: use MP4s from server/recordings (no moviepy dependency)
from recordings_resolver import resolve_recording


@app.post("/generate-animation")
async def generate_animation_endpoint(
    prompt: str = Query(..., description="Flashcard text, e.g., 'Brush your teeth'"),
    request: Request = None,
):
    """
    Return a video URL: first try pre-recorded MP4s in server/recordings, then fall back to HF/moviepy generation.
    """
    try:
        # 1) Use pre-recorded MP4 from server/recordings if available (no moviepy/setuptools needed)
        local_path = resolve_recording(prompt, VIDEOS_DIR, filename_prefix="animation")
        used_recording = local_path is not None
        if not local_path:
            # 2) Fall back to Hugging Face / moviepy generation
            generate_animation, upload_video_and_get_public_url = _get_animation_deps()
            local_path = await generate_animation(prompt)

        # Optional: Upload to Supabase Storage if configured (only when we used HF/moviepy path)
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        enable_upload = os.getenv("ENABLE_SUPABASE_UPLOAD", "false").lower() in ("1", "true", "yes")
        public_url: str | None = None
        if enable_upload and supabase_url and supabase_key and not used_recording:
            # upload_video_and_get_public_url already in scope from _get_animation_deps() above
            storage_path = os.path.join("generated", os.path.basename(local_path)).replace("\\", "/")
            with open(local_path, "rb") as f:
                content = f.read()
            public_url = upload_video_and_get_public_url(storage_path, content, content_type="video/mp4")
        # If not uploaded to Supabase, return a URL to the local /videos mount
        if not public_url:
            base = str(request.base_url).rstrip("/") if request else ""
            filename = os.path.basename(local_path)
            public_url = f"{base}/videos/{filename}" if base else f"/videos/{filename}"

        return {"video_path": public_url}
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Error in /generate-animation endpoint")
        msg = str(e)
        if "pkg_resources" in msg or "No module named" in msg:
            msg = (
                "Animation dependencies failed to load (missing pkg_resources/setuptools in this process). "
                "Install in the server venv: pip install setuptools ; then run without reload: uvicorn main:app --port 8000"
            )
        raise HTTPException(status_code=500, detail=msg)