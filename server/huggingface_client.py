import os
import time
from typing import Optional

from huggingface_hub import InferenceClient
from typing import Any
import logging
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from moviepy.editor import ImageClip, ImageSequenceClip
import shutil
from animated_video_generator import create_animated_video
try:
    from gradio_client import Client as GradioClient
except Exception:
    GradioClient = None  # Optional; used only if HF_SPACE_ID/HF_SPACE_URL is set


def _safe_filename(prompt: str) -> str:
    return "".join(c for c in prompt.lower() if c.isalnum() or c in ("-", "_"))[:40]

# Mapping of keywords to existing test videos
TEST_VIDEO_MAPPINGS = {
    "pajamas": "night clothes.mp4",
    "night": "night clothes.mp4",
    "brush": "brushing your teeth.mp4",
    "teeth": "brushing your teeth.mp4",
    "tooth": "brushing your teeth.mp4",
    "bath": "test_bath.mp4",
    "shower": "test_bath.mp4",
    "wash hands": "test_wash_hands.mp4",
    "wash face": "test_wash_hands.mp4",
    "change": "changing clothes.mp4",
    "changing": "changing clothes.mp4",
    "dress": "changing clothes.mp4",
    "wear": "test_dress.mp4",
    "put on": "test_dress.mp4",
    "clothes": "changing clothes.mp4",
    "read": "reading a book.mp4",
    "book": "reading a book.mp4",
    "story": "reading a book.mp4",
    "eat": "Eating breakfast.mp4",
    "breakfast": "Eating breakfast.mp4",
    "dinner": "Eating breakfast.mp4",
    "lunch": "Eating breakfast.mp4",
    "play": "test_play.mp4",
    "clean": "test_clean.mp4",
    "tidy": "test_clean.mp4",
    "wake": "waking up.mp4",
    "morning": "waking up.mp4",
}


