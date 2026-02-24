"""
Vercel serverless: recordings-only. No AI/moviepy – avoids FUNCTION_INVOCATION_FAILED.
"""
import os
import sys
import logging

_api_dir = os.path.dirname(os.path.abspath(__file__))
if _api_dir not in sys.path:
    sys.path.insert(0, _api_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(_api_dir, ".env"))
load_dotenv()

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from recordings_resolver import resolve_recording

app = FastAPI(title="Routine Bright Animation Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VIDEOS_DIR = os.getenv("VIDEOS_DIR") or (
    "/tmp/videos" if os.getenv("VERCEL") else os.path.join(_api_dir, "videos")
)
try:
    os.makedirs(VIDEOS_DIR, exist_ok=True)
except OSError:
    pass
app.mount("/videos", StaticFiles(directory=VIDEOS_DIR), name="videos")


@app.post("/generate-animation")
async def generate_animation_endpoint(
    prompt: str = Query(..., description="Step title, e.g. Wake up, Brush teeth"),
    request: Request = None,
):
    """Return a video URL from api/recordings (your MP4s). No AI generation."""
    try:
        if not prompt or not str(prompt).strip():
            raise HTTPException(status_code=400, detail="Missing prompt")
        prompt_str = str(prompt).strip()

        local_path = resolve_recording(prompt_str, VIDEOS_DIR, filename_prefix="animation")
        if not local_path or not os.path.isfile(local_path):
            raise HTTPException(
                status_code=404,
                detail=(
                    "No recording for this step. Add a matching MP4 in api/recordings/ "
                    "(e.g. wakingup.mp4 for Wake up, night clothes.mp4 for Put on pajamas). See api/recordings/README.md."
                ),
            )

        filename = os.path.basename(local_path)
        base = ""
        if request:
            try:
                base = str(request.base_url).rstrip("/")
            except Exception:
                pass
        if os.getenv("VERCEL") and base:
            public_url = f"{base}/api/videos/{filename}"
        else:
            public_url = f"{base}/videos/{filename}" if base else f"/videos/{filename}"

        return {"video_path": public_url}
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("generate-animation error")
        raise HTTPException(status_code=500, detail=str(e))


# Vercel: requests to /api/* hit this file; mount app at /api so path becomes /generate-animation
parent = FastAPI()
parent.mount("/api", app)
from mangum import Mangum
handler = Mangum(parent, lifespan="off")