async def generate_animation(
    prompt: str,
    *,
    hf_token: Optional[str] = None,
    model_id: Optional[str] = None,
    provider: Optional[str] = None,
    out_dir: str = "videos",
    filename_prefix: str = "animation",
    timeout_seconds: int = 300,
) -> str:
    """
    Generate a short video from text using Hugging Face Inference Providers.

    Uses huggingface_hub.InferenceClient.text_to_video under the hood.

    Returns the local file path to the saved MP4.
    """
    try:
        hf_token = hf_token or os.getenv("HF_TOKEN")
        # Prepare destination file path up-front
        os.makedirs(out_dir, exist_ok=True)
        ts = int(time.time())
        filename = f"{filename_prefix}-{_safe_filename(prompt)}-{ts}.mp4"
        file_path = os.path.join(out_dir, filename)

        # Check for existing test video matching the prompt
        # This allows using pre-generated high-quality videos for known routines
        server_dir = os.path.dirname(os.path.abspath(__file__))
        try:
            prompt_lower = prompt.lower()
            matched_video = None
            
            # Check explicit mappings first
            for keyword, video_file in TEST_VIDEO_MAPPINGS.items():
                if keyword in prompt_lower:
                    matched_video = video_file
                    break
            
            # Fallback to checking filenames directly
            if not matched_video:
                for fname in os.listdir(server_dir):
                    if fname.startswith("test_") and fname.endswith(".mp4"):
                        # test_wake_up.mp4 -> wake up
                        keyword = fname[5:-4].replace("_", " ")
                        if keyword in prompt_lower:
                            matched_video = fname
                            break
            
            if matched_video:
                src_path = os.path.join(server_dir, matched_video)
                if os.path.exists(src_path):
                    logging.info(f"Found matching test video: {src_path} for prompt: {prompt}")
                    shutil.copy2(src_path, file_path)
                    return file_path
        except Exception as e_test:
            logging.warning(f"Error checking for test video: {e_test}")

        # Short-circuit in demo mode
        demo_mode = os.getenv("HF_DEMO_MODE", "true").lower() in ("1", "true", "yes")
        if demo_mode:
            # Use our new animated video generator for demo mode
            return create_animated_video(prompt, file_path, duration=3.0, fps=24)

        # Option A: Use a Hugging Face Space if configured (can be free depending on the Space)
        space_id = os.getenv("HF_SPACE_ID") or os.getenv("HF_SPACE_URL")
        if space_id and GradioClient is not None:
            logging.info("[HF Space] Using space: %s", space_id)
            try:
                client = GradioClient(space_id)
                # Try common API names
                api_names: list[str] = ["/predict", "/run", "/text_to_video", "/generate"]
                result: Any = None
                last_err: Exception | None = None
                for api in api_names:
                    try:
                        logging.info("[HF Space] Trying api_name=%s", api)
                        result = client.predict(prompt, api_name=api)
                        break
                    except Exception as e_api:
                        logging.info("[HF Space] api_name=%s failed: %s", api, e_api)
                        last_err = e_api
                if result is None:
                    # Fallback: attempt first available API with single text input
                    try:
                        apis = client.view_api()
                        logging.info("[HF Space] view_api: found %d apis", len(apis))
                        for info in apis:
                            name = info.get("api_name")
                            if not name:
                                continue
                            try:
                                logging.info("[HF Space] Trying discovered api_name=%s", name)
                                result = client.predict(prompt, api_name=name)
                                if result is not None:
                                    break
                            except Exception as e_disc:
                                logging.info("[HF Space] discovered api_name=%s failed: %s", name, e_disc)
                                last_err = e_disc
                    except Exception as e_view:
                        last_err = e_view
                if result is None and last_err:
                    raise last_err

                # Handle result types: bytes, dict with 'video', filepath, or URL
                if isinstance(result, (bytes, bytearray)):
                    with open(file_path, "wb") as f:
                        f.write(result)
                    return file_path
                if isinstance(result, dict):
                    for key in ("video", "output", "result"):
                        v = result.get(key)
                        if isinstance(v, (bytes, bytearray)):
                            with open(file_path, "wb") as f:
                                f.write(v)
                            return file_path
                        if isinstance(v, str) and v:
                            # Could be a temp path or URL; try to read
                            try:
                                if os.path.exists(v):
                                    with open(v, "rb") as f:
                                        data = f.read()
                                    with open(file_path, "wb") as f:
                                        f.write(data)
                                    return file_path
                            except Exception:
                                pass
                if isinstance(result, str) and result:
                    try:
                        if os.path.exists(result):
                            with open(result, "rb") as f:
                                data = f.read()
                            with open(file_path, "wb") as f:
                                f.write(data)
                            return file_path
                    except Exception:
                        pass
                logging.info("[HF Space] Unknown result type: %s", type(result))
                raise RuntimeError("HF Space returned unsupported result format")
            except Exception as e_space:
                logging.exception("[HF Space] Generation failed: %s", e_space)
                # fall through to provider path

        if not hf_token:
            raise RuntimeError("HF_TOKEN is not set in environment")

        provider = provider or os.getenv("HF_PROVIDER", "replicate")
        model_id = model_id or os.getenv("HF_MODEL", "Wan-AI/Wan2.2-TI2V-5B")

        # Inference call with verbose logging to help diagnose provider failures
        logging.getLogger().setLevel(logging.INFO)
        logging.info(
            "[HF] Requesting text_to_video: provider=%s, model=%s, prompt=%s",
            provider,
            model_id,
            prompt,
        )
        try:
            client = InferenceClient(provider=provider, token=hf_token, timeout=timeout_seconds)
            video_bytes = client.text_to_video(prompt, model=model_id)
            logging.info("[HF] text_to_video succeeded; writing bytes to %s", file_path)
        except Exception as e_infer:
            # Log full traceback for debugging, but do not leak token
            logging.exception("[HF] text_to_video failed: %s", e_infer)
            raise

        with open(file_path, "wb") as f:
            if isinstance(video_bytes, dict) and "video" in video_bytes:
                f.write(video_bytes["video"])  # type: ignore
            else:
                f.write(video_bytes)  # type: ignore
        return file_path
    except Exception as e:
        logging.warning(f"generate_animation encountered error; creating placeholder. Error: {e}")
        # Final fallback: always attempt to create a placeholder video
        try:
            duration = 3.0
            size = (720, 1280)
            bg_color = (30, 30, 30)
            img = Image.new("RGB", (size[1], size[0]), color=bg_color)
            draw = ImageDraw.Draw(img)
            text = f"Demo video\n{prompt}"
            try:
                font = ImageFont.truetype("arial.ttf", 48)
            except Exception:
                font = ImageFont.load_default()
            bbox = draw.multiline_textbbox((0, 0), text, font=font, align="center")
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            pos = ((size[1] - text_w) // 2, (size[0] - text_h) // 2)
            draw.multiline_text(pos, text, fill=(240, 240, 240), font=font, align="center")
            frame = np.array(img)
            clip = ImageClip(frame).set_duration(duration)
            # file_path may not be defined in some error branches; ensure a safe path
            os.makedirs(out_dir, exist_ok=True)
            ts = int(time.time())
            file_path = os.path.join(out_dir, f"{filename_prefix}-{_safe_filename(prompt)}-{ts}.mp4")
            clip.write_videofile(file_path, fps=24, codec="libx264", audio=False, verbose=False, logger=None)
            return file_path
        except Exception as e2:
            raise RuntimeError(f"Placeholder video generation failed: {e2}")